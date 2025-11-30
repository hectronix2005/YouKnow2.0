import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { LearnClient } from "./learn-client"

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

    // Get all lessons in order
    const allLessons = course.modules.flatMap(module =>
        module.lessons.map(lesson => ({
            ...lesson,
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

    // Find current lesson
    // Priority: 1. URL param, 2. First incomplete, 3. First lesson
    let currentLesson = null
    if (lessonId && typeof lessonId === 'string') {
        currentLesson = allLessons.find(l => l.id === lessonId)
    }

    if (!currentLesson) {
        currentLesson = allLessons.find(l => !completedLessonIds.has(l.id)) || allLessons[0]
    }

    const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id)

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

            // Check if last active was yesterday (for streak)
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
                newStreak = 1 // Reset if missed a day (or first time)
            }
            // If isToday, keep same streak

            const newXP = user.xp + 10 // 10 XP per lesson
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
        // --------------------------

        redirect(`/learn/${slug}`)
    }

    return (
        <LearnClient
            user={session.user}
            course={course}
            enrollment={enrollment}
            currentLesson={currentLesson}
            currentLessonIndex={currentLessonIndex}
            allLessons={allLessons}
            completedLessonIds={completedLessonIds}
            onSignOut={handleSignOut}
            onMarkComplete={handleMarkComplete}
        />
    )
}
