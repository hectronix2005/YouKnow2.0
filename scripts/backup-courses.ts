/**
 * Script de Backup de Cursos
 *
 * Crea un backup local de todos los cursos, módulos y lecciones
 * en formato JSON para poder restaurarlos si es necesario.
 *
 * Uso:
 *   npx tsx scripts/backup-courses.ts
 *   npx tsx scripts/backup-courses.ts --restore backup-2025-12-01.json
 */

import { prisma } from '../lib/db'
import * as fs from 'fs'
import * as path from 'path'

const BACKUP_DIR = path.join(process.cwd(), 'backups')

interface CourseBackup {
    id: string
    title: string
    subtitle: string | null
    description: string
    slug: string
    category: string
    level: string
    thumbnail: string | null
    price: number
    isFree: boolean
    status: string
    publishedAt: Date | null
    createdAt: Date
    instructorId: string
    instructorEmail: string
    instructorName: string
    modules: ModuleBackup[]
}

interface ModuleBackup {
    id: string
    title: string
    description: string | null
    orderIndex: number
    lessons: LessonBackup[]
}

interface LessonBackup {
    id: string
    title: string
    description: string | null
    orderIndex: number
    lessonType: string
    videoUrl: string | null
    videoDuration: number | null
    articleContent: string | null
    isPreview: boolean
    transcription: string | null
    transcriptSegments: string | null
}

async function createBackup() {
    console.log('\n📦 Creando backup de cursos...\n')

    // Crear directorio de backups si no existe
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Obtener todos los cursos con sus relaciones
    const courses = await prisma.course.findMany({
        include: {
            instructor: {
                select: { id: true, email: true, name: true }
            },
            modules: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    lessons: {
                        orderBy: { orderIndex: 'asc' }
                    }
                }
            }
        }
    })

    if (courses.length === 0) {
        console.log('⚠️  No hay cursos para respaldar.')
        return
    }

    // Formatear datos para backup
    const backupData: CourseBackup[] = courses.map(course => ({
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        slug: course.slug,
        category: course.category,
        level: course.level,
        thumbnail: course.thumbnail,
        price: course.price,
        isFree: course.isFree,
        status: course.status,
        publishedAt: course.publishedAt,
        createdAt: course.createdAt,
        instructorId: course.instructorId,
        instructorEmail: course.instructor.email,
        instructorName: course.instructor.name,
        modules: course.modules.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            lessons: module.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                orderIndex: lesson.orderIndex,
                lessonType: lesson.lessonType,
                videoUrl: lesson.videoUrl,
                videoDuration: lesson.videoDuration,
                articleContent: lesson.articleContent,
                isPreview: lesson.isPreview,
                transcription: lesson.transcription,
                transcriptSegments: lesson.transcriptSegments
            }))
        }))
    }))

    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = `backup-courses-${timestamp}.json`
    const filepath = path.join(BACKUP_DIR, filename)

    // Guardar backup
    const backupContent = {
        createdAt: new Date().toISOString(),
        totalCourses: courses.length,
        totalModules: courses.reduce((acc, c) => acc + c.modules.length, 0),
        totalLessons: courses.reduce((acc, c) => acc + c.modules.reduce((acc2, m) => acc2 + m.lessons.length, 0), 0),
        courses: backupData
    }

    fs.writeFileSync(filepath, JSON.stringify(backupContent, null, 2))

    console.log('✅ Backup creado exitosamente!')
    console.log(`\n📁 Archivo: ${filepath}`)
    console.log(`\n📊 Resumen:`)
    console.log(`   - Cursos: ${backupContent.totalCourses}`)
    console.log(`   - Módulos: ${backupContent.totalModules}`)
    console.log(`   - Lecciones: ${backupContent.totalLessons}`)

    // Mostrar cursos respaldados
    console.log('\n📚 Cursos respaldados:')
    backupData.forEach((course, i) => {
        console.log(`   ${i + 1}. ${course.title}`)
        console.log(`      Instructor: ${course.instructorName} (${course.instructorEmail})`)
        console.log(`      Módulos: ${course.modules.length}`)
    })

    console.log('\n💡 Para restaurar, usa:')
    console.log(`   npx tsx scripts/backup-courses.ts --restore ${filename}`)
}

