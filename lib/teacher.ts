/**
 * User roles in the system with hierarchical permission levels
 * Level 1: Employee (lowest)
 * Level 2: Creador
 * Level 3: Líder
 * Level 4: Admin
 * Level 5: Super Admin (highest)
 */
export const Role = {
    EMPLOYEE: "employee",
    CREADOR: "creador",
    LIDER: "lider",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
} as const

export type UserRole = typeof Role[keyof typeof Role]

/**
 * Permission levels for each role (higher = more permissions)
 */
export const RoleLevel: Record<string, number> = {
    [Role.EMPLOYEE]: 1,
    [Role.CREADOR]: 2,
    [Role.LIDER]: 3,
    [Role.ADMIN]: 4,
    [Role.SUPER_ADMIN]: 5,
}

/**
 * Role metadata including level, color, and description
 */
export const RoleInfo: Record<string, { level: number; label: string; color: string; bgColor: string; description: string }> = {
    [Role.EMPLOYEE]: {
        level: 1,
        label: "Empleado",
        color: "text-gray-600",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        description: "Puede ver y tomar cursos"
    },
    [Role.CREADOR]: {
        level: 2,
        label: "Creador",
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        description: "Puede crear y gestionar cursos"
    },
    [Role.LIDER]: {
        level: 3,
        label: "Líder",
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        description: "Puede crear cursos y gestionar equipo"
    },
    [Role.ADMIN]: {
        level: 4,
        label: "Administrador",
        color: "text-indigo-600",
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        description: "Acceso completo excepto super admin"
    },
    [Role.SUPER_ADMIN]: {
        level: 5,
        label: "Super Admin",
        color: "text-red-600",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        description: "Control total del sistema"
    },
}

/**
 * Get the permission level of a role (1-5)
 */
export const getRoleLevel = (role?: string | null): number => {
    if (!role) return 0
    return RoleLevel[role] || 0
}

/**
 * Check if user has at least the specified permission level
 */
export const hasMinLevel = (role?: string | null, minLevel: number = 1): boolean => {
    return getRoleLevel(role) >= minLevel
}

/**
 * Check if user has employee permissions (level 1+)
 */
export const isEmployee = (role?: string | null): boolean => {
    return hasMinLevel(role, 1)
}

/**
 * Check if user has creator permissions (level 2+)
 */
export const isCreator = (role?: string | null): boolean => {
    return hasMinLevel(role, 2)
}

/**
 * Check if user has leader permissions (level 3+)
 */
export const isLeader = (role?: string | null): boolean => {
    return hasMinLevel(role, 3)
}

/**
 * Check if user has admin permissions (level 4+)
 */
export const isAdmin = (role?: string | null): boolean => {
    return hasMinLevel(role, 4)
}

/**
 * Check if user is super admin (level 5)
 */
export const isSuperAdmin = (role?: string | null): boolean => {
    return hasMinLevel(role, 5)
}

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: string): string => {
    return RoleInfo[role]?.label || role
}

/**
 * Get role info (level, label, colors, description)
 */
export const getRoleInfo = (role: string) => {
    return RoleInfo[role] || RoleInfo[Role.EMPLOYEE]
}

/**
 * Get all roles that a user can assign based on their own level
 * Users can only assign roles with lower or equal level to their own
 */
export const getAssignableRoles = (userRole: string): string[] => {
    const userLevel = getRoleLevel(userRole)
    return Object.entries(RoleLevel)
        .filter(([_, level]) => level <= userLevel)
        .map(([role]) => role)
}
