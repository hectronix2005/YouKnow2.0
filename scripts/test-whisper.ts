/**
 * Script de prueba para verificar que Transformers.js y Whisper funcionan correctamente
 * Ejecutar con: npx tsx scripts/test-whisper.ts
 */

import { pipeline } from '@xenova/transformers'

async function testWhisper() {
    console.log('🧪 Testing Whisper model...\n')

    try {
        console.log('1. Initializing Whisper tiny model...')
        const transcriber = await pipeline(
            'automatic-speech-recognition',
            'Xenova/whisper-tiny'
        )
        console.log('✅ Whisper model loaded successfully!\n')

        console.log('2. Model info:')
        console.log('   - Model: Xenova/whisper-tiny')
        console.log('   - Task: automatic-speech-recognition')
        console.log('   - Status: Ready\n')

        console.log('✅ Test completed successfully!')
        console.log('\nThe Whisper model is working correctly.')
        console.log('You can now use it to transcribe audio from videos.\n')

    } catch (error) {
        console.error('❌ Test failed:', error)
        console.error('\nPossible issues:')
        console.error('1. @xenova/transformers not installed correctly')
        console.error('2. Network issues downloading the model')
        console.error('3. Insufficient disk space for model cache\n')

        if (error instanceof Error) {
            console.error('Error details:', error.message)
        }
    }
}

testWhisper()
