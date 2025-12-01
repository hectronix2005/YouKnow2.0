"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"

interface TaskFormData {
    title: string
    description: string
    frequency: "daily" | "weekly" | "monthly"
    scheduledTime: string
    scheduledDay: number | null
    requiresPhoto: boolean
    category: string
    priority: "low" | "medium" | "high"
}

interface TaskFormProps {
    initialData?: Partial<TaskFormData>
    onSubmit: (data: TaskFormData) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

const CATEGORIES = [
    "Limpieza",
    "Mantenimiento",
    "Seguridad",
    "Inventario",
    "Atención al cliente",
    "Administración",
    "Otro",
]

const DAYS_OF_WEEK = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
]

export function TaskForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: TaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        frequency: initialData?.frequency || "daily",
        scheduledTime: initialData?.scheduledTime || "",
        scheduledDay: initialData?.scheduledDay ?? null,
        requiresPhoto: initialData?.requiresPhoto || false,
        category: initialData?.category || "",
        priority: initialData?.priority || "medium",
    })

    const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({})

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof TaskFormData, string>> = {}

        if (!formData.title.trim()) {
            newErrors.title = "El título es requerido"
        }

        if (formData.frequency === "weekly" && formData.scheduledDay === null) {
            newErrors.scheduledDay = "Selecciona un día de la semana"
        }

        if (formData.frequency === "monthly" && formData.scheduledDay === null) {
            newErrors.scheduledDay = "Selecciona un día del mes"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        await onSubmit(formData)
    }

    const handleChange = (
        field: keyof TaskFormData,
        value: string | number | boolean | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {initialData ? "Editar Tarea" : "Nueva Tarea"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Ej: Limpiar área de recepción"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Instrucciones detalladas para la tarea..."
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Frecuencia <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            {(["daily", "weekly", "monthly"] as const).map((freq) => (
                                <button
                                    key={freq}
                                    type="button"
                                    onClick={() => {
                                        handleChange("frequency", freq)
                                        handleChange("scheduledDay", null)
                                    }}
                                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                                        formData.frequency === freq
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {freq === "daily" && "Diaria"}
                                    {freq === "weekly" && "Semanal"}
                                    {freq === "monthly" && "Mensual"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scheduled Day (for weekly) */}
                    {formData.frequency === "weekly" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Día de la semana <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.scheduledDay ?? ""}
                                onChange={(e) =>
                                    handleChange("scheduledDay", e.target.value ? parseInt(e.target.value) : null)
                                }
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                            >
                                <option value="">Seleccionar día...</option>
                                {DAYS_OF_WEEK.map((day) => (
                                    <option key={day.value} value={day.value}>
                                        {day.label}
                                    </option>
                                ))}
                            </select>
                            {errors.scheduledDay && (
                                <p className="text-red-500 text-xs mt-1">{errors.scheduledDay}</p>
                            )}
                        </div>
                    )}

                    {/* Scheduled Day (for monthly) */}
                    {formData.frequency === "monthly" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Día del mes <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.scheduledDay ?? ""}
                                onChange={(e) =>
                                    handleChange("scheduledDay", e.target.value ? parseInt(e.target.value) : null)
                                }
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                            >
                                <option value="">Seleccionar día...</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            {errors.scheduledDay && (
                                <p className="text-red-500 text-xs mt-1">{errors.scheduledDay}</p>
                            )}
                        </div>
                    )}

                    {/* Scheduled Time */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Hora programada (opcional)
                        </label>
                        <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) => handleChange("scheduledTime", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Si se especifica, la tarea se mostrará a esta hora
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Categoría
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                        >
                            <option value="">Sin categoría</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat.toLowerCase()}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Prioridad
                        </label>
                        <div className="flex gap-2">
                            {(["low", "medium", "high"] as const).map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => handleChange("priority", priority)}
                                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                                        formData.priority === priority
                                            ? priority === "low"
                                                ? "bg-green-500 text-white border-green-500"
                                                : priority === "medium"
                                                ? "bg-yellow-500 text-white border-yellow-500"
                                                : "bg-red-500 text-white border-red-500"
                                            : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {priority === "low" && "Baja"}
                                    {priority === "medium" && "Media"}
                                    {priority === "high" && "Alta"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Requires Photo */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="requiresPhoto"
                            checked={formData.requiresPhoto}
                            onChange={(e) => handleChange("requiresPhoto", e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="requiresPhoto" className="text-sm font-medium">
                            Requiere evidencia fotográfica
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Tarea"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
