"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react"

interface TaskStatsProps {
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
}

function ComplianceCircle({ value, size = "lg" }: { value: number; size?: "sm" | "lg" }) {
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (value / 100) * circumference

    const getColor = (v: number) => {
        if (v >= 80) return "text-green-500"
        if (v >= 50) return "text-yellow-500"
        return "text-red-500"
    }

    const sizeClass = size === "lg" ? "w-32 h-32" : "w-20 h-20"
    const textSize = size === "lg" ? "text-3xl" : "text-xl"

    return (
        <div className={cn("relative", sizeClass)}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className={cn("transition-all duration-500", getColor(value))}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("font-bold", textSize)}>{value}%</span>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
}: {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    trend?: "up" | "down" | null
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-400">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Icon className="h-8 w-8 text-gray-400" />
                        {trend === "up" && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {trend === "down" && <TrendingDown className="h-4 w-4 text-red-500" />}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function TaskStats({ daily, weekly, monthly, onTimeRate }: TaskStatsProps) {
    return (
        <div className="space-y-6">
            {/* Daily Progress */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Progreso del Día</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold">{daily.completed}</span>
                                <span className="text-gray-500">/ {daily.total} tareas</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                    className={cn(
                                        "h-3 rounded-full transition-all duration-500",
                                        daily.compliance >= 80 ? "bg-green-500" :
                                        daily.compliance >= 50 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${daily.compliance}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {daily.pending} tareas pendientes
                            </p>
                        </div>
                        <ComplianceCircle value={daily.compliance} />
                    </div>
                </CardContent>
            </Card>

            {/* Weekly and Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Esta Semana</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{weekly.totalCompleted}</p>
                                <p className="text-sm text-gray-500">tareas completadas</p>
                            </div>
                            <ComplianceCircle value={weekly.compliance} size="sm" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Este Mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{monthly.totalCompleted}</p>
                                <p className="text-sm text-gray-500">tareas completadas</p>
                            </div>
                            <ComplianceCircle value={monthly.compliance} size="sm" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="A Tiempo"
                    value={`${onTimeRate}%`}
                    subtitle="Tareas completadas puntualmente"
                    icon={Clock}
                    trend={onTimeRate >= 80 ? "up" : "down"}
                />
                <StatCard
                    title="Racha"
                    value={daily.compliance === 100 ? "100%" : `${daily.compliance}%`}
                    subtitle="Cumplimiento diario"
                    icon={CheckCircle2}
                    trend={daily.compliance >= 80 ? "up" : "down"}
                />
            </div>
        </div>
    )
}
