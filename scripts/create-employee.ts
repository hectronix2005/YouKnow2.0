import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createEmployee() {
    console.log('Creating employee user...\n')

    const employeeData = {
        email: 'empleado@learnflow.com',
        password: 'Empleado123!',
        name: 'Juan Empleado',
        role: 'employee',
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: employeeData.email },
    })

    if (existingUser) {
        console.log(`User ${employeeData.email} already exists, updating...`)
        const hashedPassword = await bcrypt.hash(employeeData.password, 10)
        await prisma.user.update({
            where: { email: employeeData.email },
            data: {
                role: employeeData.role,
                password: hashedPassword,
                name: employeeData.name,
            },
        })
        console.log(`  Updated role to: ${employeeData.role}`)
        console.log(`  Password reset to: ${employeeData.password}`)
    } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(employeeData.password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email: employeeData.email,
                password: hashedPassword,
                name: employeeData.name,
                role: employeeData.role,
            },
        })

        console.log(`Created user: ${user.name}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Role: ${user.role}`)
    }

    console.log('\n' + '='.repeat(50))
    console.log('\nEmployee user created successfully!')
    console.log('\nCredentials:')
    console.log('-'.repeat(50))
    console.log('Employee:')
    console.log('  Email:    empleado@learnflow.com')
    console.log('  Password: Empleado123!')
    console.log('-'.repeat(50))
    console.log('\nAccess the employee checklist at: /checklist')
    console.log('Admin task management at: /checklist/admin')
}

createEmployee()
    .catch((error) => {
        console.error('Error creating employee:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
