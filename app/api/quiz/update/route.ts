import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
}

export async function PUT(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { lessonId, questions } = await req.json()

        if (!lessonId) {
            return NextResponse.json(
                { error: 'Lesson ID is required' },
                { status: 400 }
            )
        }

        if (!questions || !Array.isArray(questions)) {
            return NextResponse.json(
                { error: 'Questions array is required' },
                { status: 400 }
            )
        }

        // Validar mínimo de 10 preguntas
        const MIN_QUESTIONS = 10
        if (questions.length < MIN_QUESTIONS) {
            return NextResponse.json(
                { error: `Se requieren al menos ${MIN_QUESTIONS} preguntas. Actualmente tienes ${questions.length}.` },
                { status: 400 }
            )
        }

        // Verificar que la lección existe y el usuario es el instructor
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    include: {
                        course: true
                    }
                }
            }
        })

        if (!lesson) {
            return NextResponse.json(
                { error: 'Lesson not found' },
                { status: 404 }
            )
        }

        // Solo el instructor puede editar el quiz
        if (lesson.module.course.instructorId !== session.user.id) {
            return NextResponse.json(
                { error: 'Only the course instructor can edit quizzes' },
                { status: 403 }
            )
        }

        // Validar estructura de las preguntas
        for (const q of questions) {
            if (!q.question || typeof q.question !== 'string') {
                return NextResponse.json(
                    { error: 'Each question must have a question text' },
                    { status: 400 }
                )
            }
            if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
                return NextResponse.json(
                    { error: 'Each question must have exactly 4 options' },
                    { status: 400 }
                )
            }
            if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
                return NextResponse.json(
                    { error: 'Each question must have a valid correctIndex (0-3)' },
                    { status: 400 }
                )
            }
        }

        // Actualizar o crear el quiz
        const quiz = await prisma.lessonQuiz.upsert({
            where: { lessonId },
            update: {
                questions: JSON.stringify(questions),
                updatedAt: new Date()
            },
            create: {
                lessonId,
                questions: JSON.stringify(questions)
            }
        })

        console.log(`✅ Quiz updated for lesson ${lessonId} with ${questions.length} questions`)

        return NextResponse.json({
            success: true,
            quiz: {
                id: quiz.id,
                questions,
                updatedAt: quiz.updatedAt
            }
        })

    } catch (error) {
        console.error('Quiz update error:', error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to update quiz'
            },
            { status: 500 }
        )
    }
}
