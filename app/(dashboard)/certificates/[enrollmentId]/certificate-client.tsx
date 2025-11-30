"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, Download, Share2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CertificateClientProps {
    studentName: string
    courseTitle: string
    instructorName: string
    completionDate: string
}

export function CertificateClient({
    studentName,
    courseTitle,
    instructorName,
    completionDate
}: CertificateClientProps) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
            <div className="mb-8 print:hidden w-full max-w-4xl flex items-center justify-between">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        Certificate of Completion
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Official verification of your achievement
                    </p>
                </div>
                <div className="w-[100px]"></div> {/* Spacer */}
            </div>

            {/* Certificate Container */}
            <div className="bg-white text-gray-900 w-full max-w-4xl aspect-[1.414/1] shadow-2xl rounded-xl p-12 relative overflow-hidden border-8 border-double border-gray-200 print:shadow-none print:border-4 print:w-full print:h-screen print:rounded-none print:m-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative z-10 h-full flex flex-col items-center justify-between text-center border-4 border-indigo-900/10 p-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center justify-center mb-6">
                            <GraduationCap className="h-16 w-16 text-indigo-600" />
                        </div>
                        <h2 className="text-5xl font-serif font-bold text-indigo-900 mb-2 tracking-wide">
                            CERTIFICATE
                        </h2>
                        <p className="text-xl text-indigo-600 font-medium uppercase tracking-widest">
                            OF COMPLETION
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <p className="text-lg text-gray-500 italic">This certifies that</p>

                        <h3 className="text-4xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-12 inline-block min-w-[400px]">
                            {studentName}
                        </h3>

                        <p className="text-lg text-gray-500 italic">has successfully completed the course</p>

                        <h4 className="text-3xl font-bold text-indigo-700">
                            {courseTitle}
                        </h4>

                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Demonstrating dedication and mastery of the curriculum provided by LearnFlow AI.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="w-full flex justify-between items-end mt-12">
                        <div className="text-left">
                            <p className="text-sm text-gray-400 mb-1">Date Issued</p>
                            <p className="font-medium text-gray-900 border-t border-gray-300 pt-1 px-4">
                                {completionDate}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto mb-2 opacity-20">
                                {/* Seal Placeholder */}
                                <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-900 fill-current">
                                    <circle cx="50" cy="50" r="45" />
                                    <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 65 L30 75 L35 55 L20 40 L40 40 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-400 mb-1">Instructor</p>
                            <p className="font-medium text-gray-900 border-t border-gray-300 pt-1 px-4 font-signature">
                                {instructorName}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 print:hidden">
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                    onClick={() => window.print()}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download / Print
                </Button>
                <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
            </div>
        </div>
    )
}
