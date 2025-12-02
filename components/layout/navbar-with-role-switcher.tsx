"use client"

import { Navbar } from "./navbar"
import { RoleSwitcherProvider } from "@/components/providers/role-switcher-provider"

interface NavbarWithRoleSwitcherProps {
    user: {
        name: string
        email: string
        role: string
    }
    onSignOut: () => void
}

export function NavbarWithRoleSwitcher({ user, onSignOut }: NavbarWithRoleSwitcherProps) {
    return (
        <RoleSwitcherProvider userRole={user.role}>
            <Navbar user={user} onSignOut={onSignOut} />
        </RoleSwitcherProvider>
    )
}
