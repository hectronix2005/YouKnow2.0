import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('📋 Starting comprehensive checklist seed...')

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

    // Create task templates by category
    console.log('📝 Creating task templates...')

    const tasks = await Promise.all([
        // ============================================
        // CLEANING - Tareas de Limpieza (5 tareas)
        // ============================================
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
                title: 'Desinfección de superficies',
                description: 'Limpiar y desinfectar todas las superficies de contacto frecuente: manijas, teclados, teléfonos.',
                frequency: 'daily',
                scheduledTime: '10:00',
                requiresPhoto: false,
                category: 'cleaning',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Limpieza de baños',
                description: 'Verificar y limpiar los baños. Reponer jabón, papel y toallas.',
                frequency: 'daily',
                scheduledTime: '14:00',
                requiresPhoto: true,
                category: 'cleaning',
                priority: 'high',
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
        prisma.taskTemplate.create({
            data: {
                title: 'Organización de almacén',
                description: 'Ordenar y limpiar el área de almacén. Desechar materiales obsoletos.',
                frequency: 'weekly',
                scheduledDay: 6, // Sábado
                requiresPhoto: true,
                category: 'cleaning',
                priority: 'low',
                createdById: lider.id
            }
        }),

        // ============================================
        // MAINTENANCE - Tareas de Mantenimiento (5 tareas)
        // ============================================
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
                title: 'Verificación de aire acondicionado',
                description: 'Comprobar funcionamiento del sistema de climatización. Reportar temperaturas anormales.',
                frequency: 'daily',
                scheduledTime: '08:30',
                requiresPhoto: false,
                category: 'maintenance',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Revisión de instalaciones eléctricas',
                description: 'Inspeccionar cables, enchufes y conexiones eléctricas visibles. Reportar anomalías.',
                frequency: 'weekly',
                scheduledDay: 2, // Martes
                requiresPhoto: true,
                category: 'maintenance',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Mantenimiento preventivo de equipos',
                description: 'Limpieza interna de equipos de cómputo y verificación de actualizaciones de software.',
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
                title: 'Revisión de mobiliario',
                description: 'Inspeccionar sillas, mesas y estantes. Reportar daños o necesidad de reparación.',
                frequency: 'monthly',
                scheduledDay: 20,
                requiresPhoto: true,
                category: 'maintenance',
                priority: 'low',
                createdById: lider.id
            }
        }),

        // ============================================
        // ADMINISTRATIVE - Tareas Administrativas (5 tareas)
        // ============================================
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
        prisma.taskTemplate.create({
            data: {
                title: 'Actualización de bitácora',
                description: 'Registrar las actividades realizadas durante el día en la bitácora digital.',
                frequency: 'daily',
                scheduledTime: '17:00',
                requiresPhoto: false,
                category: 'administrative',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Revisión de correos pendientes',
                description: 'Revisar y responder correos electrónicos pendientes. Archivar los resueltos.',
                frequency: 'daily',
                scheduledTime: '09:30',
                requiresPhoto: false,
                category: 'administrative',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Reporte semanal de actividades',
                description: 'Elaborar resumen de actividades realizadas durante la semana.',
                frequency: 'weekly',
                scheduledDay: 5, // Viernes
                requiresPhoto: false,
                category: 'administrative',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Reporte mensual de actividades',
                description: 'Elaborar reporte completo con las actividades realizadas durante el mes.',
                frequency: 'monthly',
                scheduledDay: 28,
                requiresPhoto: false,
                category: 'administrative',
                priority: 'high',
                createdById: lider.id
            }
        }),

        // ============================================
        // SECURITY - Tareas de Seguridad (5 tareas)
        // ============================================
        prisma.taskTemplate.create({
            data: {
                title: 'Verificación de cerraduras',
                description: 'Comprobar que todas las puertas y ventanas cierren correctamente.',
                frequency: 'daily',
                scheduledTime: '18:00',
                requiresPhoto: false,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Respaldo de información',
                description: 'Realizar respaldo de archivos importantes en el servidor o nube.',
                frequency: 'daily',
                scheduledTime: '17:30',
                requiresPhoto: false,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Inspección de extintores',
                description: 'Verificar que los extintores estén en su lugar, cargados y con fecha de vencimiento vigente.',
                frequency: 'weekly',
                scheduledDay: 3, // Miércoles
                requiresPhoto: true,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Revisión de salidas de emergencia',
                description: 'Verificar que las salidas de emergencia estén libres de obstáculos y señalizadas.',
                frequency: 'weekly',
                scheduledDay: 1, // Lunes
                requiresPhoto: true,
                category: 'security',
                priority: 'high',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Revisión de botiquín',
                description: 'Verificar contenido del botiquín de primeros auxilios. Reportar medicamentos vencidos o faltantes.',
                frequency: 'monthly',
                scheduledDay: 5,
                requiresPhoto: true,
                category: 'security',
                priority: 'medium',
                createdById: lider.id
            }
        }),

        // ============================================
        // INVENTORY - Tareas de Inventario (5 tareas)
        // ============================================
        prisma.taskTemplate.create({
            data: {
                title: 'Conteo de materiales de oficina',
                description: 'Realizar conteo de papelería, bolígrafos, folders y otros materiales de oficina.',
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
                title: 'Verificación de stock de limpieza',
                description: 'Revisar existencias de productos de limpieza. Solicitar reposición si es necesario.',
                frequency: 'weekly',
                scheduledDay: 4, // Jueves
                requiresPhoto: false,
                category: 'inventory',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Inventario de equipos tecnológicos',
                description: 'Actualizar registro de computadoras, monitores, impresoras y otros equipos.',
                frequency: 'monthly',
                scheduledDay: 10,
                requiresPhoto: true,
                category: 'inventory',
                priority: 'medium',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Inventario de mobiliario',
                description: 'Conteo y verificación del estado de muebles: sillas, mesas, archiveros.',
                frequency: 'monthly',
                scheduledDay: 25,
                requiresPhoto: true,
                category: 'inventory',
                priority: 'low',
                createdById: lider.id
            }
        }),
        prisma.taskTemplate.create({
            data: {
                title: 'Reporte de bajas de inventario',
                description: 'Documentar y reportar equipos o materiales dados de baja durante el mes.',
                frequency: 'monthly',
                scheduledDay: 30,
                requiresPhoto: false,
                category: 'inventory',
                priority: 'low',
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

    // Complete some tasks from yesterday (mix of on-time and late)
    const completions = await Promise.all([
        // Cleaning tasks
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[0].id, // Limpieza área
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Área de trabajo limpia y ordenada.'
            }
        }),
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[1].id, // Desinfección
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Superficies desinfectadas correctamente.'
            }
        }),
        // Maintenance tasks
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[5].id, // Revisión equipos
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Todos los equipos funcionando correctamente.'
            }
        }),
        // Administrative tasks
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[10].id, // Registro asistencia
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: false,
                notes: 'Llegué 10 minutos tarde por tráfico.'
            }
        }),
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[11].id, // Bitácora
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Bitácora actualizada con todas las actividades del día.'
            }
        }),
        // Security tasks
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[15].id, // Cerraduras
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: true,
                notes: 'Todas las puertas y ventanas aseguradas.'
            }
        }),
        prisma.taskCompletion.create({
            data: {
                assignmentId: assignments[16].id, // Respaldo
                scheduledDate: yesterday,
                status: 'completed',
                completedOnTime: false,
                notes: 'Respaldo completado con 15 min de retraso por lentitud del servidor.'
            }
        }),
    ])

    console.log(`✅ Created ${completions.length} sample completions`)

    // Summary by category
    const categories = {
        cleaning: tasks.filter(t => t.category === 'cleaning').length,
        maintenance: tasks.filter(t => t.category === 'maintenance').length,
        administrative: tasks.filter(t => t.category === 'administrative').length,
        security: tasks.filter(t => t.category === 'security').length,
        inventory: tasks.filter(t => t.category === 'inventory').length,
    }

    const frequencies = {
        daily: tasks.filter(t => t.frequency === 'daily').length,
        weekly: tasks.filter(t => t.frequency === 'weekly').length,
        monthly: tasks.filter(t => t.frequency === 'monthly').length,
    }

    console.log('\n📊 Checklist Seed Summary:')
    console.log(`  - ${tasks.length} task templates created`)
    console.log(`  - ${assignments.length} assignments created`)
    console.log(`  - ${completions.length} sample completions`)

    console.log('\n📋 Tasks by frequency:')
    console.log(`  - ${frequencies.daily} daily tasks`)
    console.log(`  - ${frequencies.weekly} weekly tasks`)
    console.log(`  - ${frequencies.monthly} monthly tasks`)

    console.log('\n📋 Tasks by category:')
    console.log(`  - ${categories.cleaning} cleaning tasks`)
    console.log(`  - ${categories.maintenance} maintenance tasks`)
    console.log(`  - ${categories.administrative} administrative tasks`)
    console.log(`  - ${categories.security} security tasks`)
    console.log(`  - ${categories.inventory} inventory tasks`)

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
