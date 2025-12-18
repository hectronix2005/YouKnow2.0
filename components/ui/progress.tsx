import { cn } from "@/lib/utils"

interface ProgressProps {
    value: number
    className?: string
    showLabel?: boolean
    variant?: "default" | "success" | "warning" | "danger"
}

export function Progress({ value, className, showLabel = false, variant = "default" }: ProgressProps) {
    const percentage = Math.min(Math.max(value, 0), 100)

    const variants = {
        default: "bg-gradient-to-r from-[#46178f] to-[#1368ce]",
        success: "bg-gradient-to-r from-[#26890c] to-[#4ade80]",
        warning: "bg-gradient-to-r from-[#d89e00] to-[#ffd54f]",
        danger: "bg-gradient-to-r from-[#e21b3c] to-[#ff6b6b]"
    }

    return (
        <div className="w-full">
            <div className={cn("h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className)}>
                <div
                    className={cn("h-full transition-all duration-500 ease-out rounded-full", variants[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="mt-1.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                    {percentage}% completado
                </p>
            )}
        </div>
    )
}
