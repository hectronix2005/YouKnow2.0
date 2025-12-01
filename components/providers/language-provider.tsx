"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import { es, en } from "@/lib/translations"

type Language = "es" | "en"
type Translations = typeof es

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
}

const TRANSLATIONS_MAP = { es, en } as const
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("es")

    // Load saved language on mount and set document lang
    useEffect(() => {
        const savedLang = localStorage.getItem("language")
        if (savedLang === "es" || savedLang === "en") {
            setLanguageState(savedLang)
            document.documentElement.lang = savedLang
        } else {
            document.documentElement.lang = "es"
        }
    }, [])

    // Memoized setLanguage to prevent unnecessary re-renders
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem("language", lang)
        document.documentElement.lang = lang
    }, [])

    // Memoize translations based on language
    const t = useMemo(() => TRANSLATIONS_MAP[language], [language])

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        language,
        setLanguage,
        t
    }), [language, setLanguage, t])

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
}
