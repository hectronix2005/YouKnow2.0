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
        <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-[#1a1a1a]/95 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo - Kahoot Style */}
                    <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#46178f] to-[#1368ce] opacity-90 blur-sm transition duration-200 group-hover:opacity-100 group-hover:blur" />
                            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-[#46178f] to-[#1368ce] flex items-center justify-center shadow-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#46178f] to-[#1368ce] dark:from-[#8b5cf6] dark:to-[#00cec8]">
                            YouKnow
                        </span>
                    </Link>

                    {/* Navigation - Kahoot Style Pills */}
                    {user && (
                        <div className="hidden md:flex md:items-center md:space-x-2">
                            {/* Level 1+: Dashboard */}
                            <Link href="/dashboard">
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                        isActive("/dashboard")
                                            ? "bg-[#46178f] text-white shadow-[0_4px_14px_rgba(70,23,143,0.4)]"
                                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <Home className="h-4 w-4" />
                                    {t.nav.dashboard}
                                </button>
                            </Link>

                            {/* Level 1+: Courses */}
                            <Link href="/courses">
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                        isActive("/courses")
                                            ? "bg-[#e21b3c] text-white shadow-[0_4px_14px_rgba(226,27,60,0.4)]"
                                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    {t.nav.courses}
                                </button>
                            </Link>

                            {/* Level 1+: Checklist */}
                            <Link href="/checklist">
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                        isActive("/checklist")
                                            ? "bg-[#d89e00] text-white shadow-[0_4px_14px_rgba(216,158,0,0.4)]"
                                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <CheckSquare className="h-4 w-4" />
                                    {t.nav.checklist}
                                </button>
                            </Link>

                            {/* Level 2+: Creador (uses /lider routes) - both creador and lider roles */}
                            {isCreator(activeRole) && (
                                <Link href="/creador">
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                            isActive("/creador")
                                                ? "bg-[#1368ce] text-white shadow-[0_4px_14px_rgba(19,104,206,0.4)]"
                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <Palette className="h-4 w-4" />
                                        Creador
                                    </button>
                                </Link>
                            )}

                            {/* Level 3+: Lider - based on ACTIVE role */}
                            {isLeader(activeRole) && (
                                <Link href="/lider">
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                            isActive("/lider")
                                                ? "bg-[#26890c] text-white shadow-[0_4px_14px_rgba(38,137,12,0.4)]"
                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <Users className="h-4 w-4" />
                                        {t.nav.lider}
                                    </button>
                                </Link>
                            )}

                            {/* Level 4+: Admin - based on ACTIVE role */}
                            {isAdmin(activeRole) && (
                                <Link href="/admin/users">
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                                            isActive("/admin")
                                                ? "bg-[#00cec8] text-white shadow-[0_4px_14px_rgba(0,206,200,0.4)]"
                                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        }`}
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Admin
                                    </button>
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
                                <button
                                    onClick={onSignOut}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-[#e21b3c] hover:bg-[#e21b3c] hover:text-white transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t.auth.logout}</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/login">
                                    <button className="px-5 py-2 rounded-full font-bold text-sm text-[#46178f] hover:bg-[#46178f]/10 transition-all duration-200">
                                        {t.auth.login}
                                    </button>
                                </Link>
                                <Link href="/register">
                                    <button className="px-5 py-2 rounded-full font-bold text-sm bg-gradient-to-r from-[#46178f] to-[#1368ce] text-white shadow-[0_4px_14px_rgba(70,23,143,0.4)] hover:shadow-[0_6px_20px_rgba(70,23,143,0.5)] hover:scale-105 transition-all duration-200">
                                        {t.auth.register}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
