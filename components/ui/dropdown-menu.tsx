"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
    children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}>({ isOpen: false, setIsOpen: () => { } })

export function DropdownMenu({ children }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div ref={containerRef} className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                setIsOpen(!isOpen)
                child.props.onClick?.(e)
            }
        })
    }

    return (
        <button onClick={() => setIsOpen(!isOpen)} className="inline-flex justify-center w-full">
            {children}
        </button>
    )
}

export function DropdownMenuContent({
    children,
    align = "center",
    className
}: {
    children: React.ReactNode
    align?: "start" | "center" | "end"
    className?: string
}) {
    const { isOpen } = React.useContext(DropdownMenuContext)

    if (!isOpen) return null

    const alignmentClasses = {
        start: "left-0",
        center: "left-1/2 -translate-x-1/2",
        end: "right-0"
    }

    return (
        <div
            className={cn(
                "absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 animate-in fade-in zoom-in-95 duration-100",
                alignmentClasses[align],
                className
            )}
        >
            <div className="py-1" role="menu" aria-orientation="vertical">
                {children}
            </div>
        </div>
    )
}

export function DropdownMenuItem({
    children,
    onClick,
    className
}: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
}) {
    const { setIsOpen } = React.useContext(DropdownMenuContext)

    return (
        <button
            className={cn(
                "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors",
                className
            )}
            role="menuitem"
            onClick={() => {
                onClick?.()
                setIsOpen(false)
            }}
        >
            {children}
        </button>
    )
}
