import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function LearnPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params
    const { lesson: lessonId } = await searchParams
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { orderIndex: "asc" },
                    },
                },
                orderBy: { orderIndex: "asc" },
            },
            enrollments: {
                where: { userId: session.user.id },
            },
        },
    })

    if (!course) {
        notFound()
    }

    const enrollment = course.enrollments[0]
    if (!enrollment) {
        redirect(`/courses/${slug}`)
    }

    // Build flat list of all lessons with module info
    const allLessons = course.modules.flatMap(module =>
        module.lessons.map(lesson => ({
            ...lesson,
            moduleId: module.id,
            moduleTitle: module.title,
        }))
    )

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
        where: {
            userId: session.user.id,
            lessonId: { in: allLessons.map(l => l.id) },
        },
    })

    const completedLessonIds = new Set(
        lessonProgress.filter(p => p.isCompleted).map(p => p.lessonId)
    )

    // Handle legacy ?lesson= query param - redirect to new URL structure
    if (lessonId && typeof lessonId === 'string') {
        const lesson = allLessons.find(l => l.id === lessonId)
        if (lesson) {
            redirect(`/learn/${slug}/module/${lesson.moduleId}/lesson/${lesson.id}`)
        }
    }

    // Find the target lesson: first incomplete or first lesson
    const targetLesson = allLessons.find(l => !completedLessonIds.has(l.id)) || allLessons[0]

    if (targetLesson) {
        // Redirect to the proper URL structure
        redirect(`/learn/${slug}/module/${targetLesson.moduleId}/lesson/${targetLesson.id}`)
    }

    // Fallback: if no lessons, go to courses
    redirect(`/courses/${slug}`)
}
