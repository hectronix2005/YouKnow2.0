import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isLeader } from "@/lib/teacher"
import { ChecklistAdmin } from "./checklist-admin"

export default async function ChecklistAdminPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Líderes y admins pueden gestionar tareas
    if (!isLeader(session.user.role)) {
        redirect("/dashboard")
    }

    return <ChecklistAdmin />
}
