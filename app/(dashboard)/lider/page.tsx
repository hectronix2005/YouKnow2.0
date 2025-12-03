import { redirect } from "next/navigation"

// Lider module merged with Creador - redirect to Creador
export default function LiderDashboardPage() {
    redirect("/creador")
}
