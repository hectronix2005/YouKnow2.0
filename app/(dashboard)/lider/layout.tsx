import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isLeader } from "@/lib/teacher"

export default async function LiderLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Verify user has leader permissions (level 3+)
    if (!isLeader(session.user.role)) {
        redirect("/dashboard")
    }

    return <>{children}</>
}
