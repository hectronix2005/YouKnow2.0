"use client"

import { NavbarWithRoleSwitcher } from "@/components/layout/navbar-with-role-switcher"
import { CourseCard } from "@/components/course/course-card"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CoursesClientProps {
    user: any
    courses: any[]
    onSignOut: () => void
}

export function CoursesClient({ user, courses, onSignOut }: CoursesClientProps) {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <NavbarWithRoleSwitcher user={user} onSignOut={onSignOut} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {t.courses.title}
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {t.courses.subtitle}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t.courses.searchPlaceholder}
                                className="pl-9 bg-white dark:bg-gray-900"
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {courses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {t.courses.noResults}
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
