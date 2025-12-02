/**
 * User roles in the system (ordered by permission level)
 */
export const Role = {
    EMPLOYEE: "employee",
    CREADOR: "creador",
    LIDER: "lider",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
} as const

export type UserRole = typeof Role[keyof typeof Role]

// Role hierarchy sets for efficient permission checks
// Creador has same permissions as Lider
const LEADER_ROLES = new Set<string>([Role.CREADOR, Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN])
const ADMIN_ROLES = new Set<string>([Role.ADMIN, Role.SUPER_ADMIN])
const EMPLOYEE_ROLES = new Set<string>([Role.EMPLOYEE, Role.ADMIN, Role.SUPER_ADMIN])
const CREATOR_ROLES = new Set<string>([Role.CREADOR, Role.LIDER, Role.ADMIN, Role.SUPER_ADMIN])

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
 * Check if the user has creator permissions (creador, lider, admin, or super_admin)
 */
export const isCreator = (role?: string | null): boolean => {
    return role != null && CREATOR_ROLES.has(role)
}

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
    const displayNames: Record<string, string> = {
        [Role.EMPLOYEE]: "Empleado",
        [Role.CREADOR]: "Creador",
        [Role.LIDER]: "Líder",
        [Role.ADMIN]: "Administrador",
        [Role.SUPER_ADMIN]: "Super Admin",
    }
    return displayNames[role] || role
}
