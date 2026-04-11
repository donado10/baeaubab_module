import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button"
import { ReactNode } from "react"


type Props = {}

const NotificationPopover = ({ children }: { children: ReactNode }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>Title</PopoverTitle>
                    <PopoverDescription>Description text here.</PopoverDescription>
                </PopoverHeader>
            </PopoverContent>
        </Popover>
    )
}

export default NotificationPopover