"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Sparkles, BookOpen, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface CreateCourseClientProps {
    user: any
    onSignOut: () => void
}

export function CreateCourseClient({ user, onSignOut }: CreateCourseClientProps) {
    const router = useRouter()
    const { language } = useLanguage()
    const [title, setTitle] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || (language === "es" ? "Error al crear el curso" : "Error creating course"))
                return
            }

            router.push(`/creador/courses/${data.id}`)
        } catch (error) {
            console.error(error)
            setError(language === "es" ? "Error de conexión. Intenta de nuevo." : "Connection error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const suggestions = [
        language === "es" ? "Desarrollo Web Avanzado" : "Advanced Web Development",
        language === "es" ? "Marketing Digital para Principiantes" : "Digital Marketing for Beginners",
        language === "es" ? "Liderazgo y Gestión de Equipos" : "Leadership and Team Management",
        language === "es" ? "Excel para Negocios" : "Excel for Business"
    ]

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#0e0e0e]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Back Button */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {language === "es" ? "Volver al Dashboard" : "Back to Dashboard"}
                    </Link>

                    {/* Main Content */}
                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#26890c] to-[#1a5c08] flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <BookOpen className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {language === "es" ? "Crear Nuevo Curso" : "Create New Course"}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {language === "es"
                                    ? "¿Cómo quieres llamar a tu curso? No te preocupes, puedes cambiarlo después."
                                    : "What do you want to call your course? Don't worry, you can change it later."
                                }
                            </p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {language === "es" ? "Título del curso" : "Course title"}
                                    </label>
                                    <Input
                                        id="title"
                                        placeholder={language === "es" ? "ej. Desarrollo Web Avanzado" : "e.g. Advanced Web Development"}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 text-lg"
                                    />
                                </div>

                                {/* Suggestions */}
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        {language === "es" ? "Sugerencias" : "Suggestions"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setTitle(suggestion)}
                                                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-[#46178f]/10 hover:text-[#46178f] dark:hover:text-[#46178f] transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <Link href="/creador">
                                        <Button type="button" variant="ghost" className="text-gray-500">
                                            {language === "es" ? "Cancelar" : "Cancel"}
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={!title.trim() || isLoading}
                                        className="bg-gradient-to-r from-[#26890c] to-[#1a5c08] hover:from-[#2ea00f] hover:to-[#1d6609] text-white px-8"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {language === "es" ? "Creando..." : "Creating..."}
                                            </>
                                        ) : (
                                            language === "es" ? "Continuar" : "Continue"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Tips */}
                        <div className="mt-6 p-4 bg-[#46178f]/5 dark:bg-[#46178f]/10 rounded-xl border border-[#46178f]/20">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                                {language === "es" ? "Consejos para un buen título" : "Tips for a good title"}
                            </h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• {language === "es" ? "Sé específico sobre el tema" : "Be specific about the topic"}</li>
                                <li>• {language === "es" ? "Incluye el nivel (principiante, avanzado)" : "Include the level (beginner, advanced)"}</li>
                                <li>• {language === "es" ? "Mantén el título corto y memorable" : "Keep the title short and memorable"}</li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
