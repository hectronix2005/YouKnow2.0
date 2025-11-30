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

    // Get all published courses
    const courses = await prisma.course.findMany({
        where: {
            status: "published",
        },
        include: {
            instructor: true,
        },
        orderBy: {
            publishedAt: "desc",
        },
    })

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <CoursesClient user={session.user} courses={courses} onSignOut={handleSignOut} />
}
