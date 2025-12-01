"use client"

import { useState, useEffect, useCallback } from "react"
import { TaskCard } from "@/components/checklist/task-card"
import { TaskStats } from "@/components/checklist/task-stats"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface TaskTemplate {
    id: string
    title: string
    description: string | null
    frequency: string
    scheduledTime: string | null
    requiresPhoto: boolean
    category: string | null
    priority: string
}

interface TaskData {
    assignmentId: string
    task: TaskTemplate
    status: "pending" | "completed" | "missed"
    completedAt: string | null
    photoUrl: string | null
    notes: string | null
    completionId: string | null
}

interface TasksResponse {
    date: string
    tasks: TaskData[]
    summary: {
        total: number
        completed: number
        pending: number
    }
}

interface StatsResponse {
    employee: { id: string; name: string; email: string }
    daily: {
        total: number
        completed: number
        pending: number
        compliance: number
    }
    weekly: {
        totalCompleted: number
        expected: number
        compliance: number
    }
    monthly: {
        totalCompleted: number
        expected: number
        compliance: number
    }
    onTimeRate: number
    period: {
        today: string
        weekStart: string
        monthStart: string
    }
}

interface ChecklistDashboardProps {
    userId: string
    userName: string
}

export function ChecklistDashboard({ userId, userName }: ChecklistDashboardProps) {
    const [tasks, setTasks] = useState<TaskData[]>([])
    const [stats, setStats] = useState<StatsResponse | null>(null)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isLoading, setIsLoading] = useState(true)
    const [isCompletingTask, setIsCompletingTask] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const formatDateForAPI = (date: Date) => {
        return date.toISOString().split("T")[0]
    }

    const fetchTasks = useCallback(async () => {
        try {
            const dateStr = formatDateForAPI(selectedDate)
            const response = await fetch(`/api/checklist/my-tasks?date=${dateStr}`)
            if (!response.ok) throw new Error("Error al cargar tareas")
            const data: TasksResponse = await response.json()
            setTasks(data.tasks)
        } catch (err) {
            console.error("Error fetching tasks:", err)
            setError("Error al cargar las tareas")
        }
    }, [selectedDate])

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch("/api/checklist/statistics")
            if (!response.ok) throw new Error("Error al cargar estadísticas")
            const data: StatsResponse = await response.json()
            setStats(data)
        } catch (err) {
            console.error("Error fetching stats:", err)
        }
    }, [])

    const loadData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        await Promise.all([fetchTasks(), fetchStats()])
        setIsLoading(false)
    }, [fetchTasks, fetchStats])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleCompleteTask = async (
        assignmentId: string,
        photoUrl?: string,
        notes?: string
    ) => {
        setIsCompletingTask(assignmentId)
        try {
            const response = await fetch("/api/checklist/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId,
                    photoUrl,
                    notes,
                    scheduledDate: formatDateForAPI(selectedDate),
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Error al completar tarea")
            }

            // Refresh data
            await loadData()
        } catch (err) {
            console.error("Error completing task:", err)
            setError(err instanceof Error ? err.message : "Error al completar tarea")
        } finally {
            setIsCompletingTask(null)
        }
    }

    const handleUploadPhoto = async (file: File): Promise<string> => {
        // TODO: Implement actual photo upload to Cloudinary or similar
        // For now, create a local URL
        return URL.createObjectURL(file)
    }

    const goToPreviousDay = () => {
        setSelectedDate((prev) => {
            const newDate = new Date(prev)
            newDate.setDate(newDate.getDate() - 1)
            return newDate
        })
    }

    const goToNextDay = () => {
        setSelectedDate((prev) => {
            const newDate = new Date(prev)
            newDate.setDate(newDate.getDate() + 1)
            return newDate
        })
    }

    const goToToday = () => {
        setSelectedDate(new Date())
    }

    const isToday = () => {
        const today = new Date()
        return (
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear()
        )
    }

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString("es", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
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

    const pendingTasks = tasks.filter((t) => t.status === "pending")
    const completedTasks = tasks.filter((t) => t.status === "completed")

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Mis Tareas</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Bienvenido, {userName}
                </p>
            </div>

            {/* Date Navigation */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="font-medium capitalize">
                                {formatDisplayDate(selectedDate)}
                            </span>
                            {!isToday() && (
                                <Button variant="outline" size="sm" onClick={goToToday}>
                                    Hoy
                                </Button>
                            )}
                        </div>

                        <Button variant="ghost" size="icon" onClick={goToNextDay}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {error}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => setError(null)}
                    >
                        Cerrar
                    </Button>
                </div>
            )}

            {/* Stats Section */}
            {stats && isToday() && (
                <div className="mb-8">
                    <TaskStats
                        daily={stats.daily}
                        weekly={stats.weekly}
                        monthly={stats.monthly}
                        onTimeRate={stats.onTimeRate}
                    />
                </div>
            )}

            {/* Tasks Section */}
            <div className="space-y-6">
                {/* Pending Tasks */}
                {pendingTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Pendientes ({pendingTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingTasks.map((taskData) => (
                                <TaskCard
                                    key={taskData.assignmentId}
                                    assignmentId={taskData.assignmentId}
                                    task={taskData.task}
                                    status={taskData.status}
                                    completedAt={taskData.completedAt}
                                    photoUrl={taskData.photoUrl}
                                    notes={taskData.notes}
                                    onComplete={handleCompleteTask}
                                    onUploadPhoto={handleUploadPhoto}
                                    isLoading={isCompletingTask === taskData.assignmentId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Completadas ({completedTasks.length})
                        </h2>
                        <div className="space-y-3">
                            {completedTasks.map((taskData) => (
                                <TaskCard
                                    key={taskData.assignmentId}
                                    assignmentId={taskData.assignmentId}
                                    task={taskData.task}
                                    status={taskData.status}
                                    completedAt={taskData.completedAt}
                                    photoUrl={taskData.photoUrl}
                                    notes={taskData.notes}
                                    onComplete={handleCompleteTask}
                                    onUploadPhoto={handleUploadPhoto}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No Tasks */}
                {tasks.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No tienes tareas programadas para este día.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

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
