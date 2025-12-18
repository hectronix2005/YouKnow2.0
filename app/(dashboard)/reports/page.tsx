import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { ReportsClient } from "./reports-client"

export default async function ReportsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get user with enrollments and progress
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

    return <ReportsClient user={user} onSignOut={handleSignOut} />
}
