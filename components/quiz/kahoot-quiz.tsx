"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Trophy,
    Timer,
    CheckCircle,
    XCircle,
    Loader2,
    Play,
    RotateCcw,
    Sparkles,
    Zap,
    Target,
    Star
} from 'lucide-react'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
}

interface KahootQuizProps {
    lessonId: string
    lessonTitle: string
    onComplete?: (score: number) => void
}

type QuizState = 'loading' | 'ready' | 'playing' | 'answered' | 'results'

interface QuizResult {
    score: number
    correctAnswers: number
    totalQuestions: number
    passed: boolean
    xpEarned: number
    detailedResults: {
        questionId: string
        correct: boolean
        selectedIndex: number
        correctIndex: number
        explanation?: string
    }[]
}

// Colores Kahoot para las opciones
const OPTION_COLORS = [
    { bg: 'bg-red-500 hover:bg-red-600', selected: 'bg-red-600 ring-4 ring-red-300', icon: '▲' },
    { bg: 'bg-blue-500 hover:bg-blue-600', selected: 'bg-blue-600 ring-4 ring-blue-300', icon: '◆' },
    { bg: 'bg-yellow-500 hover:bg-yellow-600', selected: 'bg-yellow-600 ring-4 ring-yellow-300', icon: '●' },
    { bg: 'bg-green-500 hover:bg-green-600', selected: 'bg-green-600 ring-4 ring-green-300', icon: '■' }
]

