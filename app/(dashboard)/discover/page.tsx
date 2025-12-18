import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { DiscoverClient } from "./discover-client"

export default async function DiscoverPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get all published courses for discovery
    const courses = await prisma.course.findMany({
        where: {
            status: "published",
        },
        include: {
            instructor: true,
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

    // Get categories for filtering
    const categories = await prisma.course.findMany({
        where: {
            status: "published",
        },
        select: {
            category: true,
        },
        distinct: ["category"],
    })

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return (
        <DiscoverClient
            user={session.user}
            courses={courses}
            categories={categories.map(c => c.category)}
            onSignOut={handleSignOut}
        />
    )
}
