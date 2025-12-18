import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { CertificatesClient } from "./certificates-client"

export default async function CertificatesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            enrollments: {
                include: {
                    course: {
                        include: {
                            instructor: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    completedAt: "desc"
                }
            }
        }
    })

    if (!user) {
        redirect("/login")
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    // Separate completed and in-progress enrollments
    const completedEnrollments = user.enrollments.filter(e => e.progressPercent >= 100)
    const inProgressEnrollments = user.enrollments.filter(e => e.progressPercent < 100).slice(0, 3)

    return (
        <CertificatesClient
            user={user}
            completedEnrollments={completedEnrollments}
            inProgressEnrollments={inProgressEnrollments}
            onSignOut={handleSignOut}
        />
    )
}
