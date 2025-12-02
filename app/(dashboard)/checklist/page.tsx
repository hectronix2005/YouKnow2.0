import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChecklistDashboard } from "./checklist-dashboard"

export default async function ChecklistPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Todos los usuarios autenticados pueden ver sus tareas asignadas
    return (
        <ChecklistDashboard
            userId={session.user.id}
            userName={session.user.name || "Usuario"}
            userRole={session.user.role}
        />
    )
}
