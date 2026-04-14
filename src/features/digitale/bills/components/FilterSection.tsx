import { ReactNode } from "react"
import { PopoverFilterButton as SharedPopoverFilterButton } from "@/components/filters/popover-filter-button"
import { useEntrepriseFactureStore } from "../store/store"

export const PopoverFilterButton = ({ children }: { children: ReactNode }) => {
    return <SharedPopoverFilterButton useStore={useEntrepriseFactureStore}>{children}</SharedPopoverFilterButton>
}

