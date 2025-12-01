import { auth } from "@/lib/auth"
import { isEmployee } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// POST complete a task
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isEmployee(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { assignmentId, photoUrl, photoPublicId, notes, scheduledDate } = body

        if (!assignmentId) {
            return NextResponse.json(
                { error: "assignmentId is required" },
                { status: 400 }
            )
        }

        // Check assignment exists and belongs to this employee
        const assignment = await prisma.taskAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                taskTemplate: true,
            },
        })

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
        }

        if (assignment.employeeId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Check if photo is required but not provided
        if (assignment.taskTemplate.requiresPhoto && !photoUrl) {
            return NextResponse.json(
                { error: "Photo evidence is required for this task" },
                { status: 400 }
            )
        }

        // Parse scheduled date or use today
        let taskDate: Date
        if (scheduledDate) {
            taskDate = new Date(scheduledDate)
        } else {
            taskDate = new Date()
        }
        taskDate.setHours(0, 0, 0, 0)

        const endOfDay = new Date(taskDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Check if already completed for this date
        const existingCompletion = await prisma.taskCompletion.findFirst({
            where: {
                assignmentId,
                scheduledDate: {
                    gte: taskDate,
                    lte: endOfDay,
                },
            },
        })

        if (existingCompletion) {
            // Update existing completion
            const updated = await prisma.taskCompletion.update({
                where: { id: existingCompletion.id },
                data: {
                    status: "completed",
                    photoUrl: photoUrl || existingCompletion.photoUrl,
                    photoPublicId: photoPublicId || existingCompletion.photoPublicId,
                    notes: notes || existingCompletion.notes,
                    completedAt: new Date(),
                },
            })

            return NextResponse.json(updated)
        }

        // Check if completing on time based on scheduled time
        let completedOnTime = true
        if (assignment.taskTemplate.scheduledTime) {
            const [hours, minutes] = assignment.taskTemplate.scheduledTime.split(":").map(Number)
            const scheduledDateTime = new Date(taskDate)
            scheduledDateTime.setHours(hours, minutes, 0, 0)

            // Give 30 minutes grace period
            const graceTime = new Date(scheduledDateTime)
            graceTime.setMinutes(graceTime.getMinutes() + 30)

            completedOnTime = new Date() <= graceTime
        }

        // Create new completion
        const completion = await prisma.taskCompletion.create({
            data: {
                assignmentId,
                scheduledDate: taskDate,
                status: "completed",
                photoUrl: photoUrl || null,
                photoPublicId: photoPublicId || null,
                notes: notes || null,
                completedOnTime,
            },
        })

        return NextResponse.json(completion)
    } catch (error) {
        console.error("[CHECKLIST_COMPLETE_POST]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH update a completion (e.g., add photo later)
export async function PATCH(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isEmployee(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { completionId, photoUrl, photoPublicId, notes } = body

        if (!completionId) {
            return NextResponse.json(
                { error: "completionId is required" },
                { status: 400 }
            )
        }

        // Check completion exists
        const completion = await prisma.taskCompletion.findUnique({
            where: { id: completionId },
            include: {
                assignment: true,
            },
        })

        if (!completion) {
            return NextResponse.json({ error: "Completion not found" }, { status: 404 })
        }

        if (completion.assignment.employeeId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updated = await prisma.taskCompletion.update({
            where: { id: completionId },
            data: {
                photoUrl: photoUrl !== undefined ? photoUrl : completion.photoUrl,
                photoPublicId: photoPublicId !== undefined ? photoPublicId : completion.photoPublicId,
                notes: notes !== undefined ? notes : completion.notes,
            },
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error("[CHECKLIST_COMPLETE_PATCH]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
