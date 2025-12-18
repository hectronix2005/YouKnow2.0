"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
    RefreshCw,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Settings,
    CheckCircle2,
    Clock,
    Target,
    Flame,
    Trophy,
    Sparkles,
    ListTodo,
    Camera,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Star,
    TrendingUp,
    Filter,
    X,
    BarChart3,
    PieChart,
    Download,
    Zap,
    AlertCircle,
    Database
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    userEmail: string
    userRole?: string
}

const PRIORITY_CONFIG = {
    high: {
        color: "#e21b3c",
        bgColor: "bg-[#e21b3c]/10",
        borderColor: "border-[#e21b3c]",
        label: "Alta"
    },
    medium: {
        color: "#d89e00",
        bgColor: "bg-[#d89e00]/10",
        borderColor: "border-[#d89e00]",
        label: "Media"
    },
    low: {
        color: "#26890c",
        bgColor: "bg-[#26890c]/10",
        borderColor: "border-[#26890c]",
        label: "Baja"
    },
}

const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
    inventario: { color: "#1368ce", label: "Inventario" },
    limpieza: { color: "#00cec8", label: "Limpieza" },
    seguridad: { color: "#e21b3c", label: "Seguridad" },
    administrativo: { color: "#46178f", label: "Administrativo" },
    mantenimiento: { color: "#d89e00", label: "Mantenimiento" },
    reportes: { color: "#26890c", label: "Reportes" },
    reuniones: { color: "#864cbf", label: "Reuniones" },
}

const FREQUENCY_LABELS = {
    daily: "Diaria",
    weekly: "Semanal",
    monthly: "Mensual",
}

type ViewMode = "tasks" | "reports"
type FilterStatus = "all" | "pending" | "completed"

