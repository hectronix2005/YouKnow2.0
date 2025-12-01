import { auth } from "@/lib/auth"
import { isAdmin, isSuperAdmin } from "@/lib/teacher"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const session = await auth()
        const { name, email, password, role } = await req.json()

        if (!session?.user || !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Only Super Admin can create Super Admin users
        if (role === "super_admin" && !isSuperAdmin(session.user.role)) {
            return new NextResponse("Forbidden: Only Super Admins can create Super Admins", { status: 403 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return new NextResponse("User already exists", { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "employee"
            }
        })

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword)
    } catch (error) {
        console.error("[ADMIN_USERS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth()

        if (!session?.user || !isAdmin(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        enrollments: true,
                        coursesCreated: true
                    }
                }
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
