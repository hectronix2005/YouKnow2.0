import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password requirements: minimum 8 characters
const MIN_PASSWORD_LENGTH = 8

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate name length
        if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
            return NextResponse.json(
                { error: "Name must be between 2 and 100 characters" },
                { status: 400 }
            )
        }

        // Validate email format
        if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json(
                { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
                { status: 400 }
            )
        }

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim()

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user - SECURITY: Always set role to "employee" for public registration
        // Admin/lider roles should only be assigned through admin panel
        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: "employee", // NEVER accept role from client in public registration
            },
        })

        return NextResponse.json(
            { message: "User created successfully", userId: user.id },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
