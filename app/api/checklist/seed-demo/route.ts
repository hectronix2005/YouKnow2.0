import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// Demo task templates
const DEMO_TASKS = [
    // Tareas diarias
    {
        title: "Verificar inventario de productos",
        description: "Revisar stock disponible y reportar faltantes",
        frequency: "daily",
        scheduledTime: "08:00",
        requiresPhoto: false,
        category: "inventario",
        priority: "high"
    },
    {
        title: "Limpieza del área de trabajo",
        description: "Mantener el espacio de trabajo limpio y organizado",
        frequency: "daily",
        scheduledTime: "09:00",
        requiresPhoto: true,
        category: "limpieza",
        priority: "medium"
    },
    {
        title: "Revisión de equipos de seguridad",
        description: "Verificar extintores, salidas de emergencia y señalización",
        frequency: "daily",
        scheduledTime: "10:00",
        requiresPhoto: true,
        category: "seguridad",
        priority: "high"
    },
    {
        title: "Actualizar registro de asistencia",
        description: "Registrar hora de entrada y salida del personal",
        frequency: "daily",
        scheduledTime: "08:30",
        requiresPhoto: false,
        category: "administrativo",
        priority: "medium"
    },
    {
        title: "Responder correos pendientes",
        description: "Revisar bandeja de entrada y responder mensajes urgentes",
        frequency: "daily",
        scheduledTime: "11:00",
        requiresPhoto: false,
        category: "administrativo",
        priority: "low"
    },
    {
        title: "Verificar temperatura de refrigeradores",
        description: "Registrar temperaturas y reportar anomalías",
        frequency: "daily",
        scheduledTime: "07:30",
        requiresPhoto: true,
        category: "mantenimiento",
        priority: "high"
    },
    // Tareas semanales
    {
        title: "Reporte semanal de ventas",
        description: "Consolidar y enviar reporte de ventas de la semana",
        frequency: "weekly",
        scheduledDay: 5, // Viernes
        scheduledTime: "16:00",
        requiresPhoto: false,
        category: "reportes",
        priority: "high"
    },
    {
        title: "Mantenimiento preventivo de equipos",
        description: "Revisión y limpieza de equipos de cómputo",
        frequency: "weekly",
        scheduledDay: 1, // Lunes
        scheduledTime: "14:00",
        requiresPhoto: true,
        category: "mantenimiento",
        priority: "medium"
    },
    {
        title: "Reunión de equipo",
        description: "Sincronización semanal con el equipo de trabajo",
        frequency: "weekly",
        scheduledDay: 1, // Lunes
        scheduledTime: "09:00",
        requiresPhoto: false,
        category: "reuniones",
        priority: "medium"
    },
    // Tareas mensuales
    {
        title: "Inventario general mensual",
        description: "Conteo físico completo del inventario",
        frequency: "monthly",
        scheduledDay: 1, // Día 1 del mes
        scheduledTime: "08:00",
        requiresPhoto: true,
        category: "inventario",
        priority: "high"
    },
    {
        title: "Evaluación de desempeño",
        description: "Revisar métricas y objetivos del mes",
        frequency: "monthly",
        scheduledDay: 28,
        scheduledTime: "15:00",
        requiresPhoto: false,
        category: "administrativo",
        priority: "medium"
    }
]

