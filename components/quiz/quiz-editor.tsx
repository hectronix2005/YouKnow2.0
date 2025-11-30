"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Loader2,
    Save,
    Trash2,
    Plus,
    CheckCircle,
    AlertCircle,
    GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
}

interface QuizEditorProps {
    lessonId: string
    lessonTitle: string
    onClose?: () => void
}

const MIN_QUESTIONS = 10
const QUESTIONS_FOR_STUDENTS = 5

export function QuizEditor({ lessonId, lessonTitle, onClose }: QuizEditorProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Cargar quiz existente
    useEffect(() => {
        loadQuiz()
    }, [lessonId])

    const loadQuiz = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al cargar el quiz')
            }

            if (data.quiz && data.quiz.questions) {
                setQuestions(data.quiz.questions)
            } else {
                setQuestions([])
            }
        } catch (err) {
            // Don't show error for no quiz - just start with empty
            setQuestions([])
        } finally {
            setIsLoading(false)
        }
    }

    const saveQuiz = async () => {
        // Validar mínimo de preguntas
        if (questions.length < MIN_QUESTIONS) {
            setError(`Debes crear al menos ${MIN_QUESTIONS} preguntas. Actualmente tienes ${questions.length}.`)
            return
        }

        // Validar que cada pregunta tenga exactamente 4 opciones
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            if (q.options.length !== 4) {
                setError(`La pregunta ${i + 1} debe tener exactamente 4 opciones.`)
                return
            }
            if (q.options.some(opt => !opt.trim())) {
                setError(`La pregunta ${i + 1} tiene opciones vacías.`)
                return
            }
            if (!q.question.trim()) {
                setError(`La pregunta ${i + 1} está vacía.`)
                return
            }
        }

        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch('/api/quiz/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, questions })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar el quiz')
            }

            setSuccess('Quiz guardado exitosamente')
            setHasChanges(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar el quiz')
        } finally {
            setIsSaving(false)
        }
    }

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
        setHasChanges(true)
    }

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updated = [...questions]
        const newOptions = [...updated[questionIndex].options]
        newOptions[optionIndex] = value
        updated[questionIndex] = { ...updated[questionIndex], options: newOptions }
        setQuestions(updated)
        setHasChanges(true)
    }

    const setCorrectAnswer = (questionIndex: number, optionIndex: number) => {
        updateQuestion(questionIndex, 'correctIndex', optionIndex)
    }

    const deleteQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index)
        setQuestions(updated)
        setHasChanges(true)
    }

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: `q-new-${Date.now()}`,
            question: 'Nueva pregunta',
            options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
            correctIndex: 0,
            explanation: ''
        }
        setQuestions([...questions, newQuestion])
        setHasChanges(true)
    }

    // Colores para las opciones (estilo Kahoot)
    const optionColors = [
        'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
        'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
        'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
        'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
    ]

    const optionIcons = ['▲', '◆', '●', '■']

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-gray-600 dark:text-gray-400">Cargando quiz...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Editor de Quiz
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {lessonTitle}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Contador de preguntas */}
                    <Badge
                        variant={questions.length >= MIN_QUESTIONS ? "default" : "outline"}
                        className={questions.length >= MIN_QUESTIONS
                            ? "bg-green-600 text-white"
                            : "text-gray-600 border-gray-300"
                        }
                    >
                        {questions.length}/{MIN_QUESTIONS} preguntas
                    </Badge>
                    {hasChanges && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Sin guardar
                        </Badge>
                    )}
                    <Button
                        size="sm"
                        onClick={saveQuiz}
                        disabled={isSaving || questions.length < MIN_QUESTIONS}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Guardar
                    </Button>
                </div>
            </div>

            {/* Info sobre el quiz */}
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    <strong>Requisitos del Quiz:</strong> Crea mínimo {MIN_QUESTIONS} preguntas.
                    Cada pregunta debe tener 1 respuesta correcta y 3 incorrectas.
                    Los estudiantes recibirán {QUESTIONS_FOR_STUDENTS} preguntas aleatorias del banco de preguntas.
                </p>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                </div>
            )}

            {/* Lista de preguntas */}
            {questions.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No hay preguntas aún.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        Necesitas crear al menos {MIN_QUESTIONS} preguntas para activar el quiz.
                    </p>
                    <Button variant="outline" onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Primera Pregunta
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {questions.map((question, qIndex) => (
                        <Card key={question.id} className="overflow-hidden">
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 py-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                        <Badge variant="secondary">
                                            Pregunta {qIndex + 1}
                                        </Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteQuestion(qIndex)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Pregunta */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Pregunta
                                    </label>
                                    <Textarea
                                        value={question.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Escribe la pregunta..."
                                        className="resize-none"
                                        rows={2}
                                    />
                                </div>

                                {/* Opciones */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Opciones de respuesta
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {question.options.map((option, oIndex) => (
                                            <div
                                                key={oIndex}
                                                className={cn(
                                                    "relative flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                                                    optionColors[oIndex],
                                                    question.correctIndex === oIndex && "ring-2 ring-green-500 ring-offset-2 bg-green-50 dark:bg-green-900/20"
                                                )}
                                            >
                                                <span className="text-lg opacity-60">{optionIcons[oIndex]}</span>
                                                <Input
                                                    value={option}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    className="border-0 bg-transparent focus-visible:ring-0 p-0 flex-1"
                                                    placeholder={`Opción ${oIndex + 1}`}
                                                />
                                                {question.correctIndex === oIndex && (
                                                    <CheckCircle className="w-5 h-5 text-green-500 absolute right-3" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Selector de respuesta correcta */}
                                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <label className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 block">
                                            Selecciona la respuesta correcta:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['A', 'B', 'C', 'D'].map((letter, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setCorrectAnswer(qIndex, idx)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg font-semibold transition-all",
                                                        question.correctIndex === idx
                                                            ? "bg-green-600 text-white shadow-lg scale-105"
                                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    Opción {letter}
                                                    {question.correctIndex === idx && (
                                                        <CheckCircle className="w-4 h-4 ml-2 inline" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                            Actualmente seleccionada: <strong>Opción {['A', 'B', 'C', 'D'][question.correctIndex]}</strong> como correcta
                                        </p>
                                    </div>
                                </div>

                                {/* Explicación (opcional) */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Explicación (opcional)
                                    </label>
                                    <Textarea
                                        value={question.explanation || ''}
                                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                        placeholder="Explicación de la respuesta correcta..."
                                        className="resize-none"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Agregar pregunta */}
                    <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={addQuestion}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Pregunta
                    </Button>
                </div>
            )}
        </div>
    )
}
