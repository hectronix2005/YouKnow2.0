import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isCreator, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BookOpen, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function LiderDashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Both creador (level 2) and lider (level 3) can access this page
    if (!isCreator(session.user.role)) {
        redirect("/dashboard")
    }

    // Leaders and admins can see all courses, regular creators only see their own
    const isLeaderOrAdmin = isLeader(session.user.role)

    const courses = await prisma.course.findMany({
        where: isLeaderOrAdmin ? {} : { instructorId: session.user.id },
        include: {
            instructor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            _count: {
                select: { enrollments: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const totalEnrolled = courses.reduce((acc, course) => acc + course._count.enrollments, 0)
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel del Creador</h1>
                </div>
                <div className="flex gap-4">
                    <Link href="/lider/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nuevo Curso
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total de Cursos</CardTitle>
                        <BookOpen className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Inscritos</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEnrolled}</div>
                    </CardContent>
                </Card>
                {/* Revenue card hidden - all courses are free */}
            </div>

            {/* Courses List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <Link key={course.id} href={`/lider/courses/${course.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                {isLeaderOrAdmin && course.instructor && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Por: {course.instructor.name}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                {/* Price hidden - all courses are free */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{course.status}</span>
                                    <span>{course._count.enrollments} enrolled</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
