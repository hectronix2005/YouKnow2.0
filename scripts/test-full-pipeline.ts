
import { VideoExtractor } from '../lib/video-processing/extractor'
import { FrameAnalyzer } from '../lib/video-processing/frame-analyzer'
import { AudioTranscriber } from '../lib/video-processing/audio-transcriber'
import { MetadataGenerator } from '../lib/video-processing/metadata-generator'
import { YouTubeDownloader } from '../lib/video-processing/youtube-downloader'
import path from 'path'
import fs from 'fs'

async function testFullPipeline() {
    const youtubeUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw' // Me at the zoo (short video)
    const tempDir = path.join(process.cwd(), 'temp')

    console.log('🚀 Starting Full Pipeline Test...')
    console.log(`📂 Temp dir: ${tempDir}`)

    let tempVideoPath: string | null = null

    try {
        // 0. Download
        console.log('\n📥 Step 0: Downloading YouTube video...')
        const youtubeDownloader = new YouTubeDownloader(tempDir)
        tempVideoPath = await youtubeDownloader.downloadVideo(youtubeUrl)
        console.log(`  ✅ Downloaded to: ${tempVideoPath}`)

        // 1. Extract Metadata
        console.log('\n📊 Step 1: Extracting basic metadata...')
        const extractor = new VideoExtractor(tempDir)
        const basicMetadata = await extractor.getMetadata(tempVideoPath)
        console.log('  ✅ Metadata:', basicMetadata)

        // 2. Extract Frames
        console.log('\n🖼️  Step 2: Extracting frames...')
        const framePaths = await extractor.extractFrames(tempVideoPath, 3)
        console.log(`  ✅ Extracted ${framePaths.length} frames`)

        // 3. Analyze Frames
        console.log('\n🤖 Step 3: Analyzing frames with AI...')
        const frameAnalyzer = new FrameAnalyzer()
        await frameAnalyzer.initialize()
        const frameAnalysis = await frameAnalyzer.analyzeFrames(framePaths)
        console.log('  ✅ Frame Analysis:', frameAnalysis)

        // 4. Transcribe Audio
        console.log('\n🎤 Step 4: Transcribing audio...')
        const audioPath = await extractor.extractAudio(tempVideoPath)
        console.log(`  ✅ Audio extracted to: ${audioPath}`)

        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found at ${audioPath}`)
        }
        const stats = fs.statSync(audioPath)
        console.log(`  📊 Audio file size: ${stats.size} bytes`)

        const transcriber = new AudioTranscriber()
        await transcriber.initialize('tiny')
        const transcript = await transcriber.transcribe(audioPath, 'spanish')
        console.log(`  ✅ Transcript (${transcript.text.length} chars):`, transcript.text.substring(0, 100) + '...')

        // 5. Generate Thumbnail
        console.log('\n📸 Step 5: Generating thumbnail...')
        const thumbnailPath = await extractor.generateThumbnail(tempVideoPath)
        console.log(`  ✅ Thumbnail: ${thumbnailPath}`)

        // 6. Generate Metadata
        console.log('\n📝 Step 6: Generating final metadata...')
        const generator = new MetadataGenerator()
        const generatedMetadata = await generator.generate(
            transcript.text,
            frameAnalysis,
            basicMetadata.duration
        )
        console.log('  ✅ Generated Metadata:', generatedMetadata)

        console.log('\n✨ Test Complete! Success!')

    } catch (error) {
        console.error('\n❌ Test Failed:', error)
    } finally {
        if (tempVideoPath) {
            console.log('\n🧹 Cleaning up...')
            // await fs.promises.unlink(tempVideoPath).catch(() => {})
        }
    }
}

testFullPipeline()
