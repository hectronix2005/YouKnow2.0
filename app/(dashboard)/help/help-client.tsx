"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import Link from "next/link"
import {
    HelpCircle,
    ArrowLeft,
    BookOpen,
    MessageCircle,
    Mail,
    FileText,
    Video,
    Award,
    Target,
    Zap,
    ChevronRight,
    ExternalLink
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { useState } from "react"

interface HelpClientProps {
    user: any
    onSignOut: () => void
}

export function HelpClient({ user, onSignOut }: HelpClientProps) {
    const { language } = useLanguage()
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

    const faqs = [
        {
            question: language === "es" ? "¿Cómo empiezo un curso?" : "How do I start a course?",
            answer: language === "es"
                ? "Ve a la sección 'Descubrir' para explorar cursos disponibles. Haz clic en cualquier curso y presiona 'Inscribirse' para comenzar a aprender."
                : "Go to the 'Discover' section to explore available courses. Click on any course and press 'Enroll' to start learning."
        },
        {
            question: language === "es" ? "¿Cómo obtengo un certificado?" : "How do I get a certificate?",
            answer: language === "es"
                ? "Completa todas las lecciones de un curso al 100%. Una vez completado, tu certificado estará disponible en la sección 'Certificados'."
                : "Complete all lessons of a course to 100%. Once completed, your certificate will be available in the 'Certificates' section."
        },
        {
            question: language === "es" ? "¿Qué son los XP y las rachas?" : "What are XP and streaks?",
            answer: language === "es"
                ? "XP (puntos de experiencia) se ganan al completar lecciones y cursos. Las rachas miden tus días consecutivos de aprendizaje. ¡Mantén tu racha para ganar más XP!"
                : "XP (experience points) are earned by completing lessons and courses. Streaks measure your consecutive days of learning. Keep your streak to earn more XP!"
        },
        {
            question: language === "es" ? "¿Cómo funciona el checklist de tareas?" : "How does the task checklist work?",
            answer: language === "es"
                ? "El checklist te ayuda a organizar tus tareas de aprendizaje. Los líderes pueden asignar tareas a su equipo y hacer seguimiento del progreso."
                : "The checklist helps you organize your learning tasks. Leaders can assign tasks to their team and track progress."
        },
        {
            question: language === "es" ? "¿Puedo crear mis propios cursos?" : "Can I create my own courses?",
            answer: language === "es"
                ? "Sí, si tienes rol de 'Creador' o superior. Accede al panel de Creador desde el menú lateral para empezar a crear contenido."
                : "Yes, if you have a 'Creator' role or higher. Access the Creator panel from the sidebar menu to start creating content."
        }
    ]

    const quickLinks = [
        {
            icon: BookOpen,
            title: language === "es" ? "Explorar Cursos" : "Explore Courses",
            description: language === "es" ? "Descubre nuevos cursos" : "Discover new courses",
            href: "/discover",
            color: "#1368ce"
        },
        {
            icon: Target,
            title: language === "es" ? "Mi Biblioteca" : "My Library",
            description: language === "es" ? "Cursos en los que estás inscrito" : "Courses you're enrolled in",
            href: "/courses",
            color: "#26890c"
        },
        {
            icon: Award,
            title: language === "es" ? "Certificados" : "Certificates",
            description: language === "es" ? "Ver tus logros" : "View your achievements",
            href: "/certificates",
            color: "#d89e00"
        },
        {
            icon: Zap,
            title: language === "es" ? "Reportes" : "Reports",
            description: language === "es" ? "Tu progreso de aprendizaje" : "Your learning progress",
            href: "/reports",
            color: "#46178f"
        }
    ]

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
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <HelpCircle className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {language === "es" ? "Centro de Ayuda" : "Help Center"}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {language === "es" ? "¿En qué podemos ayudarte?" : "How can we help you?"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {quickLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link key={link.href} href={link.href} className="group">
                                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                                        <div
                                            className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                                            style={{ backgroundColor: `${link.color}15` }}
                                        >
                                            <Icon className="h-5 w-5" style={{ color: link.color }} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-[#46178f] transition-colors">
                                            {link.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {link.description}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm mb-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#46178f]" />
                            {language === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
                        </h2>
                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {faq.question}
                                        </span>
                                        <ChevronRight
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                                                expandedFaq === index ? "rotate-90" : ""
                                            }`}
                                        />
                                    </button>
                                    {expandedFaq === index && (
                                        <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-[#1368ce]/10 flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-[#1368ce]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {language === "es" ? "Soporte por Email" : "Email Support"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {language === "es" ? "Respuesta en 24 horas" : "Response within 24 hours"}
                                    </p>
                                </div>
                            </div>
                            <a
                                href="mailto:soporte@learnflow.ai"
                                className="inline-flex items-center gap-2 text-[#1368ce] hover:underline font-medium"
                            >
                                soporte@learnflow.ai
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-[#26890c]/10 flex items-center justify-center">
                                    <Video className="h-6 w-6 text-[#26890c]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">
                                        {language === "es" ? "Tutoriales en Video" : "Video Tutorials"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {language === "es" ? "Aprende a usar la plataforma" : "Learn to use the platform"}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-2 text-gray-400 font-medium">
                                {language === "es" ? "Próximamente" : "Coming soon"}
                            </span>
                        </div>
                    </div>

                    {/* Version Info */}
                    <div className="mt-8 text-center text-sm text-gray-400">
                        <p>LearnFlow AI v1.0.0</p>
                        <p className="mt-1">
                            {language === "es" ? "Hecho con" : "Made with"} ❤️ {language === "es" ? "por" : "by"} YouKnow Team
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}
