import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get user with stats
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    course: {
                        include: {
                            instructor: true,
                        },
                    },
                },
                orderBy: {
                    lastAccessedAt: "desc",
                },
            },
            achievements: true,
        },
    })

    if (!user) {
        redirect("/login")
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <DashboardClient user={user} onSignOut={handleSignOut} />
}
