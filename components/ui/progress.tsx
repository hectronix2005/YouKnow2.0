import { cn } from "@/lib/utils"

interface ProgressProps {
    value: number
    className?: string
    showLabel?: boolean
}

export function Progress({ value, className, showLabel = false }: ProgressProps) {
    const percentage = Math.min(Math.max(value, 0), 100)

    return (
        <div className="w-full">
            <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700", className)}>
                <div
                    className="h-full bg-[#6366f1] transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {percentage}% complete
                </p>
            )}
        </div>
    )
}
