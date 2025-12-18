import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { HelpClient } from "./help-client"

export default async function HelpPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user) {
        redirect("/login")
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <HelpClient user={user} onSignOut={handleSignOut} />
}
