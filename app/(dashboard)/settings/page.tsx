import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user) {
        redirect("/login")
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <SettingsClient user={user} onSignOut={handleSignOut} />
}
