import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { LessonClient } from "./lesson-client"

export default async function LessonPage({
    params,
}: {
    params: Promise<{ slug: string; moduleId: string; lessonId: string }>
}) {
    const { slug, moduleId, lessonId } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const course = await prisma.course.findUnique({
        where: { slug },
        include: {
            instructor: true,
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

    // Verify module exists
    const currentModule = course.modules.find(m => m.id === moduleId)
    if (!currentModule) {
        notFound()
    }

    // Verify lesson exists in this module
    const currentLesson = currentModule.lessons.find(l => l.id === lessonId)
    if (!currentLesson) {
        notFound()
    }

    // Get all lessons in order with module info
    const allLessons = course.modules.flatMap((module, moduleIndex) =>
        module.lessons.map(lesson => ({
            ...lesson,
            moduleId: module.id,
            moduleTitle: module.title,
            moduleIndex: moduleIndex + 1,
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

    const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId)

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    const handleMarkComplete = async (lessonId: string) => {
        "use server"

        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user!.id,
                    lessonId,
                },
            },
            update: {
                isCompleted: true,
                completedAt: new Date(),
            },
            create: {
                userId: session.user!.id,
                lessonId,
                isCompleted: true,
                completedAt: new Date(),
            },
        })

        // Update enrollment progress
        const completed = completedLessonIds.size + 1
        const progressPercent = Math.round((completed / allLessons.length) * 100)

        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
                completedLessons: completed,
                progressPercent,
                lastAccessedAt: new Date(),
            },
        })

        // --- GAMIFICATION LOGIC ---
        const user = await prisma.user.findUnique({
            where: { id: session.user!.id },
            select: { xp: true, streak: true, lastActiveAt: true }
        })

        if (user) {
            const now = new Date()
            const lastActive = new Date(user.lastActiveAt)

            const isYesterday = (date: Date) => {
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                return date.getDate() === yesterday.getDate() &&
                    date.getMonth() === yesterday.getMonth() &&
                    date.getFullYear() === yesterday.getFullYear()
            }

            const isToday = (date: Date) => {
                const today = new Date()
                return date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
            }

            let newStreak = user.streak
            if (isYesterday(lastActive)) {
                newStreak += 1
            } else if (!isToday(lastActive)) {
                newStreak = 1
            }

            const newXP = user.xp + 10
            const newLevel = Math.floor(newXP / 100) + 1

            await prisma.user.update({
                where: { id: session.user!.id },
                data: {
                    xp: newXP,
                    level: newLevel,
                    streak: newStreak,
                    lastActiveAt: now
                }
            })
        }

        // Navigate to next lesson or stay on current
        const nextLesson = allLessons[currentLessonIndex + 1]
        if (nextLesson) {
            redirect(`/learn/${slug}/module/${nextLesson.moduleId}/lesson/${nextLesson.id}`)
        } else {
            redirect(`/learn/${slug}/module/${moduleId}/lesson/${lessonId}`)
        }
    }

    return (
        <LessonClient
            user={session.user}
            course={course}
            enrollment={enrollment}
            currentModule={currentModule}
            currentLesson={{ ...currentLesson, moduleTitle: currentModule.title }}
            currentLessonIndex={currentLessonIndex}
            allLessons={allLessons}
            completedLessonIds={completedLessonIds}
            onSignOut={handleSignOut}
            onMarkComplete={handleMarkComplete}
        />
    )
}
