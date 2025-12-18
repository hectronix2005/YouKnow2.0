import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { signOut } from "@/lib/auth"
import { isCreator } from "@/lib/teacher"
import { CourseEditorClient } from "./course-editor-client"

export default async function EditCoursePage({
    params,
}: {
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params
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

    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { orderIndex: "asc" }
                    }
                },
                orderBy: { orderIndex: "asc" }
            }
        }
    })

    if (!course) {
        notFound()
    }

    if (course.instructorId !== session.user.id) {
        redirect("/creador")
    }

    const handleSignOut = async () => {
        "use server"
        await signOut()
    }

    return <CourseEditorClient user={user} course={course} onSignOut={handleSignOut} />
}
