import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { CoursesClient } from "./courses-client"

export default async function CoursesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get user with enrollments
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    course: {
                        include: {
                            instructor: true,
                            modules: {
                                include: {
                                    lessons: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    lastAccessedAt: "desc",
                },
            },
        },
    })

    if (!user) {
        redirect("/login")
    }

    // Get all published courses for discovery
    const allCourses = await prisma.course.findMany({
        where: {
            status: "published",
        },
        include: {
            instructor: true,
            modules: {
                include: {
                    lessons: true,
                },
            },
            _count: {
                select: {
                    enrollments: true,
                },
            },
        },
        orderBy: {
            publishedAt: "desc",
        },
    })

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <CoursesClient user={user} allCourses={allCourses} onSignOut={handleSignOut} />
}