async function restoreBackup(filename: string) {
    console.log(`\n📂 Restaurando backup: ${filename}\n`)

    const filepath = path.join(BACKUP_DIR, filename)

    if (!fs.existsSync(filepath)) {
        console.error(`❌ Archivo no encontrado: ${filepath}`)
        process.exit(1)
    }

    const backupContent = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
    const courses: CourseBackup[] = backupContent.courses

    console.log(`📊 Backup contiene:`)
    console.log(`   - Cursos: ${backupContent.totalCourses}`)
    console.log(`   - Módulos: ${backupContent.totalModules}`)
    console.log(`   - Lecciones: ${backupContent.totalLessons}`)
    console.log(`   - Fecha: ${backupContent.createdAt}`)

    let restored = 0
    let skipped = 0

    for (const courseData of courses) {
        // Verificar si el curso ya existe (por slug)
        const existingCourse = await prisma.course.findUnique({
            where: { slug: courseData.slug }
        })

        if (existingCourse) {
            console.log(`⏭️  Saltando "${courseData.title}" (ya existe)`)
            skipped++
            continue
        }

        // Verificar que el instructor existe
        let instructorId = courseData.instructorId
        const instructor = await prisma.user.findUnique({
            where: { id: instructorId }
        })

        if (!instructor) {
            // Buscar por email
            const instructorByEmail = await prisma.user.findUnique({
                where: { email: courseData.instructorEmail }
            })
            if (instructorByEmail) {
                instructorId = instructorByEmail.id
            } else {
                console.log(`⚠️  Instructor no encontrado para "${courseData.title}", saltando...`)
                skipped++
                continue
            }
        }

        // Crear curso con módulos y lecciones
        try {
            await prisma.course.create({
                data: {
                    title: courseData.title,
                    subtitle: courseData.subtitle,
                    description: courseData.description,
                    slug: courseData.slug,
                    category: courseData.category,
                    level: courseData.level,
                    thumbnail: courseData.thumbnail,
                    price: courseData.price,
                    isFree: courseData.isFree,
                    status: courseData.status,
                    publishedAt: courseData.publishedAt ? new Date(courseData.publishedAt) : null,
                    instructorId: instructorId,
                    modules: {
                        create: courseData.modules.map(module => ({
                            title: module.title,
                            description: module.description,
                            orderIndex: module.orderIndex,
                            lessons: {
                                create: module.lessons.map(lesson => ({
                                    title: lesson.title,
                                    description: lesson.description,
                                    orderIndex: lesson.orderIndex,
                                    lessonType: lesson.lessonType,
                                    videoUrl: lesson.videoUrl,
                                    videoDuration: lesson.videoDuration,
                                    articleContent: lesson.articleContent,
                                    isPreview: lesson.isPreview,
                                    transcription: lesson.transcription,
                                    transcriptSegments: lesson.transcriptSegments
                                }))
                            }
                        }))
                    }
                }
            })
            console.log(`✅ Restaurado: "${courseData.title}"`)
            restored++
        } catch (error) {
            console.error(`❌ Error restaurando "${courseData.title}":`, error)
        }
    }

    console.log(`\n📊 Resumen de restauración:`)
    console.log(`   - Restaurados: ${restored}`)
    console.log(`   - Saltados (ya existían): ${skipped}`)
}

async function listBackups() {
    console.log('\n📁 Backups disponibles:\n')

    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('   No hay backups todavía.')
        return
    }

    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()

    if (files.length === 0) {
        console.log('   No hay backups todavía.')
        return
    }

    for (const file of files) {
        const filepath = path.join(BACKUP_DIR, file)
        const stats = fs.statSync(filepath)
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
        console.log(`   📦 ${file}`)
        console.log(`      Cursos: ${content.totalCourses}, Tamaño: ${(stats.size / 1024).toFixed(1)} KB`)
        console.log('')
    }
}

async function main() {
    const args = process.argv.slice(2)

    if (args.includes('--restore') && args.length >= 2) {
        const filename = args[args.indexOf('--restore') + 1]
        await restoreBackup(filename)
    } else if (args.includes('--list')) {
        await listBackups()
    } else {
        await createBackup()
    }

    await prisma.$disconnect()
}

main().catch(console.error)
