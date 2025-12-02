import { prisma } from '../lib/db'

async function checkUsers() {
    console.log('\n=== Checking Users ===\n')

    // Find Rariza
    const rariza = await prisma.user.findFirst({
        where: { email: 'Rariza@pibox.app' }
    })
    console.log('Rariza:', rariza ? { id: rariza.id, name: rariza.name, email: rariza.email, role: rariza.role } : 'NOT FOUND')

    // Find Andrea
    const andrea = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { contains: 'Andrea', mode: 'insensitive' } },
                { name: { contains: 'Andrea Lucero', mode: 'insensitive' } }
            ]
        }
    })
    console.log('Andrea:', andrea ? { id: andrea.id, name: andrea.name, email: andrea.email, role: andrea.role } : 'NOT FOUND')

    console.log('\n=== Checking Courses ===\n')

    // Get all courses
    const allCourses = await prisma.course.findMany({
        include: {
            instructor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log(`Total courses: ${allCourses.length}\n`)

    allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`)
        console.log(`   Instructor: ${course.instructor.name} (${course.instructor.email})`)
        console.log(`   Role: ${course.instructor.role}`)
        console.log(`   Status: ${course.status}`)
        console.log('')
    })

    await prisma.$disconnect()
}

checkUsers().catch(console.error)
