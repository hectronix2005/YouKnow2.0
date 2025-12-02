"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CreateCoursePage() {
    const router = useRouter()
    const [title, setTitle] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            })

            if (!response.ok) throw new Error("Failed to create course")

            const course = await response.json()
            router.push(`/creador/courses/${course.id}`)
        } catch (error) {
            console.error(error)
            // Show error toast
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Name your course</h1>
            <p className="text-gray-500 mb-8">
                What would you like to name your course? Don't worry, you can change this later.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Advanced Web Development"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/creador">
                        <Button type="button" variant="ghost">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={!title || isLoading}>
                        {isLoading ? "Creating..." : "Continue"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
