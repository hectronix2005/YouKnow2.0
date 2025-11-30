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

        const { lessonId } = await req.json()

        if (!lessonId) {
            return NextResponse.json(
                { error: 'Lesson ID is required' },
                { status: 400 }
            )
        }

        // Obtener la lección
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

        // Verificar que el usuario tiene acceso
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: lesson.module.courseId
                }
            }
        })

        const isInstructor = lesson.module.course.instructorId === session.user.id

        if (!enrollment && !isInstructor) {
            return NextResponse.json(
                { error: 'Not enrolled in this course' },
                { status: 403 }
            )
        }

        // Buscar quiz existente
        const existingQuiz = await prisma.lessonQuiz.findUnique({
            where: { lessonId }
        })

        if (existingQuiz) {
            return NextResponse.json({
                success: true,
                quiz: {
                    id: existingQuiz.id,
                    questions: JSON.parse(existingQuiz.questions),
                    generatedAt: existingQuiz.generatedAt
                }
            })
        }

        // No hay quiz, retornar vacío
        return NextResponse.json({
            success: true,
            quiz: null,
            message: 'No quiz found for this lesson'
        })

    } catch (error) {
        console.error('Quiz fetch error:', error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch quiz'
            },
            { status: 500 }
        )
    }
}
