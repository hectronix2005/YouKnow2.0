import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('=== COMPLETE DEBUG FOR JUAN ===\n')

    // 1. Find Juan
    const juan = await prisma.user.findFirst({
        where: { email: 'juan@learnflow.ai' }
    })

    if (!juan) {
        console.log('❌ Juan not found in database!')
        console.log('\nLet\'s check all users:')
        const allUsers = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true }
        })
        console.log(allUsers)
        return
    }

    console.log('✅ User found:')
    console.log(`   ID: ${juan.id}`)
    console.log(`   Email: ${juan.email}`)
    console.log(`   Name: ${juan.name}`)
    console.log(`   Role: ${juan.role}`)

    // 2. Check ALL task templates
    const allTemplates = await prisma.taskTemplate.findMany()
    console.log(`\n📋 Total task templates in DB: ${allTemplates.length}`)
    console.log(`   Active: ${allTemplates.filter(t => t.isActive).length}`)
    console.log(`   Inactive: ${allTemplates.filter(t => !t.isActive).length}`)

    // 3. Check Juan's assignments
    const assignments = await prisma.taskAssignment.findMany({
        where: { employeeId: juan.id },
        include: { taskTemplate: true }
    })

    console.log(`\n📌 Assignments for Juan: ${assignments.length}`)
    console.log(`   Active assignments: ${assignments.filter(a => a.isActive).length}`)
    console.log(`   Inactive assignments: ${assignments.filter(a => !a.isActive).length}`)

    if (assignments.length === 0) {
        console.log('\n❌ NO ASSIGNMENTS FOUND FOR JUAN!')
        console.log('This is the problem - Juan has no tasks assigned.')
        return
    }

    // 4. Check each assignment in detail
    console.log('\n📋 Assignment details:')
    for (const a of assignments) {
        const task = a.taskTemplate
        console.log(`\n   Task: ${task.title}`)
        console.log(`   - Assignment isActive: ${a.isActive}`)
        console.log(`   - Template isActive: ${task.isActive}`)
        console.log(`   - Frequency: ${task.frequency}`)
        console.log(`   - ScheduledDay: ${task.scheduledDay}`)
        console.log(`   - Category: ${task.category}`)
    }

    // 5. Simulate the API query
    console.log('\n\n=== SIMULATING API QUERY ===')

    // Parse date like the API does
    const dateParam = '2025-12-01'
    const [year, month, day] = dateParam.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0)

    console.log(`\nTarget date: ${targetDate}`)
    console.log(`Day of week: ${targetDate.getDay()} (0=Sun, 1=Mon)`)
    console.log(`Day of month: ${targetDate.getDate()}`)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Query exactly like the API
    const apiAssignments = await prisma.taskAssignment.findMany({
        where: {
            employeeId: juan.id,
            isActive: true,
            taskTemplate: {
                isActive: true,
            },
        },
        include: {
            taskTemplate: true,
            completions: {
                where: {
                    scheduledDate: {
                        gte: targetDate,
                        lte: endOfDay,
                    },
                },
            },
        },
    })

    console.log(`\n📋 API query returned: ${apiAssignments.length} assignments`)

    // Filter like the API
    const dayOfWeek = targetDate.getDay()
    const dayOfMonth = targetDate.getDate()

    const filteredTasks = apiAssignments.filter((assignment) => {
        const task = assignment.taskTemplate
        switch (task.frequency) {
            case "daily":
                return true
            case "weekly":
                return task.scheduledDay === null || task.scheduledDay === dayOfWeek
            case "monthly":
                return task.scheduledDay === null || task.scheduledDay === dayOfMonth
            default:
                return false
        }
    })

    console.log(`\n📋 After filtering for Dec 1st: ${filteredTasks.length} tasks`)

    for (const a of filteredTasks) {
        console.log(`   ✅ ${a.taskTemplate.title} (${a.taskTemplate.frequency})`)
    }

    console.log('\n=== END DEBUG ===')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
