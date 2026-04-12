"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchCommand } from "./SearchCommand"

/**
 * Trigger button for the global search command palette.
 * Opens on click or ⌘K / Ctrl+K.
 */
const SearchSection = () => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((prev) => !prev)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="flex w-72 items-center justify-start gap-2 rounded-full border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            >
                <SearchIcon className="size-4 shrink-0" />
                <span className="flex-1 text-left text-sm">Rechercher…</span>
                {/* <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] text-white/50">
                    <span>⌘</span>K
                </kbd> */}
            </Button>

            <SearchCommand open={open} onOpenChange={setOpen} />
        </>
    )
}

export default SearchSection
