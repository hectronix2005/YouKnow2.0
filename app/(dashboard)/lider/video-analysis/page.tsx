import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { VideoAnalysisClient } from "./video-analysis-client"

export default async function VideoAnalysisPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user) {
        redirect('/login')
    }

    if (user.role !== 'lider') {
        redirect('/dashboard')
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <VideoAnalysisClient user={user} onSignOut={handleSignOut} />
}
