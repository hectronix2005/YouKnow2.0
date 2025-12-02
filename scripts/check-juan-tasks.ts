import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Find Juan
    const juan = await prisma.user.findFirst({
        where: { email: 'juan@learnflow.ai' }
    })

    if (!juan) {
        console.log('❌ Juan not found')
        return
    }

    console.log(`👤 Juan: ${juan.name} (${juan.id})`)
    console.log(`   Role: ${juan.role}`)

    // Get all assignments for Juan
    const assignments = await prisma.taskAssignment.findMany({
        where: {
            employeeId: juan.id,
            isActive: true,
        },
        include: {
            taskTemplate: true,
        }
    })

    console.log(`\n📋 Total assignments: ${assignments.length}`)

    if (assignments.length === 0) {
        console.log('❌ No assignments found for Juan!')
        return
    }

    // Check which tasks should appear on December 1st (Monday)
    const dec1 = new Date('2025-12-01')
    const dayOfWeek = dec1.getDay() // Should be 1 (Monday)
    const dayOfMonth = dec1.getDate() // Should be 1

    console.log(`\n📅 December 1st, 2025:`)
    console.log(`   Day of week: ${dayOfWeek} (0=Sun, 1=Mon, ...)`)
    console.log(`   Day of month: ${dayOfMonth}`)

    console.log('\n📋 All tasks assigned to Juan:')
    for (const a of assignments) {
        const task = a.taskTemplate
        let shouldAppear = false
        let reason = ''

        switch (task.frequency) {
            case 'daily':
                shouldAppear = true
                reason = 'Daily task'
                break
            case 'weekly':
                shouldAppear = task.scheduledDay === null || task.scheduledDay === dayOfWeek
                reason = `Weekly (day ${task.scheduledDay}), today is ${dayOfWeek}`
                break
            case 'monthly':
                shouldAppear = task.scheduledDay === null || task.scheduledDay === dayOfMonth
                reason = `Monthly (day ${task.scheduledDay}), today is ${dayOfMonth}`
                break
        }

        const status = shouldAppear ? '✅' : '❌'
        console.log(`${status} [${task.category}] ${task.title}`)
        console.log(`   Frequency: ${task.frequency}, ${reason}`)
        console.log(`   isActive: ${task.isActive}`)
    }

    // Count tasks for Dec 1st
    const tasksForDec1 = assignments.filter(a => {
        const task = a.taskTemplate
        if (!task.isActive) return false

        switch (task.frequency) {
            case 'daily':
                return true
            case 'weekly':
                return task.scheduledDay === null || task.scheduledDay === dayOfWeek
            case 'monthly':
                return task.scheduledDay === null || task.scheduledDay === dayOfMonth
            default:
                return false
        }
    })

    console.log(`\n📊 Tasks that should appear on Dec 1st: ${tasksForDec1.length}`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
