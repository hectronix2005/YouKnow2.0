"use client"

import { Search, Bell, Globe, ChevronDown, User, Settings, LogOut } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
    user: {
        name: string
        email: string
        role: string
    }
    title?: string
    onSignOut?: () => void
}

export function DashboardHeader({ user, title, onSignOut }: DashboardHeaderProps) {
    const { t, language, setLanguage } = useLanguage()

    return (
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 dark:bg-[#1a1a1a] dark:border-gray-800">
            <div className="h-full flex items-center justify-between px-6">
                {/* Left: Page Title or Search */}
                <div className="flex items-center gap-4">
                    {title && (
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Center: Search Bar */}
                <div className="flex-1 max-w-xl mx-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.common.search}
                            className="w-full h-11 pl-12 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#46178f] transition-all"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button className="relative h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-[#e21b3c] rounded-full border-2 border-white dark:border-[#1a1a1a]" />
                    </button>

                    {/* Language */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={() => setLanguage("es")}
                                className={`cursor-pointer ${language === "es" ? "bg-[#46178f]/10 text-[#46178f]" : ""}`}
                            >
                                {t.common.spanish}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setLanguage("en")}
                                className={`cursor-pointer ${language === "en" ? "bg-[#46178f]/10 text-[#46178f]" : ""}`}
                            >
                                {t.common.english}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#46178f] to-[#1368ce] flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                                    {user.name.split(' ')[0]}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <Link href="/settings">
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="h-4 w-4 mr-2" />
                                    {t.nav.profile}
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/settings">
                                <DropdownMenuItem className="cursor-pointer">
                                    <Settings className="h-4 w-4 mr-2" />
                                    {t.settings?.title || "Configuración"}
                                </DropdownMenuItem>
                            </Link>
                            {onSignOut && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={onSignOut}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        {t.nav.signOut}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
