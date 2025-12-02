import { auth } from "@/lib/auth"
import { isEmployee, isAdmin, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// Helper to get start of day/week/month in UTC
function getStartOfDayUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0))
}

function getStartOfWeekUTC(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    d.setDate(diff)
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0))
}

function getStartOfMonthUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0))
}

// Helper to calculate compliance rate
function calculateCompliance(completed: number, total: number): number {
    if (total === 0) return 100
    return Math.round((completed / total) * 100)
}

// GET statistics for employee or all employees (admin)
export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || (!isEmployee(session.user.role) && !isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const employeeId = searchParams.get("employeeId")

        const isAdminUser = isAdmin(session.user.role) || isLeader(session.user.role)

        // If not admin, can only see own stats
        const targetEmployeeId = isAdminUser && employeeId ? employeeId : session.user.id

        const now = new Date()
        const startOfToday = getStartOfDayUTC(now)
        const startOfWeek = getStartOfWeekUTC(now)
        const startOfMonth = getStartOfMonthUTC(now)

        // End of day in UTC (23:59:59.999)
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1)

        // Get all active assignments for employee
        const assignments = await prisma.taskAssignment.findMany({
            where: {
                employeeId: targetEmployeeId,
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
                            gte: startOfMonth,
                        },
                    },
                },
            },
        })

        // Calculate daily stats - use UTC day/date from startOfToday
        const dayOfWeek = startOfToday.getUTCDay()
        const dayOfMonth = startOfToday.getUTCDate()

        const dailyAssignments = assignments.filter((a) => {
            const task = a.taskTemplate

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
        })

        const dailyCompleted = dailyAssignments.filter((a) =>
            a.completions.some(
                (c) =>
                    c.status === "completed" &&
                    new Date(c.scheduledDate) >= startOfToday &&
                    new Date(c.scheduledDate) <= endOfToday
            )
        ).length

        // Calculate weekly stats
        const weeklyCompletions = assignments.reduce((count, a) => {
            return (
                count +
                a.completions.filter(
                    (c) =>
                        c.status === "completed" && new Date(c.scheduledDate) >= startOfWeek
                ).length
            )
        }, 0)

        // Calculate expected tasks for this week (simplified)
        const weeklyExpected = dailyAssignments.length * 7

        // Calculate monthly stats
        const monthlyCompletions = assignments.reduce((count, a) => {
            return (
                count +
                a.completions.filter(
                    (c) =>
                        c.status === "completed" && new Date(c.scheduledDate) >= startOfMonth
                ).length
            )
        }, 0)

        // Calculate expected tasks for this month (simplified)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const monthlyExpected = dailyAssignments.length * daysInMonth

        // Get on-time completion rate
        const allCompletions = assignments.flatMap((a) => a.completions)
        const completedOnTime = allCompletions.filter((c) => c.completedOnTime).length

        // Get employee info
        const employee = await prisma.user.findUnique({
            where: { id: targetEmployeeId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        })

        const stats = {
            employee,
            daily: {
                total: dailyAssignments.length,
                completed: dailyCompleted,
                pending: dailyAssignments.length - dailyCompleted,
                compliance: calculateCompliance(dailyCompleted, dailyAssignments.length),
            },
            weekly: {
                totalCompleted: weeklyCompletions,
                expected: weeklyExpected,
                compliance: calculateCompliance(weeklyCompletions, weeklyExpected),
            },
            monthly: {
                totalCompleted: monthlyCompletions,
                expected: monthlyExpected,
                compliance: calculateCompliance(monthlyCompletions, monthlyExpected),
            },
            onTimeRate: calculateCompliance(completedOnTime, allCompletions.length),
            period: {
                today: startOfToday.toISOString().split("T")[0],
                weekStart: startOfWeek.toISOString().split("T")[0],
                monthStart: startOfMonth.toISOString().split("T")[0],
            },
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error("[CHECKLIST_STATISTICS_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// GET all employees statistics (admin only) - OPTIMIZED
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const now = new Date()
        const startOfToday = getStartOfDayUTC(now)
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1)

        // Use UTC methods for day calculations
        const dayOfWeekUTC = startOfToday.getUTCDay()
        const dayOfMonthUTC = startOfToday.getUTCDate()

        // OPTIMIZATION: Fetch ALL assignments with their completions in ONE query
        const allAssignments = await prisma.taskAssignment.findMany({
            where: {
                isActive: true,
                taskTemplate: {
                    isActive: true,
                },
            },
            include: {
                taskTemplate: true,
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                completions: {
                    where: {
                        scheduledDate: {
                            gte: startOfToday,
                            lte: endOfToday,
                        },
                    },
                },
            },
        })

        // Group assignments by employee
        const employeeMap = new Map<string, {
            employee: { id: string; name: string; email: string; role: string }
            assignments: typeof allAssignments
        }>()

        allAssignments.forEach((assignment) => {
            const empId = assignment.employee.id
            if (!employeeMap.has(empId)) {
                employeeMap.set(empId, {
                    employee: assignment.employee,
                    assignments: [],
                })
            }
            employeeMap.get(empId)!.assignments.push(assignment)
        })

        // Calculate stats for each employee
        const employeeStats = Array.from(employeeMap.values()).map(({ employee, assignments }) => {
            // Filter for today's tasks
            const todaysAssignments = assignments.filter((a) => {
                const task = a.taskTemplate
                switch (task.frequency) {
                    case "daily":
                        return true
                    case "weekly":
                        return task.scheduledDay === null || task.scheduledDay === dayOfWeekUTC
                    case "monthly":
                        return task.scheduledDay === null || task.scheduledDay === dayOfMonthUTC
                    default:
                        return false
                }
            })

            const completed = todaysAssignments.filter((a) =>
                a.completions.some((c) => c.status === "completed")
            ).length

            return {
                employee,
                daily: {
                    total: todaysAssignments.length,
                    completed,
                    pending: todaysAssignments.length - completed,
                    compliance: calculateCompliance(completed, todaysAssignments.length),
                },
            }
        })

        // Sort by compliance (lowest first to highlight those needing attention)
        employeeStats.sort((a, b) => a.daily.compliance - b.daily.compliance)

        return NextResponse.json({
            date: startOfToday.toISOString().split("T")[0],
            employees: employeeStats,
            summary: {
                totalEmployees: employeeStats.length,
                averageCompliance: Math.round(
                    employeeStats.reduce((sum, e) => sum + e.daily.compliance, 0) /
                    (employeeStats.length || 1)
                ),
            },
        })
    } catch (error) {
        console.error("[CHECKLIST_STATISTICS_ALL_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
