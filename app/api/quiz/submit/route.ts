import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { quizId, answers, timeSpent } = await req.json()

        if (!quizId || !answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Quiz ID and answers are required' },
                { status: 400 }
            )
        }

        // Obtener el quiz
        const quiz = await prisma.lessonQuiz.findUnique({
            where: { id: quizId }
        })

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            )
        }

        // Parsear las preguntas con manejo de errores
        let questions
        try {
            questions = JSON.parse(quiz.questions)
        } catch {
            return NextResponse.json(
                { error: 'Invalid quiz data format' },
                { status: 500 }
            )
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json(
                { error: 'Quiz has no valid questions' },
                { status: 400 }
            )
        }

        // Calcular puntuación
        let correctAnswers = 0
        const detailedResults = answers.map((answer: { questionId: string; selectedIndex: number }, index: number) => {
            const question = questions.find((q: any) => q.id === answer.questionId)
            if (!question) return { correct: false, explanation: 'Question not found' }

            const isCorrect = answer.selectedIndex === question.correctIndex
            if (isCorrect) correctAnswers++

            return {
                questionId: answer.questionId,
                correct: isCorrect,
                selectedIndex: answer.selectedIndex,
                correctIndex: question.correctIndex,
                explanation: question.explanation || null
            }
        })

        const totalQuestions = answers.length
        const score = Math.round((correctAnswers / totalQuestions) * 100)

        // Guardar intento
        const attempt = await prisma.quizAttempt.create({
            data: {
                lessonQuizId: quizId,
                userId: session.user.id,
                score,
                correctAnswers,
                totalQuestions,
                answers: JSON.stringify(detailedResults),
                timeSpent: timeSpent || 0
            }
        })

        // Actualizar XP del usuario si aprobó (>= 60%)
        if (score >= 60) {
            const xpEarned = Math.floor(score / 10) * 5 // 5 XP por cada 10% de score

            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    xp: { increment: xpEarned }
                }
            })
        }

        console.log(`📊 Quiz submitted: ${score}% (${correctAnswers}/${totalQuestions})`)

        return NextResponse.json({
            success: true,
            result: {
                attemptId: attempt.id,
                score,
                correctAnswers,
                totalQuestions,
                passed: score >= 60,
                detailedResults,
                xpEarned: score >= 60 ? Math.floor(score / 10) * 5 : 0
            }
        })

    } catch (error) {
        console.error('Quiz submission error:', error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to submit quiz'
            },
            { status: 500 }
        )
    }
}
