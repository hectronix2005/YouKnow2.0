import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function ModulePage({
    params,
}: {
    params: Promise<{ slug: string; moduleId: string }>
}) {
    const { slug, moduleId } = await params
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

    // Find the module
    const currentModule = course.modules.find(m => m.id === moduleId)
    if (!currentModule) {
        notFound()
    }

    // Get lesson progress to find first incomplete lesson
    const lessonProgress = await prisma.lessonProgress.findMany({
        where: {
            userId: session.user.id,
            lessonId: { in: currentModule.lessons.map(l => l.id) },
        },
    })

    const completedLessonIds = new Set(
        lessonProgress.filter(p => p.isCompleted).map(p => p.lessonId)
    )

    // Find first incomplete lesson in this module, or first lesson if all complete
    const targetLesson = currentModule.lessons.find(l => !completedLessonIds.has(l.id))
        || currentModule.lessons[0]

    if (targetLesson) {
        // Redirect to the first/next lesson in this module
        redirect(`/learn/${slug}/module/${moduleId}/lesson/${targetLesson.id}`)
    }

    // If no lessons in module, go back to course
    redirect(`/learn/${slug}`)
}
