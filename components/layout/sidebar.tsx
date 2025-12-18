"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    Search,
    BookOpen,
    FolderOpen,
    BarChart3,
    Settings,
    Plus,
    Users,
    Award,
    CheckSquare,
    Palette,
    ShieldCheck,
    HelpCircle,
    LogOut
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { isCreator, isLeader, isAdmin } from "@/lib/teacher"

interface SidebarProps {
    user: {
        name: string
        email: string
        role: string
    }
    onSignOut?: () => void
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
    const pathname = usePathname()
    const { t } = useLanguage()

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/")

    const mainNavItems = [
        { href: "/dashboard", icon: Home, label: t.sidebar.home, color: "group-hover:text-white" },
        { href: "/discover", icon: Search, label: t.sidebar.discover, color: "group-hover:text-white" },
        { href: "/courses", icon: FolderOpen, label: t.sidebar.library, color: "group-hover:text-white" },
        { href: "/reports", icon: BarChart3, label: t.sidebar.reports, color: "group-hover:text-white" },
    ]

    const secondaryNavItems = [
        { href: "/checklist", icon: CheckSquare, label: t.sidebar.tasks, show: true },
        { href: "/certificates", icon: Award, label: t.sidebar.certificates, show: true },
        { href: "/creador", icon: Palette, label: t.sidebar.creator, show: isCreator(user.role) },
        { href: "/lider", icon: Users, label: t.sidebar.leader, show: isLeader(user.role) },
        { href: "/admin/users", icon: ShieldCheck, label: t.sidebar.admin, show: isAdmin(user.role) },
    ]

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-[72px] bg-[#46178f] flex flex-col items-center py-4 shadow-xl">
            {/* Logo */}
            <Link href="/dashboard" className="mb-6">
                <div className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                    <span className="text-2xl font-black text-white">Y</span>
                </div>
            </Link>

            {/* Create Button - Solo para creadores o superior */}
            {isCreator(user.role) && (
                <Link href="/creador/create" className="mb-6">
                    <button className="h-12 w-12 rounded-xl bg-[#26890c] hover:bg-[#2ea00f] flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-[0_4px_14px_rgba(38,137,12,0.5)] hover:scale-105">
                        <Plus className="h-6 w-6 text-white" strokeWidth={3} />
                    </button>
                </Link>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
                {mainNavItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link key={item.href} href={item.href} className="w-full group">
                            <div
                                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-200 ${
                                    active
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <Icon className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-medium truncate">{item.label}</span>
                            </div>
                        </Link>
                    )
                })}

                {/* Separator */}
                <div className="w-10 h-px bg-white/20 my-3" />

                {/* Secondary Navigation */}
                {secondaryNavItems.filter(item => item.show).map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link key={item.href} href={item.href} className="w-full group">
                            <div
                                className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-200 ${
                                    active
                                        ? "bg-white/20 text-white"
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <Icon className="h-5 w-5 mb-1" />
                                <span className="text-[10px] font-medium truncate">{item.label}</span>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col items-center gap-1 w-full px-2 mt-auto">
                <Link href="/settings" className="w-full group">
                    <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200">
                        <Settings className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-medium">{t.sidebar.settings}</span>
                    </div>
                </Link>

                <Link href="/help" className="w-full group">
                    <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200">
                        <HelpCircle className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-medium">{t.sidebar.help}</span>
                    </div>
                </Link>

                {onSignOut && (
                    <button onClick={onSignOut} className="w-full group">
                        <div className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
                            <LogOut className="h-5 w-5 mb-1" />
                            <span className="text-[10px] font-medium">{t.sidebar.logout}</span>
                        </div>
                    </button>
                )}
            </div>
        </aside>
    )
}
