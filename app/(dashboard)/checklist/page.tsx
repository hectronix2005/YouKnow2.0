import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isEmployee } from "@/lib/teacher"
import { ChecklistDashboard } from "./checklist-dashboard"

export default async function ChecklistPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Check if user has employee permissions
    if (!isEmployee(session.user.role)) {
        redirect("/dashboard")
    }

    return <ChecklistDashboard userId={session.user.id} userName={session.user.name || "Empleado"} />
}
