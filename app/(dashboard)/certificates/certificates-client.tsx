"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import Link from "next/link"
import { Award, BookOpen, ArrowLeft, ArrowRight, GraduationCap, Trophy, Download } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

interface CertificatesClientProps {
    user: any
    completedEnrollments: any[]
    inProgressEnrollments: any[]
    onSignOut: () => void
}

export function CertificatesClient({
    user,
    completedEnrollments,
    inProgressEnrollments,
    onSignOut
}: CertificatesClientProps) {
    const { language } = useLanguage()

    const colors = ["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f", "#00cec8"]

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#0e0e0e]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Back Button + Header */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {language === "es" ? "Volver al Dashboard" : "Back to Dashboard"}
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {language === "es" ? "Mis Certificados" : "My Certificates"}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {language === "es"
                                        ? `${completedEnrollments.length} certificado${completedEnrollments.length !== 1 ? 's' : ''} obtenido${completedEnrollments.length !== 1 ? 's' : ''}`
                                        : `${completedEnrollments.length} certificate${completedEnrollments.length !== 1 ? 's' : ''} earned`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Certificates Grid */}
                    {completedEnrollments.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            {completedEnrollments.map((enrollment, index) => {
                                const color = colors[index % colors.length]
                                return (
                                    <Link
                                        key={enrollment.id}
                                        href={`/certificates/${enrollment.id}`}
                                        className="group"
                                    >
                                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-amber-500/30">
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${color}20` }}
                                                >
                                                    <GraduationCap className="h-6 w-6" style={{ color }} />
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-full">
                                                    <Trophy className="h-3 w-3" />
                                                    {language === "es" ? "Completado" : "Completed"}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                {enrollment.course.title}
                                            </h3>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                {language === "es" ? "Por:" : "By:"} {enrollment.course.instructor.name}
                                            </p>

                                            {enrollment.completedAt && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                                                    {language === "es" ? "Completado el" : "Completed on"}{" "}
                                                    {new Date(enrollment.completedAt).toLocaleDateString(
                                                        language === "es" ? "es-ES" : "en-US",
                                                        { year: "numeric", month: "long", day: "numeric" }
                                                    )}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                    {language === "es" ? "Ver Certificado" : "View Certificate"}
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                                <Download className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-12 text-center mb-8 shadow-sm">
                            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                <Award className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {language === "es" ? "Aun no tienes certificados" : "No certificates yet"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                                {language === "es"
                                    ? "Completa cursos al 100% para obtener certificados que validen tus conocimientos"
                                    : "Complete courses to 100% to earn certificates that validate your knowledge"
                                }
                            </p>
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <BookOpen className="h-5 w-5" />
                                {language === "es" ? "Explorar Cursos" : "Explore Courses"}
                            </Link>
                        </div>
                    )}

                    {/* In Progress Section */}
                    {inProgressEnrollments.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                {language === "es" ? "Cursos en Progreso" : "Courses in Progress"}
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inProgressEnrollments.map((enrollment, index) => {
                                    const color = colors[index % colors.length]
                                    return (
                                        <Link
                                            key={enrollment.id}
                                            href={`/learn/${enrollment.course.slug}`}
                                            className="group"
                                        >
                                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div
                                                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        <span className="text-lg font-bold text-white">
                                                            {enrollment.course.title.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {enrollment.course.title}
                                                    </h3>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm text-gray-500 mb-1.5">
                                                        <span>{language === "es" ? "Progreso" : "Progress"}</span>
                                                        <span className="font-medium">{Math.round(enrollment.progressPercent)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${enrollment.progressPercent}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 font-medium flex items-center gap-1">
                                                    {language === "es" ? "Continuar aprendiendo" : "Continue learning"}
                                                    <ArrowRight className="h-3 w-3" />
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
