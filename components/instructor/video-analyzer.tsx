"use client"

import { useState } from "react"

export function VideoAnalyzer() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return
        setIsAnalyzing(true)
        // TODO: Implementar análisis de video con IA
        setTimeout(() => setIsAnalyzing(false), 2000)
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                />
                <label
                    htmlFor="video-upload"
                    className="cursor-pointer flex flex-col items-center"
                >
                    <svg
                        className="w-12 h-12 text-gray-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 mb-2">
                        {file ? file.name : "Arrastra un video o haz clic para seleccionar"}
                    </span>
                    <span className="text-sm text-gray-500">
                        MP4, WebM, MOV (máx. 500MB)
                    </span>
                </label>
            </div>

            {file && (
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                >
                    {isAnalyzing ? "Analizando..." : "Analizar Video con IA"}
                </button>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Funcionalidad en desarrollo - Próximamente disponible
            </p>
        </div>
    )
}
