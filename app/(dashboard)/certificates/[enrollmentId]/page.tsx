import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CertificateClient } from "./certificate-client"

export default async function CertificatePage({
    params,
}: {
    params: Promise<{ enrollmentId: string }>
}) {
    const { enrollmentId } = await params
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            user: true,
            course: {
                include: {
                    instructor: true
                }
            }
        }
    })

    if (!enrollment) {
        notFound()
    }

    // Security check: only the owner can view their certificate
    if (enrollment.userId !== session.user.id) {
        redirect("/dashboard")
    }

    // Completion check
    if (enrollment.progressPercent < 100) {
        redirect(`/learn/${enrollment.course.slug}`)
    }

    return (
        <CertificateClient
            studentName={enrollment.user.name}
            courseTitle={enrollment.course.title}
            instructorName={enrollment.course.instructor.name}
            completionDate={new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
        />
    )
}
