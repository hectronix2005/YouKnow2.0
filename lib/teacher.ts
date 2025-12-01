/**
 * User roles in the system (ordered by permission level)
 */
export const Role = {
    EMPLOYEE: "employee",
    LIDER: "lider",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
} as const

export type UserRole = typeof Role[keyof typeof Role]

// Role hierarchy sets for efficient permission checks
const LEADER_ROLES = new Set<string>([Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN])
const ADMIN_ROLES = new Set<string>([Role.ADMIN, Role.SUPER_ADMIN])
const EMPLOYEE_ROLES = new Set<string>([Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN])

/**
 * Check if the user has leader permissions (lider, admin, or super_admin)
 */
export const isLeader = (role?: string | null): boolean => {
    return role != null && LEADER_ROLES.has(role)
}

/**
 * Check if the user has admin permissions (admin or super_admin)
 */
export const isAdmin = (role?: string | null): boolean => {
    return role != null && ADMIN_ROLES.has(role)
}

/**
 * Check if the user is a super admin
 */
export const isSuperAdmin = (role?: string | null): boolean => {
    return role === Role.SUPER_ADMIN
}

/**
 * Check if the user has employee permissions (employee, admin, or super_admin)
 */
export const isEmployee = (role?: string | null): boolean => {
    return role != null && EMPLOYEE_ROLES.has(role)
}

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
    const displayNames: Record<string, string> = {
        [Role.EMPLOYEE]: "Empleado",
        [Role.LIDER]: "Líder",
        [Role.ADMIN]: "Administrador",
        [Role.SUPER_ADMIN]: "Super Admin",
    }
    return displayNames[role] || role
}
