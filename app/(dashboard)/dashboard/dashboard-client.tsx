"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import {
    Plus,
    Play,
    Users,
    Clock,
    MoreHorizontal,
    Star,
    Zap,
    Trophy,
    Flame,
    TrendingUp,
    BookOpen,
    Target
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { isCreator } from "@/lib/teacher"
import Link from "next/link"

interface DashboardClientProps {
    user: any
    onSignOut: () => void
}

export function DashboardClient({ user, onSignOut }: DashboardClientProps) {
    const { t } = useLanguage()

    // Mock data for recent kahoots/courses
    const recentItems = user.enrollments.slice(0, 4).map((enrollment: any, index: number) => ({
        id: enrollment.id,
        title: enrollment.course.title,
        type: "Curso",
        questionsCount: Math.floor(Math.random() * 20) + 5,
        plays: Math.floor(Math.random() * 100),
        lastPlayed: "Hace 2 días",
        color: ["#e21b3c", "#1368ce", "#26890c", "#d89e00"][index % 4],
        slug: enrollment.course.slug,
        progress: enrollment.progressPercent
    }))

    // Quick actions - Kahoot style (filtradas por permisos)
    const quickActions = [
        { icon: Plus, label: t.dashboard.create, sublabel: t.dashboard.newCourse, color: "#26890c", href: "/creador/create", show: isCreator(user.role) },
        { icon: BookOpen, label: t.dashboard.library, sublabel: t.dashboard.myCourses, color: "#1368ce", href: "/courses", show: true },
        { icon: Target, label: t.dashboard.discover, sublabel: t.dashboard.explore, color: "#e21b3c", href: "/discover", show: true },
        { icon: TrendingUp, label: t.dashboard.reports, sublabel: t.dashboard.statistics, color: "#d89e00", href: "/reports", show: true },
    ].filter(action => action.show)

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#0e0e0e]">
            {/* Sidebar */}
            <Sidebar user={user} onSignOut={onSignOut} />

            {/* Main Content - offset by sidebar width */}
            <div className="ml-[72px]">
                {/* Header */}
                <DashboardHeader user={user} />

                {/* Page Content */}
                <main className="p-6">
                    {/* Welcome Banner */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#46178f] to-[#1368ce] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                        <div className="relative">
                            <h1 className="text-2xl font-bold mb-1">
                                {t.dashboard.welcome.replace("{name}", user.name.split(' ')[0])}
                            </h1>
                            <p className="text-white/80 text-sm">
                                {t.dashboard.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#e21b3c]/10 flex items-center justify-center">
                                    <Flame className="h-5 w-5 text-[#e21b3c]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.streak}</p>
                                    <p className="text-xs text-gray-500">{t.dashboard.streakDays}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#46178f]/10 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-[#46178f]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.level[0]}.{user.level}</p>
                                    <p className="text-xs text-gray-500">{user.xp} XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#d89e00]/10 flex items-center justify-center">
                                    <Trophy className="h-5 w-5 text-[#d89e00]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.achievements.length}</p>
                                    <p className="text-xs text-gray-500">{t.dashboard.achievements}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-[#26890c]/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-[#26890c]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.enrollments.length}</p>
                                    <p className="text-xs text-gray-500">{t.dashboard.activeCourses}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions - Kahoot Style */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon
                            return (
                                <Link key={index} href={action.href}>
                                    <div
                                        className="group relative overflow-hidden rounded-xl p-5 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                                        style={{ backgroundColor: action.color }}
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-300" />
                                        <Icon className="h-8 w-8 mb-3 relative" />
                                        <p className="font-bold text-lg relative">{action.label}</p>
                                        <p className="text-sm text-white/80 relative">{action.sublabel}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Recent Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t.dashboard.continueLearning}
                            </h2>
                            <Link href="/courses" className="text-sm font-medium text-[#46178f] hover:underline">
                                {t.dashboard.viewAll}
                            </Link>
                        </div>

                        {recentItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {recentItems.map((item: any) => (
                                    <Link key={item.id} href={`/learn/${item.slug}`}>
                                        <div className="group bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                                            {/* Color Header */}
                                            <div
                                                className="h-24 relative flex items-center justify-center"
                                                style={{ backgroundColor: item.color }}
                                            >
                                                <span className="text-4xl font-black text-white/30">
                                                    {item.title.charAt(0)}
                                                </span>
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                                                        <Play className="h-5 w-5 text-gray-900 ml-0.5" fill="currentColor" />
                                                    </div>
                                                </div>
                                                {/* Progress indicator */}
                                                {item.progress > 0 && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                                        <div
                                                            className="h-full bg-white"
                                                            style={{ width: `${item.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Content */}
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-[#46178f] transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3" />
                                                        {item.questionsCount} {t.dashboard.lessons}
                                                    </span>
                                                    <span>{item.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-12 text-center">
                                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {t.dashboard.noCourses}
                                </h3>
                                <p className="text-gray-500 mb-4">{t.dashboard.startJourney}</p>
                                <Link href="/courses">
                                    <button className="px-6 py-2.5 rounded-full bg-[#46178f] text-white font-bold hover:bg-[#5a1eb5] transition-colors">
                                        {t.dashboard.browseCourses}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Featured Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t.dashboard.recommended}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Featured Large Card */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-[#1368ce] to-[#00cec8] rounded-xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                                <div className="relative">
                                    <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-bold mb-3">
                                        <Star className="h-3 w-3" />
                                        {t.dashboard.featured}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Python para Ciencia de Datos</h3>
                                    <p className="text-white/80 text-sm mb-4">
                                        Domina Python y el análisis de datos con nuestro curso completo.
                                    </p>
                                    <Link href="/courses/python-for-data-science">
                                        <button className="px-5 py-2 rounded-full bg-white text-[#1368ce] font-bold text-sm hover:bg-gray-100 transition-colors">
                                            {t.dashboard.start}
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            {/* Side Cards */}
                            <div className="space-y-4">
                                <div className="bg-[#e21b3c] rounded-xl p-5 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative">
                                        <Trophy className="h-6 w-6 mb-2" />
                                        <h4 className="font-bold mb-1">{t.dashboard.weeklyChallenge}</h4>
                                        <p className="text-xs text-white/80">{t.dashboard.weeklyChallengeDesc}</p>
                                    </div>
                                </div>
                                <div className="bg-[#26890c] rounded-xl p-5 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative">
                                        <Users className="h-6 w-6 mb-2" />
                                        <h4 className="font-bold mb-1">{t.dashboard.joinTeam}</h4>
                                        <p className="text-xs text-white/80">{t.dashboard.joinTeamDesc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