// POST - Seed demo data for the current user
export async function POST(req: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Check if user already has tasks
        const existingAssignments = await prisma.taskAssignment.count({
            where: { employeeId: userId }
        })

        if (existingAssignments > 0) {
            return NextResponse.json({
                message: "El usuario ya tiene tareas asignadas",
                existingTasks: existingAssignments
            })
        }

        // Create task templates and assign to user
        const createdTasks = []
        const createdAssignments = []

        for (const taskData of DEMO_TASKS) {
            // Create task template
            const task = await prisma.taskTemplate.create({
                data: {
                    ...taskData,
                    createdById: userId,
                    isActive: true
                }
            })
            createdTasks.push(task)

            // Create assignment for the user
            const assignment = await prisma.taskAssignment.create({
                data: {
                    taskTemplateId: task.id,
                    employeeId: userId,
                    isActive: true
                }
            })
            createdAssignments.push(assignment)
        }

        // Create some completions for the past days to show history
        const today = new Date()
        const completionsCreated = []

        for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
            const targetDate = new Date(today)
            targetDate.setDate(targetDate.getDate() - daysAgo)
            targetDate.setUTCHours(0, 0, 0, 0)

            // For each assignment, create completion based on day
            for (const assignment of createdAssignments) {
                const task = createdTasks.find(t => t.id === assignment.taskTemplateId)
                if (!task) continue

                // Check if task should appear on this date
                const dayOfWeek = targetDate.getUTCDay()
                const dayOfMonth = targetDate.getUTCDate()

                let shouldAppear = false
                if (task.frequency === "daily") {
                    shouldAppear = true
                } else if (task.frequency === "weekly" && task.scheduledDay === dayOfWeek) {
                    shouldAppear = true
                } else if (task.frequency === "monthly" && task.scheduledDay === dayOfMonth) {
                    shouldAppear = true
                }

                if (!shouldAppear) continue

                // Create completion (80% completion rate for demo)
                const shouldComplete = Math.random() < 0.8

                if (shouldComplete) {
                    const completedAt = new Date(targetDate)
                    completedAt.setUTCHours(
                        parseInt(task.scheduledTime?.split(":")[0] || "9"),
                        parseInt(task.scheduledTime?.split(":")[1] || "0") + Math.floor(Math.random() * 30),
                        0,
                        0
                    )

                    const completion = await prisma.taskCompletion.create({
                        data: {
                            assignmentId: assignment.id,
                            completedAt,
                            scheduledDate: targetDate,
                            status: "completed",
                            completedOnTime: Math.random() < 0.9,
                            notes: Math.random() < 0.3 ? "Tarea completada sin novedades" : null
                        }
                    })
                    completionsCreated.push(completion)
                }
            }
        }

        // Create some completions for TODAY (leave some pending)
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0))

        let todayCompleted = 0
        let todayPending = 0

        for (let i = 0; i < createdAssignments.length; i++) {
            const assignment = createdAssignments[i]
            const task = createdTasks.find(t => t.id === assignment.taskTemplateId)
            if (!task) continue

            // Only daily tasks appear today for demo
            if (task.frequency !== "daily") continue

            // Complete 60% of today's tasks
            if (i < createdAssignments.length * 0.6) {
                const completedAt = new Date()
                completedAt.setHours(
                    parseInt(task.scheduledTime?.split(":")[0] || "9"),
                    parseInt(task.scheduledTime?.split(":")[1] || "0"),
                    0,
                    0
                )

                await prisma.taskCompletion.create({
                    data: {
                        assignmentId: assignment.id,
                        completedAt,
                        scheduledDate: todayUTC,
                        status: "completed",
                        completedOnTime: true,
                        notes: null
                    }
                })
                todayCompleted++
            } else {
                todayPending++
            }
        }

        return NextResponse.json({
            success: true,
            message: "Datos demo creados exitosamente",
            summary: {
                tasksCreated: createdTasks.length,
                assignmentsCreated: createdAssignments.length,
                completionsCreated: completionsCreated.length,
                todayCompleted,
                todayPending
            }
        })
    } catch (error) {
        console.error("[CHECKLIST_SEED_DEMO]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - Remove all demo data for the current user
export async function DELETE(req: Request) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Delete all completions for this user's assignments
        const assignments = await prisma.taskAssignment.findMany({
            where: { employeeId: session.user.id },
            select: { id: true, taskTemplateId: true }
        })

        const assignmentIds = assignments.map(a => a.id)
        const taskIds = [...new Set(assignments.map(a => a.taskTemplateId))]

        // Delete completions
        await prisma.taskCompletion.deleteMany({
            where: { assignmentId: { in: assignmentIds } }
        })

        // Delete assignments
        await prisma.taskAssignment.deleteMany({
            where: { employeeId: session.user.id }
        })

        // Delete task templates created by this user (only if no other assignments)
        for (const taskId of taskIds) {
            const otherAssignments = await prisma.taskAssignment.count({
                where: { taskTemplateId: taskId }
            })
            if (otherAssignments === 0) {
                await prisma.taskTemplate.delete({
                    where: { id: taskId }
                })
            }
        }

        return NextResponse.json({
            success: true,
            message: "Datos demo eliminados"
        })
    } catch (error) {
        console.error("[CHECKLIST_DELETE_DEMO]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
