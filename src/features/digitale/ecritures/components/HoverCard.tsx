import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ReactNode } from "react"
import { ErrorEcrituresContainer } from "./DialogTableDetail"


export const HoverCardError = ({ children, status, refpiece }: { children: ReactNode, status: string, refpiece: string }) => {
    if (status !== '1') {
        return <>{children}</>
    }
    return <HoverCard >
        <HoverCardTrigger>{children}</HoverCardTrigger>
        <HoverCardContent className="min-w-lg!" side="left">
            <ul className="flex flex-col gap-2">

                <ErrorEcrituresContainer refpiece={refpiece} />
            </ul>
        </HoverCardContent>
    </HoverCard>
}