import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CourseEditor } from "./course-editor"

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

    return <CourseEditor course={course} />
}
