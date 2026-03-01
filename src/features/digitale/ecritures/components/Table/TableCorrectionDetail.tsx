import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IEcritureLigne } from "../../interface";
import { convertDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useForm, useWatch } from "react-hook-form";
import z, { json } from "zod";
import { ecritureEnteteLigneSchema, ecritureLigneDigitalSchema, ecritureSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useCorrectBills from "../../api/use-correct-bills";
import useLoadEcrituresCheckBills from "../../api/use-load-ecritures-check-bills";
import { useEcritureEnteteLigneStore } from "../../store/store";

export interface IDetails {
    piece: string;
    cg_num: string;
    tiers: string;
    jm_date: string;
    intitule: string;
    debit: number;
    credit: number;
}

export function EcrituresTableCorrectionDetails({ details }: { details: IEcritureLigne[] }) {
    const entete = details.filter((detail) => detail.EC_Sens === 0)[0]
    const store = useEcritureEnteteLigneStore()
    const { mutate } = useCorrectBills()
    const form = useForm<z.infer<typeof ecritureSchema>>({
        resolver: zodResolver(ecritureSchema),

        defaultValues: {
            entete: {
                JO_Num: entete.JO_Num,
                CT_Num: entete.CT_Num,
                EC_Montant: entete.EC_Montant,
                EC_RefPiece: entete.EC_RefPiece,

                JM_Date: entete.JM_Date,
                Status: entete.status,
            },
            ligne: details,
            error: []
        },
    });

    const onSubmit = (values: z.infer<typeof ecritureSchema>) => {
        console.log(values)
        mutate({ json: [values] }, {
            onSuccess: (results) => {
                console.log(results)
                const billsUpdated = store.items.filter((bill) => !results.results.includes(bill.entete.EC_RefPiece))
                values.entete.Montant_reel = store.items.filter((bill) => results.results.includes(bill.entete.EC_RefPiece))[0].entete.Montant_reel
                store.setItems([values, ...billsUpdated])
                store.setClearDialogState()
                //mutateCheckBills({ json: { year: store.periode[0], month: store.periode[1], bills: [values.entete.EC_RefPiece] } })
            }
        })
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Table >
                    <TableHeader>
                        <TableRow className="border-b border-[#101010]">
                            <TableHead className="w-[100px]">Date journal</TableHead>
                            <TableHead>Compte Général</TableHead>
                            <TableHead>Tiers</TableHead>
                            <TableHead>Libellé</TableHead>
                            <TableHead>Débit</TableHead>
                            <TableHead>Crédit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {details.map((detail, index) => (
                            <TableRow key={index} className="text-xs border-b border-[#101010]">
                                <TableCell className="font-medium "><FormField
                                    name={`ligne.${index}.JM_Date`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="text..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /></TableCell>
                                <TableCell className="font-medium"><FormField
                                    name={`ligne.${index}.CG_Num`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="text..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /></TableCell>
                                <TableCell className="font-medium"><FormField
                                    name={`ligne.${index}.CT_Num`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                {detail.EC_Sens === 0 ? <Input
                                                    type="text"
                                                    placeholder="..."
                                                    {...field}
                                                /> : <Input
                                                    type="text"
                                                    placeholder="..."
                                                    {...field}
                                                    disabled
                                                />}
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /></TableCell>
                                <TableCell><FormField
                                    name={`ligne.${index}.EC_Intitule`}
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="text..."
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                /></TableCell>
                                <TableCell><FormField
                                    name={`ligne.${index}.EC_Montant`}
                                    control={form.control}
                                    render={({ field }) => {
                                        const [fieldValue, setFieldValue] = useState(field.value)
                                        return (
                                            <FormItem>
                                                <FormControl>
                                                    {detail.EC_Sens === 0 ? <Input
                                                        type="number"
                                                        placeholder="..."
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(Number(e.currentTarget.value))
                                                            setFieldValue(Number(e.currentTarget.value)); form.setValue('entete.EC_Montant', Number(e.currentTarget.value)), {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            }
                                                        }}
                                                    /> : <Input
                                                        type="number"
                                                        placeholder="..."
                                                        {...field}
                                                        value={0}
                                                        disabled
                                                    />}
                                                </FormControl>
                                            </FormItem>
                                        )
                                    }}
                                /></TableCell>
                                <TableCell><FormField
                                    name={`ligne.${index}.EC_Montant`}
                                    control={form.control}
                                    render={({ field }) => {
                                        const [fieldValue, setFieldValue] = useState(field.value)
                                        return (
                                            <FormItem>
                                                <FormControl>
                                                    {detail.EC_Sens === 1 ? <Input
                                                        type="number"
                                                        placeholder="..."
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(Number(e.currentTarget.value))

                                                            setFieldValue(Number(e.currentTarget.value)); form.setValue('entete.EC_Montant', Number(e.currentTarget.value)), {
                                                                shouldValidate: true,
                                                                shouldDirty: true,
                                                            }
                                                        }}
                                                    /> : <Input
                                                        type="number"
                                                        placeholder="..."
                                                        {...field}
                                                        value={0}
                                                        disabled
                                                    />}
                                                </FormControl>
                                            </FormItem>
                                        )
                                    }}
                                /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter className="mt-8">
                        <TableRow>
                            <TableCell colSpan={4}>Total</TableCell>
                            <TableCell className="text-left">{form.watch('ligne').filter((val) => val.EC_Sens === 0).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                            <TableCell className="text-left">{form.watch('ligne').filter((val) => val.EC_Sens === 1).reduce((total, next) => { return total + Number(next.EC_Montant) }, 0)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                <div className="w-full  mt-8">

                    <Button type="submit" className="block ml-auto">Corriger</Button>
                </div>
            </form>
        </Form>
    );
}
