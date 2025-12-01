"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Sparkles, Trophy, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { Navbar } from "@/components/layout/navbar"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-16 pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-8 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-300">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI-Powered Learning Platform</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-6 dark:text-white">
            <span className="block">{t.home.heroTitle.split(" IA")[0]}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              AI
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 transition-all duration-200">
                {t.home.getStarted}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                {t.home.learnMore}
              </Button>
            </Link>
          </div>

          {/* Stats / Trust indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white mb-4">
              {t.home.featuresTitle}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none dark:bg-gray-800 transition-transform hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t.home.feature1Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.home.feature1Desc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none dark:bg-gray-800 transition-transform hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 dark:bg-purple-900/30 dark:text-purple-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t.home.feature2Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.home.feature2Desc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-gray-200/50 dark:shadow-none dark:bg-gray-800 transition-transform hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 dark:bg-pink-900/30 dark:text-pink-400">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{t.home.feature3Title}</CardTitle>
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

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mb-10 text-xl text-indigo-100">
            {t.home.ctaSubtitle}
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 text-lg h-12 px-8 shadow-xl">
              {t.home.ctaButton}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">YouKnow</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.home.footer}
          </p>
        </div>
      </footer>
    </div>
  )
}
