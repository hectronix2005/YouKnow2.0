import * as React from "react"
import { cn } from "@/lib/utils"

// Style constants moved outside component to prevent recreation on each render
const BASE_STYLES = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

const VARIANTS = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
    primary: "bg-[#6366f1] text-white hover:bg-[#4f46e5] focus:ring-[#6366f1]",
    secondary: "bg-[#8b5cf6] text-white hover:bg-[#7c3aed] focus:ring-[#8b5cf6]",
    outline: "border-2 border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]",
} as const

const SIZES = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "h-9 w-9 p-0",
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => (
        <button
            className={cn(BASE_STYLES, VARIANTS[variant], SIZES[size], className)}
            ref={ref}
            {...props}
        />
    )
)
Button.displayName = "Button"

export { Button }
