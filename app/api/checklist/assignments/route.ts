import { auth } from "@/lib/auth"
import { isAdmin, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// GET all assignments (admin/leader only)
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const assignments = await prisma.taskAssignment.findMany({
            orderBy: { assignedAt: "desc" },
            include: {
                taskTemplate: true,
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json(assignments)
    } catch (error) {
        console.error("[CHECKLIST_ASSIGNMENTS_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST assign task to employee (admin only)
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { taskTemplateId, employeeId } = body

        if (!taskTemplateId || !employeeId) {
            return NextResponse.json(
                { error: "taskTemplateId and employeeId are required" },
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

        // Check employee exists and has employee role
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        // Check if assignment already exists
        const existingAssignment = await prisma.taskAssignment.findUnique({
            where: {
                taskTemplateId_employeeId: {
                    taskTemplateId,
                    employeeId,
                },
            },
        })

        if (existingAssignment) {
            return NextResponse.json(
                { error: "Task is already assigned to this employee" },
                { status: 400 }
            )
        }

        const assignment = await prisma.taskAssignment.create({
            data: {
                taskTemplateId,
                employeeId,
            },
            include: {
                taskTemplate: true,
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        return NextResponse.json(assignment)
    } catch (error) {
        console.error("[CHECKLIST_ASSIGNMENTS_POST]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE remove assignment (admin only)
export async function DELETE(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isAdmin(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const assignmentId = searchParams.get("assignmentId")

        if (!assignmentId) {
            return NextResponse.json(
                { error: "assignmentId is required" },
                { status: 400 }
            )
        }

        const assignment = await prisma.taskAssignment.findUnique({
            where: { id: assignmentId },
        })

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        await prisma.taskAssignment.delete({
            where: { id: assignmentId },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[CHECKLIST_ASSIGNMENTS_DELETE]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