export function ChecklistDashboard({ userId, userName, userEmail, userRole }: ChecklistDashboardProps) {
    const isLeaderOrAdmin = userRole === 'lider' || userRole === 'admin' || userRole === 'super_admin'
    const [tasks, setTasks] = useState<TaskData[]>([])
    const [stats, setStats] = useState<StatsResponse | null>(null)
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isLoading, setIsLoading] = useState(true)
    const [isCompletingTask, setIsCompletingTask] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

    // View and filter states
    const [viewMode, setViewMode] = useState<ViewMode>("tasks")
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
    const [filterCategory, setFilterCategory] = useState<string | null>(null)
    const [filterPriority, setFilterPriority] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [seedingDemo, setSeedingDemo] = useState(false)

    // User object for sidebar and header
    const user = {
        name: userName,
        email: userEmail,
        role: userRole || "employee"
    }

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

            await loadData()
        } catch (err) {
            console.error("Error completing task:", err)
            setError(err instanceof Error ? err.message : "Error al completar tarea")
        } finally {
            setIsCompletingTask(null)
        }
    }

    const handleUploadPhoto = async (file: File): Promise<string> => {
        return URL.createObjectURL(file)
    }

    const handleSeedDemo = async () => {
        setSeedingDemo(true)
        try {
            const response = await fetch("/api/checklist/seed-demo", {
                method: "POST"
            })
            const data = await response.json()
            if (data.success) {
                await loadData()
            } else {
                setError(data.message || "Error al crear datos demo")
            }
        } catch (err) {
            setError("Error al crear datos demo")
        } finally {
            setSeedingDemo(false)
        }
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
            day: "numeric",
            month: "long",
        })
    }

    // Filtered tasks
    const filteredTasks = tasks.filter(task => {
        if (filterStatus !== "all" && task.status !== filterStatus) return false
        if (filterCategory && task.task.category !== filterCategory) return false
        if (filterPriority && task.task.priority !== filterPriority) return false
        return true
    })

    const pendingTasks = filteredTasks.filter((t) => t.status === "pending")
    const completedTasks = filteredTasks.filter((t) => t.status === "completed")

    // Stats from actual tasks (unfiltered for accuracy)
    const dailyFromTasks = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "completed").length,
        pending: tasks.filter(t => t.status === "pending").length,
        compliance: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 100
    }

    // Category breakdown
    const categoryBreakdown = tasks.reduce((acc, task) => {
        const cat = task.task.category || "otros"
        if (!acc[cat]) {
            acc[cat] = { total: 0, completed: 0 }
        }
        acc[cat].total++
        if (task.status === "completed") acc[cat].completed++
        return acc
    }, {} as Record<string, { total: number; completed: number }>)

    // Priority breakdown
    const priorityBreakdown = tasks.reduce((acc, task) => {
        const pri = task.task.priority
        if (!acc[pri]) {
            acc[pri] = { total: 0, completed: 0 }
        }
        acc[pri].total++
        if (task.status === "completed") acc[pri].completed++
        return acc
    }, {} as Record<string, { total: number; completed: number }>)

    const getComplianceColor = (value: number) => {
        if (value >= 80) return "#26890c"
        if (value >= 50) return "#d89e00"
        return "#e21b3c"
    }

    const getMotivationalMessage = () => {
        if (dailyFromTasks.total === 0) return "Sin tareas programadas"
        if (dailyFromTasks.compliance === 100) return "Excelente trabajo!"
        if (dailyFromTasks.compliance >= 75) return "Casi lo logras!"
        if (dailyFromTasks.compliance >= 50) return "Sigue adelante!"
        return "A completar tareas!"
    }

    const clearFilters = () => {
        setFilterStatus("all")
        setFilterCategory(null)
        setFilterPriority(null)
    }

    const hasActiveFilters = filterStatus !== "all" || filterCategory || filterPriority

    // Get unique categories from tasks
    const availableCategories = [...new Set(tasks.map(t => t.task.category).filter(Boolean))] as string[]

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#0e0e0e]">
            <Sidebar user={user} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6 max-w-6xl mx-auto">
                    {/* Hero Header */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#46178f] via-[#1368ce] to-[#00cec8] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />

                        <div className="relative flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ListTodo className="h-6 w-6" />
                                    <span className="text-white/80 text-sm font-medium">Mis Tareas</span>
                                </div>
                                <h1 className="text-2xl font-bold mb-1">
                                    Hola, {userName.split(' ')[0]}!
                                </h1>
                                <p className="text-white/80">
                                    {getMotivationalMessage()}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* View Mode Toggle */}
                                <div className="flex items-center bg-white/20 rounded-xl p-1">
                                    <button
                                        onClick={() => setViewMode("tasks")}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                                            viewMode === "tasks" ? "bg-white text-[#46178f]" : "text-white hover:bg-white/10"
                                        )}
                                    >
                                        <ListTodo className="h-4 w-4" />
                                        Tareas
                                    </button>
                                    <button
                                        onClick={() => setViewMode("reports")}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                                            viewMode === "reports" ? "bg-white text-[#46178f]" : "text-white hover:bg-white/10"
                                        )}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        Reportes
                                    </button>
                                </div>

                                {isLeaderOrAdmin && (
                                    <Link href="/checklist/admin">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-medium transition-all">
                                            <Settings className="h-4 w-4" />
                                            Administrar
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Today's Progress */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${getComplianceColor(dailyFromTasks.compliance)}20` }}
                                >
                                    <Target
                                        className="h-6 w-6"
                                        style={{ color: getComplianceColor(dailyFromTasks.compliance) }}
                                    />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {dailyFromTasks.completed}/{dailyFromTasks.total}
                                    </p>
                                    <p className="text-xs text-gray-500">Hoy</p>
                                </div>
                            </div>
                            <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${dailyFromTasks.compliance}%`,
                                        backgroundColor: getComplianceColor(dailyFromTasks.compliance)
                                    }}
                                />
                            </div>
                        </div>

                        {/* Weekly */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-[#1368ce]/10 flex items-center justify-center">
                                    <Flame className="h-6 w-6 text-[#1368ce]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.weekly.totalCompleted || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">Esta semana</p>
                                </div>
                            </div>
                        </div>

                        {/* Monthly */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-[#d89e00]/10 flex items-center justify-center">
                                    <Trophy className="h-6 w-6 text-[#d89e00]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.monthly.totalCompleted || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">Este mes</p>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Rate */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-[#26890c]/10 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-[#26890c]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats?.monthly.compliance || 0}%
                                    </p>
                                    <p className="text-xs text-gray-500">Cumplimiento</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {viewMode === "tasks" && (
                        <>
                            {/* Date Navigation + Filters */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={goToPreviousDay}
                                        className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-[#46178f]/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-[#46178f]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-gray-900 dark:text-white capitalize">
                                                {formatDisplayDate(selectedDate)}
                                            </p>
                                            {isToday() && (
                                                <span className="inline-flex items-center gap-1 text-xs text-[#46178f] font-medium">
                                                    <Sparkles className="h-3 w-3" />
                                                    Hoy
                                                </span>
                                            )}
                                        </div>
                                        {!isToday() && (
                                            <button
                                                onClick={goToToday}
                                                className="px-3 py-1.5 rounded-lg bg-[#46178f] text-white text-sm font-medium hover:bg-[#5a1eb5] transition-colors"
                                            >
                                                Ir a hoy
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        onClick={goToNextDay}
                                        className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>

                                {/* Filter Bar */}
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all",
                                            showFilters || hasActiveFilters
                                                ? "bg-[#46178f] text-white"
                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                                        )}
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filtros
                                        {hasActiveFilters && (
                                            <span className="h-5 w-5 rounded-full bg-white text-[#46178f] text-xs font-bold flex items-center justify-center">
                                                {[filterStatus !== "all", filterCategory, filterPriority].filter(Boolean).length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Quick Status Filters */}
                                    <div className="flex items-center gap-2">
                                        {[
                                            { id: "all", label: "Todas", count: tasks.length },
                                            { id: "pending", label: "Pendientes", count: tasks.filter(t => t.status === "pending").length },
                                            { id: "completed", label: "Completadas", count: tasks.filter(t => t.status === "completed").length },
                                        ].map(status => (
                                            <button
                                                key={status.id}
                                                onClick={() => setFilterStatus(status.id as FilterStatus)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                    filterStatus === status.id
                                                        ? "bg-[#46178f]/10 text-[#46178f]"
                                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                )}
                                            >
                                                {status.label} ({status.count})
                                            </button>
                                        ))}
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                            Limpiar
                                        </button>
                                    )}
                                </div>

                                {/* Expanded Filters */}
                                {showFilters && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                                        {/* Category Filter */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-2">Categoría</p>
                                            <div className="flex flex-wrap gap-2">
                                                {availableCategories.map(cat => {
                                                    const config = CATEGORY_CONFIG[cat] || { color: "#666", label: cat }
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                                filterCategory === cat
                                                                    ? "text-white"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                            )}
                                                            style={filterCategory === cat ? { backgroundColor: config.color } : {}}
                                                        >
                                                            {config.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Priority Filter */}
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 mb-2">Prioridad</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setFilterPriority(filterPriority === key ? null : key)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                            filterPriority === key
                                                                ? "text-white"
                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                                        )}
                                                        style={filterPriority === key ? { backgroundColor: config.color } : {}}
                                                    >
                                                        {config.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-[#e21b3c]/10 border border-[#e21b3c]/20 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-[#e21b3c]" />
                                        <span className="text-[#e21b3c] font-medium">{error}</span>
                                    </div>
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-[#e21b3c] hover:bg-[#e21b3c]/10 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="h-16 w-16 rounded-full bg-[#46178f]/10 flex items-center justify-center mb-4">
                                        <RefreshCw className="h-8 w-8 text-[#46178f] animate-spin" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Cargando tareas...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Pending Tasks */}
                                    {pendingTasks.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-8 w-8 rounded-lg bg-[#e21b3c]/10 flex items-center justify-center">
                                                    <Clock className="h-4 w-4 text-[#e21b3c]" />
                                                </div>
                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Pendientes
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-full bg-[#e21b3c] text-white text-xs font-bold">
                                                    {pendingTasks.length}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {pendingTasks.map((taskData) => (
                                                    <TaskCardNew
                                                        key={taskData.assignmentId}
                                                        taskData={taskData}
                                                        isExpanded={expandedTaskId === taskData.assignmentId}
                                                        onToggleExpand={() => setExpandedTaskId(
                                                            expandedTaskId === taskData.assignmentId ? null : taskData.assignmentId
                                                        )}
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
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="h-8 w-8 rounded-lg bg-[#26890c]/10 flex items-center justify-center">
                                                    <CheckCircle2 className="h-4 w-4 text-[#26890c]" />
                                                </div>
                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                                    Completadas
                                                </h2>
                                                <span className="px-2.5 py-0.5 rounded-full bg-[#26890c] text-white text-xs font-bold">
                                                    {completedTasks.length}
                                                </span>
                                            </div>
                                            <div className="space-y-3">
                                                {completedTasks.map((taskData) => (
                                                    <TaskCardNew
                                                        key={taskData.assignmentId}
                                                        taskData={taskData}
                                                        isExpanded={expandedTaskId === taskData.assignmentId}
                                                        onToggleExpand={() => setExpandedTaskId(
                                                            expandedTaskId === taskData.assignmentId ? null : taskData.assignmentId
                                                        )}
                                                        onComplete={handleCompleteTask}
                                                        onUploadPhoto={handleUploadPhoto}
                                                        isLoading={false}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {tasks.length === 0 && (
                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-12 text-center">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#46178f]/20 to-[#1368ce]/20 flex items-center justify-center mx-auto mb-4">
                                                <Database className="h-10 w-10 text-[#46178f]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                Sin tareas asignadas
                                            </h3>
                                            <p className="text-gray-500 mb-6">
                                                No tienes tareas asignadas. Crea datos de prueba para explorar el módulo.
                                            </p>
                                            <button
                                                onClick={handleSeedDemo}
                                                disabled={seedingDemo}
                                                className="px-6 py-3 rounded-full bg-[#46178f] text-white font-bold hover:bg-[#5a1eb5] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                            >
                                                {seedingDemo ? (
                                                    <>
                                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                                        Creando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="h-5 w-5" />
                                                        Crear datos demo
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* No results after filter */}
                                    {tasks.length > 0 && filteredTasks.length === 0 && (
                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-12 text-center">
                                            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                                <Filter className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                Sin resultados
                                            </h3>
                                            <p className="text-gray-500 mb-4">
                                                No hay tareas que coincidan con los filtros seleccionados.
                                            </p>
                                            <button
                                                onClick={clearFilters}
                                                className="px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 transition-colors"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Reports View */}
                    {viewMode === "reports" && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Daily Report */}
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Hoy</h3>
                                        <div className="h-10 w-10 rounded-xl bg-[#46178f]/10 flex items-center justify-center">
                                            <Target className="h-5 w-5 text-[#46178f]" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Completadas</span>
                                            <span className="font-bold text-[#26890c]">{dailyFromTasks.completed}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Pendientes</span>
                                            <span className="font-bold text-[#e21b3c]">{dailyFromTasks.pending}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Total</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{dailyFromTasks.total}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cumplimiento</span>
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: getComplianceColor(dailyFromTasks.compliance) }}
                                                >
                                                    {dailyFromTasks.compliance}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${dailyFromTasks.compliance}%`,
                                                        backgroundColor: getComplianceColor(dailyFromTasks.compliance)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weekly Report */}
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Esta Semana</h3>
                                        <div className="h-10 w-10 rounded-xl bg-[#1368ce]/10 flex items-center justify-center">
                                            <Flame className="h-5 w-5 text-[#1368ce]" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Completadas</span>
                                            <span className="font-bold text-[#26890c]">{stats?.weekly.totalCompleted || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Esperadas</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{stats?.weekly.expected || 0}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cumplimiento</span>
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: getComplianceColor(stats?.weekly.compliance || 0) }}
                                                >
                                                    {stats?.weekly.compliance || 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${stats?.weekly.compliance || 0}%`,
                                                        backgroundColor: getComplianceColor(stats?.weekly.compliance || 0)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Report */}
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Este Mes</h3>
                                        <div className="h-10 w-10 rounded-xl bg-[#d89e00]/10 flex items-center justify-center">
                                            <Trophy className="h-5 w-5 text-[#d89e00]" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Completadas</span>
                                            <span className="font-bold text-[#26890c]">{stats?.monthly.totalCompleted || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Esperadas</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{stats?.monthly.expected || 0}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cumplimiento</span>
                                                <span
                                                    className="text-lg font-bold"
                                                    style={{ color: getComplianceColor(stats?.monthly.compliance || 0) }}
                                                >
                                                    {stats?.monthly.compliance || 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${stats?.monthly.compliance || 0}%`,
                                                        backgroundColor: getComplianceColor(stats?.monthly.compliance || 0)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Por Categoría</h3>
                                    <PieChart className="h-5 w-5 text-gray-400" />
                                </div>
                                {Object.keys(categoryBreakdown).length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Object.entries(categoryBreakdown).map(([cat, data]) => {
                                            const config = CATEGORY_CONFIG[cat] || { color: "#666", label: cat }
                                            const compliance = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                                            return (
                                                <div
                                                    key={cat}
                                                    className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800"
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: config.color }}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                                {data.completed}/{data.total}
                                                            </p>
                                                            <p className="text-xs text-gray-500">tareas</p>
                                                        </div>
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{ color: getComplianceColor(compliance) }}
                                                        >
                                                            {compliance}%
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${compliance}%`,
                                                                backgroundColor: config.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        No hay datos de categorías disponibles
                                    </p>
                                )}
                            </div>

                            {/* Priority Breakdown */}
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Por Prioridad</h3>
                                    <BarChart3 className="h-5 w-5 text-gray-400" />
                                </div>
                                {Object.keys(priorityBreakdown).length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                                            const data = priorityBreakdown[key] || { total: 0, completed: 0 }
                                            const compliance = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                                            return (
                                                <div key={key} className="flex items-center gap-4">
                                                    <div className="w-24 flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: config.color }}
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
                                                        <div
                                                            className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                                                            style={{
                                                                width: `${compliance}%`,
                                                                backgroundColor: config.color,
                                                                minWidth: compliance > 0 ? '60px' : '0'
                                                            }}
                                                        >
                                                            {compliance > 0 && (
                                                                <span className="text-xs font-bold text-white">
                                                                    {compliance}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-20 text-right">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {data.completed}/{data.total}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        No hay datos de prioridad disponibles
                                    </p>
                                )}
                            </div>

                            {/* On-Time Rate */}
                            {stats && (
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                                Tasa de Puntualidad
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Porcentaje de tareas completadas a tiempo
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="text-4xl font-bold"
                                                style={{ color: getComplianceColor(stats.onTimeRate) }}
                                            >
                                                {stats.onTimeRate}%
                                            </p>
                                            <p className="text-sm text-gray-500">a tiempo</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating Refresh Button */}
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#46178f] text-white shadow-lg hover:bg-[#5a1eb5] hover:shadow-xl hover:scale-105 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={cn("h-6 w-6", isLoading && "animate-spin")} />
                    </button>
                </main>
            </div>
        </div>
    )
}

// TaskCard Component
function TaskCardNew({
    taskData,
    isExpanded,
    onToggleExpand,
    onComplete,
    onUploadPhoto,
    isLoading,
}: {
    taskData: TaskData
    isExpanded: boolean
    onToggleExpand: () => void
    onComplete: (assignmentId: string, photoUrl?: string, notes?: string) => Promise<void>
    onUploadPhoto: (file: File) => Promise<string>
    isLoading: boolean
}) {
    const [localNotes, setLocalNotes] = useState(taskData.notes || "")
    const [uploading, setUploading] = useState(false)
    const [localPhotoUrl, setLocalPhotoUrl] = useState(taskData.photoUrl)

    const isCompleted = taskData.status === "completed"
    const task = taskData.task
    const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium
    const categoryConfig = CATEGORY_CONFIG[task.category || ""] || { color: "#666", label: task.category }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const url = await onUploadPhoto(file)
            setLocalPhotoUrl(url)
        } catch (error) {
            console.error("Error uploading photo:", error)
        } finally {
            setUploading(false)
        }
    }

    const handleComplete = async () => {
        await onComplete(taskData.assignmentId, localPhotoUrl || undefined, localNotes || undefined)
    }

    return (
        <div
            className={cn(
                "bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md",
                isCompleted && "opacity-75"
            )}
        >
            <div className="h-1" style={{ backgroundColor: priorityConfig.color }} />

            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                            onClick={isCompleted ? undefined : onToggleExpand}
                            className={cn(
                                "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
                                isCompleted
                                    ? "bg-[#26890c] border-[#26890c]"
                                    : "border-gray-300 dark:border-gray-600 hover:border-[#46178f]"
                            )}
                        >
                            {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>

                        <div className="flex-1 min-w-0">
                            <h3 className={cn(
                                "font-bold text-gray-900 dark:text-white",
                                isCompleted && "line-through text-gray-500"
                            )}>
                                {task.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {task.scheduledTime && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {task.scheduledTime}
                                    </span>
                                )}
                                <span
                                    className="px-2 py-1 rounded-lg text-xs font-bold"
                                    style={{
                                        backgroundColor: `${priorityConfig.color}15`,
                                        color: priorityConfig.color
                                    }}
                                >
                                    {priorityConfig.label}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-[#1368ce]/10 text-[#1368ce] text-xs font-medium">
                                    {FREQUENCY_LABELS[task.frequency as keyof typeof FREQUENCY_LABELS]}
                                </span>
                                {task.category && (
                                    <span
                                        className="px-2 py-1 rounded-lg text-xs font-medium"
                                        style={{
                                            backgroundColor: `${categoryConfig.color}15`,
                                            color: categoryConfig.color
                                        }}
                                    >
                                        {categoryConfig.label}
                                    </span>
                                )}
                                {task.requiresPhoto && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#d89e00]/10 text-[#d89e00] text-xs font-medium">
                                        <Camera className="h-3 w-3" />
                                        Foto
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onToggleExpand}
                        className="flex-shrink-0 h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 ml-9 space-y-4">
                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                {task.description}
                            </p>
                        )}

                        {!isCompleted && (
                            <>
                                {task.requiresPhoto && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                            <Camera className="h-4 w-4 text-[#d89e00]" />
                                            Evidencia fotográfica
                                            <span className="text-[#e21b3c]">*</span>
                                        </label>
                                        {localPhotoUrl ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={localPhotoUrl}
                                                    alt="Evidencia"
                                                    className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-gray-700"
                                                />
                                                <button
                                                    onClick={() => setLocalPhotoUrl(null)}
                                                    className="text-sm text-[#46178f] font-medium hover:underline"
                                                >
                                                    Cambiar foto
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d89e00]/10 text-[#d89e00] font-medium cursor-pointer hover:bg-[#d89e00]/20 transition-colors w-fit">
                                                <Camera className="h-4 w-4" />
                                                {uploading ? "Subiendo..." : "Subir foto"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={handlePhotoUpload}
                                                    disabled={uploading}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        value={localNotes}
                                        onChange={(e) => setLocalNotes(e.target.value)}
                                        placeholder="Agregar notas o comentarios..."
                                        className="w-full px-4 py-3 text-sm border-0 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#46178f] resize-none h-20"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={handleComplete}
                                        disabled={isLoading || (task.requiresPhoto && !localPhotoUrl)}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                            task.requiresPhoto && !localPhotoUrl
                                                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                                                : "bg-[#26890c] text-white hover:bg-[#2ea00f] hover:scale-[1.02]"
                                        )}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4" />
                                                Completar tarea
                                            </>
                                        )}
                                    </button>
                                    {task.requiresPhoto && !localPhotoUrl && (
                                        <span className="text-xs text-[#e21b3c] flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Sube una foto primero
                                        </span>
                                    )}
                                </div>
                            </>
                        )}

                        {isCompleted && (
                            <div className="space-y-3">
                                {taskData.completedAt && (
                                    <div className="flex items-center gap-2 text-[#26890c]">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Completada el {new Date(taskData.completedAt).toLocaleString("es", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                )}
                                {taskData.photoUrl && (
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Evidencia:</p>
                                        <img
                                            src={taskData.photoUrl}
                                            alt="Evidencia"
                                            className="w-full max-w-xs rounded-xl border border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                )}
                                {taskData.notes && (
                                    <div>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Notas:</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                            {taskData.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
