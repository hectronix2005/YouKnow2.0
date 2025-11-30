"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { es, en } from "@/lib/translations"

type Language = "es" | "en"
type Translations = typeof es

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("es")
    const [t, setTranslations] = useState<Translations>(es)

    useEffect(() => {
        // Check local storage or browser preference
        const savedLang = localStorage.getItem("language") as Language
        if (savedLang && (savedLang === "es" || savedLang === "en")) {
            setLanguage(savedLang)
        }
    }, [])

    useEffect(() => {
        setTranslations(language === "es" ? es : en)
        localStorage.setItem("language", language)
        document.documentElement.lang = language
    }, [language])

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
