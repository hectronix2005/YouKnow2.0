import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const email = "instructor@learnflow.ai"
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.log("User not found:", email)
        // List all users
        const users = await prisma.user.findMany({ select: { email: true, role: true } })
        console.log("Available users:", users)
        return
    }

    const newPassword = await bcrypt.hash("password123", 10)
    await prisma.user.update({
        where: { email },
        data: { password: newPassword }
    })
    console.log("Password reset for:", email, "-> password123")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
