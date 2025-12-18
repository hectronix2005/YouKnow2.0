import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isCreator } from "@/lib/teacher"

export default async function CreadorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Verify user has creator permissions (level 2+)
    if (!isCreator(session.user.role)) {
        redirect("/dashboard")
    }

    return <>{children}</>
}
