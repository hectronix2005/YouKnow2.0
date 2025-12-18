import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { isCreator } from "@/lib/teacher"
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

    // Both creador and lider can access video analysis
    if (!isCreator(user.role)) {
        redirect('/dashboard')
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <VideoAnalysisClient user={user} onSignOut={handleSignOut} />
}
