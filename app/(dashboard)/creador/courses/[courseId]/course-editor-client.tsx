"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash, GripVertical, Loader2, Video, ChevronDown, ChevronRight, Youtube, Link as LinkIcon, Globe, EyeOff, Target, X } from "lucide-react"
import { QuizEditor } from "@/components/quiz/quiz-editor"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/providers/toast-provider"
import { useLanguage } from "@/components/providers/language-provider"

interface CourseEditorClientProps {
    user: any
    course: any
    onSignOut: () => void
}

export function CourseEditorClient({ user, course, onSignOut }: CourseEditorClientProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const { language } = useLanguage()
    const [isLoading, setIsLoading] = useState(false)
    const [title, setTitle] = useState(course.title)
    const [description, setDescription] = useState(course.description || "")
    const [price, setPrice] = useState(course.price)
    const [category, setCategory] = useState(course.category)
    const [modules, setModules] = useState(course.modules)
    const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
    const [hasChanges, setHasChanges] = useState(false)
    const [courseStatus, setCourseStatus] = useState(course.status)
    const [isPublishing, setIsPublishing] = useState(false)
    const [quizEditorLesson, setQuizEditorLesson] = useState<{ id: string, title: string } | null>(null)

    const toggleLessonExpanded = (lessonId: string) => {
        const newExpanded = new Set(expandedLessons)
        if (newExpanded.has(lessonId)) {
            newExpanded.delete(lessonId)
        } else {
            newExpanded.add(lessonId)
        }
        setExpandedLessons(newExpanded)
    }

    const getVideoType = (url: string): 'youtube' | 'direct' | 'none' => {
        if (!url) return 'none'
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
        return 'direct'
    }

    const getYoutubeId = (url: string): string | null => {
        if (!url) return null
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        return match ? match[1] : null
    }

    const handleAddModule = () => {
        const newModule = {
            id: `temp-${Date.now()}`,
            title: language === "es" ? "Nuevo Módulo" : "New Module",
            lessons: [],
            isNew: true
        }
        setModules([...modules, newModule])
        setHasChanges(true)
    }

    const handleAddLesson = (moduleIndex: number) => {
        const newModules = [...modules]
        const newLesson = {
            id: `temp-lesson-${Date.now()}`,
            title: language === "es" ? "Nueva Lección" : "New Lesson",
            lessonType: 'video',
            isNew: true
        }
        newModules[moduleIndex].lessons.push(newLesson)
        setModules(newModules)
        setHasChanges(true)
    }

    const handleUpdateModule = (index: number, field: string, value: string) => {
        const newModules = [...modules]
        newModules[index] = { ...newModules[index], [field]: value }
        setModules(newModules)
        setHasChanges(true)
    }

    const handleUpdateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: string) => {
        const newModules = [...modules]
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value
        }
        setModules(newModules)
        setHasChanges(true)
    }

    const handleDeleteModule = (index: number) => {
        const newModules = [...modules]
        newModules.splice(index, 1)
        setModules(newModules)
        setHasChanges(true)
    }

    const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
        const newModules = [...modules]
        newModules[moduleIndex].lessons.splice(lessonIndex, 1)
        setModules(newModules)
        setHasChanges(true)
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/courses/${course.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    category,
                    modules
                })
            })

            if (!response.ok) throw new Error("Failed to save")

            const data = await response.json()
            if (data.modules) {
                setModules(data.modules)
            }

            setHasChanges(false)
            router.refresh()
            showToast(
                language === "es" ? "¡Curso guardado exitosamente!" : "Course saved successfully!",
                "success",
                5000
            )
        } catch (error) {
            console.error(error)
            showToast(
                language === "es" ? "Error al guardar los cambios" : "Error saving changes",
                "error",
                5000
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleTogglePublish = async () => {
        setIsPublishing(true)
        try {
            const newStatus = courseStatus === 'published' ? 'draft' : 'published'
            const response = await fetch(`/api/courses/${course.id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error("Failed to update status")

            setCourseStatus(newStatus)
            router.refresh()

            if (newStatus === 'published') {
                showToast(
                    language === "es" ? "¡Curso publicado! Los estudiantes ahora pueden verlo." : "Course published! Students can now see it.",
                    "success",
                    5000
                )
            } else {
                showToast(
                    language === "es" ? "Curso despublicado. Ya no es visible para los estudiantes." : "Course unpublished. No longer visible to students.",
                    "info",
                    5000
                )
            }
        } catch (error) {
            console.error(error)
            showToast(
                language === "es" ? "Error al cambiar el estado del curso" : "Error changing course status",
                "error",
                5000
            )
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#0e0e0e]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Back Button + Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {language === "es" ? "Volver al Dashboard" : "Back to Dashboard"}
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${courseStatus === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                {courseStatus === 'published'
                                    ? (language === "es" ? 'Publicado' : 'Published')
                                    : (language === "es" ? 'Borrador' : 'Draft')
                                }
                            </span>
                            <Button
                                onClick={handleTogglePublish}
                                disabled={isPublishing}
                                variant={courseStatus === 'published' ? 'outline' : 'default'}
                                className={courseStatus === 'published'
                                    ? 'border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }
                            >
                                {isPublishing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : courseStatus === 'published' ? (
                                    <EyeOff className="h-4 w-4 mr-2" />
                                ) : (
                                    <Globe className="h-4 w-4 mr-2" />
                                )}
                                {courseStatus === 'published'
                                    ? (language === "es" ? 'Despublicar' : 'Unpublish')
                                    : (language === "es" ? 'Publicar' : 'Publish')
                                }
                            </Button>
                            {hasChanges && (
                                <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1 animate-pulse">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                                    {language === "es" ? "Cambios sin guardar" : "Unsaved changes"}
                                </span>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className={`${hasChanges ? "bg-green-600 hover:bg-green-700 animate-pulse" : "bg-[#26890c] hover:bg-[#1d6609]"}`}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {language === "es" ? "Guardar" : "Save"}
                            </Button>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {language === "es" ? "Editar Curso" : "Edit Course"}
                        </h1>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Course Details */}
                        <div className="space-y-6">
                            <Card className="bg-white dark:bg-[#1a1a1a] shadow-sm">
                                <CardHeader>
                                    <CardTitle>{language === "es" ? "Detalles del Curso" : "Course Details"}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{language === "es" ? "Título" : "Title"}</Label>
                                        <Input
                                            value={title}
                                            onChange={(e) => { setTitle(e.target.value); setHasChanges(true) }}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{language === "es" ? "Descripción" : "Description"}</Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => { setDescription(e.target.value); setHasChanges(true) }}
                                            rows={4}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{language === "es" ? "Categoría" : "Category"}</Label>
                                        <Input
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); setHasChanges(true) }}
                                            suppressHydrationWarning
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Curriculum */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {language === "es" ? "Contenido" : "Curriculum"}
                                </h2>
                                <Button size="sm" variant="outline" onClick={handleAddModule}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {language === "es" ? "Agregar Módulo" : "Add Module"}
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {modules.map((module: any, moduleIndex: number) => (
                                    <Card key={module.id || `module-${moduleIndex}`} className="bg-white dark:bg-[#1a1a1a] shadow-sm">
                                        <CardHeader className="p-4 flex flex-row items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                                            <div className="flex items-center gap-2 font-medium flex-1 mr-4">
                                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move flex-shrink-0" />
                                                <Input
                                                    value={module.title}
                                                    onChange={(e) => handleUpdateModule(moduleIndex, 'title', e.target.value)}
                                                    className="h-8 bg-transparent border-transparent hover:border-gray-300 focus:bg-white dark:focus:bg-gray-800"
                                                    suppressHydrationWarning
                                                />
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteModule(moduleIndex)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <div className="space-y-2 pl-6">
                                                {module.lessons.map((lesson: any, lessonIndex: number) => {
                                                    const lessonKey = lesson.id || `lesson-${moduleIndex}-${lessonIndex}`
                                                    const isExpanded = expandedLessons.has(lessonKey)
                                                    const videoType = getVideoType(lesson.videoUrl || '')
                                                    const youtubeId = getYoutubeId(lesson.videoUrl || '')

                                                    return (
                                                        <div key={lessonKey} className="border rounded-lg dark:border-gray-700 overflow-hidden">
                                                            <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm">
                                                                <div className="flex items-center gap-2 flex-1 mr-2">
                                                                    <button
                                                                        onClick={() => toggleLessonExpanded(lessonKey)}
                                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                                    >
                                                                        {isExpanded ? (
                                                                            <ChevronDown className="h-3 w-3 text-gray-500" />
                                                                        ) : (
                                                                            <ChevronRight className="h-3 w-3 text-gray-500" />
                                                                        )}
                                                                    </button>
                                                                    <GripVertical className="h-3 w-3 text-gray-400 flex-shrink-0 cursor-move" />
                                                                    <Input
                                                                        value={lesson.title}
                                                                        onChange={(e) => handleUpdateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                                                        className="h-7 text-sm bg-transparent border-transparent hover:border-gray-300 focus:bg-white dark:focus:bg-gray-800"
                                                                        suppressHydrationWarning
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {videoType === 'youtube' ? (
                                                                        <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                                                            <Youtube className="h-3 w-3" />
                                                                            YouTube
                                                                        </span>
                                                                    ) : videoType === 'direct' ? (
                                                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                                                            <Video className="h-3 w-3" />
                                                                            Video
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                                            <Video className="h-3 w-3" />
                                                                            {language === "es" ? "Sin video" : "No video"}
                                                                        </span>
                                                                    )}
                                                                    {lesson.hasQuiz && (
                                                                        <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">
                                                                            <Target className="h-3 w-3" />
                                                                            Quiz
                                                                        </span>
                                                                    )}
                                                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}>
                                                                        <Trash className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-800/30 border-t dark:border-gray-700 space-y-4">
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Video className="h-4 w-4 text-indigo-600" />
                                                                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                                {language === "es" ? "Video de la Lección" : "Lesson Video"}
                                                                            </Label>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                                                <LinkIcon className="h-3 w-3" />
                                                                                {language === "es" ? "URL del Video (YouTube o enlace directo MP4)" : "Video URL (YouTube or direct MP4 link)"}
                                                                            </Label>
                                                                            <Input
                                                                                value={lesson.videoUrl || ''}
                                                                                onChange={(e) => handleUpdateLesson(moduleIndex, lessonIndex, 'videoUrl', e.target.value)}
                                                                                placeholder="https://youtube.com/watch?v=... o https://example.com/video.mp4"
                                                                                className="text-sm"
                                                                                suppressHydrationWarning
                                                                            />
                                                                        </div>

                                                                        {lesson.videoUrl && videoType === 'youtube' && youtubeId && (
                                                                            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                                                                <iframe
                                                                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                                                                    className="w-full h-full"
                                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                    allowFullScreen
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="border-t dark:border-gray-700 pt-4">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <Target className="h-4 w-4 text-purple-600" />
                                                                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                                    {language === "es" ? "Quiz de Evaluación" : "Quiz"}
                                                                                </Label>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateLesson(moduleIndex, lessonIndex, 'hasQuiz', lesson.hasQuiz ? '' : 'true')}
                                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${lesson.hasQuiz ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                                                                    }`}
                                                                            >
                                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lesson.hasQuiz ? 'translate-x-6' : 'translate-x-1'
                                                                                    }`} />
                                                                            </button>
                                                                        </div>

                                                                        {lesson.hasQuiz && lesson.id && !lesson.id.startsWith('temp-') && (
                                                                            <Button
                                                                                size="sm"
                                                                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                                                                onClick={() => setQuizEditorLesson({
                                                                                    id: lesson.id,
                                                                                    title: lesson.title
                                                                                })}
                                                                            >
                                                                                <Target className="h-4 w-4 mr-2" />
                                                                                {language === "es" ? "Editar Quiz" : "Edit Quiz"}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                                <Button size="sm" variant="ghost" className="w-full justify-center text-indigo-600" onClick={() => handleAddLesson(moduleIndex)}>
                                                    <Plus className="h-3 w-3 mr-2" />
                                                    {language === "es" ? "Agregar Lección" : "Add Lesson"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {modules.length === 0 && (
                                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500 bg-white dark:bg-[#1a1a1a]">
                                        {language === "es" ? "Sin módulos aún. ¡Comienza agregando uno!" : "No modules yet. Start by adding one!"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Quiz Editor Modal */}
            {quizEditorLesson && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {language === "es" ? "Editor de Quiz" : "Quiz Editor"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {quizEditorLesson.title}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQuizEditorLesson(null)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <QuizEditor
                                lessonId={quizEditorLesson.id}
                                lessonTitle={quizEditorLesson.title}
                                onClose={() => setQuizEditorLesson(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
