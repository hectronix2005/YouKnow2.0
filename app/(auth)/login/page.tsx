"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, ArrowLeft, User, Users, Shield, Zap } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

// Demo users for quick access
const DEMO_USERS = [
    {
        id: "employee",
        name: "Carlos Méndez",
        role: "Empleado",
        roleEn: "Employee",
        email: "employee@learnflow.ai",
        password: "employee123",
        icon: User,
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        description: "Acceso básico a cursos y tareas",
        descriptionEn: "Basic access to courses and tasks"
    },
    {
        id: "lider",
        name: "Dr. Sarah Johnson",
        role: "Líder",
        roleEn: "Leader",
        email: "lider@learnflow.ai",
        password: "lider123",
        icon: Users,
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
        description: "Gestión de equipo y creación de cursos",
        descriptionEn: "Team management and course creation"
    }
]

export default function LoginPage() {
    const router = useRouter()
    const { t, language } = useLanguage()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [loadingUser, setLoadingUser] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                if (result.error === "CredentialsSignin") {
                    setError(t.auth.invalidCredentials)
                } else {
                    setError(t.auth.connectionError)
                }
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch {
            setError(t.auth.connectionError)
        } finally {
            setLoading(false)
        }
    }

    const handleQuickLogin = async (user: typeof DEMO_USERS[0]) => {
        setError("")
        setLoadingUser(user.id)

        try {
            const result = await signIn("credentials", {
                email: user.email,
                password: user.password,
                redirect: false,
            })

            if (result?.error) {
                setError(t.auth.invalidCredentials)
            } else {
                router.push("/dashboard")
                router.refresh()
            }
        } catch {
            setError(t.auth.connectionError)
        } finally {
            setLoadingUser(null)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t.common.back}
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t.auth.welcomeBack}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t.auth.loginSubtitle}
                    </p>
                </div>

                <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none dark:bg-gray-900">
                    <CardContent className="space-y-4 pt-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center animate-in fade-in slide-in-from-top-2">
                                <span className="mr-2">⚠️</span>
                                {error}
                            </div>
                        )}

                        {/* Quick Access Demo Users - FIRST */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {language === "es" ? "Acceso Rápido Demo" : "Quick Demo Access"}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                {DEMO_USERS.map((user) => {
                                    const Icon = user.icon
                                    const isLoading = loadingUser === user.id
                                    return (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleQuickLogin(user)}
                                            disabled={isLoading || loading || loadingUser !== null}
                                            className={`w-full p-3 rounded-xl border ${user.borderColor} ${user.bgColor}
                                                hover:scale-[1.02] hover:shadow-md transition-all duration-200
                                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                                text-left group`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${user.color}
                                                    flex items-center justify-center shadow-sm
                                                    group-hover:shadow-md transition-shadow`}>
                                                    {isLoading ? (
                                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                                    ) : (
                                                        <Icon className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                            {user.name}
                                                        </p>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                            bg-gradient-to-r ${user.color} text-white`}>
                                                            {language === "es" ? user.role : user.roleEn}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {language === "es" ? user.description : user.descriptionEn}
                                                    </p>
                                                </div>
                                                <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                                    {language === "es" ? "o ingresa manualmente" : "or enter manually"}
                                </span>
                            </div>
                        </div>

                        {/* Manual Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.auth.email}
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.auth.password}
                                    </label>
                                    <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                        {t.auth.forgotPassword}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t.common.loading}
                                    </>
                                ) : (
                                    t.auth.login
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
                            {t.auth.noAccount}{" "}
                            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-all">
                                {t.auth.register}
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
