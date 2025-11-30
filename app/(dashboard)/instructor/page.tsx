import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isTeacher } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BookOpen, Users, DollarSign, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function InstructorDashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Check if user is instructor (or allow everyone to be instructor for MVP)
    // For MVP, we'll assume everyone can create courses or check role
    if (!isTeacher(session.user.role)) {
        // Optional: Redirect to become instructor page or just allow it
        // redirect("/dashboard")
    }

    const courses = await prisma.course.findMany({
        where: { instructorId: session.user.id },
        include: {
            _count: {
                select: { enrollments: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0)
    const totalRevenue = courses.reduce((acc, course) => acc + (course.price * course._count.enrollments), 0)

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
                </div>
                <div className="flex gap-4">
                    <Link href="/instructor/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                {/* Revenue card hidden - all courses are free */}
            </div>

            {/* Courses List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <Link key={course.id} href={`/instructor/courses/${course.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Price hidden - all courses are free */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{course.status}</span>
                                    <span>{course._count.enrollments} students</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
