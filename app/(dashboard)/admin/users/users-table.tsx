"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, ShieldAlert, ShieldCheck, User, ChevronDown, Palette, Users } from "lucide-react"
import { getRoleInfo, getRoleLevel, getAssignableRoles, Role, RoleInfo } from "@/lib/teacher"

interface UserData {
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
    initialUsers: UserData[]
    currentUserRole: string
}

export function UsersTable({ initialUsers, currentUserRole }: UsersTableProps) {
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>(initialUsers)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const currentUserLevel = getRoleLevel(currentUserRole)
    const assignableRoles = getAssignableRoles(currentUserRole)

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
            case "lider": return <Users className="h-4 w-4 text-green-500" />
            case "creador": return <Palette className="h-4 w-4 text-purple-500" />
            default: return <User className="h-4 w-4 text-gray-500" />
        }
    }

    const roleOrder = [Role.EMPLOYEE, Role.CREADOR, Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN]

    return (
        <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Nivel & Rol</th>
                            <th className="px-6 py-3">Stats</th>
                            <th className="px-6 py-3">Registro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                        {users.map((user) => {
                            const roleInfo = getRoleInfo(user.role)
                            const userLevel = getRoleLevel(user.role)
                            const canEdit = userLevel <= currentUserLevel

                            return (
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
                                                        className={`h-9 border-dashed ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        disabled={loadingId === user.id || !canEdit}
                                                    >
                                                        {loadingId === user.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <>
                                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded mr-2 ${roleInfo.bgColor} ${roleInfo.color}`}>
                                                                    Nv.{roleInfo.level}
                                                                </span>
                                                                {getRoleIcon(user.role)}
                                                            </>
                                                        )}
                                                        <span className={`ml-2 mr-1 ${roleInfo.color}`}>{roleInfo.label}</span>
                                                        {canEdit && <ChevronDown className="h-3 w-3 opacity-50" />}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                {canEdit && (
                                                    <DropdownMenuContent align="start" className="w-56">
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                                                            Seleccionar nivel de permisos
                                                        </div>
                                                        <DropdownMenuSeparator />
                                                        {roleOrder.map((role) => {
                                                            const info = RoleInfo[role]
                                                            const isAssignable = assignableRoles.includes(role)
                                                            const isCurrentRole = user.role === role

                                                            if (!isAssignable) return null

                                                            return (
                                                                <DropdownMenuItem
                                                                    key={role}
                                                                    onClick={() => handleRoleChange(user.id, role)}
                                                                    className={`flex items-center gap-2 ${isCurrentRole ? 'bg-accent' : ''}`}
                                                                >
                                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${info.bgColor} ${info.color}`}>
                                                                        {info.level}
                                                                    </span>
                                                                    {getRoleIcon(role)}
                                                                    <div className="flex flex-col">
                                                                        <span className={info.color}>{info.label}</span>
                                                                        <span className="text-xs text-gray-400">{info.description}</span>
                                                                    </div>
                                                                </DropdownMenuItem>
                                                            )
                                                        })}
                                                    </DropdownMenuContent>
                                                )}
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <Badge variant="secondary" className="w-fit">
                                                {user._count.enrollments} Inscripciones
                                            </Badge>
                                            {user._count.coursesCreated > 0 && (
                                                <Badge variant="outline" className="w-fit">
                                                    {user._count.coursesCreated} Cursos
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
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
