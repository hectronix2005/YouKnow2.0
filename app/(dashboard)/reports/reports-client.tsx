"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
    TrendingUp,
    Clock,
    Target,
    Trophy,
    Flame,
    BookOpen,
    CheckCircle,
    Calendar,
    BarChart3,
    Zap
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface ReportsClientProps {
    user: any
    onSignOut: () => void
}

export function ReportsClient({ user, onSignOut }: ReportsClientProps) {
    const { t } = useLanguage()

    // Calculate stats
    const totalCourses = user.enrollments.length
    const completedCourses = user.enrollments.filter((e: any) => e.progressPercent === 100).length
    const totalLessonsCompleted = user.enrollments.reduce((acc: number, e: any) => acc + e.completedLessons, 0)
    const averageProgress = totalCourses > 0
        ? Math.round(user.enrollments.reduce((acc: number, e: any) => acc + e.progressPercent, 0) / totalCourses)
        : 0

    // Mock weekly activity data
    const weeklyActivity = [
        { day: "Lun", minutes: 45, lessons: 3 },
        { day: "Mar", minutes: 30, lessons: 2 },
        { day: "Mié", minutes: 60, lessons: 4 },
        { day: "Jue", minutes: 15, lessons: 1 },
        { day: "Vie", minutes: 90, lessons: 5 },
        { day: "Sáb", minutes: 20, lessons: 1 },
        { day: "Dom", minutes: 0, lessons: 0 },
    ]

    const maxMinutes = Math.max(...weeklyActivity.map(d => d.minutes), 1)

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#121212]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {t.reports.title}
                        </h1>
                        <p className="text-gray-500">
                            {t.reports.subtitle}
                        </p>
                    </div>

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-[#46178f]/10 flex items-center justify-center">
                                    <Flame className="h-5 w-5 text-[#46178f]" />
                                </div>
                                <span className="text-xs font-medium text-[#26890c] bg-[#26890c]/10 px-2 py-1 rounded-full">
                                    +{user.streak > 0 ? user.streak : 0} {t.dashboard.days}
                                </span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.streak}</p>
                            <p className="text-sm text-gray-500">{t.reports.currentStreak}</p>
                        </div>

                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-[#1368ce]/10 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-[#1368ce]" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.xp}</p>
                            <p className="text-sm text-gray-500">{t.reports.totalXP}</p>
                        </div>

                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-[#26890c]/10 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-[#26890c]" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLessonsCompleted}</p>
                            <p className="text-sm text-gray-500">{t.reports.lessonsCompleted}</p>
                        </div>

                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="h-10 w-10 rounded-lg bg-[#d89e00]/10 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-[#d89e00]" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{user.achievements.length}</p>
                            <p className="text-sm text-gray-500">{t.reports.achievementsEarned}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Weekly Activity Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-[#46178f]" />
                                    {t.reports.weeklyActivity}
                                </h2>
                                <span className="text-sm text-gray-500">{t.reports.thisWeek}</span>
                            </div>
                            <div className="flex items-end justify-between gap-3 h-48">
                                {weeklyActivity.map((day, index) => (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col justify-end h-36">
                                            <div
                                                className="w-full rounded-lg transition-all duration-500"
                                                style={{
                                                    height: `${(day.minutes / maxMinutes) * 100}%`,
                                                    backgroundColor: ["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f", "#00cec8", "#e21b3c"][index],
                                                    minHeight: day.minutes > 0 ? "8px" : "0"
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-500">{day.day}</span>
                                        <span className="text-xs text-gray-400">{day.minutes}m</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Overview */}
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Target className="h-5 w-5 text-[#e21b3c]" />
                                {t.reports.overallProgress}
                            </h2>
                            <div className="space-y-6">
                                {/* Circular Progress */}
                                <div className="flex justify-center">
                                    <div className="relative h-32 w-32">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="#e5e7eb"
                                                strokeWidth="12"
                                                fill="none"
                                                className="dark:stroke-gray-700"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="#46178f"
                                                strokeWidth="12"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${averageProgress * 3.52} 352`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{averageProgress}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t.reports.activeCourses}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{totalCourses}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t.reports.completed}</span>
                                        <span className="font-bold text-[#26890c]">{completedCourses}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">{t.reports.inProgress}</span>
                                        <span className="font-bold text-[#1368ce]">{totalCourses - completedCourses}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Progress List */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-[#1368ce]" />
                            {t.reports.progressByCourse}
                        </h2>
                        {user.enrollments.length > 0 ? (
                            <div className="space-y-4">
                                {user.enrollments.map((enrollment: any, index: number) => {
                                    const colors = ["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f"]
                                    const color = colors[index % colors.length]
                                    return (
                                        <div key={enrollment.id} className="flex items-center gap-4">
                                            <div
                                                className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: color }}
                                            >
                                                <span className="text-lg font-bold text-white">
                                                    {enrollment.course.title.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {enrollment.course.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${enrollment.progressPercent}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-500 w-12 text-right">
                                                        {enrollment.progressPercent}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {enrollment.completedLessons} {t.reports.lessons}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {t.reports.completed}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                                    <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500">{t.reports.noActiveCourses}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
