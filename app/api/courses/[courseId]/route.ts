import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth()
        const { courseId } = await params

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title, description, price, category, modules } = await req.json()

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, instructorId: true }
        })

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 })
        }

        if (course.instructorId !== session.user.id && !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

        // Handle modules and lessons with quiz preservation
        // Get existing lessons and their quizzes before deleting
        const existingModules = await prisma.module.findMany({
            where: { courseId },
            include: { lessons: true }
        })

        // Map old lesson IDs to their quizzes
        const existingLessonIds = existingModules.flatMap(m => m.lessons.map(l => l.id))

        // Get quizzes for existing lessons
        const existingQuizzes = await prisma.lessonQuiz.findMany({
            where: { lessonId: { in: existingLessonIds } }
        })

        // Create a map of lesson title -> quiz for preservation
        const quizByLessonTitle = new Map<string, { id: string; questions: string }>()
        for (const module of existingModules) {
            for (const lesson of module.lessons) {
                const quiz = existingQuizzes.find(q => q.lessonId === lesson.id)
                if (quiz) {
                    // Use title as key since IDs will change
                    quizByLessonTitle.set(lesson.title, { id: quiz.id, questions: quiz.questions })
                }
            }
        }

        // Delete existing quizzes (they'll be reassociated)
        if (existingLessonIds.length > 0) {
            await prisma.lessonQuiz.deleteMany({
                where: { lessonId: { in: existingLessonIds } }
            })
        }

        // Delete existing modules (cascade deletes lessons)
        await prisma.module.deleteMany({
            where: { courseId }
        })

        // Create new structure and preserve quizzes
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
                    const createdLesson = await prisma.lesson.create({
                        data: {
                            title: lessonData.title,
                            description: lessonData.description || null,
                            orderIndex: j,
                            lessonType: lessonData.lessonType || "video",
                            videoUrl: lessonData.videoUrl || null,
                            videoDuration: lessonData.videoDuration ? parseInt(lessonData.videoDuration) : null,
                            isPreview: lessonData.isPreview || false,
                            hasQuiz: lessonData.hasQuiz === true || lessonData.hasQuiz === 'true',
                            transcription: lessonData.transcription || null,
                            transcriptSegments: lessonData.transcriptSegments
                                ? (typeof lessonData.transcriptSegments === 'string'
                                    ? lessonData.transcriptSegments
                                    : JSON.stringify(lessonData.transcriptSegments))
                                : null,
                            moduleId: createdModule.id
                        }
                    })

                    // Restore quiz if it existed for this lesson title
                    const savedQuiz = quizByLessonTitle.get(lessonData.title)
                    if (savedQuiz) {
                        await prisma.lessonQuiz.create({
                            data: {
                                lessonId: createdLesson.id,
                                questions: savedQuiz.questions
                            }
                        })
                    }
                }
            }
        }

        // Fetch and return updated course with modules and lessons
        const updatedCourse = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                modules: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lessons: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                }
            }
        })

        return NextResponse.json({ success: true, modules: updatedCourse?.modules || [] })
    } catch (error) {
        console.error("[COURSE_PATCH]", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
