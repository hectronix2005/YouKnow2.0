import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, BookOpen, ArrowRight, GraduationCap } from "lucide-react"

export default async function CertificatesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Get all completed enrollments for the user
    const completedEnrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id,
            progressPercent: 100,
            status: "completed"
        },
        include: {
            course: {
                include: {
                    instructor: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            completedAt: "desc"
        }
    })

    // Get in-progress enrollments
    const inProgressEnrollments = await prisma.enrollment.findMany({
        where: {
            userId: session.user.id,
            progressPercent: {
                lt: 100
            }
        },
        include: {
            course: true
        },
        orderBy: {
            progressPercent: "desc"
        },
        take: 3
    })

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Mis Certificados
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Certificados obtenidos al completar cursos
                    </p>
                </div>
            </div>

            {completedEnrollments.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {completedEnrollments.map((enrollment) => (
                        <Link
                            key={enrollment.id}
                            href={`/certificates/${enrollment.id}`}
                        >
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-amber-500/50 h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                                            <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                                            <Award className="h-3 w-3" />
                                            Completado
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg mt-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                        {enrollment.course.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Por: {enrollment.course.instructor.name}
                                    </p>
                                    {enrollment.completedAt && (
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            Completado el {new Date(enrollment.completedAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium group-hover:gap-2 transition-all">
                                        Ver Certificado
                                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="mb-12 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Award className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Aun no tienes certificados
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                            Completa cursos para obtener certificados que validen tus conocimientos
                        </p>
                        <Link href="/courses">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Explorar Cursos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* In Progress Section */}
            {inProgressEnrollments.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Cursos en Progreso
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inProgressEnrollments.map((enrollment) => (
                            <Link
                                key={enrollment.id}
                                href={`/learn/${enrollment.course.slug}`}
                            >
                                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                                    <CardContent className="p-4">
                                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {enrollment.course.title}
                                        </h3>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                                                <span>Progreso</span>
                                                <span>{Math.round(enrollment.progressPercent)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${enrollment.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium">
                                            Continuar aprendiendo →
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
