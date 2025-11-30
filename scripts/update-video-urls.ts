/**
 * Script para actualizar las URLs de videos en lecciones existentes
 * Ejecutar con: npx tsx scripts/update-video-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Videos de muestra confiables de Google Cloud Storage
const SAMPLE_VIDEOS = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
]

async function main() {
    console.log('🎬 Actualizando URLs de videos...\n')

    // Obtener todas las lecciones de tipo video
    const lessons = await prisma.lesson.findMany({
        where: {
            lessonType: 'video'
        },
        include: {
            module: {
                include: {
                    course: true
                }
            }
        },
        orderBy: [
            { module: { courseId: 'asc' } },
            { module: { orderIndex: 'asc' } },
            { orderIndex: 'asc' }
        ]
    })

    console.log(`📚 Encontradas ${lessons.length} lecciones de video\n`)

    let updated = 0
    let skipped = 0

    for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i]
        const videoUrl = SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length]

        // Verificar si la URL actual es diferente o está vacía
        const needsUpdate = !lesson.videoUrl ||
            lesson.videoUrl.includes('commondatastorage') || // URL vieja
            !lesson.videoUrl.startsWith('https://storage.googleapis.com')

        if (needsUpdate) {
            await prisma.lesson.update({
                where: { id: lesson.id },
                data: { videoUrl }
            })
            updated++
            console.log(`✅ ${lesson.module.course.title.slice(0, 30)}... > ${lesson.title.slice(0, 40)}...`)
        } else {
            skipped++
        }
    }

    console.log(`\n📊 Resumen:`)
    console.log(`   - Actualizadas: ${updated} lecciones`)
    console.log(`   - Sin cambios: ${skipped} lecciones`)
    console.log(`\n✨ ¡Actualización completada!`)
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
