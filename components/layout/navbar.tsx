"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, LogOut, GraduationCap, Globe, ShieldCheck, CheckSquare, Palette, Users, ChevronDown, RotateCcw, User, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isCreator, isLeader, isAdmin, getRoleInfo, getRoleLevel, Role, RoleInfo } from "@/lib/teacher"
import { useRoleSwitcher } from "@/components/providers/role-switcher-provider"

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

    // Try to use role switcher, fallback to user's actual role
    let activeRole = user?.role || ""
    let originalRole = user?.role || ""
    let isUsingDifferentRole = false
    let setActiveRole: ((role: string) => void) | null = null
    let resetToOriginal: (() => void) | null = null
    let availableRoles: string[] = []

    try {
        const roleSwitcher = useRoleSwitcher()
        activeRole = roleSwitcher.activeRole
        originalRole = roleSwitcher.originalRole
        isUsingDifferentRole = roleSwitcher.isUsingDifferentRole
        setActiveRole = roleSwitcher.setActiveRole
        resetToOriginal = roleSwitcher.resetToOriginal
        availableRoles = roleSwitcher.availableRoles
    } catch {
        // Role switcher not available, use defaults
        if (user) {
            const originalLevel = getRoleLevel(user.role)
            const roleOrder = [Role.EMPLOYEE, Role.CREADOR, Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN]
            availableRoles = roleOrder.filter(role => getRoleLevel(role) <= originalLevel)
        }
    }

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

    const activeRoleInfo = getRoleInfo(activeRole)
    const originalRoleInfo = getRoleInfo(originalRole)
    const userLevel = getRoleLevel(originalRole)

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "super_admin": return <ShieldAlert className="h-4 w-4" />
            case "admin": return <ShieldCheck className="h-4 w-4" />
            case "lider": return <Users className="h-4 w-4" />
            case "creador": return <Palette className="h-4 w-4" />
            default: return <User className="h-4 w-4" />
        }
    }

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
                            YouKnow
                        </span>
                    </Link>

                    {/* Navigation - based on ACTIVE role */}
                    {user && (
                        <div className="hidden md:flex md:items-center md:space-x-1">
                            {/* Level 1+: Dashboard */}
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

                            {/* Level 1+: Courses */}
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

                            {/* Level 1+: Checklist */}
                            <Link href="/checklist">
                                <Button
                                    variant={isActive("/checklist") ? "secondary" : "ghost"}
                                    size="sm"
                                    className={isActive("/checklist") ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300" : ""}
                                >
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    {t.nav.checklist}
                                </Button>
                            </Link>

                            {/* Level 2+: Creador - based on ACTIVE role */}
                            {isCreator(activeRole) && (
                                <Link href="/creador">
                                    <Button
                                        variant={isActive("/creador") ? "secondary" : "ghost"}
                                        size="sm"
                                        className={isActive("/creador") ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" : ""}
                                    >
                                        <Palette className="mr-2 h-4 w-4" />
                                        Creador
                                    </Button>
                                </Link>
                            )}

                            {/* Level 3+: Lider - based on ACTIVE role */}
                            {isLeader(activeRole) && (
                                <Link href="/lider">
                                    <Button
                                        variant={isActive("/lider") ? "secondary" : "ghost"}
                                        size="sm"
                                        className={isActive("/lider") ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" : ""}
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        {t.nav.lider}
                                    </Button>
                                </Link>
                            )}

                            {/* Level 4+: Admin - based on ACTIVE role */}
                            {isAdmin(activeRole) && (
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
                                    {t.common.spanish}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
                                    {t.common.english}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {user ? (
                            <>
                                <div className="hidden md:flex md:items-center md:gap-2">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{user.name}</p>

                                        {/* Role Switcher Dropdown - only if user has level 2+ */}
                                        {userLevel >= 2 && setActiveRole ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center justify-end gap-1 hover:opacity-80 transition-opacity cursor-pointer">
                                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${activeRoleInfo.bgColor} ${activeRoleInfo.color}`}>
                                                            Nv.{activeRoleInfo.level}
                                                        </span>
                                                        <span className={`text-xs ${activeRoleInfo.color}`}>
                                                            {activeRoleInfo.label}
                                                        </span>
                                                        <ChevronDown className="h-3 w-3 text-gray-400" />
                                                        {isUsingDifferentRole && (
                                                            <span className="text-xs text-amber-500 font-medium">(vista)</span>
                                                        )}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-64">
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b mb-1">
                                                        Cambiar vista de rol
                                                    </div>
                                                    {availableRoles.map((role) => {
                                                        const info = RoleInfo[role]
                                                        const isCurrentActive = activeRole === role
                                                        const isOriginal = originalRole === role

                                                        return (
                                                            <DropdownMenuItem
                                                                key={role}
                                                                onClick={() => setActiveRole(role)}
                                                                className={`flex items-center gap-2 cursor-pointer ${isCurrentActive ? 'bg-accent' : ''}`}
                                                            >
                                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${info.bgColor} ${info.color}`}>
                                                                    {info.level}
                                                                </span>
                                                                <span className={info.color}>
                                                                    {getRoleIcon(role)}
                                                                </span>
                                                                <div className="flex flex-col flex-1">
                                                                    <span className={`text-sm ${info.color}`}>
                                                                        {info.label}
                                                                        {isOriginal && <span className="text-gray-400 ml-1">(tu rol)</span>}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">{info.description}</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        )
                                                    })}
                                                    {isUsingDifferentRole && resetToOriginal && (
                                                        <>
                                                            <div className="border-t my-1" />
                                                            <DropdownMenuItem
                                                                onClick={resetToOriginal}
                                                                className="flex items-center gap-2 text-amber-600 cursor-pointer"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                                <span>Volver a mi rol original</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${activeRoleInfo.bgColor} ${activeRoleInfo.color}`}>
                                                    Nv.{activeRoleInfo.level}
                                                </span>
                                                <span className={`text-xs ${activeRoleInfo.color}`}>
                                                    {activeRoleInfo.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>
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
