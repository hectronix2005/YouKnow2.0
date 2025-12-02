"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { TaskForm } from "@/components/checklist/task-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    Users,
    BarChart3,
    Clock,
    Camera,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskTemplate {
    id: string
    title: string
    description: string | null
    frequency: string
    scheduledTime: string | null
    scheduledDay: number | null
    requiresPhoto: boolean
    category: string | null
    priority: string
    isActive: boolean
    createdAt: string
    assignments: {
        id: string
        employee: {
            id: string
            name: string
            email: string
        }
    }[]
}

interface Employee {
    id: string
    name: string
    email: string
    role: string
}

interface EmployeeStats {
    employee: Employee
    daily: {
        total: number
        completed: number
        pending: number
        compliance: number
    }
}

interface AllStatsResponse {
    date: string
    employees: EmployeeStats[]
    summary: {
        totalEmployees: number
        averageCompliance: number
    }
}

const FREQUENCY_LABELS = {
    daily: "Diaria",
    weekly: "Semanal",
    monthly: "Mensual",
} as const

const PRIORITY_LABELS = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
} as const

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function ChecklistAdmin() {
    const [tasks, setTasks] = useState<TaskTemplate[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [stats, setStats] = useState<AllStatsResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null)
    const [assigningTask, setAssigningTask] = useState<TaskTemplate | null>(null)
    const [expandedTask, setExpandedTask] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"tasks" | "employees">("tasks")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchTasks = useCallback(async () => {
        try {
            const response = await fetch("/api/checklist/tasks")
            if (!response.ok) throw new Error("Error al cargar tareas")
            const data = await response.json()
            setTasks(data)
        } catch (err) {
            console.error("Error fetching tasks:", err)
            setError("Error al cargar las tareas")
        }
    }, [])

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/users")
            if (!response.ok) throw new Error("Error al cargar empleados")
            const data = await response.json()
            // Filter employees (role = employee)
            setEmployees(data.filter((u: Employee) => u.role === "employee"))
        } catch (err) {
            console.error("Error fetching employees:", err)
        }
    }, [])

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/checklist/statistics", {
                method: "POST",
            })
            if (!response.ok) throw new Error("Error al cargar estadísticas")
            const data = await response.json()
            setStats(data)
        } catch (err) {
            console.error("Error fetching stats:", err)
        }
    }, [])

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        await Promise.all([fetchTasks(), fetchEmployees(), fetchStats()])
        setIsLoading(false)
    }, [fetchTasks, fetchEmployees, fetchStats])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleCreateTask = async (data: {
        title: string
        description: string
        frequency: "daily" | "weekly" | "monthly"
        scheduledTime: string
        scheduledDay: number | null
        requiresPhoto: boolean
        category: string
        priority: "low" | "medium" | "high"
    }) => {
        setIsSubmitting(true)
        try {
            const response = await fetch("/api/checklist/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al crear tarea")
            }

            await fetchTasks()
            setShowForm(false)
        } catch (err) {
            console.error("Error creating task:", err)
            setError(err instanceof Error ? err.message : "Error al crear tarea")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateTask = async (data: {
        title: string
        description: string
        frequency: "daily" | "weekly" | "monthly"
        scheduledTime: string
        scheduledDay: number | null
        requiresPhoto: boolean
        category: string
        priority: "low" | "medium" | "high"
    }) => {
        if (!editingTask) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/checklist/tasks/${editingTask.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al actualizar tarea")
            }

            await fetchTasks()
            setEditingTask(null)
        } catch (err) {
            console.error("Error updating task:", err)
            setError(err instanceof Error ? err.message : "Error al actualizar tarea")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("¿Estás seguro de eliminar esta tarea?")) return

        try {
            const response = await fetch(`/api/checklist/tasks/${taskId}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Error al eliminar tarea")

            await fetchTasks()
        } catch (err) {
            console.error("Error deleting task:", err)
            setError("Error al eliminar la tarea")
        }
    }

    const handleAssignTask = async (taskId: string, employeeId: string) => {
        try {
            const response = await fetch("/api/checklist/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskTemplateId: taskId, employeeId }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Error al asignar tarea")
            }

            await fetchTasks()
        } catch (err) {
            console.error("Error assigning task:", err)
            setError(err instanceof Error ? err.message : "Error al asignar tarea")
        }
    }

    const handleRemoveAssignment = async (assignmentId: string) => {
        try {
            const response = await fetch(
                `/api/checklist/assignments?assignmentId=${assignmentId}`,
                { method: "DELETE" }
            )

            if (!response.ok) throw new Error("Error al remover asignación")

            await fetchTasks()
        } catch (err) {
            console.error("Error removing assignment:", err)
            setError("Error al remover la asignación")
        }
    }

    const getScheduleText = (task: TaskTemplate) => {
        if (task.frequency === "daily") {
            return task.scheduledTime ? `Diaria a las ${task.scheduledTime}` : "Diaria"
        }
        if (task.frequency === "weekly") {
            const day = task.scheduledDay !== null ? DAY_LABELS[task.scheduledDay] : ""
            return `Semanal - ${day}${task.scheduledTime ? ` a las ${task.scheduledTime}` : ""}`
        }
        if (task.frequency === "monthly") {
            return `Mensual - día ${task.scheduledDay}${task.scheduledTime ? ` a las ${task.scheduledTime}` : ""}`
        }
        return task.frequency
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/checklist">
                    <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a Mis Tareas
                    </Button>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Administración de Tareas</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gestiona las tareas del checklist de empleados
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Tarea
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                    <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
                        Cerrar
                    </Button>
                </div>
            )}

            {/* Create/Edit Form */}
            {(showForm || editingTask) && (
                <div className="mb-8">
                    <TaskForm
                        initialData={
                            editingTask
                                ? {
                                    title: editingTask.title,
                                    description: editingTask.description || "",
                                    frequency: editingTask.frequency as "daily" | "weekly" | "monthly",
                                    scheduledTime: editingTask.scheduledTime || "",
                                    scheduledDay: editingTask.scheduledDay,
                                    requiresPhoto: editingTask.requiresPhoto,
                                    category: editingTask.category || "",
                                    priority: editingTask.priority as "low" | "medium" | "high",
                                }
                                : undefined
                        }
                        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                        onCancel={() => {
                            setShowForm(false)
                            setEditingTask(null)
                        }}
                        isLoading={isSubmitting}
                    />
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={activeTab === "tasks" ? "default" : "outline"}
                    onClick={() => setActiveTab("tasks")}
                >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tareas ({tasks.length})
                </Button>
                <Button
                    variant={activeTab === "employees" ? "default" : "outline"}
                    onClick={() => setActiveTab("employees")}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Empleados ({employees.length})
                </Button>
            </div>

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
                <div className="space-y-4">
                    {tasks.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    No hay tareas creadas todavía.
                                </p>
                                <Button onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear primera tarea
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        tasks.map((task) => (
                            <Card key={task.id} className={cn(!task.isActive && "opacity-60")}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold">{task.title}</h3>
                                                <span
                                                    className={cn(
                                                        "px-2 py-0.5 text-xs rounded",
                                                        task.priority === "high" &&
                                                        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                                                        task.priority === "medium" &&
                                                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                                                        task.priority === "low" &&
                                                        "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                    )}
                                                >
                                                    {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                                                </span>
                                                {!task.isActive && (
                                                    <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                        Inactiva
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {getScheduleText(task)}
                                                </span>
                                                {task.category && (
                                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                                                        {task.category}
                                                    </span>
                                                )}
                                                {task.requiresPhoto && (
                                                    <span className="flex items-center gap-1 text-orange-600">
                                                        <Camera className="h-3 w-3" />
                                                        Foto requerida
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {task.assignments.length} asignados
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingTask(task)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setExpandedTask(
                                                        expandedTask === task.id ? null : task.id
                                                    )
                                                }
                                            >
                                                {expandedTask === task.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded Section - Assignments */}
                                    {expandedTask === task.id && (
                                        <div className="mt-4 pt-4 border-t">
                                            {task.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    {task.description}
                                                </p>
                                            )}

                                            <h4 className="font-medium mb-2">Asignaciones:</h4>
                                            {task.assignments.length > 0 ? (
                                                <div className="space-y-2">
                                                    {task.assignments.map((assignment) => (
                                                        <div
                                                            key={assignment.id}
                                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                                        >
                                                            <div>
                                                                <p className="font-medium">
                                                                    {assignment.employee.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {assignment.employee.email}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleRemoveAssignment(assignment.id)
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 mb-2">
                                                    No hay empleados asignados
                                                </p>
                                            )}

                                            {/* Assign to employee */}
                                            <div className="mt-4">
                                                <select
                                                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignTask(task.id, e.target.value)
                                                            e.target.value = ""
                                                        }
                                                    }}
                                                >
                                                    <option value="">Asignar a empleado...</option>
                                                    {employees
                                                        .filter(
                                                            (emp) =>
                                                                !task.assignments.some(
                                                                    (a) => a.employee.id === emp.id
                                                                )
                                                        )
                                                        .map((emp) => (
                                                            <option key={emp.id} value={emp.id}>
                                                                {emp.name} ({emp.email})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Employees Tab */}
            {activeTab === "employees" && (
                <div className="space-y-4">
                    {/* Summary Card */}
                    {stats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen del día - {stats.date}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Total empleados</p>
                                        <p className="text-2xl font-bold">{stats.summary.totalEmployees}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Cumplimiento promedio</p>
                                        <p
                                            className={cn(
                                                "text-2xl font-bold",
                                                stats.summary.averageCompliance >= 80
                                                    ? "text-green-600"
                                                    : stats.summary.averageCompliance >= 50
                                                        ? "text-yellow-600"
                                                        : "text-red-600"
                                            )}
                                        >
                                            {stats.summary.averageCompliance}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Employee Stats */}
                    {stats?.employees.map((empStat) => (
                        <Card key={empStat.employee.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{empStat.employee.name}</h3>
                                        <p className="text-sm text-gray-500">{empStat.employee.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={cn(
                                                "text-2xl font-bold",
                                                empStat.daily.compliance >= 80
                                                    ? "text-green-600"
                                                    : empStat.daily.compliance >= 50
                                                        ? "text-yellow-600"
                                                        : "text-red-600"
                                            )}
                                        >
                                            {empStat.daily.compliance}%
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {empStat.daily.completed}/{empStat.daily.total} tareas
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={cn(
                                            "h-2 rounded-full transition-all",
                                            empStat.daily.compliance >= 80
                                                ? "bg-green-500"
                                                : empStat.daily.compliance >= 50
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                        )}
                                        style={{ width: `${empStat.daily.compliance}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {employees.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No hay empleados registrados con el rol &quot;employee&quot;.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Refresh Button */}
            <div className="fixed bottom-6 right-6">
                <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
                    onClick={loadData}
                    disabled={isLoading}
                >
                    <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>
        </div>
    )
}
