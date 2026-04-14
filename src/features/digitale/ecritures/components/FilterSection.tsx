import { ReactNode } from "react"
import { PopoverFilterButton as SharedPopoverFilterButton } from "@/features/digitale/_shared/components/PopoverFilterButton"
import { useEcritureEnteteLigneStore } from "../store/store"

export const PopoverFilterButton = ({ children }: { children: ReactNode }) => {
    return <SharedPopoverFilterButton useStore={useEcritureEnteteLigneStore}>{children}</SharedPopoverFilterButton>
}

