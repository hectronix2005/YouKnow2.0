import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('👤 Adding Juan Empleado...')

    // Check if Juan Empleado already exists
    let juan = await prisma.user.findFirst({
        where: { email: 'juan@learnflow.ai' }
    })

    if (!juan) {
        // Create Juan Empleado (password pre-hashed: juan123)
        juan = await prisma.user.create({
            data: {
                email: 'juan@learnflow.ai',
                password: '$2b$10$SefAlmsfttPpV23O73tGeuifB/xa1Q5nAsFfRFB/cnyhBJF32EQje', // password: employee123
                name: 'Juan Empleado',
                role: 'employee',
            }
        })
        console.log('✅ Created Juan Empleado')
    } else {
        console.log('ℹ️ Juan Empleado already exists')
    }

    console.log(`👤 Juan: ${juan.name} (${juan.id})`)

    // Get existing task templates (select 10 diverse ones)
    const allTasks = await prisma.taskTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
    })

    if (allTasks.length === 0) {
        console.log('❌ No tasks found. Run seed-checklist.ts first.')
        return
    }

    // Select 10 tasks from different categories
    const selectedTasks = [
        // 2 from cleaning
        allTasks.find(t => t.category === 'cleaning' && t.frequency === 'daily'),
        allTasks.find(t => t.category === 'cleaning' && t.frequency === 'weekly'),
        // 2 from maintenance
        allTasks.find(t => t.category === 'maintenance' && t.frequency === 'daily'),
        allTasks.find(t => t.category === 'maintenance' && t.frequency === 'monthly'),
        // 2 from administrative
        allTasks.find(t => t.category === 'administrative' && t.frequency === 'daily'),
        allTasks.find(t => t.category === 'administrative' && t.frequency === 'weekly'),
        // 2 from security
        allTasks.find(t => t.category === 'security' && t.frequency === 'daily'),
        allTasks.find(t => t.category === 'security' && t.frequency === 'weekly'),
        // 2 from inventory
        allTasks.find(t => t.category === 'inventory' && t.frequency === 'weekly'),
        allTasks.find(t => t.category === 'inventory' && t.frequency === 'monthly'),
    ].filter(Boolean)

    console.log(`📋 Selected ${selectedTasks.length} tasks to assign`)

    // Remove any existing assignments for Juan
    await prisma.taskAssignment.deleteMany({
        where: { employeeId: juan.id }
    })

    // Create new assignments
    const assignments = await Promise.all(
        selectedTasks.map(task =>
            prisma.taskAssignment.create({
                data: {
                    taskTemplateId: task!.id,
                    employeeId: juan.id,
                    isActive: true
                }
            })
        )
    )

    console.log(`✅ Created ${assignments.length} task assignments for Juan`)

    // Show summary
    console.log('\n📊 Tasks assigned to Juan Empleado:')
    for (const task of selectedTasks) {
        if (task) {
            console.log(`  - [${task.category}] ${task.title} (${task.frequency})`)
        }
    }

    console.log('\n🔑 Login credentials:')
    console.log('  Email: juan@learnflow.ai')
    console.log('  Password: employee123')
    console.log('\n✅ Done!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
