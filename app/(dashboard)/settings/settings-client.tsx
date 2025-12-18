"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import {
    User,
    Bell,
    Globe,
    Shield,
    Palette,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Check,
    ChevronRight,
    Sun,
    Moon,
    Monitor
} from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

type Theme = "light" | "dark" | "system"

interface SettingsClientProps {
    user: any
    onSignOut: () => void
}

export function SettingsClient({ user, onSignOut }: SettingsClientProps) {
    const { t, language, setLanguage } = useLanguage()
    const [activeTab, setActiveTab] = useState("profile")
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        updates: false,
    })
    const [theme, setTheme] = useState<Theme>("system")

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null
        if (savedTheme) {
            setTheme(savedTheme)
        }
    }, [])

    // Apply theme changes
    useEffect(() => {
        const html = document.documentElement

        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                html.classList.add("dark")
                html.style.colorScheme = "dark"
            } else {
                html.classList.remove("dark")
                html.style.colorScheme = "light"
            }
        }

        if (theme === "dark") {
            applyTheme(true)
            localStorage.setItem("theme", "dark")
        } else if (theme === "light") {
            applyTheme(false)
            localStorage.setItem("theme", "light")
        } else {
            // System preference
            localStorage.setItem("theme", "system")
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            applyTheme(systemPrefersDark)

            // Listen for system theme changes
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
            const handleChange = (e: MediaQueryListEvent) => {
                if (theme === "system") {
                    applyTheme(e.matches)
                }
            }
            mediaQuery.addEventListener("change", handleChange)
            return () => mediaQuery.removeEventListener("change", handleChange)
        }
    }, [theme])

    const tabs = [
        { id: "profile", label: t.settings.profile, icon: User },
        { id: "notifications", label: t.settings.notifications, icon: Bell },
        { id: "language", label: t.settings.language, icon: Globe },
        { id: "privacy", label: t.settings.privacy, icon: Shield },
        { id: "appearance", label: t.settings.appearance, icon: Palette },
    ]

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#121212]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {t.settings.title}
                        </h1>
                        <p className="text-gray-500">
                            {t.settings.subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm overflow-hidden">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? "bg-[#46178f] text-white"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{tab.label}</span>
                                            <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm p-6">
                                {/* Profile Tab */}
                                {activeTab === "profile" && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                            {t.settings.profileInfo}
                                        </h2>
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#46178f] to-[#1368ce] flex items-center justify-center">
                                                <span className="text-3xl font-bold text-white">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h3>
                                                <p className="text-gray-500">{user.email}</p>
                                                <button className="mt-2 text-sm font-medium text-[#46178f] hover:underline">
                                                    {t.settings.changePhoto}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {t.settings.fullName}
                                                </label>
                                                <input
                                                    type="text"
                                                    defaultValue={user.name}
                                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#46178f]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {t.settings.email}
                                                </label>
                                                <input
                                                    type="email"
                                                    defaultValue={user.email}
                                                    className="w-full h-11 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#46178f]"
                                                />
                                            </div>
                                            <button className="mt-4 px-6 py-2.5 rounded-full bg-[#46178f] text-white font-bold hover:bg-[#5a1eb5] transition-colors">
                                                {t.settings.saveChanges}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === "notifications" && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                            {t.settings.notifications}
                                        </h2>
                                        <div className="space-y-4">
                                            {[
                                                { key: "email", label: t.settings.emailNotifications, desc: t.settings.emailNotificationsDesc },
                                                { key: "push", label: t.settings.pushNotifications, desc: t.settings.pushNotificationsDesc },
                                                { key: "updates", label: t.settings.updates, desc: t.settings.updatesDesc },
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                                            notifications[item.key as keyof typeof notifications] ? "bg-[#26890c]" : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                                                notifications[item.key as keyof typeof notifications] ? "translate-x-7" : "translate-x-1"
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Language Tab */}
                                {activeTab === "language" && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                            {t.settings.language}
                                        </h2>
                                        <div className="space-y-3">
                                            {[
                                                { code: "es", label: t.common.spanish, flag: "🇪🇸", desc: "Spanish" },
                                                { code: "en", label: t.common.english, flag: "🇺🇸", desc: "English" },
                                            ].map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLanguage(lang.code as "es" | "en")
                                                    }}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                                                        language === lang.code
                                                            ? "border-[#46178f] bg-[#46178f]/5"
                                                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <div className="text-left">
                                                        <span className="font-medium text-gray-900 dark:text-white block">{lang.label}</span>
                                                        <span className="text-xs text-gray-500">{lang.desc}</span>
                                                    </div>
                                                    {language === lang.code && (
                                                        <Check className="h-5 w-5 text-[#46178f] ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-6 p-4 rounded-lg bg-[#46178f]/5 border border-[#46178f]/20">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t.settings.languageDesc}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t.settings.currentLanguage}: {language === "es" ? t.common.spanish : t.common.english}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Privacy Tab */}
                                {activeTab === "privacy" && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                            {t.settings.privacySecurity}
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Lock className="h-5 w-5 text-[#46178f]" />
                                                    <p className="font-medium text-gray-900 dark:text-white">{t.settings.changePassword}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{t.settings.changePasswordDesc}</p>
                                                <button className="text-sm font-medium text-[#46178f] hover:underline">
                                                    {t.settings.changePassword}
                                                </button>
                                            </div>
                                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Shield className="h-5 w-5 text-[#26890c]" />
                                                    <p className="font-medium text-gray-900 dark:text-white">{t.settings.twoFactor}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{t.settings.twoFactorDesc}</p>
                                                <button className="text-sm font-medium text-[#46178f] hover:underline">
                                                    {t.settings.configure2FA}
                                                </button>
                                            </div>
                                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                <p className="font-medium text-red-600 dark:text-red-400 mb-2">{t.settings.dangerZone}</p>
                                                <p className="text-sm text-red-500 mb-3">{t.settings.deleteAccountDesc}</p>
                                                <button className="text-sm font-medium text-red-600 hover:underline">
                                                    {t.settings.deleteAccount}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Appearance Tab */}
                                {activeTab === "appearance" && (
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                                            {t.settings.appearance}
                                        </h2>
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500 mb-4">{t.settings.selectTheme}</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { id: "light" as Theme, label: t.settings.light, icon: Sun, bg: "bg-amber-50", iconColor: "text-amber-500" },
                                                    { id: "dark" as Theme, label: t.settings.dark, icon: Moon, bg: "bg-indigo-950", iconColor: "text-indigo-300" },
                                                    { id: "system" as Theme, label: t.settings.system, icon: Monitor, bg: "bg-gradient-to-r from-amber-50 to-indigo-950", iconColor: "text-gray-500" },
                                                ].map((themeOption) => {
                                                    const Icon = themeOption.icon
                                                    const isSelected = theme === themeOption.id
                                                    return (
                                                        <button
                                                            key={themeOption.id}
                                                            onClick={() => setTheme(themeOption.id)}
                                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                                isSelected
                                                                    ? "border-[#46178f] ring-2 ring-[#46178f]/20"
                                                                    : "border-gray-200 dark:border-gray-700 hover:border-[#46178f]/50"
                                                            }`}
                                                        >
                                                            <div className={`h-16 rounded-lg ${themeOption.bg} mb-3 flex items-center justify-center`}>
                                                                <Icon className={`h-8 w-8 ${themeOption.iconColor}`} />
                                                            </div>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{themeOption.label}</p>
                                                                {isSelected && (
                                                                    <Check className="h-4 w-4 text-[#46178f]" />
                                                                )}
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-4">
                                                {theme === "system"
                                                    ? t.settings.themeSystem
                                                    : theme === "dark"
                                                    ? t.settings.themeDark
                                                    : t.settings.themeLight
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
