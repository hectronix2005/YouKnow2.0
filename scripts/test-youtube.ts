import { YouTubeDownloader } from '../lib/video-processing/youtube-downloader'
import path from 'path'
import fs from 'fs'

async function testYouTubeDownloader() {
    console.log('🧪 Testing YouTube Downloader...')

    const tempDir = path.join(process.cwd(), 'temp')
    const downloader = new YouTubeDownloader(tempDir)

    // Test video: "Big Buck Bunny 60fps 4K - Official Blender Foundation Short Film" (short clip version or similar if possible, but standard is fine)
    // Using a known safe, short video. "Test Video"
    const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw' // "Me at the zoo" - very short (19s)

    try {
        // 1. Test URL validation
        console.log('\n1. Testing URL validation...')
        const isValid = downloader.isYouTubeUrl(testUrl)
        console.log(`   URL ${testUrl} is valid: ${isValid}`)
        if (!isValid) throw new Error('URL validation failed')

        // 2. Test Video Info
        console.log('\n2. Getting video info...')
        const info = await downloader.getVideoInfo(testUrl)
        console.log('   Video Info:', info)
        if (!info.title) throw new Error('Failed to get video info')

        // 3. Test Download (Audio only for speed)
        console.log('\n3. Testing Audio Download...')
        const audioPath = await downloader.downloadAudio(testUrl)
        console.log(`   Audio downloaded to: ${audioPath}`)

        if (!fs.existsSync(audioPath)) {
            throw new Error('Audio file not found after download')
        }

        // 4. Cleanup
        console.log('\n4. Cleaning up...')
        await downloader.cleanup(audioPath)
        if (fs.existsSync(audioPath)) {
            throw new Error('Cleanup failed')
        }

        console.log('\n✅ YouTube Downloader Test Passed!')

    } catch (error) {
        console.error('\n❌ Test Failed:', error)
        process.exit(1)
    }
}

testYouTubeDownloader()
