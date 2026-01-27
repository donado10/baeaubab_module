"use client"

import * as React from "react"
import FilterIcon from "@/assets/filter.svg"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"



export function CollapsibleFilterVehicule({ filter }: { filter: (action: 'add' | 'remove', value: string) => void }) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex w-[350px] flex-col gap-2 "
        >
            <div className="flex items-center justify-between gap-4 px-4">
                <h4 className="text-sm font-semibold">
                    Filtre véhicule
                </h4>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <Image src={FilterIcon} alt="" width={16} height={16} />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 px-4 mb-4">
                <div className="flex items-center gap-3">
                    <Checkbox id="en_mission" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'en_mission')
                        } else {
                            filter('remove', 'en_mission')
                        }

                    }} />
                    <Label htmlFor="en_mission">En Mission</Label>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox id="disponible" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'disponible')
                        } else {
                            filter('remove', 'disponible')
                        }

                    }} />
                    <Label htmlFor="disponible">Disponible</Label>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox id="indisponible" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'indisponible')
                        } else {
                            filter('remove', 'indisponible')
                        }

                    }} />
                    <Label htmlFor="indisponible">Indisponible</Label>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
export function CollapsibleFilterDriver({ filter }: { filter: (action?: 'add' | 'remove', value?: string) => void }) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex w-[350px] flex-col gap-2 "
        >
            <div className="flex items-center justify-between gap-4 px-4">
                <h4 className="text-sm font-semibold">
                    Filtre chauffeur
                </h4>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                        <Image src={FilterIcon} alt="" width={16} height={16} />
                    </Button>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 px-4 mb-4">
                <div className="flex items-center gap-3">
                    <Checkbox id="non_conforme" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'non_conforme')
                        } else {
                            filter('remove', 'non_conforme')
                        }

                    }} />
                    <Label htmlFor="non_conforme">Non Conforme</Label>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox id="disponible" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'disponible')
                        } else {
                            filter('remove', 'disponible')
                        }

                    }} />
                    <Label htmlFor="disponible">Disponible</Label>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox id="indisponible" onCheckedChange={(e) => {
                        if (e.valueOf() === true) {
                            filter('add', 'indisponible')
                        } else {
                            filter('remove', 'indisponible')
                        }

                    }} />
                    <Label htmlFor="indisponible">Indisponible</Label>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
