import { auth } from "@/lib/auth"
import { isAdmin, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// POST bulk assign task to multiple employees (admin/leader only)
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { taskTemplateId, employeeIds } = body

        if (!taskTemplateId || !employeeIds || !Array.isArray(employeeIds)) {
            return NextResponse.json(
                { error: "taskTemplateId and employeeIds (array) are required" },
                { status: 400 }
            )
        }

        if (employeeIds.length === 0) {
            return NextResponse.json(
                { error: "employeeIds array cannot be empty" },
                { status: 400 }
            )
        }

        // Check task template exists
        const taskTemplate = await prisma.taskTemplate.findUnique({
            where: { id: taskTemplateId },
        })

        if (!taskTemplate) {
            return NextResponse.json({ error: "Task template not found" }, { status: 404 })
        }

        // Check all employees exist
        const employees = await prisma.user.findMany({
            where: {
                id: { in: employeeIds },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        })

        if (employees.length !== employeeIds.length) {
            return NextResponse.json(
                { error: "One or more employees not found" },
                { status: 404 }
            )
        }

        // Get existing assignments to avoid duplicates
        const existingAssignments = await prisma.taskAssignment.findMany({
            where: {
                taskTemplateId,
                employeeId: { in: employeeIds },
            },
            select: {
                employeeId: true,
            },
        })

        const existingEmployeeIds = new Set(existingAssignments.map((a) => a.employeeId))
        const newEmployeeIds = employeeIds.filter((id) => !existingEmployeeIds.has(id))

        // Create new assignments
        let createdCount = 0
        if (newEmployeeIds.length > 0) {
            const result = await prisma.taskAssignment.createMany({
                data: newEmployeeIds.map((employeeId) => ({
                    taskTemplateId,
                    employeeId,
                    isActive: true,
                })),
            })
            createdCount = result.count
        }

        // Get all assignments for this task (including newly created ones)
        const allAssignments = await prisma.taskAssignment.findMany({
            where: {
                taskTemplateId,
                employeeId: { in: employeeIds },
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            created: createdCount,
            skipped: employeeIds.length - createdCount,
            assignments: allAssignments,
        })
    } catch (error) {
        console.error("[CHECKLIST_BULK_ASSIGN_POST]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
