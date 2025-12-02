"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CheckCircle2, Calendar, CalendarDays } from "lucide-react"

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
    dateLabel?: string
}

export function TaskStats({ daily, weekly, monthly, dateLabel = "Día" }: TaskStatsProps) {
    const getComplianceColor = (value: number) => {
        if (value >= 80) return "text-green-600 dark:text-green-400"
        if (value >= 50) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    const getProgressColor = (value: number) => {
        if (value >= 80) return "bg-green-500"
        if (value >= 50) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4">
                    {/* Daily Progress */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">{dateLabel}</span>
                        </div>
                        <div className={cn("text-2xl font-bold", getComplianceColor(daily.compliance))}>
                            {daily.completed}/{daily.total}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                            <div
                                className={cn("h-1.5 rounded-full transition-all", getProgressColor(daily.compliance))}
                                style={{ width: `${daily.compliance}%` }}
                            />
                        </div>
                    </div>

                    {/* Weekly */}
                    <div className="text-center border-x border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs font-medium">Semana</span>
                        </div>
                        <div className={cn("text-2xl font-bold", getComplianceColor(weekly.compliance))}>
                            {weekly.totalCompleted}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            completadas
                        </div>
                    </div>

                    {/* Monthly */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-xs font-medium">Mes</span>
                        </div>
                        <div className={cn("text-2xl font-bold", getComplianceColor(monthly.compliance))}>
                            {monthly.totalCompleted}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            completadas
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
