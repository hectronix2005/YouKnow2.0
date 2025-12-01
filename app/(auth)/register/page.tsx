"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { GraduationCap, Loader2, ArrowLeft, Check } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

export default function RegisterPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("employee")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError(t.common.error)
            return
        }

        if (password.length < 6) {
            setError(t.common.error)
            return
        }

        setLoading(true)

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || t.common.error)
            } else {
                router.push("/login?registered=true")
            }
        } catch (error) {
            setError(t.common.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" />
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
                        {t.auth.createAccount}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t.auth.registerSubtitle}
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
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.auth.fullName}
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="h-11"
                                />
                            </div>

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
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.auth.password}
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t.auth.confirmPassword}
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t.auth.roleSelection}
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`cursor-pointer rounded-lg border p-4 transition-all ${role === "employee"
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500"
                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                                            }`}
                                        onClick={() => setRole("employee")}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{t.auth.employeeRole.split(" ")[0]}</span>
                                            {role === "employee" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Employee</p>
                                    </div>

                                    <div
                                        className={`cursor-pointer rounded-lg border p-4 transition-all ${role === "lider"
                                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500"
                                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                                            }`}
                                        onClick={() => setRole("lider")}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{t.auth.liderRole.split(" ")[0]}</span>
                                            {role === "lider" && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Líder</p>
                                    </div>
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
                                    t.auth.register
                                )}
                            </Button>

                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {t.auth.haveAccount}{" "}
                                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-all">
                                    {t.auth.login}
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
