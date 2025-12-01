"use client"

import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, BookOpen, CheckCircle, PlayCircle, Award, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"

interface CourseDetailClientProps {
    user: any
    course: any
    enrollment: any | null
    isEnrolled: boolean
    totalLessons: number
    onSignOut: () => void
    onEnroll: () => void
}

export function CourseDetailClient({
    user,
    course,
    enrollment,
    isEnrolled,
    totalLessons,
    onSignOut,
    onEnroll
}: CourseDetailClientProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Navbar user={user} onSignOut={onSignOut} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Course Header */}
                <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                {course.category}
                            </span>
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                {course.level}
                            </span>
                        </div>

                        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{course.title}</h1>
                        {course.subtitle && (
                            <p className="mb-8 text-xl text-indigo-100 max-w-3xl leading-relaxed">{course.subtitle}</p>
                        )}

                        <div className="flex flex-wrap gap-6 text-sm font-medium">
                            <div className="flex items-center space-x-2">
                                <div className="p-1 bg-white/20 rounded-full">
                                    <Users className="h-4 w-4" />
                                </div>
                                <span>{t.courses.instructor.replace("{name}", course.instructor.name)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="p-1 bg-white/20 rounded-full">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <span>{t.courses.lessons.replace("{count}", totalLessons.toString())}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="p-1 bg-white/20 rounded-full">
                                    <Award className="h-4 w-4" />
                                </div>
                                <span>{t.courses.certificate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-none dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-xl">{t.courses.about}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                                    {course.description}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-none dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-xl">{t.courses.content}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {course.modules.map((module: any, index: number) => (
                                        <div key={module.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50 transition-all hover:border-indigo-200 dark:hover:border-indigo-900">
                                            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white flex items-center">
                                                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-1 rounded mr-2">
                                                    {t.courses.module.replace("{number}", (index + 1).toString())}
                                                </span>
                                                {module.title}
                                            </h3>
                                            {module.description && (
                                                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 ml-1">
                                                    {module.description}
                                                </p>
                                            )}
                                            <div className="space-y-2">
                                                {module.lessons.map((lesson: any) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            {lesson.isPreview ? (
                                                                <PlayCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                                            )}
                                                            <span className="text-gray-700 dark:text-gray-300">{lesson.title}</span>
                                                            {lesson.isPreview && (
                                                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                                    {t.courses.preview}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {lesson.videoDuration && (
                                                            <div className="flex items-center space-x-1 text-gray-500 text-xs">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{Math.ceil(lesson.videoDuration / 60)} min</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="sticky top-24">
                            <Card className="border-none shadow-xl shadow-indigo-500/10 dark:shadow-none dark:bg-gray-900 overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600" />
                                <CardContent className="p-6">
                                    {/* Price section hidden - all courses are free */}
                                    <div className="mb-6 text-center">
                                        <div className="mb-2 text-4xl font-bold text-green-600 dark:text-green-400">
                                            {t.courses.free}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Acceso completo gratuito
                                        </p>
                                    </div>

                                    {isEnrolled && enrollment ? (
                                        <>
                                            {/* Progress indicator */}
                                            {enrollment.progressPercent > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {t.dashboard.progress.replace("{percent}", Math.round(enrollment.progressPercent).toString())}
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            {enrollment.completedLessons}/{totalLessons}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                        <div
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${enrollment.progressPercent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <Link href={`/learn/${course.slug}`}>
                                                <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
                                                    {t.courses.continue}
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <form action={onEnroll}>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                                            >
                                                {t.courses.enroll}
                                            </Button>
                                        </form>
                                    )}

                                    <div className="mt-8 space-y-4">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                            {t.courses.includes}
                                        </h4>
                                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-3">
                                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                                <span>{t.courses.lifetimeAccess}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Award className="h-5 w-5 text-indigo-500" />
                                                <span>{t.courses.certificate}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Users className="h-5 w-5 text-purple-500" />
                                                <span>{t.courses.aiSupport}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
