"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { getRoleLevel, Role, RoleInfo } from "@/lib/teacher"

interface RoleSwitcherContextType {
    originalRole: string
    activeRole: string
    setActiveRole: (role: string) => void
    isUsingDifferentRole: boolean
    resetToOriginal: () => void
    availableRoles: string[]
}

const RoleSwitcherContext = createContext<RoleSwitcherContextType | undefined>(undefined)

interface RoleSwitcherProviderProps {
    children: ReactNode
    userRole: string
}

export function RoleSwitcherProvider({ children, userRole }: RoleSwitcherProviderProps) {
    const [activeRole, setActiveRoleState] = useState(userRole)
    const originalLevel = getRoleLevel(userRole)

    // Get all roles at or below user's level
    const roleOrder = [Role.EMPLOYEE, Role.CREADOR, Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN]
    const availableRoles = roleOrder.filter(role => getRoleLevel(role) <= originalLevel)

    useEffect(() => {
        // Load saved active role from localStorage
        const saved = localStorage.getItem(`activeRole_${userRole}`)
        if (saved && availableRoles.includes(saved as typeof availableRoles[number])) {
            setActiveRoleState(saved)
        }
    }, [userRole, availableRoles])

    const setActiveRole = (role: string) => {
        if (getRoleLevel(role) <= originalLevel) {
            setActiveRoleState(role)
            localStorage.setItem(`activeRole_${userRole}`, role)
        }
    }

    const resetToOriginal = () => {
        setActiveRoleState(userRole)
        localStorage.removeItem(`activeRole_${userRole}`)
    }

    const isUsingDifferentRole = activeRole !== userRole

    return (
        <RoleSwitcherContext.Provider
            value={{
                originalRole: userRole,
                activeRole,
                setActiveRole,
                isUsingDifferentRole,
                resetToOriginal,
                availableRoles
            }}
        >
            {children}
        </RoleSwitcherContext.Provider>
    )
}

export function useRoleSwitcher() {
    const context = useContext(RoleSwitcherContext)
    if (context === undefined) {
        throw new Error("useRoleSwitcher must be used within a RoleSwitcherProvider")
    }
    return context
}
