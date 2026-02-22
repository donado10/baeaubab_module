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
import { ReactNode } from "react"



const PopoverFilter = () => {
    return (
        <Collapsible>
            <CollapsibleTrigger ><h1 className="text-blue-600"> Invalide</h1></CollapsibleTrigger>
            <CollapsibleContent className="mt-4 text-xs">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Checkbox id="er_equilibre" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="er_equilibre">Equilibre</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="er_compliance" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="er_compliance">Conforme</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_date_journal" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_date_journal">Date Journal</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_jour" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_jour">Jour</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_date" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_date">Date écriture</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_piece" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_piece">Piece</Label>
                        </div></div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_refpiece" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_refpiece">Référence écriture</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_cg_num" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_cg_num">Compte Général</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ct_num" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ct_num">Compte tiers</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_intitule" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_intitule">Intitulé écriture</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_sens" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_sens">Sens écriture</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="err_ec_montant" onCheckedChange={(e) => {
                            }} />
                            <Label htmlFor="err_ec_montant">Montant écriture</Label>
                        </div></div>
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

