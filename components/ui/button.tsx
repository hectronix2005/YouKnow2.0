import * as React from "react"
import { cn } from "@/lib/utils"

// Kahoot-style button with rounded corners and vibrant colors
const BASE_STYLES = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-98 shadow-lg"

const VARIANTS = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
    primary: "bg-[#46178f] text-white hover:bg-[#5a1eb5] focus:ring-[#46178f] shadow-[0_4px_14px_rgba(70,23,143,0.4)]",
    secondary: "bg-[#1368ce] text-white hover:bg-[#1577e8] focus:ring-[#1368ce] shadow-[0_4px_14px_rgba(19,104,206,0.4)]",
    success: "bg-[#26890c] text-white hover:bg-[#2ea00f] focus:ring-[#26890c] shadow-[0_4px_14px_rgba(38,137,12,0.4)]",
    danger: "bg-[#e21b3c] text-white hover:bg-[#f02045] focus:ring-[#e21b3c] shadow-[0_4px_14px_rgba(226,27,60,0.4)]",
    warning: "bg-[#d89e00] text-white hover:bg-[#f0b000] focus:ring-[#d89e00] shadow-[0_4px_14px_rgba(216,158,0,0.4)]",
    cyan: "bg-[#00cec8] text-white hover:bg-[#00e6df] focus:ring-[#00cec8] shadow-[0_4px_14px_rgba(0,206,200,0.4)]",
    outline: "border-2 border-[#46178f] bg-transparent text-[#46178f] hover:bg-[#46178f] hover:text-white dark:border-[#8b5cf6] dark:text-[#8b5cf6] dark:hover:bg-[#8b5cf6] dark:hover:text-white shadow-none",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 shadow-none",
} as const

const SIZES = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
    xl: "px-10 py-4 text-xl",
    icon: "h-10 w-10 p-0",
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
