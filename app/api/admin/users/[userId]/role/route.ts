import { auth } from "@/lib/auth"
import { isAdmin, isSuperAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth()
        const { userId } = await params
        const { role } = await req.json()

        if (!session?.user || !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Validate role
        const validRoles = ["employee", "creador", "lider", "admin", "super_admin"]
        if (!validRoles.includes(role)) {
            return new NextResponse("Invalid role", { status: 400 })
        }

        // Only Super Admin can assign Super Admin role
        if (role === "super_admin" && !isSuperAdmin(session.user.role)) {
            return new NextResponse("Forbidden: Only Super Admins can assign Super Admin role", { status: 403 })
        }

        // Prevent modifying own role to avoid locking oneself out (optional but good practice)
        // For now, we'll allow it but maybe warn in UI. 
        // Actually, let's prevent removing super_admin status if it's the last one, but that's complex.
        // Let's just allow it for now.

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[ADMIN_USER_ROLE_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
