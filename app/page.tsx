"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Sparkles, Trophy, Zap, ArrowRight, CheckCircle2, Play, Users, BookOpen } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { Navbar } from "@/components/layout/navbar"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f7] dark:bg-[#0e0e0e]">
      <Navbar />

      {/* Hero Section - Kahoot Style */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-[10%] w-72 h-72 bg-[#e21b3c]/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-[5%] w-96 h-96 bg-[#46178f]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-[20%] w-80 h-80 bg-[#1368ce]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-[15%] w-64 h-64 bg-[#26890c]/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-gradient-to-r from-[#46178f] to-[#1368ce] px-5 py-2 text-sm font-bold text-white mb-8 shadow-[0_4px_14px_rgba(70,23,143,0.4)]">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Plataforma de Aprendizaje con IA</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-6 dark:text-white">
            <span className="block">Aprende jugando con</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#46178f] via-[#1368ce] to-[#00cec8]">
              YouKnow
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <button className="w-full sm:w-auto text-lg px-10 py-4 rounded-full font-bold bg-[#46178f] text-white shadow-[0_6px_20px_rgba(70,23,143,0.4)] hover:shadow-[0_8px_30px_rgba(70,23,143,0.5)] hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
                {t.home.getStarted}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/courses">
              <button className="w-full sm:w-auto text-lg px-10 py-4 rounded-full font-bold border-2 border-[#46178f] text-[#46178f] hover:bg-[#46178f] hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
                <Play className="h-5 w-5" />
                {t.home.learnMore}
              </button>
            </Link>
          </div>

          {/* Stats / Trust indicators - Kahoot style colorful cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-[#e21b3c] rounded-2xl p-4 text-white shadow-[0_4px_14px_rgba(226,27,60,0.3)]">
              <div className="text-3xl font-black">100%</div>
              <div className="text-sm font-bold opacity-90">Gratis</div>
            </div>
            <div className="bg-[#1368ce] rounded-2xl p-4 text-white shadow-[0_4px_14px_rgba(19,104,206,0.3)]">
              <div className="text-3xl font-black">24/7</div>
              <div className="text-sm font-bold opacity-90">Acceso ilimitado</div>
            </div>
            <div className="bg-[#26890c] rounded-2xl p-4 text-white shadow-[0_4px_14px_rgba(38,137,12,0.3)]">
              <div className="text-3xl font-black">IA</div>
              <div className="text-sm font-bold opacity-90">Asistente personal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Kahoot Style */}
      <section className="py-24 bg-white dark:bg-[#1a1a1a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white mb-4">
              {t.home.featuresTitle}
            </h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-[#46178f] to-[#1368ce] mx-auto rounded-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 - Red */}
            <Card variant="interactive" className="border-none overflow-hidden">
              <div className="h-2 bg-[#e21b3c]" />
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-[#e21b3c] text-white flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(226,27,60,0.4)]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">{t.home.feature1Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.home.feature1Desc}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 - Blue */}
            <Card variant="interactive" className="border-none overflow-hidden">
              <div className="h-2 bg-[#1368ce]" />
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-[#1368ce] text-white flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(19,104,206,0.4)]">
                  <Trophy className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">{t.home.feature2Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.home.feature2Desc}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 - Green */}
            <Card variant="interactive" className="border-none overflow-hidden">
              <div className="h-2 bg-[#26890c]" />
              <CardHeader>
                <div className="h-14 w-14 rounded-2xl bg-[#26890c] text-white flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(38,137,12,0.4)]">
                  <Zap className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black">{t.home.feature3Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.home.feature3Desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Kahoot Gradient */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#46178f] via-[#1368ce] to-[#00cec8]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mb-10 text-xl text-white/80 font-medium">
            {t.home.ctaSubtitle}
          </p>
          <Link href="/register">
            <button className="bg-white text-[#46178f] hover:bg-gray-100 text-lg px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-all duration-200">
              {t.home.ctaButton}
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-[#1a1a1a]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#46178f] to-[#1368ce] flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#46178f] to-[#1368ce]">YouKnow</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t.home.footer}
          </p>
        </div>
      </footer>
    </div>
  )
}
