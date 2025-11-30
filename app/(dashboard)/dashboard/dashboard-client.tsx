"use client"

import { Navbar } from "@/components/layout/navbar"
import { CourseCard } from "@/components/course/course-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, Zap, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardClientProps {
    user: any
    onSignOut: () => void
}

export function DashboardClient({ user, onSignOut }: DashboardClientProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar user={user} onSignOut={onSignOut} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t.dashboard.welcome.replace("{name}", user.name)}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t.dashboard.subtitle}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                    <Card className="border-none shadow-lg shadow-orange-500/5 bg-white dark:bg-gray-900 transition-transform hover:-translate-y-1 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t.dashboard.streak}
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center dark:bg-orange-900/20">
                                <Flame className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.streak} {t.dashboard.days} 🔥
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-indigo-500/5 bg-white dark:bg-gray-900 transition-transform hover:-translate-y-1 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t.dashboard.level}
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center dark:bg-indigo-900/20">
                                <Zap className="h-4 w-4 text-indigo-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {t.dashboard.level} {user.level}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {user.xp} {t.dashboard.xp}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-yellow-500/5 bg-white dark:bg-gray-900 transition-transform hover:-translate-y-1 duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t.dashboard.achievements}
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center dark:bg-yellow-900/20">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {user.achievements.length} {t.dashboard.badges}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Continue Learning */}
                {user.enrollments.length > 0 ? (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {t.dashboard.continueLearning}
                            </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {user.enrollments.map((enrollment: any) => (
                                <CourseCard
                                    key={enrollment.id}
                                    course={enrollment.course}
                                    enrollment={enrollment}
                                    showProgress
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="mb-12 border-dashed border-2 bg-transparent shadow-none">
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 dark:bg-gray-800">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
                                {t.dashboard.noCourses}
                            </p>
                            <Link href="/courses">
                                <Button variant="primary">
                                    {t.dashboard.browseCourses}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Recommended Courses */}
                <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t.dashboard.recommended}
                        </h2>
                        <Link href="/courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center">
                            {t.dashboard.viewAll}
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
                        <div className="max-w-2xl">
                            <h3 className="text-2xl font-bold mb-2">Python for Data Science</h3>
                            <p className="text-indigo-100 mb-6">
                                Master Python programming and data analysis with our comprehensive course.
                            </p>
                            <Link href="/courses/python-for-data-science">
                                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100 border-none">
                                    {t.courses.enroll}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function BookOpen(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
