"use client"

import { NavbarWithRoleSwitcher } from "@/components/layout/navbar-with-role-switcher"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "@/components/video/video-player"
import { KahootQuiz } from "@/components/quiz/kahoot-quiz"
import { CheckCircle, ChevronLeft, ChevronRight, Trophy, Menu, Target, X, Lock, AlertCircle, Folder } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LessonClientProps {
    user: any
    course: any
    enrollment: any
    currentModule: any
    currentLesson: any
    currentLessonIndex: number
    allLessons: any[]
    completedLessonIds: Set<string>
    onSignOut: () => void
    onMarkComplete: (lessonId: string) => void
}

export function LessonClient({
    user,
    course,
    enrollment,
    currentModule,
    currentLesson,
    currentLessonIndex,
    allLessons,
    completedLessonIds,
    onSignOut,
    onMarkComplete
}: LessonClientProps) {
    const { t } = useLanguage()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [showQuiz, setShowQuiz] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [lastQuizScore, setLastQuizScore] = useState<number | null>(null)
    const [quizPassed, setQuizPassed] = useState(false)
    const [bestScore, setBestScore] = useState<number | null>(null)
    const [hasQuiz, setHasQuiz] = useState(true)

    // Build URL helper
    const buildLessonUrl = (lesson: any) => {
        return `/learn/${course.slug}/module/${lesson.moduleId}/lesson/${lesson.id}`
    }

    // Fetch quiz score on mount and when lesson changes
    useEffect(() => {
        const fetchQuizScore = async () => {
            try {
                const response = await fetch(`/api/quiz/best-score?lessonId=${currentLesson.id}`)
                const data = await response.json()
                if (response.ok) {
                    setHasQuiz(data.hasQuiz)
                    setBestScore(data.bestScore)
                    setQuizPassed(data.passed)
                    if (data.bestScore !== null) {
                        setQuizCompleted(true)
                        setLastQuizScore(data.bestScore)
                    }
                }
            } catch (error) {
                console.error('Error fetching quiz score:', error)
            }
        }
        fetchQuizScore()
    }, [currentLesson.id])

    // Get previous and next lessons
    const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
    const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            <NavbarWithRoleSwitcher user={user} onSignOut={onSignOut} />

            <div className="flex flex-1 relative overflow-hidden">
                {/* Sidebar Toggle (Mobile) */}
                <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                    <span className="font-semibold truncate pr-4">{course.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Sidebar - Course Content */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-80 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]",
                        sidebarOpen ? "translate-x-0 pt-16 lg:pt-0" : "-translate-x-full pt-16 lg:pt-0"
                    )}
                >
                    <div className="h-full flex flex-col">
                        {/* Course Header */}
                        <div className="border-b border-gray-200 p-6 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                            <Link href={`/learn/${course.slug}`} className="text-sm text-indigo-600 hover:underline mb-2 block">
                                ← Volver al curso
                            </Link>
                            <h2 className="font-bold text-gray-900 dark:text-white mb-2">{course.title}</h2>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                <span>{t.dashboard.progress.replace("{percent}", enrollment.progressPercent.toString())}</span>
                                <span>{completedLessonIds.size}/{allLessons.length}</span>
                            </div>
                            <Progress value={enrollment.progressPercent} className="h-2" />
                        </div>

                        {/* Current Location Breadcrumb */}
                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50">
                            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                                <Folder className="h-3 w-3" />
                                <span className="font-medium">{currentModule.title}</span>
                            </div>
                        </div>

                        {/* Modules and Lessons */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {course.modules.map((module: any, index: number) => {
                                const isCurrentModule = module.id === currentModule.id
                                const moduleUrl = `/learn/${course.slug}/module/${module.id}`

                                return (
                                    <div key={module.id}>
                                        <Link
                                            href={moduleUrl}
                                            className={cn(
                                                "mb-3 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded block transition-colors",
                                                isCurrentModule
                                                    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {t.courses.module.replace("{number}", (index + 1).toString())}: {module.title}
                                        </Link>
                                        <div className="space-y-1">
                                            {module.lessons.map((lesson: any) => {
                                                const isCompleted = completedLessonIds.has(lesson.id)
                                                const isCurrent = lesson.id === currentLesson.id
                                                const lessonUrl = `/learn/${course.slug}/module/${module.id}/lesson/${lesson.id}`

                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        href={lessonUrl}
                                                        className={cn(
                                                            "flex items-center space-x-3 rounded-lg p-3 text-sm transition-all duration-200",
                                                            isCurrent
                                                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 font-medium shadow-sm border border-indigo-100 dark:border-indigo-900/50"
                                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        )}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                                                        ) : (
                                                            <div className={cn(
                                                                "h-4 w-4 flex-shrink-0 rounded-full border-2",
                                                                isCurrent ? "border-indigo-500" : "border-gray-300 dark:border-gray-600"
                                                            )} />
                                                        )}
                                                        <span className="line-clamp-2">{lesson.title}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content - Video Player */}
                <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="mx-auto max-w-5xl p-4 lg:p-8">
                        {/* Breadcrumb */}
                        <nav className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            <ol className="flex items-center gap-2 flex-wrap">
                                <li>
                                    <Link href="/courses" className="hover:text-indigo-600">Cursos</Link>
                                </li>
                                <li>/</li>
                                <li>
                                    <Link href={`/learn/${course.slug}`} className="hover:text-indigo-600">{course.title}</Link>
                                </li>
                                <li>/</li>
                                <li>
                                    <Link href={`/learn/${course.slug}/module/${currentModule.id}`} className="hover:text-indigo-600">
                                        {currentModule.title}
                                    </Link>
                                </li>
                                <li>/</li>
                                <li className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
                                    {currentLesson.title}
                                </li>
                            </ol>
                        </nav>

                        {/* Video Player */}
                        <div className="mb-8">
                            <VideoPlayer
                                src={currentLesson.videoUrl}
                                title={currentLesson.title}
                                description={currentLesson.description}
                                poster="/placeholder-video.svg"
                                onEnded={() => {
                                    if (!completedLessonIds.has(currentLesson.id) && (!hasQuiz || quizPassed)) {
                                        onMarkComplete(currentLesson.id)
                                    }
                                }}
                                onError={(error) => {
                                    console.error('Video error:', error)
                                }}
                            />
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                            <div className="flex-1">
                                <div className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {currentLesson.moduleTitle}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{currentLesson.title}</h1>
                                {currentLesson.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{currentLesson.description}</p>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {/* Quiz Button */}
                                <Button
                                    onClick={() => setShowQuiz(true)}
                                    size="lg"
                                    variant={quizPassed ? "outline" : "default"}
                                    className={cn(
                                        "w-full sm:w-auto",
                                        quizPassed
                                            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400"
                                            : quizCompleted
                                                ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-900/20 dark:text-orange-400"
                                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                                    )}
                                >
                                    {quizPassed ? (
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                    ) : (
                                        <Target className="mr-2 h-5 w-5" />
                                    )}
                                    {quizPassed
                                        ? `Quiz: 100%`
                                        : quizCompleted
                                            ? `Quiz: ${lastQuizScore}% (Requiere 100%)`
                                            : "Tomar Quiz (Requerido)"}
                                </Button>

                                {!completedLessonIds.has(currentLesson.id) ? (
                                    hasQuiz && !quizPassed ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <Button
                                                type="button"
                                                size="lg"
                                                disabled
                                                className="w-full sm:w-auto bg-gray-400 text-white cursor-not-allowed opacity-60"
                                            >
                                                <Lock className="mr-2 h-5 w-5" />
                                                {t.learn.markComplete}
                                            </Button>
                                            <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Aprueba el quiz con 100%
                                            </span>
                                        </div>
                                    ) : (
                                        <form action={() => onMarkComplete(currentLesson.id)}>
                                            <Button type="submit" size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                {t.learn.markComplete}
                                            </Button>
                                        </form>
                                    )
                                ) : (
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto cursor-default border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        {t.learn.completed}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-8">
                            <div>
                                {prevLesson && (
                                    <Link href={buildLessonUrl(prevLesson)}>
                                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                            <ChevronLeft className="mr-2 h-4 w-4" />
                                            {t.learn.previous}
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div>
                                {nextLesson && (
                                    <Link href={buildLessonUrl(nextLesson)}>
                                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                            {t.learn.next}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Course Complete */}
                        {enrollment.progressPercent === 100 && (
                            <Card className="mt-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="p-12 text-center relative z-10">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                        <Trophy className="h-10 w-10 text-yellow-300" />
                                    </div>
                                    <h2 className="mb-2 text-3xl font-bold">{t.learn.congrats}</h2>
                                    <p className="mb-8 text-indigo-100 text-lg">
                                        {t.learn.courseCompleted}
                                    </p>
                                    <Link href={`/certificates/${enrollment.id}`}>
                                        <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl">
                                            {t.learn.viewCertificate}
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        )}
                    </div>
                </main>
            </div>

            {/* Quiz Modal */}
            {showQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                        <button
                            onClick={() => setShowQuiz(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        <div className="p-6 md:p-8">
                            <KahootQuiz
                                lessonId={currentLesson.id}
                                lessonTitle={currentLesson.title}
                                onComplete={(score) => {
                                    setQuizCompleted(true)
                                    setLastQuizScore(score)
                                    if (score === 100) {
                                        setQuizPassed(true)
                                        setBestScore(100)
                                        if (!completedLessonIds.has(currentLesson.id)) {
                                            onMarkComplete(currentLesson.id)
                                        }
                                    } else {
                                        if (bestScore === null || score > bestScore) {
                                            setBestScore(score)
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
