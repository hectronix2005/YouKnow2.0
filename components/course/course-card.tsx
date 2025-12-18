"use client"

import { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Play, ArrowRight } from "lucide-react"
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

// Kahoot-style color cycling for cards without thumbnails
const gradientColors = [
    "from-[#e21b3c] to-[#ff6b6b]",
    "from-[#1368ce] to-[#45a3e5]",
    "from-[#26890c] to-[#4ade80]",
    "from-[#d89e00] to-[#ffd54f]",
    "from-[#46178f] to-[#8b5cf6]",
    "from-[#00cec8] to-[#5eead4]",
]

export const CourseCard = memo(function CourseCard({ course, enrollment, showProgress = false }: CourseCardProps) {
    const { t } = useLanguage()

    // Get a consistent color based on course id
    const colorIndex = course.id.charCodeAt(0) % gradientColors.length
    const gradientClass = gradientColors[colorIndex]

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(70,23,143,0.15)] hover:-translate-y-2 border-none bg-white dark:bg-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-2xl">
            {/* Thumbnail */}
            <div className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${gradientClass}`}>
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center relative">
                        <div className="absolute inset-0 bg-black/10" />
                        <span className="text-7xl font-black text-white/30 select-none relative z-10">
                            {course.title.charAt(0)}
                        </span>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 z-20">
                            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/20">
                                {course.category}
                            </span>
                        </div>
                    </div>
                )}

                {/* Level Badge */}
                <div className="absolute top-3 right-3 z-20">
                    <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-gray-900 shadow-lg">
                        {course.level}
                    </span>
                </div>

                {/* Play button overlay on hover */}
                {showProgress && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl">
                            <Play className="h-8 w-8 text-[#46178f] ml-1" fill="#46178f" />
                        </div>
                    </div>
                )}
            </div>

            <CardHeader className="pb-3">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        <span>{t.courses.instructor.replace("{name}", course.instructor.name)}</span>
                    </div>
                </div>

                <CardTitle className="line-clamp-2 text-lg font-black group-hover:text-[#46178f] dark:group-hover:text-[#8b5cf6] transition-colors">
                    {course.title}
                </CardTitle>

                {course.subtitle && (
                    <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {course.subtitle}
                    </p>
                )}
            </CardHeader>

            <CardContent className="pb-3">
                {showProgress && enrollment && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                                {t.dashboard.progress.replace("{percent}", enrollment.progressPercent.toString())}
                            </span>
                        </div>
                        <Progress
                            value={enrollment.progressPercent}
                            variant={enrollment.progressPercent >= 100 ? "success" : "default"}
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Link href={showProgress ? `/learn/${course.slug}` : `/courses/${course.slug}`} className="w-full">
                    <button
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] ${
                            showProgress
                                ? "bg-[#46178f] text-white shadow-[0_4px_14px_rgba(70,23,143,0.4)] hover:bg-[#5a1eb5]"
                                : "bg-[#1368ce] text-white shadow-[0_4px_14px_rgba(19,104,206,0.4)] hover:bg-[#1577e8]"
                        }`}
                    >
                        {showProgress ? (
                            <>
                                <Play className="h-4 w-4" />
                                {t.courses.continue}
                            </>
                        ) : (
                            <>
                                {t.courses.view}
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </Link>
            </CardFooter>
        </Card>
    )
})
