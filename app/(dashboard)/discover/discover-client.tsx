"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Search, Filter, Play, Users, BookOpen, Star, TrendingUp } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"

interface Course {
    id: string
    title: string
    subtitle: string | null
    slug: string
    category: string
    level: string
    thumbnail: string | null
    instructor: {
        name: string
    }
    _count: {
        enrollments: number
    }
}

interface DiscoverClientProps {
    user: any
    courses: Course[]
    categories: string[]
    onSignOut: () => void
}

export function DiscoverClient({ user, courses, categories, onSignOut }: DiscoverClientProps) {
    const { t } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

    // Filter courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || course.category === selectedCategory
        const matchesLevel = !selectedLevel || course.level === selectedLevel
        return matchesSearch && matchesCategory && matchesLevel
    })

    // Color mapping for cards
    const colors = ["#e21b3c", "#1368ce", "#26890c", "#d89e00", "#46178f", "#00cec8"]
    const getColor = (index: number) => colors[index % colors.length]

    const levels = ["Principiante", "Intermedio", "Avanzado"]

    return (
        <div className="min-h-screen bg-[#f2f2f2] dark:bg-[#121212]">
            <Sidebar user={user} onSignOut={onSignOut} />

            <div className="ml-[72px]">
                <DashboardHeader user={user} />

                <main className="p-6">
                    {/* Hero Section */}
                    <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#e21b3c] to-[#ff6b6b] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative max-w-2xl">
                            <h1 className="text-3xl font-bold mb-2">{t.discover.title}</h1>
                            <p className="text-white/80 mb-6">
                                {t.discover.subtitle}
                            </p>
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t.discover.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-3">
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">{t.discover.category}:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        !selectedCategory
                                            ? "bg-[#46178f] text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {t.discover.all}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            selectedCategory === category
                                                ? "bg-[#46178f] text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Level Filter */}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm font-medium text-gray-600">{t.discover.level}:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedLevel(null)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        !selectedLevel
                                            ? "bg-[#1368ce] text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {t.discover.all}
                                </button>
                                {levels.map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                            selectedLevel === level
                                                ? "bg-[#1368ce] text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            {filteredCourses.length} {filteredCourses.length !== 1 ? t.discover.coursesFoundPlural : t.discover.coursesFound}
                        </p>
                    </div>

                    {/* Course Grid */}
                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredCourses.map((course, index) => (
                                <Link key={course.id} href={`/courses/${course.slug}`}>
                                    <div className="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                                        {/* Color Header */}
                                        <div
                                            className="h-32 relative flex items-center justify-center"
                                            style={{ backgroundColor: getColor(index) }}
                                        >
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-5xl font-black text-white/30">
                                                    {course.title.charAt(0)}
                                                </span>
                                            )}
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                                <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                                                    <Play className="h-6 w-6 text-gray-900 ml-0.5" fill="currentColor" />
                                                </div>
                                            </div>
                                            {/* Level Badge */}
                                            <div className="absolute top-3 right-3">
                                                <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-gray-900">
                                                    {course.level}
                                                </span>
                                            </div>
                                            {/* Category Badge */}
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 rounded-full bg-black/30 text-xs font-medium text-white backdrop-blur-sm">
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-[#46178f] transition-colors">
                                                {course.title}
                                            </h3>
                                            {course.subtitle && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                    {course.subtitle}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {course._count.enrollments} {t.discover.students}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3" />
                                                    {course.instructor.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {t.discover.noCoursesFound}
                            </h3>
                            <p className="text-gray-500">
                                {t.discover.tryOther}
                            </p>
                        </div>
                    )}

                    {/* Trending Section */}
                    <div className="mt-12">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-[#e21b3c]" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t.discover.trending}
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["Python", "JavaScript", "Data Science", "Machine Learning"].map((topic, i) => (
                                <button
                                    key={topic}
                                    onClick={() => setSearchQuery(topic)}
                                    className="p-4 rounded-xl text-white font-bold text-left transition-all hover:scale-[1.02]"
                                    style={{ backgroundColor: getColor(i) }}
                                >
                                    <Star className="h-5 w-5 mb-2 opacity-80" />
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
