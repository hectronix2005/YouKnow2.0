import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(req.url)
        const lessonId = searchParams.get('lessonId')

        if (!lessonId) {
            return NextResponse.json(
                { error: 'Lesson ID is required' },
                { status: 400 }
            )
        }

        // Obtener el quiz de la lección
        const quiz = await prisma.lessonQuiz.findUnique({
            where: { lessonId }
        })

        if (!quiz) {
            return NextResponse.json({
                hasQuiz: false,
                bestScore: null,
                passed: false
            })
        }

        // Obtener el mejor score del usuario para este quiz
        const bestAttempt = await prisma.quizAttempt.findFirst({
            where: {
                lessonQuizId: quiz.id,
                userId: session.user.id
            },
            orderBy: {
                score: 'desc'
            }
        })

        return NextResponse.json({
            hasQuiz: true,
            bestScore: bestAttempt?.score ?? null,
            passed: bestAttempt ? bestAttempt.score === 100 : false,
            attempts: await prisma.quizAttempt.count({
                where: {
                    lessonQuizId: quiz.id,
                    userId: session.user.id
                }
            })
        })

    } catch (error) {
        console.error('Quiz best score error:', error)
        return NextResponse.json(
            { error: 'Failed to get quiz score' },
            { status: 500 }
        )
    }
}
