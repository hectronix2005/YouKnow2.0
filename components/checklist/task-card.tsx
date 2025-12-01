"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    CheckCircle2,
    Clock,
    Camera,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from "lucide-react"

interface TaskTemplate {
    id: string
    title: string
    description: string | null
    frequency: string
    scheduledTime: string | null
    requiresPhoto: boolean
    category: string | null
    priority: string
}

interface TaskCardProps {
    assignmentId: string
    task: TaskTemplate
    status: "pending" | "completed" | "missed"
    completedAt: string | null
    photoUrl: string | null
    notes: string | null
    onComplete: (assignmentId: string, photoUrl?: string, notes?: string) => Promise<void>
    onUploadPhoto?: (file: File) => Promise<string>
    isLoading?: boolean
}

const PRIORITY_COLORS = {
    high: "border-l-red-500 bg-red-50 dark:bg-red-950/20",
    medium: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
    low: "border-l-green-500 bg-green-50 dark:bg-green-950/20",
} as const

const FREQUENCY_LABELS = {
    daily: "Diaria",
    weekly: "Semanal",
    monthly: "Mensual",
} as const

export function TaskCard({
    assignmentId,
    task,
    status,
    completedAt,
    photoUrl,
    notes,
    onComplete,
    onUploadPhoto,
    isLoading = false,
}: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [localNotes, setLocalNotes] = useState(notes || "")
    const [uploading, setUploading] = useState(false)
    const [localPhotoUrl, setLocalPhotoUrl] = useState(photoUrl)

    const isCompleted = status === "completed"
    const priorityClass = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !onUploadPhoto) return

        setUploading(true)
        try {
            const url = await onUploadPhoto(file)
            setLocalPhotoUrl(url)
        } catch (error) {
            console.error("Error uploading photo:", error)
        } finally {
            setUploading(false)
        }
    }

    const handleComplete = async () => {
        await onComplete(assignmentId, localPhotoUrl || undefined, localNotes || undefined)
    }

    return (
        <Card className={cn(
            "border-l-4 transition-all",
            priorityClass,
            isCompleted && "opacity-75"
        )}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <h3 className={cn(
                                "font-medium truncate",
                                isCompleted && "line-through text-gray-500"
                            )}>
                                {task.title}
                            </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 ml-7">
                            {task.scheduledTime && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.scheduledTime}
                                </span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                {FREQUENCY_LABELS[task.frequency as keyof typeof FREQUENCY_LABELS]}
                            </span>
                            {task.category && (
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    {task.category}
                                </span>
                            )}
                            {task.requiresPhoto && (
                                <span className="flex items-center gap-1 text-orange-600">
                                    <Camera className="h-3 w-3" />
                                    Foto requerida
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-shrink-0"
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="mt-4 ml-7 space-y-4">
                        {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {task.description}
                            </p>
                        )}

                        {!isCompleted && (
                            <>
                                {task.requiresPhoto && (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Camera className="h-4 w-4" />
                                            Evidencia fotográfica
                                            <span className="text-red-500">*</span>
                                        </label>
                                        {localPhotoUrl ? (
                                            <div className="relative">
                                                <img
                                                    src={localPhotoUrl}
                                                    alt="Evidencia"
                                                    className="w-full max-w-xs rounded-lg border"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => setLocalPhotoUrl(null)}
                                                >
                                                    Cambiar foto
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={handlePhotoUpload}
                                                    disabled={uploading}
                                                    className="text-sm"
                                                />
                                                {uploading && <span className="text-sm text-gray-500">Subiendo...</span>}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notas (opcional)</label>
                                    <textarea
                                        value={localNotes}
                                        onChange={(e) => setLocalNotes(e.target.value)}
                                        placeholder="Agregar notas o comentarios..."
                                        className="w-full px-3 py-2 text-sm border rounded-lg resize-none h-20
                                            focus:outline-none focus:ring-2 focus:ring-blue-500
                                            dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleComplete}
                                        disabled={isLoading || (task.requiresPhoto && !localPhotoUrl)}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {isLoading ? "Guardando..." : "Marcar como completada"}
                                    </Button>
                                    {task.requiresPhoto && !localPhotoUrl && (
                                        <span className="text-xs text-orange-600 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Debes subir una foto
                                        </span>
                                    )}
                                </div>
                            </>
                        )}

                        {isCompleted && (
                            <div className="space-y-2 text-sm">
                                {completedAt && (
                                    <p className="text-green-600">
                                        Completada el {new Date(completedAt).toLocaleString("es")}
                                    </p>
                                )}
                                {photoUrl && (
                                    <div>
                                        <p className="font-medium mb-1">Evidencia:</p>
                                        <img
                                            src={photoUrl}
                                            alt="Evidencia"
                                            className="w-full max-w-xs rounded-lg border"
                                        />
                                    </div>
                                )}
                                {notes && (
                                    <div>
                                        <p className="font-medium mb-1">Notas:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
