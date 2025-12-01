import { auth } from "@/lib/auth"
import { isEmployee } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// Helper to get today's date at midnight
function getTodayDate(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
}

// Helper to check if a task should appear for today
function shouldTaskAppearToday(task: {
    frequency: string
    scheduledDay: number | null
}): boolean {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0-6, 0=Sunday
    const dayOfMonth = today.getDate() // 1-31

    switch (task.frequency) {
        case "daily":
            return true
        case "weekly":
            return task.scheduledDay === null || task.scheduledDay === dayOfWeek
        case "monthly":
            return task.scheduledDay === null || task.scheduledDay === dayOfMonth
        default:
            return false
    }
}

// GET employee's tasks for today
export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isEmployee(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const dateParam = searchParams.get("date")

        // Parse date or use today
        let targetDate: Date
        if (dateParam) {
            targetDate = new Date(dateParam)
            targetDate.setHours(0, 0, 0, 0)
        } else {
            targetDate = getTodayDate()
        }

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Get all active assignments for this employee
        const assignments = await prisma.taskAssignment.findMany({
            where: {
                employeeId: session.user.id,
                isActive: true,
                taskTemplate: {
                    isActive: true,
                },
            },
            include: {
                taskTemplate: true,
                completions: {
                    where: {
                        scheduledDate: {
                            gte: targetDate,
                            lte: endOfDay,
                        },
                    },
                },
            },
        })

        // Filter tasks that should appear for the target date
        const todaysTasks = assignments
            .filter((assignment) => shouldTaskAppearToday(assignment.taskTemplate))
            .map((assignment) => {
                const completion = assignment.completions[0] || null
                return {
                    assignmentId: assignment.id,
                    task: assignment.taskTemplate,
                    status: completion?.status || "pending",
                    completedAt: completion?.completedAt || null,
                    photoUrl: completion?.photoUrl || null,
                    notes: completion?.notes || null,
                    completionId: completion?.id || null,
                }
            })

        // Sort by scheduled time (if exists) then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        todaysTasks.sort((a, b) => {
            // First sort by time if both have scheduled times
            if (a.task.scheduledTime && b.task.scheduledTime) {
                return a.task.scheduledTime.localeCompare(b.task.scheduledTime)
            }
            // Tasks with scheduled time come first
            if (a.task.scheduledTime && !b.task.scheduledTime) return -1
            if (!a.task.scheduledTime && b.task.scheduledTime) return 1
            // Then sort by priority
            return (
                (priorityOrder[a.task.priority as keyof typeof priorityOrder] || 1) -
                (priorityOrder[b.task.priority as keyof typeof priorityOrder] || 1)
            )
        })

        return NextResponse.json({
            date: targetDate.toISOString().split("T")[0],
            tasks: todaysTasks,
            summary: {
                total: todaysTasks.length,
                completed: todaysTasks.filter((t) => t.status === "completed").length,
                pending: todaysTasks.filter((t) => t.status === "pending").length,
            },
        })
    } catch (error) {
        console.error("[CHECKLIST_MY_TASKS_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
