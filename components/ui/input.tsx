import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
                    "[&:-webkit-autofill]:bg-white [&:-webkit-autofill]:text-gray-900",
                    "[&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.900)]",
                    "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_white_inset]",
                    "dark:[&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.gray.100)]",
                    "dark:[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_theme(colors.gray.800)_inset]",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
