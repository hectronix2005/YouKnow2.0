"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Search, Users, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Employee {
    id: string
    name: string
    email: string
    role: string
}

interface EmployeeSelectorProps {
    taskId: string
    taskTitle: string
    existingAssignments: Array<{
        id: string
        employee: {
            id: string
            name: string
            email: string
        }
    }>
    onAssign: (employeeIds: string[]) => Promise<void>
    onClose: () => void
}

export function EmployeeSelector({
    taskId,
    taskTitle,
    existingAssignments,
    onAssign,
    onClose,
}: EmployeeSelectorProps) {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isAssigning, setIsAssigning] = useState(false)

    const existingEmployeeIds = new Set(existingAssignments.map((a) => a.employee.id))

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/employees?role=employee")
            if (!response.ok) throw new Error("Failed to fetch employees")
            const data = await response.json()
            setEmployees(data)
        } catch (error) {
            console.error("Error fetching employees:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredEmployees = employees.filter((emp) => {
        const query = searchQuery.toLowerCase()
        return (
            emp.name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query) ||
            emp.role.toLowerCase().includes(query)
        )
    })

    const availableEmployees = filteredEmployees.filter(
        (emp) => !existingEmployeeIds.has(emp.id)
    )

    // Group employees by role for better organization
    const employeesByRole = availableEmployees.reduce((acc, emp) => {
        const role = emp.role || 'employee'
        if (!acc[role]) acc[role] = []
        acc[role].push(emp)
        return acc
    }, {} as Record<string, typeof availableEmployees>)

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
            case 'admin':
                return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            case 'lider':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            case 'employee':
                return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin'
            case 'admin':
                return 'Admin'
            case 'lider':
                return 'Líder'
            case 'employee':
                return 'Empleado'
            default:
                return role
        }
    }

    const handleToggle = (employeeId: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId)
        } else {
            newSelected.add(employeeId)
        }
        setSelectedIds(newSelected)
    }

    const handleSelectAll = () => {
        if (selectedIds.size === availableEmployees.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(availableEmployees.map((emp) => emp.id)))
        }
    }

    const handleAssign = async () => {
        if (selectedIds.size === 0) return

        try {
            setIsAssigning(true)
            await onAssign(Array.from(selectedIds))
            onClose()
        } catch (error) {
            console.error("Error assigning employees:", error)
        } finally {
            setIsAssigning(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="flex-1">
                        <CardTitle className="text-xl">Asignar Empleados</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {taskTitle}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, email o rol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>
                                {availableEmployees.length} disponible{availableEmployees.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        {selectedIds.size > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Select All */}
                    {availableEmployees.length > 0 && (
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Checkbox
                                id="select-all"
                                checked={selectedIds.size === availableEmployees.length}
                                onCheckedChange={handleSelectAll}
                            />
                            <label
                                htmlFor="select-all"
                                className="text-sm font-medium cursor-pointer"
                            >
                                Seleccionar todos
                            </label>
                        </div>
                    )}

                    {/* Employee List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : availableEmployees.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchQuery
                                    ? "No se encontraron empleados"
                                    : "Todos los empleados ya están asignados"}
                            </div>
                        ) : (
                            availableEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent",
                                        selectedIds.has(employee.id) &&
                                        "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                    )}
                                    onClick={() => handleToggle(employee.id)}
                                >
                                    <Checkbox
                                        checked={selectedIds.has(employee.id)}
                                        onCheckedChange={() => handleToggle(employee.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm truncate">
                                                {employee.name}
                                            </p>
                                            <span className={cn(
                                                "px-2 py-0.5 text-xs rounded-full font-medium",
                                                getRoleBadgeColor(employee.role)
                                            )}>
                                                {getRoleLabel(employee.role)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {employee.email}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Existing Assignments */}
                    {existingAssignments.length > 0 && (
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-2">
                                Ya asignados ({existingAssignments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {existingAssignments.map((assignment) => (
                                    <div
                                        key={assignment.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                                    >
                                        <span>{assignment.employee.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isAssigning}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAssign}
                            className="flex-1"
                            disabled={selectedIds.size === 0 || isAssigning}
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Asignando...
                                </>
                            ) : (
                                `Asignar ${selectedIds.size > 0 ? `(${selectedIds.size})` : ""}`
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
