"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function CreateCoursePage() {
    const router = useRouter()
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
                setError(data.error || "Error al crear el curso")
                return
            }

            router.push(`/creador/courses/${data.id}`)
        } catch (error) {
            console.error(error)
            setError("Error de conexión. Intenta de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Nombra tu curso</h1>
            <p className="text-gray-500 mb-8">
                ¿Cómo quieres llamar a tu curso? No te preocupes, puedes cambiarlo después.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">Título del curso</Label>
                    <Input
                        id="title"
                        placeholder="ej. Desarrollo Web Avanzado"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/creador">
                        <Button type="button" variant="ghost">
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={!title || isLoading}>
                        {isLoading ? "Creando..." : "Continuar"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
