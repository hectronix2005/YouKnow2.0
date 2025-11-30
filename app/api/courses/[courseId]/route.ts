import { auth } from "@/lib/auth"
import { isTeacher, isAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth()
        const { courseId } = await params
        const { title, description, price, category, modules } = await req.json()

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId }
        })

        if (!course) {
            return new NextResponse("Not Found", { status: 404 })
        }

        if (course.instructorId !== session.user.id && !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Update course details
        await prisma.course.update({
            where: { id: courseId },
            data: {
                title,
                description,
                price,
                category,
            }
        })

        // Handle modules and lessons
        // For MVP simplicity, we'll delete existing structure and recreate
        // In production, we should do smart diffing

        // 1. Delete existing modules (cascade deletes lessons)
        await prisma.module.deleteMany({
            where: { courseId }
        })

        // 2. Create new structure
        for (let i = 0; i < modules.length; i++) {
            const moduleData = modules[i]
            const createdModule = await prisma.module.create({
                data: {
                    title: moduleData.title,
                    orderIndex: i,
                    courseId
                }
            })

            if (moduleData.lessons && moduleData.lessons.length > 0) {
                for (let j = 0; j < moduleData.lessons.length; j++) {
                    const lessonData = moduleData.lessons[j]
                    await prisma.lesson.create({
                        data: {
                            title: lessonData.title,
                            description: lessonData.description || null,
                            orderIndex: j,
                            lessonType: lessonData.lessonType || "video",
                            videoUrl: lessonData.videoUrl || null,
                            videoDuration: lessonData.videoDuration ? parseInt(lessonData.videoDuration) : null,
                            isPreview: lessonData.isPreview || false,
                            transcription: lessonData.transcription || null,
                            transcriptSegments: lessonData.transcriptSegments
                                ? (typeof lessonData.transcriptSegments === 'string'
                                    ? lessonData.transcriptSegments
                                    : JSON.stringify(lessonData.transcriptSegments))
                                : null,
                            moduleId: createdModule.id
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[COURSE_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
