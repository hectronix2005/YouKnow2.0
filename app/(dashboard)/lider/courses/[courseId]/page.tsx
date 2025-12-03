import { redirect } from "next/navigation"

// Lider module merged with Creador - redirect to Creador
export default async function LiderCourseEditPage({
    params,
}: {
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params
    redirect(`/creador/courses/${courseId}`)
}
