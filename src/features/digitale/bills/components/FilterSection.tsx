import { ReactNode } from "react"
import { PopoverFilterButton as SharedPopoverFilterButton } from "@/features/digitale/_shared/components/PopoverFilterButton"
import { useEntrepriseFactureStore } from "../store/store"

export const PopoverFilterButton = ({ children }: { children: ReactNode }) => {
    return <SharedPopoverFilterButton useStore={useEntrepriseFactureStore}>{children}</SharedPopoverFilterButton>
}

