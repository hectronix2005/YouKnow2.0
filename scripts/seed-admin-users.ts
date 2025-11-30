import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash("password123", 10)

    const adminEmail = "admin@learnflow.com"
    const superAdminEmail = "superadmin@learnflow.com"

    // Check/Create Admin
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                name: "Admin User",
                email: adminEmail,
                password,
                role: "admin",
            },
        })
        console.log(`Created Admin: ${adminEmail} / password123`)
    } else {
        // Update role just in case
        if (admin.role !== "admin") {
            await prisma.user.update({
                where: { id: admin.id },
                data: { role: "admin" }
            })
            console.log(`Updated Admin role for: ${adminEmail}`)
        }
        console.log(`Existing Admin: ${adminEmail} (password might be password123)`)
    }

    // Check/Create Super Admin
    let superAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } })
    if (!superAdmin) {
        superAdmin = await prisma.user.create({
            data: {
                name: "Super Admin User",
                email: superAdminEmail,
                password,
                role: "super_admin",
            },
        })
        console.log(`Created Super Admin: ${superAdminEmail} / password123`)
    } else {
        // Update role just in case
        if (superAdmin.role !== "super_admin") {
            await prisma.user.update({
                where: { id: superAdmin.id },
                data: { role: "super_admin" }
            })
            console.log(`Updated Super Admin role for: ${superAdminEmail}`)
        }
        console.log(`Existing Super Admin: ${superAdminEmail} (password might be password123)`)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
