import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { UsersTable } from "./users-table"
import { CreateUserDialog } from "./create-user-dialog"
import { Shield, ArrowLeft } from "lucide-react"

export default async function AdminUsersPage() {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user.role)) {
        redirect("/dashboard")
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    enrollments: true,
                    coursesCreated: true
                }
            }
        }
    })

    // Serialize dates for client component
    const formattedUsers = users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString()
    }))

    return (
        <div className="p-6">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                        <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage user roles and permissions</p>
                    </div>
                </div>
                <CreateUserDialog currentUserRole={session.user.role} />
            </div>

            <UsersTable initialUsers={formattedUsers} currentUserRole={session.user.role} />
        </div>
    )
}
