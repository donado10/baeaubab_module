import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ReactNode, useState } from "react"
import { useEcritureEnteteLigneStore } from "../store/store"
import { boolean } from "zod"

const CheckboxFilter = ({ id, type, label }: { id: string, type: string, label: string }) => {
    const store = useEcritureEnteteLigneStore()
    const [state, setState] = useState(store.filter.invalide.includes(type))

    return <div className="flex items-center gap-3">
        <Checkbox id={id} checked={state} onCheckedChange={(e) => {
            if (e.valueOf() === true) {

                store.setFilter({ ...store.filter, invalide: [...store.filter.invalide, type] })
                setState(true)
                return
            }
            store.setFilter({ ...store.filter, invalide: [...store.filter.invalide.filter((f) => f !== type)] })
            setState(false)

        }} />
        <Label htmlFor={id}>{label}</Label>
    </div>
}

const PopoverFilter = () => {
    const store = useEcritureEnteteLigneStore()
    return (
        <Collapsible>
            <CollapsibleTrigger ><h1 className="text-blue-600"> Invalide</h1></CollapsibleTrigger>
            <CollapsibleContent className="mt-4 text-xs">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-4">

                        <CheckboxFilter id="er_equilibre" type="Balanced" label="Equilibre" />
                        <CheckboxFilter id="er_compliance" type="Compliance" label="Conformité" />
                        <CheckboxFilter id="er_date_journal" type="JM_Date" label="Date Journal" />
                        <CheckboxFilter id="er_ec_jour" type="EC_Jour" label="Jour Ecriture" />
                        <CheckboxFilter id="er_ec_date" type="EC_Date" label="Date Ecriture" />
                        <CheckboxFilter id="er_ec_piece" type="EC_Piece" label="Piece" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <CheckboxFilter id="er_ec_refpiece" type="EC_Refpiece" label="Référence Ecriture" />
                        <CheckboxFilter id="er_cg_num" type="CG_Num" label="Compte Général" />
                        <CheckboxFilter id="er_ct_num" type="CT_Num" label="Compte Tiers" />
                        <CheckboxFilter id="er_ec_intitule" type="EC_Intitule" label="Intitulé Ecriture" />
                        <CheckboxFilter id="er_ec_sens" type="EC_Sens" label="Sens Ecriture" />
                        <CheckboxFilter id="er_ec_montant" type="EC_Montant" label="Montant Ecriture" />
                    </div>
                </div>


            </CollapsibleContent>
        </Collapsible>)

}
export const PopoverFilterButton = ({ children }: { children: ReactNode }) => {
    return <Popover >
        <PopoverTrigger asChild>
            {children}
        </PopoverTrigger>
        <PopoverContent side="left" className="w-96!">
            <PopoverHeader>
                {/* <PopoverTitle>Filtre</PopoverTitle> */}
            </PopoverHeader>
            <PopoverFilter />
        </PopoverContent>
    </Popover>
}

