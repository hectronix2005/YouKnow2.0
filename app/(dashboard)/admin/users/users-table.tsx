"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, ShieldAlert, ShieldCheck, User, ChevronDown, MoreHorizontal } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    _count: {
        enrollments: number
        coursesCreated: number
    }
}

interface UsersTableProps {
    initialUsers: User[]
    currentUserRole: string
}

export function UsersTable({ initialUsers, currentUserRole }: UsersTableProps) {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingId(userId)
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            })

            if (!response.ok) {
                throw new Error("Failed to update role")
            }

            const updatedUser = await response.json()

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: updatedUser.role } : user
            ))

            router.refresh()
        } catch (error) {
            console.error("Failed to update role", error)
            alert("Failed to update user role")
        } finally {
            setLoadingId(null)
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "super_admin": return <ShieldAlert className="h-4 w-4 text-red-500" />
            case "admin": return <ShieldCheck className="h-4 w-4 text-indigo-500" />
            case "lider": return <Shield className="h-4 w-4 text-green-500" />
            case "creador": return <Shield className="h-4 w-4 text-purple-500" />
            default: return <User className="h-4 w-4 text-gray-500" />
        }
    }

    const getRoleLabel = (role: string) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Stats</th>
                            <th className="px-6 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                                        <span className="text-sm text-gray-500">{user.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-dashed"
                                                    disabled={loadingId === user.id}
                                                >
                                                    {loadingId === user.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    ) : (
                                                        getRoleIcon(user.role)
                                                    )}
                                                    <span className="ml-2 mr-1">{getRoleLabel(user.role)}</span>
                                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "employee")}>
                                                    <User className="mr-2 h-4 w-4" /> Employee
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "creador")}>
                                                    <Shield className="mr-2 h-4 w-4 text-purple-500" /> Creador
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "lider")}>
                                                    <Shield className="mr-2 h-4 w-4" /> Líder
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                                                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                                                </DropdownMenuItem>
                                                {currentUserRole === "super_admin" && (
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, "super_admin")}>
                                                        <ShieldAlert className="mr-2 h-4 w-4" /> Super Admin
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-xs">
                                        <Badge variant="secondary" className="w-fit">
                                            {user._count.enrollments} Enrollments
                                        </Badge>
                                        {user._count.coursesCreated > 0 && (
                                            <Badge variant="outline" className="w-fit">
                                                {user._count.coursesCreated} Courses
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString("es-ES", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
