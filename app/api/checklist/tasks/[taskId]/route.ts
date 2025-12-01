import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// GET single task template (admin only)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await auth()
        const { taskId } = await params

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const task = await prisma.taskTemplate.findUnique({
            where: { id: taskId },
            include: {
                assignments: {
                    include: {
                        employee: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        completions: {
                            orderBy: { scheduledDate: "desc" },
                            take: 10,
                        },
                    },
                },
            },
        })

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error("[CHECKLIST_TASK_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH update task template (admin only)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await auth()
        const { taskId } = await params

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            title,
            description,
            frequency,
            scheduledTime,
            scheduledDay,
            requiresPhoto,
            category,
            priority,
            isActive,
        } = body

        // Check task exists
        const existingTask = await prisma.taskTemplate.findUnique({
            where: { id: taskId },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        // Build update data
        const updateData: Record<string, unknown> = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (frequency !== undefined) {
            if (!["daily", "weekly", "monthly"].includes(frequency)) {
                return NextResponse.json(
                    { error: "Invalid frequency" },
                    { status: 400 }
                )
            }
            updateData.frequency = frequency
        }
        if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime
        if (scheduledDay !== undefined) updateData.scheduledDay = scheduledDay
        if (requiresPhoto !== undefined) updateData.requiresPhoto = requiresPhoto
        if (category !== undefined) updateData.category = category
        if (priority !== undefined) updateData.priority = priority
        if (isActive !== undefined) updateData.isActive = isActive

        const task = await prisma.taskTemplate.update({
            where: { id: taskId },
            data: updateData,
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("[CHECKLIST_TASK_PATCH]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE task template (admin only)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const session = await auth()
        const { taskId } = await params

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check task exists
        const existingTask = await prisma.taskTemplate.findUnique({
            where: { id: taskId },
        })

        if (!existingTask) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 })
        }

        await prisma.taskTemplate.delete({
            where: { id: taskId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[CHECKLIST_TASK_DELETE]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
