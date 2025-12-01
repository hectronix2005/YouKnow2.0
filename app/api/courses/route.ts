import { auth } from "@/lib/auth"
import { isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateUniqueSlug } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isLeader(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title } = await req.json()

        if (!title || typeof title !== "string" || title.trim().length < 3) {
            return NextResponse.json(
                { error: "Title must be at least 3 characters" },
                { status: 400 }
            )
        }

        const slug = generateUniqueSlug(title)

        const course = await prisma.course.create({
            data: {
                title: title.trim(),
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
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
