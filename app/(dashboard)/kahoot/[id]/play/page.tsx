"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, X, Check, Clock, Trophy, Star, ChevronRight, Home, RotateCcw, Share2, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

interface KahootQuestion {
    id: string
    type: string
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
    color: string
    questions: KahootQuestion[]
    plays: number
    players: number
}

type GameState = "lobby" | "countdown" | "question" | "answer" | "results" | "finished"

const answerColors = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"]
const answerShapes = ["triangle", "diamond", "circle", "square"]

export default function PlayKahootPage() {
    const params = useParams()
    const router = useRouter()
    const kahootId = params.id as string

    const [kahoot, setKahoot] = useState<KahootType | null>(null)
    const [gameState, setGameState] = useState<GameState>("lobby")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [answers, setAnswers] = useState<{ questionId: string; selected: number | null; correct: boolean; points: number; time: number }[]>([])
    const [countdown, setCountdown] = useState(3)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [questionStartTime, setQuestionStartTime] = useState(0)

    // Load kahoot from localStorage
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

    // Countdown timer
    useEffect(() => {
        if (gameState === "countdown" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (gameState === "countdown" && countdown === 0) {
            startQuestion()
        }
    }, [gameState, countdown])

    // Question timer
    useEffect(() => {
        if (gameState === "question" && timeLeft > 0 && selectedAnswer === null) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (gameState === "question" && timeLeft === 0 && selectedAnswer === null) {
            handleTimeUp()
        }
    }, [gameState, timeLeft, selectedAnswer])

    const startGame = () => {
        setGameState("countdown")
        setCountdown(3)
        setCurrentQuestionIndex(0)
        setScore(0)
        setStreak(0)
        setAnswers([])
    }

    const startQuestion = () => {
        if (!kahoot) return
        const question = kahoot.questions[currentQuestionIndex]
        setTimeLeft(question.timeLimit)
        setSelectedAnswer(null)
        setQuestionStartTime(Date.now())
        setGameState("question")
    }

    const handleTimeUp = () => {
        if (!kahoot) return
        const question = kahoot.questions[currentQuestionIndex]

        setAnswers([...answers, {
            questionId: question.id,
            selected: null,
            correct: false,
            points: 0,
            time: question.timeLimit
        }])
        setStreak(0)
        setGameState("answer")
    }

    const handleSelectAnswer = (index: number) => {
        if (selectedAnswer !== null || gameState !== "question" || !kahoot) return

        const question = kahoot.questions[currentQuestionIndex]
        const timeTaken = (Date.now() - questionStartTime) / 1000
        const isCorrect = index === question.correctAnswer

        let pointsEarned = 0
        if (isCorrect) {
            // Points based on speed (faster = more points)
            const timeBonus = Math.max(0, 1 - (timeTaken / question.timeLimit))
            pointsEarned = Math.round(question.points * (0.5 + 0.5 * timeBonus))

            // Streak bonus
            if (streak >= 2) {
                pointsEarned = Math.round(pointsEarned * (1 + streak * 0.1))
            }

            setScore(score + pointsEarned)
            setStreak(streak + 1)

            // Confetti for correct answer
            if (typeof window !== "undefined") {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            }
        } else {
            setStreak(0)
        }

        setSelectedAnswer(index)
        setAnswers([...answers, {
            questionId: question.id,
            selected: index,
            correct: isCorrect,
            points: pointsEarned,
            time: timeTaken
        }])

        // Show answer after short delay
        setTimeout(() => {
            setGameState("answer")
        }, 500)
    }

    const nextQuestion = () => {
        if (!kahoot) return

        if (currentQuestionIndex < kahoot.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setGameState("countdown")
            setCountdown(3)
        } else {
            setGameState("finished")
            // Update play count
            const savedKahoots = localStorage.getItem("youknow_kahoots")
            if (savedKahoots) {
                const kahoots = JSON.parse(savedKahoots)
                const updated = kahoots.map((k: KahootType) => {
                    if (k.id === kahootId) {
                        return { ...k, plays: k.plays + 1, players: k.players + 1 }
                    }
                    return k
                })
                localStorage.setItem("youknow_kahoots", JSON.stringify(updated))
            }
        }
    }

    if (!kahoot) {
        return (
            <div className="min-h-screen bg-[#46178f] flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Cargando Kahoot...</p>
                </div>
            </div>
        )
    }

    const currentQuestion = kahoot.questions[currentQuestionIndex]
    const correctAnswers = answers.filter(a => a.correct).length
    const accuracy = answers.length > 0 ? Math.round((correctAnswers / answers.length) * 100) : 0

    return (
        <div className="min-h-screen" style={{ backgroundColor: gameState === "lobby" || gameState === "finished" ? "#46178f" : kahoot.color }}>
            {/* Lobby */}
            {gameState === "lobby" && (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rotate-45" />
                    </div>

                    <div className="relative z-10 text-center max-w-2xl">
                        {/* Close button */}
                        <Link href="/courses" className="absolute top-4 right-4 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                            <X className="h-6 w-6" />
                        </Link>

                        {/* Kahoot cover */}
                        <div className="w-32 h-32 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl" style={{ backgroundColor: kahoot.color }}>
                            <Play className="h-16 w-16 text-white" fill="white" />
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                            {kahoot.title}
                        </h1>
                        <p className="text-white/80 text-lg mb-8">
                            {kahoot.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 mb-8 text-white/80">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">{kahoot.questions.length}</p>
                                <p className="text-sm">Preguntas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">{kahoot.plays}</p>
                                <p className="text-sm">Jugadas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-white">{kahoot.players}</p>
                                <p className="text-sm">Jugadores</p>
                            </div>
                        </div>

                        {/* Play button */}
                        <button
                            onClick={startGame}
                            className="px-12 py-5 bg-white text-[#46178f] rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
                        >
                            <Play className="h-6 w-6 inline mr-3" fill="currentColor" />
                            Comenzar
                        </button>

                        {/* Sound toggle */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="absolute top-4 left-4 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        >
                            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Countdown */}
            {gameState === "countdown" && (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-white/80 text-xl mb-4">Pregunta {currentQuestionIndex + 1} de {kahoot.questions.length}</p>
                        <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center mx-auto animate-pulse">
                            <span className="text-7xl font-black text-[#46178f]">{countdown}</span>
                        </div>
                        <p className="text-white text-2xl font-bold mt-6">¡Prepárate!</p>
                    </div>
                </div>
            )}

            {/* Question */}
            {gameState === "question" && currentQuestion && (
                <div className="min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 rounded-full px-4 py-2 text-white font-bold">
                                {currentQuestionIndex + 1} / {kahoot.questions.length}
                            </div>
                            {streak >= 2 && (
                                <div className="bg-yellow-400 text-black rounded-full px-4 py-2 font-bold flex items-center gap-1">
                                    <Star className="h-4 w-4" fill="currentColor" />
                                    Racha x{streak}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white rounded-full px-6 py-2 font-black text-lg" style={{ color: kahoot.color }}>
                                {score.toLocaleString()} pts
                            </div>
                        </div>
                    </div>

                    {/* Timer bar */}
                    <div className="h-2 bg-white/20">
                        <div
                            className="h-full bg-white transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                        />
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="h-8 w-8 text-white" />
                            <span className="text-5xl font-black text-white">{timeLeft}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-center max-w-4xl mb-4">
                            {currentQuestion.question}
                        </h2>
                        {currentQuestion.type === "truefalse" && (
                            <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm">
                                Verdadero o Falso
                            </span>
                        )}
                    </div>

                    {/* Answers */}
                    <div className={`grid gap-3 p-4 ${currentQuestion.answers.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-2"}`}>
                        {currentQuestion.answers.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={selectedAnswer !== null}
                                className={`p-6 rounded-xl font-bold text-white text-xl transition-all duration-200 flex items-center gap-4 ${
                                    selectedAnswer === index
                                        ? "scale-95 opacity-80"
                                        : "hover:scale-[1.02] hover:shadow-lg"
                                }`}
                                style={{ backgroundColor: answerColors[index] }}
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {answerShapes[index] === "triangle" && <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] border-b-white" />}
                                    {answerShapes[index] === "diamond" && <div className="w-4 h-4 bg-white rotate-45" />}
                                    {answerShapes[index] === "circle" && <div className="w-4 h-4 bg-white rounded-full" />}
                                    {answerShapes[index] === "square" && <div className="w-4 h-4 bg-white" />}
                                </div>
                                <span className="flex-1 text-left">{answer}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Answer reveal */}
            {gameState === "answer" && currentQuestion && (
                <div className="min-h-screen flex flex-col">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between">
                        <div className="bg-white/20 rounded-full px-4 py-2 text-white font-bold">
                            {currentQuestionIndex + 1} / {kahoot.questions.length}
                        </div>
                        <div className="bg-white rounded-full px-6 py-2 font-black text-lg" style={{ color: kahoot.color }}>
                            {score.toLocaleString()} pts
                        </div>
                    </div>

                    {/* Result */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {answers[answers.length - 1]?.correct ? (
                            <>
                                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 animate-bounce">
                                    <Check className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2">¡Correcto!</h2>
                                <p className="text-2xl text-white/80">+{answers[answers.length - 1]?.points} puntos</p>
                                {streak >= 2 && (
                                    <p className="text-yellow-400 font-bold mt-2 flex items-center gap-2">
                                        <Star className="h-5 w-5" fill="currentColor" />
                                        ¡Racha de {streak}!
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center mb-6">
                                    <X className="h-12 w-12 text-white" />
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2">
                                    {selectedAnswer === null ? "¡Tiempo agotado!" : "Incorrecto"}
                                </h2>
                                <p className="text-xl text-white/80">
                                    Respuesta correcta: {currentQuestion.answers[currentQuestion.correctAnswer as number]}
                                </p>
                            </>
                        )}
                        {currentQuestion.explanation && (
                            <p className="mt-4 text-white/70 text-center max-w-lg">{currentQuestion.explanation}</p>
                        )}
                    </div>

                    {/* Next button */}
                    <div className="p-6">
                        <button
                            onClick={nextQuestion}
                            className="w-full py-5 bg-white rounded-xl font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                            style={{ color: kahoot.color }}
                        >
                            {currentQuestionIndex < kahoot.questions.length - 1 ? (
                                <>
                                    Siguiente
                                    <ChevronRight className="h-6 w-6" />
                                </>
                            ) : (
                                <>
                                    Ver resultados
                                    <Trophy className="h-6 w-6" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Final results */}
            {gameState === "finished" && (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-xl" />
                    </div>

                    <div className="relative z-10 text-center max-w-lg w-full">
                        {/* Trophy */}
                        <div className="w-28 h-28 rounded-full bg-yellow-400 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Trophy className="h-14 w-14 text-yellow-800" />
                        </div>

                        <h1 className="text-4xl font-black text-white mb-2">¡Juego terminado!</h1>
                        <p className="text-white/80 text-lg mb-8">{kahoot.title}</p>

                        {/* Score card */}
                        <div className="bg-white rounded-2xl p-6 mb-6 shadow-xl">
                            <p className="text-6xl font-black mb-2" style={{ color: "#46178f" }}>
                                {score.toLocaleString()}
                            </p>
                            <p className="text-gray-500 font-medium mb-6">puntos totales</p>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-3xl font-bold text-green-500">{correctAnswers}</p>
                                    <p className="text-sm text-gray-500">Correctas</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-red-500">{answers.length - correctAnswers}</p>
                                    <p className="text-sm text-gray-500">Incorrectas</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-blue-500">{accuracy}%</p>
                                    <p className="text-sm text-gray-500">Precisión</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-white text-[#46178f] rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                            >
                                <RotateCcw className="h-5 w-5" />
                                Jugar de nuevo
                            </button>
                            <div className="flex gap-3">
                                <button className="flex-1 py-4 bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                    Compartir
                                </button>
                                <Link href="/courses" className="flex-1 py-4 bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
                                    <Home className="h-5 w-5" />
                                    Salir
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
