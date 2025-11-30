import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth()
        const { courseId } = await params
        const { status } = await req.json()

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

        // Validate status
        if (status !== 'published' && status !== 'draft') {
            return new NextResponse("Invalid status", { status: 400 })
        }

        // Update course status
        await prisma.course.update({
            where: { id: courseId },
            data: {
                status,
                publishedAt: status === 'published' ? new Date() : null
            }
        })

        return NextResponse.json({ success: true, status })
    } catch (error) {
        console.error("[COURSE_PUBLISH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
