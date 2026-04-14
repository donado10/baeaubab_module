"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { SearchStrategyFactory } from "../strategies"
import { SearchType, ISearchResult } from "../types"
import useSearchAll from "../api/use-search-all"

const STRATEGIES = SearchStrategyFactory.all()

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// ── Strategy type tabs ────────────────────────────────────────────────────────

type TypeTabsProps = {
    active: SearchType
    onChange: (type: SearchType) => void
}

function TypeTabs({ active, onChange }: TypeTabsProps) {
    return (
        <div className="flex gap-1 border-b px-3 py-2">
            {STRATEGIES.map((s) => (
                <button
                    key={s.type}
                    // prevent focus from leaving CommandInput
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange(s.type)}
                    className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        active === s.type
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <s.Icon className="size-3.5" />
                    {s.label}
                </button>
            ))}
        </div>
    )
}

// ── Single result row ─────────────────────────────────────────────────────────

function ResultItem({
    result,
    strategy,
    onSelect,
}: {
    result: ISearchResult
    strategy: ReturnType<typeof SearchStrategyFactory.create>
    onSelect: (href: string) => void
}) {
    return (
        <CommandItem
            value={result.id}
            onSelect={() => onSelect(result.href)}
            className="flex items-center justify-between gap-4 py-2.5"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <strategy.Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{result.label}</p>
                    {result.sublabel && (
                        <p className="truncate text-xs text-muted-foreground">{result.sublabel}</p>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {result.badge && (
                    <span
                        className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            (() => {
                                switch (result.badge) {
                                    case "Valide":
                                        return "bg-green-100 text-green-800"
                                    case "En attente":
                                        return "bg-yellow-100 text-yellow-800"
                                    case "Supprimé":
                                        return "bg-red-100 text-red-800"
                                    default:
                                        return "bg-gray-100 text-gray-800"
                                }
                            })()
                        )}
                    >
                        {result.badge}
                    </span>
                )}
                {result.amount !== undefined && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {result.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} FCFA
                    </span>
                )}
            </div>
        </CommandItem>
    )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ResultsSkeleton() {
    return (
        <div className="px-3 py-2 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-1/3 rounded" />
                        <Skeleton className="h-2.5 w-1/2 rounded" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                </div>
            ))}
        </div>
    )
}

// ── Hint state (shown before the user has typed enough) ───────────────────────

function SearchHint({ strategy }: { strategy: ReturnType<typeof SearchStrategyFactory.create> }) {
    return (
        <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <strategy.Icon className="size-5" />
            </div>
            <p className="text-sm">Saisissez au moins 2 caractères pour rechercher</p>
        </div>
    )
}

// ── Main dialog ───────────────────────────────────────────────────────────────

export function SearchCommand({ open, onOpenChange }: Props) {
    const [type, setType] = useState<SearchType>("bon-livraison")
    const [query, setQuery] = useState("")
    const router = useRouter()

    const strategy = SearchStrategyFactory.create(type)
    const { data: results = [], isLoading } = useSearchAll(type, query)

    const isReady = query.trim().length >= 2

    const handleSelect = useCallback(
        (href: string) => {
            router.push(href)
            onOpenChange(false)
            setQuery("")
        },
        [router, onOpenChange]
    )

    const handleTypeChange = (newType: SearchType) => {
        setType(newType)
        setQuery("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader className="sr-only">
                <DialogTitle>Recherche globale</DialogTitle>
                <DialogDescription>Rechercher par bon de livraison, facture ou entreprise</DialogDescription>
            </DialogHeader>
            <DialogContent
                className="overflow-hidden p-0 max-w-xl"
                showCloseButton={false}
            >
                {/*
                 * shouldFilter={false} disables cmdk's built-in client-side fuzzy filter.
                 * All filtering is done server-side; letting cmdk re-filter would hide
                 * results that matched on a field not present in the item's visible text
                 * (e.g. CT_Num "cl10885" not appearing in the label/sublabel).
                 */}
                <Command
                    shouldFilter={false}
                    className="**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                >
                    <TypeTabs active={type} onChange={handleTypeChange} />

                    <CommandInput
                        placeholder={strategy.placeholder}
                        value={query}
                        onValueChange={setQuery}
                    />

                    <CommandList className="max-h-[360px]">
                        {!isReady && <SearchHint strategy={strategy} />}

                        {isReady && isLoading && <ResultsSkeleton />}

                        {isReady && !isLoading && results.length === 0 && (
                            <CommandEmpty>Aucun résultat pour « {query} ».</CommandEmpty>
                        )}

                        {isReady && !isLoading && results.length > 0 && (
                            <CommandGroup heading={`${results.length} résultat${results.length > 1 ? "s" : ""}`}>
                                {results.map((result) => (
                                    <ResultItem
                                        key={result.id}
                                        result={result}
                                        strategy={strategy}
                                        onSelect={handleSelect}
                                    />
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