export function KahootQuiz({ lessonId, lessonTitle, onComplete }: KahootQuizProps) {
    const [state, setState] = useState<QuizState>('loading')
    const [quizId, setQuizId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([])
    const [timeLeft, setTimeLeft] = useState(20) // 20 segundos por pregunta
    const [totalTime, setTotalTime] = useState(0)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showCorrect, setShowCorrect] = useState(false)

    const QUESTIONS_PER_QUIZ = 5
    const MIN_QUESTIONS_REQUIRED = 10

    // Cargar quiz
    const loadQuiz = useCallback(async () => {
        setState('loading')
        setError(null)

        try {
            const response = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load quiz')
            }

            // Verificar si existe quiz
            if (!data.quiz || !data.quiz.questions) {
                setError('Este quiz aún no está disponible. El instructor debe crear las preguntas.')
                setState('ready')
                return
            }

            const allQuestions = data.quiz.questions as QuizQuestion[]

            // Verificar mínimo de preguntas
            if (allQuestions.length < MIN_QUESTIONS_REQUIRED) {
                setError(`El quiz no está completo. Se requieren al menos ${MIN_QUESTIONS_REQUIRED} preguntas (actualmente hay ${allQuestions.length}).`)
                setState('ready')
                return
            }

            // Seleccionar 5 preguntas aleatorias
            const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
            const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_QUIZ)

            setQuizId(data.quiz.id)
            setQuestions(selectedQuestions)
            setState('ready')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading quiz')
            setState('ready')
        }
    }, [lessonId])

    useEffect(() => {
        loadQuiz()
    }, [loadQuiz])

    const startQuiz = () => {
        setState('playing')
        setCurrentQuestionIndex(0)
        setAnswers([])
        setTimeLeft(20)
        setTotalTime(0)
        setResult(null)
        setSelectedAnswer(null)
        setShowCorrect(false)
    }

    const handleSelectAnswer = useCallback((index: number) => {
        if (selectedAnswer !== null) return // Ya respondió
        if (currentQuestionIndex >= questions.length) return // No hay más preguntas

        const currentQuestion = questions[currentQuestionIndex]
        if (!currentQuestion) return // Verificación de seguridad

        setSelectedAnswer(index)
        setShowCorrect(true)
        setState('answered')

        const newAnswer = {
            questionId: currentQuestion.id,
            selectedIndex: index
        }
        setAnswers(prev => [...prev, newAnswer])

        // Esperar 2 segundos para mostrar respuesta correcta
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                // Siguiente pregunta
                setCurrentQuestionIndex(prev => prev + 1)
                setSelectedAnswer(null)
                setShowCorrect(false)
                setTimeLeft(20)
                setState('playing')
            } else {
                // Fin del quiz - enviar resultados
                submitQuiz([...answers, newAnswer])
            }
        }, 2000)
    }, [selectedAnswer, currentQuestionIndex, questions, answers])

    // Timer
    useEffect(() => {
        if (state !== 'playing') return
        if (questions.length === 0) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Tiempo agotado - seleccionar automáticamente incorrecta
                    handleSelectAnswer(-1) // -1 indica timeout
                    return 20
                }
                return prev - 1
            })
            setTotalTime(prev => prev + 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [state, currentQuestionIndex, questions.length, handleSelectAnswer])

    const submitQuiz = async (finalAnswers: { questionId: string; selectedIndex: number }[]) => {
        setState('loading')

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId,
                    answers: finalAnswers,
                    timeSpent: totalTime
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quiz')
            }

            setResult(data.result)
            setState('results')
            onComplete?.(data.result.score)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error submitting quiz')
            setState('results')
        }
    }

    const currentQuestion = questions[currentQuestionIndex]

    // Pantalla de carga
    if (state === 'loading' && !questions.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Generando quiz...</p>
            </div>
        )
    }

    // Pantalla de error
    if (error && state !== 'playing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="text-red-600 text-center">{error}</p>
                <Button onClick={loadQuiz} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Intentar de nuevo
                </Button>
            </div>
        )
    }

    // Pantalla de inicio
    if (state === 'ready') {
        // Si hay error (quiz incompleto o no disponible), no mostrar botón de inicio
        if (error || questions.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
                    <div className="relative">
                        <div className="relative bg-gradient-to-br from-gray-400 to-gray-600 p-6 rounded-full">
                            <Target className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Quiz: {lessonTitle}
                        </h2>
                        <p className="text-orange-600 dark:text-orange-400">
                            {error || 'Quiz no disponible'}
                        </p>
                    </div>

                    <Button onClick={loadQuiz} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Intentar cargar de nuevo
                    </Button>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-full">
                        <Target className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Quiz: {lessonTitle}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Responde {QUESTIONS_PER_QUIZ} preguntas aleatorias para evaluar tu conocimiento
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        <span>20 seg/pregunta</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>Gana XP</span>
                    </div>
                </div>

                <Button
                    onClick={startQuiz}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-semibold shadow-lg"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Comenzar Quiz
                </Button>
            </div>
        )
    }

    // Pantalla de resultados
    if (state === 'results' && result) {
        const isPassed = result.passed

        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                {/* Confetti effect for passing */}
                {isPassed && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="absolute top-0 left-1/2 w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="absolute top-0 left-3/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                )}

                {/* Score Circle */}
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${isPassed
                        ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                        : 'bg-gradient-to-br from-orange-400 to-red-500'
                    }`}>
                    <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold">{result.score}%</span>
                    </div>
                </div>

                {/* Result Message */}
                <div className="text-center space-y-2">
                    {isPassed ? (
                        <>
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <Trophy className="w-6 h-6" />
                                <span className="text-xl font-bold">¡Excelente!</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Has demostrado un buen conocimiento del tema
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-2 text-orange-600">
                                <RotateCcw className="w-6 h-6" />
                                <span className="text-xl font-bold">Sigue practicando</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Revisa el video e intenta de nuevo
                            </p>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                    <Card className="p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold">{result.correctAnswers}</p>
                        <p className="text-xs text-gray-500">Correctas</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold">{result.totalQuestions - result.correctAnswers}</p>
                        <p className="text-xs text-gray-500">Incorrectas</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold">+{result.xpEarned}</p>
                        <p className="text-xs text-gray-500">XP ganado</p>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button onClick={startQuiz} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Intentar de nuevo
                    </Button>
                </div>
            </div>
        )
    }

    // Pantalla de juego
    if ((state === 'playing' || state === 'answered') && currentQuestion) {
        return (
            <div className="flex flex-col min-h-[500px]">
                {/* Header con progreso y timer */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Pregunta {currentQuestionIndex + 1} de {questions.length}
                        </span>
                        <div className="flex gap-1">
                            {questions.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-colors ${i < currentQuestionIndex
                                            ? 'bg-green-500'
                                            : i === currentQuestionIndex
                                                ? 'bg-indigo-500'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${timeLeft <= 5
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 animate-pulse'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        <Timer className="w-5 h-5" />
                        <span className="text-xl tabular-nums">{timeLeft}</span>
                    </div>
                </div>

                {/* Pregunta */}
                <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-8 mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-center leading-relaxed">
                        {currentQuestion.question}
                    </h3>
                </Card>

                {/* Opciones estilo Kahoot */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {currentQuestion.options.map((option, index) => {
                        const color = OPTION_COLORS[index]
                        const isSelected = selectedAnswer === index
                        const isCorrect = index === currentQuestion.correctIndex
                        const showAsCorrect = showCorrect && isCorrect
                        const showAsWrong = showCorrect && isSelected && !isCorrect

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={state === 'answered'}
                                className={`
                                    relative p-6 rounded-lg text-white font-semibold text-lg
                                    transition-all duration-200 transform
                                    ${state === 'answered' ? 'cursor-default' : 'hover:scale-[1.02] active:scale-[0.98]'}
                                    ${isSelected ? color.selected : color.bg}
                                    ${showAsCorrect ? 'ring-4 ring-green-400 bg-green-500' : ''}
                                    ${showAsWrong ? 'ring-4 ring-red-400 opacity-60' : ''}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl opacity-60">{color.icon}</span>
                                    <span className="flex-1 text-left">{option}</span>
                                    {showAsCorrect && <CheckCircle className="w-6 h-6" />}
                                    {showAsWrong && <XCircle className="w-6 h-6" />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Feedback después de responder */}
                {state === 'answered' && (
                    <div className={`mt-4 p-4 rounded-lg text-center ${selectedAnswer === currentQuestion.correctIndex
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {selectedAnswer === currentQuestion.correctIndex ? (
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">¡Correcto!</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold">
                                    Incorrecto - La respuesta era: {currentQuestion.options[currentQuestion.correctIndex]}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return null
}
