import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/teacher"
import { ChecklistAdmin } from "./checklist-admin"

export default async function ChecklistAdminPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    // Check if user has admin permissions
    if (!isAdmin(session.user.role)) {
        redirect("/dashboard")
    }

    return <ChecklistAdmin />
}
