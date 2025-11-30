"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle, Loader2, RefreshCw, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Videos de fallback confiables (videos de dominio público)
const FALLBACK_VIDEOS = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
]

// Helper para detectar y extraer ID de YouTube
function getYouTubeId(url: string): string | null {
    if (!url) return null
    // Soporta múltiples formatos de URL de YouTube
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}

function isYouTubeUrl(url: string): boolean {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
}

// Componente para reproductor de YouTube
function YouTubePlayer({
    videoId,
    title,
    onEnded,
    className
}: {
    videoId: string
    title?: string
    onEnded?: () => void
    className?: string
}) {
    const [isLoading, setIsLoading] = useState(true)

    // Timeout de seguridad: ocultar loading después de 2 segundos máximo
    // ya que el onLoad de iframes cross-origin puede no dispararse
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timeout)
    }, [videoId])

    return (
        <div className={cn(
            "relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl",
            className
        )}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-sm opacity-80">Cargando video...</p>
                    </div>
                </div>
            )}
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=0&disablekb=1`}
                title={title || "Video de YouTube"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
            />
            {/* Indicador de YouTube */}
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
                <Youtube className="h-3 w-3" />
                YouTube
            </div>
        </div>
    )
}

interface VideoPlayerProps {
    src?: string | null
    poster?: string
    title?: string
    description?: string
    onTimeUpdate?: (currentTime: number, duration: number) => void
    onEnded?: () => void
    onError?: (error: string) => void
    initialTime?: number
    className?: string
}

type VideoState = "loading" | "ready" | "playing" | "paused" | "error" | "retrying"

export function VideoPlayer({
    src,
    poster,
    title,
    description,
    onTimeUpdate,
    onEnded,
    onError,
    initialTime = 0,
    className
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [videoState, setVideoState] = useState<VideoState>("loading")
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [retryCount, setRetryCount] = useState(0)
    const [currentSrcIndex, setCurrentSrcIndex] = useState(0)
    const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)

    const MAX_RETRIES = 3
    const RETRY_DELAY = 2000 // 2 segundos entre reintentos

    // Lista de fuentes a intentar
    const videoSources = src ? [src, ...FALLBACK_VIDEOS] : FALLBACK_VIDEOS

    // Obtener la URL actual
    const currentSrc = videoSources[currentSrcIndex]

    // Manejar errores de video
    const handleVideoError = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        const error = video.error
        let message = "Error al cargar el video"

        if (error) {
            switch (error.code) {
                case MediaError.MEDIA_ERR_ABORTED:
                    message = "La carga del video fue cancelada"
                    break
                case MediaError.MEDIA_ERR_NETWORK:
                    message = "Error de red al cargar el video"
                    break
                case MediaError.MEDIA_ERR_DECODE:
                    message = "Error al decodificar el video"
                    break
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    message = "Formato de video no soportado"
                    break
            }
        }

        console.warn(`Video error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, message)

        // Intentar con la siguiente fuente
        if (currentSrcIndex < videoSources.length - 1) {
            setVideoState("retrying")
            setCurrentSrcIndex(prev => prev + 1)
            setRetryCount(0)
        } else if (retryCount < MAX_RETRIES) {
            // Reintentar con la misma fuente
            setVideoState("retrying")
            setTimeout(() => {
                setRetryCount(prev => prev + 1)
                if (videoRef.current) {
                    videoRef.current.load()
                }
            }, RETRY_DELAY)
        } else {
            // Todos los intentos fallaron
            setVideoState("error")
            setErrorMessage(message)
            onError?.(message)
        }
    }, [retryCount, currentSrcIndex, videoSources.length, onError])

    // Cuando el video está listo
    const handleCanPlay = useCallback(() => {
        setVideoState("ready")
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
            if (initialTime > 0) {
                videoRef.current.currentTime = initialTime
            }
        }
    }, [initialTime])

    const [maxWatchedTime, setMaxWatchedTime] = useState(0)
    const [showSeekWarning, setShowSeekWarning] = useState(false)

    // Reset max watched time when source changes
    useEffect(() => {
        setMaxWatchedTime(0)
        setCurrentTime(0)
    }, [currentSrc])

    // Actualización del tiempo
    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime
            const dur = videoRef.current.duration
            setCurrentTime(current)

            // Update max watched time
            if (current > maxWatchedTime) {
                setMaxWatchedTime(current)
            }

            onTimeUpdate?.(current, dur)
        }
    }, [onTimeUpdate, maxWatchedTime])

    // Controles de reproducción
    const togglePlay = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            video.play().then(() => {
                setVideoState("playing")
            }).catch((err) => {
                console.error("Error playing video:", err)
                // Algunos navegadores bloquean autoplay, mostrar controles
                setVideoState("paused")
            })
        } else {
            video.pause()
            setVideoState("paused")
        }
    }, [])

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }, [isMuted])

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
            setVolume(newVolume)
            setIsMuted(newVolume === 0)
        }
    }, [])

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)

        // Prevent seeking forward beyond max watched time
        // Allow a small buffer (e.g., 1 second)
        if (time > maxWatchedTime + 1) {
            setShowSeekWarning(true)
            setTimeout(() => setShowSeekWarning(false), 3000)
            return
        }

        if (videoRef.current) {
            videoRef.current.currentTime = time
            setCurrentTime(time)
        }
    }, [maxWatchedTime])

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => {
                setIsFullscreen(true)
            }).catch(console.error)
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false)
            }).catch(console.error)
        }
    }, [])

    const handleRetry = useCallback(() => {
        setRetryCount(0)
        setCurrentSrcIndex(0)
        setVideoState("loading")
        if (videoRef.current) {
            videoRef.current.load()
        }
    }, [])

    // Formatear tiempo
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return "0:00"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Auto-ocultar controles
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
            if (videoState === "playing") {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false)
                }, 3000)
            }
        }

        const container = containerRef.current
        container?.addEventListener("mousemove", handleMouseMove)

        return () => {
            container?.removeEventListener("mousemove", handleMouseMove)
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [videoState])

    // Listener para fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    // Si no hay video disponible
    if (!currentSrc) {
        return (
            <div className={cn(
                "relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden flex items-center justify-center",
                className
            )}>
                <div className="text-center text-white p-6 max-w-md">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Play className="h-8 w-8 ml-1 opacity-50" />
                    </div>
                    <p className="text-lg font-medium opacity-80 mb-2">
                        Video no disponible
                    </p>
                    {description && (
                        <p className="text-sm opacity-60 mt-4">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Si es un video de YouTube, usar el reproductor de YouTube
    const youtubeId = src ? getYouTubeId(src) : null
    if (youtubeId) {
        return (
            <YouTubePlayer
                videoId={youtubeId}
                title={title}
                onEnded={onEnded}
                className={className}
            />
        )
    }

    // Reproductor HTML5 para videos MP4/WebM directos
    return (
        <div
            ref={containerRef}
            className={cn(
                "relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl",
                className
            )}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="h-full w-full"
                poster={poster}
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onEnded}
                onError={handleVideoError}
                onPlay={() => setVideoState("playing")}
                onPause={() => setVideoState("paused")}
                onWaiting={() => setVideoState("loading")}
                onPlaying={() => setVideoState("playing")}
                playsInline
                preload="metadata"
                key={currentSrc} // Forzar re-render cuando cambia la fuente
            >
                <source src={currentSrc} type="video/mp4" />
                <source src={currentSrc} type="video/webm" />
                Tu navegador no soporta la reproducción de video.
            </video>

            {/* Estado de carga */}
            {(videoState === "loading" || videoState === "retrying") && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                        <p className="text-sm opacity-80">
                            {videoState === "retrying"
                                ? `Reintentando... (fuente ${currentSrcIndex + 1}/${videoSources.length})`
                                : "Cargando video..."
                            }
                        </p>
                    </div>
                </div>
            )}

            {/* Estado de error */}
            {videoState === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                    <div className="text-center text-white p-6 max-w-md">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <p className="text-lg font-medium mb-2">No se pudo cargar el video</p>
                        <p className="text-sm opacity-60 mb-6">{errorMessage}</p>
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </div>
            )}

            {/* Overlay para play/pause al hacer click */}
            {videoState !== "loading" && videoState !== "error" && videoState !== "retrying" && (
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={togglePlay}
                />
            )}

            {/* Botón de play central (cuando está pausado) */}
            {videoState === "paused" && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110">
                        <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controles de video */}
            {videoState !== "loading" && videoState !== "error" && videoState !== "retrying" && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
                        showControls ? "opacity-100" : "opacity-0"
                    )}
                >
                    {/* Barra de progreso */}
                    <div className="mb-3 relative group/progress">
                        {/* Seek Warning Tooltip */}
                        {showSeekWarning && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-xs rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                                No puedes adelantar el video sin haberlo visto
                            </div>
                        )}

                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                                       [&::-webkit-slider-thumb]:appearance-none
                                       [&::-webkit-slider-thumb]:w-3
                                       [&::-webkit-slider-thumb]:h-3
                                       [&::-webkit-slider-thumb]:bg-white
                                       [&::-webkit-slider-thumb]:rounded-full
                                       [&::-webkit-slider-thumb]:shadow-lg
                                       hover:[&::-webkit-slider-thumb]:w-4
                                       hover:[&::-webkit-slider-thumb]:h-4
                                       transition-all relative z-10"
                            style={{
                                background: `linear-gradient(to right, 
                                    #6366f1 0%, 
                                    #6366f1 ${(currentTime / duration) * 100}%, 
                                    rgba(99, 102, 241, 0.3) ${(currentTime / duration) * 100}%,
                                    rgba(99, 102, 241, 0.3) ${(maxWatchedTime / duration) * 100}%,
                                    rgba(255,255,255,0.1) ${(maxWatchedTime / duration) * 100}%, 
                                    rgba(255,255,255,0.1) 100%)`
                            }}
                        />
                    </div>

                    {/* Controles inferiores */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {/* Play/Pause */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="text-white hover:text-indigo-300 transition-colors p-1"
                            >
                                {videoState === "playing" ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5" />
                                )}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center space-x-2 group/volume">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    className="text-white hover:text-indigo-300 transition-colors p-1"
                                >
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-5 w-5" />
                                    ) : (
                                        <Volume2 className="h-5 w-5" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                                               [&::-webkit-slider-thumb]:appearance-none
                                               [&::-webkit-slider-thumb]:w-2
                                               [&::-webkit-slider-thumb]:h-2
                                               [&::-webkit-slider-thumb]:bg-white
                                               [&::-webkit-slider-thumb]:rounded-full"
                                />
                            </div>

                            {/* Time */}
                            <span className="text-white text-sm font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Título del video */}
                            {title && (
                                <span className="text-white/60 text-sm truncate max-w-[200px] hidden sm:block">
                                    {title}
                                </span>
                            )}

                            {/* Fullscreen */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                                className="text-white hover:text-indigo-300 transition-colors p-1"
                            >
                                <Maximize className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicador de fuente alternativa */}
            {currentSrcIndex > 0 && videoState !== "error" && (
                <div className="absolute top-4 right-4 bg-yellow-500/80 text-black text-xs px-2 py-1 rounded">
                    Video alternativo
                </div>
            )}
        </div>
    )
}
