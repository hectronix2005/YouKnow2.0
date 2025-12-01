import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmins() {
    console.log('Creating admin users...\n')

    const adminUsers = [
        {
            email: 'superadmin@learnflow.com',
            password: 'SuperAdmin123!',
            name: 'Super Administrador',
            role: 'super_admin',
        },
        {
            email: 'admin@learnflow.com',
            password: 'Admin123!',
            name: 'Administrador',
            role: 'admin',
        },
    ]

    for (const userData of adminUsers) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        })

        if (existingUser) {
            console.log(`User ${userData.email} already exists, updating...`)
            const hashedPassword = await bcrypt.hash(userData.password, 10)
            await prisma.user.update({
                where: { email: userData.email },
                data: {
                    role: userData.role,
                    password: hashedPassword,
                    name: userData.name,
                },
            })
            console.log(`  Updated role to: ${userData.role}`)
            console.log(`  Password reset to: ${userData.password}`)
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10)

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role,
                },
            })

            console.log(`Created user: ${user.name}`)
            console.log(`  Email: ${user.email}`)
            console.log(`  Role: ${user.role}`)
        }
        console.log('')
    }

    console.log('=' .repeat(50))
    console.log('\nAdmin users created successfully!')
    console.log('\nCredentials:')
    console.log('-' .repeat(50))
    console.log('Super Admin:')
    console.log('  Email:    superadmin@learnflow.com')
    console.log('  Password: SuperAdmin123!')
    console.log('')
    console.log('Admin:')
    console.log('  Email:    admin@learnflow.com')
    console.log('  Password: Admin123!')
    console.log('-' .repeat(50))
}

createAdmins()
    .catch((error) => {
        console.error('Error creating admins:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
