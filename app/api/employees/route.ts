import { auth } from "@/lib/auth"
import { isAdmin, isLeader } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

// GET all employees (admin/leader only)
export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || (!isAdmin(session.user.role) && !isLeader(session.user.role))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const roleFilter = searchParams.get("role")

        const employees = await prisma.user.findMany({
            where: roleFilter ? { role: roleFilter } : undefined,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json(employees)
    } catch (error) {
        console.error("[EMPLOYEES_GET]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
