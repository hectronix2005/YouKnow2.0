import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('📋 Starting checklist seed...')

    // Get existing users
    const lider = await prisma.user.findFirst({
        where: { role: 'lider' }
    })

    const employee = await prisma.user.findFirst({
        where: { role: 'employee' }
    })

    if (!lider) {
        console.log('❌ No lider found. Please run the main seed first.')
        return
    }

    if (!employee) {
        console.log('❌ No employee found. Please run the main seed first.')
        return
    }

    console.log(`👤 Lider: ${lider.name} (${lider.id})`)
    console.log(`👤 Employee: ${employee.name} (${employee.id})`)

    // Clean existing checklist data
    console.log('🧹 Cleaning existing checklist data...')
    await prisma.taskCompletion.deleteMany({})
    await prisma.taskAssignment.deleteMany({})
    await prisma.taskTemplate.deleteMany({})
    console.log('✅ Checklist data cleaned')

    // Create task templates
    console.log('📝 Creating task templates...')

    const tasks = await Promise.all([
        // Tareas diarias
        prisma.taskTemplate.create({
            data: {
                title: 'Revisión de equipos de cómputo',
                description: 'Verificar que todos los equipos de cómputo estén funcionando correctamente. Reportar cualquier falla.',
                frequency: 'daily',
                scheduledTime: '09:00',
                requiresPhoto: false,
                category: 'maintenance',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Limpieza del área de trabajo',
                description: 'Mantener el área de trabajo limpia y ordenada. Incluye escritorios, sillas y pisos.',
                frequency: 'daily',
                scheduledTime: '08:00',
                requiresPhoto: true,
                category: 'cleaning',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Registro de asistencia',
                description: 'Marcar entrada y salida en el sistema de control de asistencia.',
                frequency: 'daily',
                scheduledTime: '07:30',
                requiresPhoto: false,
                category: 'administrative',
                priority: 'high',
                createdById: lider.id
            }
        }),

        // Tareas semanales
        prisma.taskTemplate.create({
            data: {
                title: 'Inventario de materiales',
                description: 'Realizar conteo de materiales de oficina y reportar faltantes.',
                frequency: 'weekly',
                scheduledDay: 1, // Lunes
                requiresPhoto: false,
                category: 'inventory',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Respaldo de información',
                description: 'Realizar respaldo semanal de archivos importantes en el servidor.',
                frequency: 'weekly',
                scheduledDay: 5, // Viernes
                requiresPhoto: false,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Inspección de seguridad',
                description: 'Verificar extintores, salidas de emergencia y botiquín de primeros auxilios.',
                frequency: 'weekly',
                scheduledDay: 3, // Miércoles
                requiresPhoto: true,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),

        // Tareas mensuales
        prisma.taskTemplate.create({
            data: {
                title: 'Reporte mensual de actividades',
                description: 'Elaborar reporte con las actividades realizadas durante el mes.',
                frequency: 'monthly',
                scheduledDay: 28,
                requiresPhoto: false,
                category: 'administrative',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Mantenimiento preventivo de equipos',
                description: 'Limpieza interna de equipos de cómputo y verificación de actualizaciones.',
                frequency: 'monthly',
                scheduledDay: 15,
                requiresPhoto: true,
                category: 'maintenance',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Evaluación de desempeño',
                description: 'Completar autoevaluación de desempeño mensual.',
                frequency: 'monthly',
                scheduledDay: 25,
                requiresPhoto: false,
                category: 'administrative',
                priority: 'low',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Limpieza profunda de instalaciones',
                description: 'Realizar limpieza profunda de todas las áreas incluyendo ventanas, alfombras y sanitarios.',
                frequency: 'monthly',
                scheduledDay: 1,
                requiresPhoto: true,
                category: 'cleaning',
                priority: 'medium',
                createdById: lider.id
            }
        }),
    ])

    console.log(`✅ Created ${tasks.length} task templates`)

    // Assign all tasks to the employee
    console.log('📌 Assigning tasks to employee...')

    const assignments = await Promise.all(
        tasks.map(task =>
            prisma.taskAssignment.create({
                data: {
                    taskTemplateId: task.id,
                    employeeId: employee.id,
                    isActive: true
                }
            })
        )
    )

    console.log(`✅ Created ${assignments.length} task assignments`)

    // Create some sample completions for testing
    console.log('✅ Creating sample completions...')

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Complete some tasks from yesterday
    const completions = await Promise.all([
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[0].id, // Revisión de equipos
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Todos los equipos funcionando correctamente.'
            }
        }),
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[1].id, // Limpieza
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Área de trabajo limpia y ordenada.'
            }
        }),
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[2].id, // Registro asistencia
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: false,
                notes: 'Llegué 10 minutos tarde.'
            }
        }),
    ])

    console.log(`✅ Created ${completions.length} sample completions`)

    console.log('\n📊 Checklist Seed Summary:')
    console.log(`  - ${tasks.length} task templates created`)
    console.log(`  - ${assignments.length} assignments created`)
    console.log(`  - ${completions.length} sample completions`)
    console.log('\n📋 Tasks by frequency:')
    console.log('  - 3 daily tasks')
    console.log('  - 3 weekly tasks')
    console.log('  - 4 monthly tasks')
    console.log('\n📋 Tasks by category:')
    console.log('  - 2 cleaning tasks')
    console.log('  - 2 maintenance tasks')
    console.log('  - 3 administrative tasks')
    console.log('  - 2 security tasks')
    console.log('  - 1 inventory task')
    console.log('\n🌱 Checklist seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Checklist seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
