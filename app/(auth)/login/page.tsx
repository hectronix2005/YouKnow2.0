"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

export default function LoginPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

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
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4 pt-6">
                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center animate-in fade-in slide-in-from-top-2">
                                    <span className="mr-2">⚠️</span>
                                    {error}
                                </div>
                            )}

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

                            {/* Demo credentials hint */}
                            <div className="rounded-lg bg-indigo-50 p-4 text-xs dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                                <p className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">{t.auth.demoCredentials}</p>
                                <div className="space-y-1 text-indigo-700 dark:text-indigo-400 font-mono">
                                    <p>Employee: employee@learnflow.ai / employee123</p>
                                    <p>Líder: lider@learnflow.ai / lider123</p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col space-y-4 pb-6">
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

                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {t.auth.noAccount}{" "}
                                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-all">
                                    {t.auth.register}
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
