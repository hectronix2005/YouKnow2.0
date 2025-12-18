"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Play,
    Settings,
    Image,
    Clock,
    Award,
    ChevronUp,
    ChevronDown,
    Copy,
    Check,
    X,
    HelpCircle,
    ToggleLeft,
    Eye,
    GripVertical
} from "lucide-react"

type QuestionType = "quiz" | "truefalse" | "poll" | "puzzle" | "typing"

interface KahootQuestion {
    id: string
    type: QuestionType
    question: string
    answers: string[]
    correctAnswer: number | number[]
    timeLimit: number
    points: number
    image?: string
    explanation?: string
}

interface KahootType {
    id: string
    title: string
    description: string
    coverImage?: string
    color: string
    questions: KahootQuestion[]
    visibility: "private" | "public" | "organization"
    plays: number
    favorites: number
    players: number
    createdAt: string
    updatedAt: string
    status: "draft" | "published"
    category?: string
    language?: string
    difficulty?: "easy" | "medium" | "hard"
}

const answerColors = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"]
const timeLimits = [5, 10, 20, 30, 60, 90, 120, 240]
const pointOptions = [0, 1000, 2000]

export default function EditKahootPage() {
    const params = useParams()
    const router = useRouter()
    const kahootId = params.id as string

    const [kahoot, setKahoot] = useState<KahootType | null>(null)
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0)
    const [isSaving, setIsSaving] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Load kahoot
    useEffect(() => {
        const savedKahoots = localStorage.getItem("youknow_kahoots")
        if (savedKahoots) {
            const kahoots = JSON.parse(savedKahoots)
            const found = kahoots.find((k: KahootType) => k.id === kahootId)
            if (found) {
                setKahoot(found)
            }
        }
    }, [kahootId])

    const saveKahoot = () => {
        if (!kahoot) return
        setIsSaving(true)

        const savedKahoots = localStorage.getItem("youknow_kahoots")
        if (savedKahoots) {
            const kahoots = JSON.parse(savedKahoots)
            const updated = kahoots.map((k: KahootType) =>
                k.id === kahootId ? { ...kahoot, updatedAt: new Date().toISOString() } : k
            )
            localStorage.setItem("youknow_kahoots", JSON.stringify(updated))
        }

        setTimeout(() => {
            setIsSaving(false)
            setHasChanges(false)
        }, 500)
    }

    const updateKahoot = (updates: Partial<KahootType>) => {
        if (!kahoot) return
        setKahoot({ ...kahoot, ...updates })
        setHasChanges(true)
    }

    const addQuestion = (type: QuestionType = "quiz") => {
        if (!kahoot) return

        const newQuestion: KahootQuestion = {
            id: Date.now().toString(),
            type,
            question: "",
            answers: type === "truefalse" ? ["Verdadero", "Falso"] : ["", "", "", ""],
            correctAnswer: 0,
            timeLimit: 20,
            points: 1000
        }

        const newQuestions = [...kahoot.questions, newQuestion]
        updateKahoot({ questions: newQuestions })
        setSelectedQuestionIndex(newQuestions.length - 1)
    }

    const deleteQuestion = (index: number) => {
        if (!kahoot || kahoot.questions.length <= 1) return

        const newQuestions = kahoot.questions.filter((_, i) => i !== index)
        updateKahoot({ questions: newQuestions })

        if (selectedQuestionIndex >= newQuestions.length) {
            setSelectedQuestionIndex(newQuestions.length - 1)
        }
    }

    const duplicateQuestion = (index: number) => {
        if (!kahoot) return

        const questionToCopy = kahoot.questions[index]
        const newQuestion = {
            ...questionToCopy,
            id: Date.now().toString()
        }

        const newQuestions = [...kahoot.questions]
        newQuestions.splice(index + 1, 0, newQuestion)
        updateKahoot({ questions: newQuestions })
        setSelectedQuestionIndex(index + 1)
    }

    const moveQuestion = (index: number, direction: "up" | "down") => {
        if (!kahoot) return

        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= kahoot.questions.length) return

        const newQuestions = [...kahoot.questions]
        const [removed] = newQuestions.splice(index, 1)
        newQuestions.splice(newIndex, 0, removed)

        updateKahoot({ questions: newQuestions })
        setSelectedQuestionIndex(newIndex)
    }

    const updateQuestion = (index: number, updates: Partial<KahootQuestion>) => {
        if (!kahoot) return

        const newQuestions = kahoot.questions.map((q, i) =>
            i === index ? { ...q, ...updates } : q
        )
        updateKahoot({ questions: newQuestions })
    }

    if (!kahoot) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-[#46178f] border-t-transparent rounded-full" />
            </div>
        )
    }

    const currentQuestion = kahoot.questions[selectedQuestionIndex]

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/courses"
                            className="h-10 w-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div>
                            <input
                                type="text"
                                value={kahoot.title}
                                onChange={(e) => updateKahoot({ title: e.target.value })}
                                className="font-bold text-lg bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                                placeholder="Título del Kahoot"
                            />
                            <p className="text-sm text-gray-500">
                                {kahoot.questions.length} preguntas • {kahoot.status === "published" ? "Publicado" : "Borrador"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 font-medium"
                        >
                            <Settings className="h-4 w-4" />
                            Ajustes
                        </button>
                        <Link
                            href={`/kahoot/${kahootId}/play`}
                            className="h-10 px-4 rounded-lg bg-[#1368ce] text-white hover:bg-[#0f5bba] flex items-center gap-2 font-medium"
                        >
                            <Eye className="h-4 w-4" />
                            Vista previa
                        </Link>
                        <button
                            onClick={saveKahoot}
                            disabled={isSaving || !hasChanges}
                            className={`h-10 px-6 rounded-lg font-bold flex items-center gap-2 transition-all ${
                                hasChanges
                                    ? "bg-[#26890c] text-white hover:bg-[#2ea00f]"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {isSaving ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isSaving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Questions Sidebar */}
                <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => addQuestion("quiz")}
                            className="w-full py-3 bg-[#46178f] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#5a1eb5] transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            Agregar pregunta
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {kahoot.questions.map((question, index) => (
                            <div
                                key={question.id}
                                onClick={() => setSelectedQuestionIndex(index)}
                                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                                    selectedQuestionIndex === index
                                        ? "bg-[#46178f]/10 border-2 border-[#46178f]"
                                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent"
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 rounded bg-[#46178f] text-white text-xs font-bold flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {question.question || "Sin pregunta"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                question.type === "quiz" ? "bg-blue-100 text-blue-700" :
                                                question.type === "truefalse" ? "bg-green-100 text-green-700" :
                                                "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {question.type === "quiz" ? "Quiz" : question.type === "truefalse" ? "V/F" : question.type}
                                            </span>
                                            <span className="text-xs text-gray-500">{question.timeLimit}s</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick actions on hover */}
                                <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveQuestion(index, "up"); }}
                                        disabled={index === 0}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronUp className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); moveQuestion(index, "down"); }}
                                        disabled={index === kahoot.questions.length - 1}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                                    >
                                        <ChevronDown className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); duplicateQuestion(index); }}
                                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteQuestion(index); }}
                                        className="p-1 rounded hover:bg-red-100 text-red-500"
                                        disabled={kahoot.questions.length <= 1}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add question types */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Tipo de pregunta</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => addQuestion("quiz")}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
                            >
                                <HelpCircle className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                <span className="text-xs">Quiz</span>
                            </button>
                            <button
                                onClick={() => addQuestion("truefalse")}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
                            >
                                <ToggleLeft className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                <span className="text-xs">V/F</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Question Editor */}
                <main className="flex-1 overflow-y-auto">
                    {currentQuestion && (
                        <div className="max-w-4xl mx-auto p-6">
                            {/* Question Type & Settings */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <select
                                        value={currentQuestion.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as QuestionType
                                            const newAnswers = newType === "truefalse"
                                                ? ["Verdadero", "Falso"]
                                                : currentQuestion.answers.length === 2
                                                    ? ["", "", "", ""]
                                                    : currentQuestion.answers
                                            updateQuestion(selectedQuestionIndex, { type: newType, answers: newAnswers })
                                        }}
                                        className="h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="quiz">Quiz</option>
                                        <option value="truefalse">Verdadero/Falso</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Time limit */}
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <select
                                            value={currentQuestion.timeLimit}
                                            onChange={(e) => updateQuestion(selectedQuestionIndex, { timeLimit: parseInt(e.target.value) })}
                                            className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            {timeLimits.map((time) => (
                                                <option key={time} value={time}>{time} seg</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Points */}
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-gray-500" />
                                        <select
                                            value={currentQuestion.points}
                                            onChange={(e) => updateQuestion(selectedQuestionIndex, { points: parseInt(e.target.value) })}
                                            className="h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            {pointOptions.map((points) => (
                                                <option key={points} value={points}>
                                                    {points === 0 ? "Sin puntos" : points === 1000 ? "Estándar" : "Doble"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Question Preview Card */}
                            <div
                                className="rounded-2xl overflow-hidden shadow-xl mb-6"
                                style={{ backgroundColor: kahoot.color }}
                            >
                                {/* Question input */}
                                <div className="p-8">
                                    <textarea
                                        value={currentQuestion.question}
                                        onChange={(e) => updateQuestion(selectedQuestionIndex, { question: e.target.value })}
                                        placeholder="Escribe tu pregunta aquí..."
                                        className="w-full bg-transparent text-white text-2xl font-bold placeholder-white/50 border-0 focus:outline-none focus:ring-0 resize-none text-center"
                                        rows={3}
                                    />
                                </div>

                                {/* Add image button */}
                                <div className="px-8 pb-4 flex justify-center">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                                        <Image className="h-4 w-4" />
                                        Agregar imagen
                                    </button>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className={`grid gap-4 ${currentQuestion.type === "truefalse" ? "grid-cols-2" : "grid-cols-2"}`}>
                                {currentQuestion.answers.map((answer, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-xl overflow-hidden"
                                        style={{ backgroundColor: answerColors[index] }}
                                    >
                                        <div className="p-4 flex items-center gap-4">
                                            {/* Shape icon */}
                                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {index === 0 && <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-white" />}
                                                {index === 1 && <div className="w-5 h-5 bg-white rotate-45" />}
                                                {index === 2 && <div className="w-5 h-5 bg-white rounded-full" />}
                                                {index === 3 && <div className="w-5 h-5 bg-white" />}
                                            </div>

                                            {/* Answer input */}
                                            <input
                                                type="text"
                                                value={answer}
                                                onChange={(e) => {
                                                    const newAnswers = [...currentQuestion.answers]
                                                    newAnswers[index] = e.target.value
                                                    updateQuestion(selectedQuestionIndex, { answers: newAnswers })
                                                }}
                                                placeholder={`Respuesta ${index + 1}`}
                                                disabled={currentQuestion.type === "truefalse"}
                                                className="flex-1 bg-transparent text-white text-lg font-medium placeholder-white/50 border-0 focus:outline-none disabled:cursor-not-allowed"
                                            />

                                            {/* Correct answer toggle */}
                                            <button
                                                onClick={() => updateQuestion(selectedQuestionIndex, { correctAnswer: index })}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                    currentQuestion.correctAnswer === index
                                                        ? "bg-white text-green-500"
                                                        : "bg-white/20 text-white hover:bg-white/30"
                                                }`}
                                            >
                                                <Check className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Explanation (optional) */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Explicación (opcional)
                                </label>
                                <textarea
                                    value={currentQuestion.explanation || ""}
                                    onChange={(e) => updateQuestion(selectedQuestionIndex, { explanation: e.target.value })}
                                    placeholder="Agrega una explicación que se mostrará después de responder..."
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#46178f]"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Settings Panel */}
                {showSettings && (
                    <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white">Ajustes del Kahoot</h3>
                            <button onClick={() => setShowSettings(false)}>
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                                <input
                                    type="text"
                                    value={kahoot.title}
                                    onChange={(e) => updateKahoot({ title: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                                <textarea
                                    value={kahoot.description}
                                    onChange={(e) => updateKahoot({ description: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                                <div className="flex gap-2">
                                    {["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f", "#00cec8"].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => updateKahoot({ color })}
                                            className={`w-10 h-10 rounded-full ${kahoot.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibilidad</label>
                                <select
                                    value={kahoot.visibility}
                                    onChange={(e) => updateKahoot({ visibility: e.target.value as any })}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                >
                                    <option value="private">Privado</option>
                                    <option value="organization">Organización</option>
                                    <option value="public">Público</option>
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                                <select
                                    value={kahoot.category || "General"}
                                    onChange={(e) => updateKahoot({ category: e.target.value })}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                >
                                    <option value="General">General</option>
                                    <option value="Matemáticas">Matemáticas</option>
                                    <option value="Ciencias">Ciencias</option>
                                    <option value="Historia">Historia</option>
                                    <option value="Geografía">Geografía</option>
                                    <option value="Idiomas">Idiomas</option>
                                    <option value="Tecnología">Tecnología</option>
                                </select>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dificultad</label>
                                <select
                                    value={kahoot.difficulty || "medium"}
                                    onChange={(e) => updateKahoot({ difficulty: e.target.value as any })}
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                >
                                    <option value="easy">Fácil</option>
                                    <option value="medium">Medio</option>
                                    <option value="hard">Difícil</option>
                                </select>
                            </div>

                            {/* Publish/Unpublish */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => updateKahoot({ status: kahoot.status === "published" ? "draft" : "published" })}
                                    className={`w-full py-3 rounded-lg font-bold ${
                                        kahoot.status === "published"
                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                    }`}
                                >
                                    {kahoot.status === "published" ? "Despublicar" : "Publicar"}
                                </button>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}
