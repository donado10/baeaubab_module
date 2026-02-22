import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ReactNode } from "react"

export const PopoverFilterButton = ({ children }: { children: ReactNode }) => {
    return <Popover >
        <PopoverTrigger asChild>
            {children}
        </PopoverTrigger>
        <PopoverContent side="left">
            <PopoverHeader>
                <PopoverTitle>Title</PopoverTitle>
                <PopoverDescription>Description text here.</PopoverDescription>
            </PopoverHeader>
        </PopoverContent>
    </Popover>
}