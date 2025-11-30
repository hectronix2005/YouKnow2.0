import { auth } from "@/lib/auth"
import { isTeacher } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        const { title } = await req.json()

        if (!session?.user || !isTeacher(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Generate a slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

        const course = await prisma.course.create({
            data: {
                title,
                slug,
                description: "No description yet",
                category: "Uncategorized",
                level: "Beginner",
                instructorId: session.user.id,
                isFree: true,
                price: 0,
            }
        })

        return NextResponse.json(course)
    } catch (error) {
        console.error("[COURSES_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
