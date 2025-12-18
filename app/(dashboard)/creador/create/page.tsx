import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { isCreator } from "@/lib/teacher"
import { CreateCourseClient } from "./create-client"

export default async function CreateCoursePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    if (!isCreator(session.user.role)) {
        redirect("/dashboard")
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

    return <CreateCourseClient user={user} onSignOut={handleSignOut} />
}
