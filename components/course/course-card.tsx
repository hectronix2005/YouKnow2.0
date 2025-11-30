"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface CourseCardProps {
    course: {
        id: string
        title: string
        subtitle?: string | null
        slug: string
        category: string
        level: string
        thumbnail?: string | null
        price: number
        isFree: boolean
        instructor: {
            name: string
        }
    }
    enrollment?: {
        progressPercent: number
        completedLessons: number
    }
    showProgress?: boolean
}

export function CourseCard({ course, enrollment, showProgress = false }: CourseCardProps) {
    const { t } = useLanguage()

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-none bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-none">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center relative">
                        <div className="absolute inset-0 bg-black/10" />
                        <span className="text-6xl font-bold text-white/20 select-none relative z-10">
                            {course.title.charAt(0)}
                        </span>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20">
                            <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                                {course.category}
                            </span>
                        </div>
                    </div>
                )}

                {/* Level Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur-md shadow-sm">
                        {course.level}
                    </span>
                </div>
            </div>

            <CardHeader className="pb-3">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <Users className="h-3 w-3" />
                        <span>{t.courses.instructor.replace("{name}", course.instructor.name)}</span>
                    </div>
                    {/* Price hidden - all courses are free for now */}
                </div>

                <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {course.title}
                </CardTitle>

                {course.subtitle && (
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {course.subtitle}
                    </p>
                )}
            </CardHeader>

            <CardContent className="pb-3">
                {showProgress && enrollment && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {t.dashboard.progress.replace("{percent}", enrollment.progressPercent.toString())}
                            </span>
                        </div>
                        <Progress value={enrollment.progressPercent} className="h-2" />
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Link href={showProgress ? `/learn/${course.slug}` : `/courses/${course.slug}`} className="w-full">
                    <Button
                        variant={showProgress ? "default" : "primary"}
                        className={`w-full transition-all duration-300 ${showProgress
                            ? "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {showProgress ? t.courses.continue : t.courses.view}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
