import { auth } from "@/lib/auth"
import { isAdmin, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// GET all task templates (admin/leader only)
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const tasks = await prisma.taskTemplate.findMany({
            orderBy: { createdAt: "desc" },
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
                    },
                },
            },
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error("[CHECKLIST_TASKS_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST create new task template (admin/leader only)
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
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
        } = body

        if (!title || !frequency) {
            return NextResponse.json(
                { error: "Title and frequency are required" },
                { status: 400 }
            )
        }

        // Validate frequency
        if (!["daily", "weekly", "monthly"].includes(frequency)) {
            return NextResponse.json(
                { error: "Invalid frequency. Must be daily, weekly, or monthly" },
                { status: 400 }
            )
        }

        // Validate scheduledDay based on frequency
        if (frequency === "weekly" && scheduledDay !== undefined) {
            if (scheduledDay < 0 || scheduledDay > 6) {
                return NextResponse.json(
                    { error: "For weekly tasks, scheduledDay must be 0-6 (0=Sunday)" },
                    { status: 400 }
                )
            }
        }

        if (frequency === "monthly" && scheduledDay !== undefined) {
            if (scheduledDay < 1 || scheduledDay > 31) {
                return NextResponse.json(
                    { error: "For monthly tasks, scheduledDay must be 1-31" },
                    { status: 400 }
                )
            }
        }

        const task = await prisma.taskTemplate.create({
            data: {
                title,
                description: description || null,
                frequency,
                scheduledTime: scheduledTime || null,
                scheduledDay: scheduledDay !== undefined ? scheduledDay : null,
                requiresPhoto: requiresPhoto || false,
                category: category || null,
                priority: priority || "medium",
                createdById: session.user.id,
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error("[CHECKLIST_TASKS_POST]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
