"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, User, LogOut, GraduationCap, Globe, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isTeacher, isAdmin } from "@/lib/teacher"

interface NavbarProps {
    user?: {
        name: string
        email: string
        role: string
    }
    onSignOut?: () => void
}

export function Navbar({ user, onSignOut }: NavbarProps) {
    const pathname = usePathname()
    const { t, language, setLanguage } = useLanguage()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-75 blur transition duration-200 group-hover:opacity-100" />
                            <GraduationCap className="relative h-8 w-8 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            LearnFlow AI
                        </span>
                    </Link>

                    {/* Navigation */}
                    {user && (
                        <div className="hidden md:flex md:items-center md:space-x-1">
                            <Link href="/dashboard">
                                <Button
                                    variant={isActive("/dashboard") ? "secondary" : "ghost"}
                                    size="sm"
                                    className={isActive("/dashboard") ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : ""}
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    {t.nav.dashboard}
                                </Button>
                            </Link>

                            <Link href="/courses">
                                <Button
                                    variant={isActive("/courses") ? "secondary" : "ghost"}
                                    size="sm"
                                    className={isActive("/courses") ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : ""}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    {t.nav.courses}
                                </Button>
                            </Link>

                            {isTeacher(user.role) && (
                                <Link href="/instructor">
                                    <Button
                                        variant={isActive("/instructor") ? "secondary" : "ghost"}
                                        size="sm"
                                        className={isActive("/instructor") ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : ""}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        {t.nav.instructor}
                                    </Button>
                                </Link>
                            )}

                            {isAdmin(user.role) && (
                                <Link href="/admin/users">
                                    <Button
                                        variant={isActive("/admin") ? "secondary" : "ghost"}
                                        size="sm"
                                        className={isActive("/admin") ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : ""}
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Language Switcher */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 px-0">
                                    <Globe className="h-4 w-4" />
                                    <span className="sr-only">{t.common.language}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLanguage("es")} className={language === "es" ? "bg-accent" : ""}>
                                    🇪🇸 {t.common.spanish}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
                                    🇺🇸 {t.common.english}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {user ? (
                            <>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onSignOut}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">{t.auth.logout}</span>
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        {t.auth.login}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary" size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200">
                                        {t.auth.register}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
