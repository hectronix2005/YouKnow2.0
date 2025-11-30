export const isTeacher = (role?: string | null) => {
    return role === "instructor" || role === "admin" || role === "super_admin";
}

export const isAdmin = (role?: string | null) => {
    return role === "admin" || role === "super_admin";
}

export const isSuperAdmin = (role?: string | null) => {
    return role === "super_admin";
}
