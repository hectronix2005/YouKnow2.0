import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { CourseDetailClient } from "./course-detail-client"

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
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

    const enrollment = course.enrollments.length > 0 ? course.enrollments[0] : null
    const isEnrolled = enrollment !== null
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    const handleEnroll = async () => {
        "use server"
        await prisma.enrollment.create({
            data: {
                userId: session.user!.id,
                courseId: course.id,
                completedLessons: 0,
                progressPercent: 0,
            },
        })
        redirect(`/learn/${course.slug}`)
    }

    return (
        <CourseDetailClient
            user={session.user}
            course={course}
            enrollment={enrollment}
            isEnrolled={isEnrolled}
            totalLessons={totalLessons}
            onSignOut={handleSignOut}
            onEnroll={handleEnroll}
        />
    )
}
