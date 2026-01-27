"use client";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Children, ReactNode, useContext } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { driverSchema } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";
import useGetDriver from "../api/use-get-driver";
import useUpdateDriver from "../api/use-update-driver";



export const UpdateDriverContainer = ({ driver_no, onClose }: { driver_no: string, onClose: () => void }) => {
    const { data, isPending } = useGetDriver(driver_no)

    if (isPending) {
        return <></>
    }

    return <UpdateDriverSection onClose={onClose} driver={data.result[0]} />
}

const UpdateDriverSection = ({ driver, onClose }: { driver: z.infer<typeof driverSchema>, onClose: () => void }) => {
    const form = useForm<z.infer<typeof driverSchema>>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            em_addons: {
                cars: [],
                permis: driver.em_addons.permis,
                base_salary: driver.em_addons.base_salary,
                cnss: driver.em_addons.cnss,
                contract_type: driver.em_addons.contract_type,
                date_embauche: driver.em_addons.date_embauche,
                documents: driver.em_addons.documents,
                ipm: driver.em_addons.ipm,
                matricule: driver.em_addons.matricule,
                status: driver.em_addons.status,
            },
            em_type: "1",
            em_address: driver.em_address,
            em_birthday: driver.em_birthday,
            em_birthplace: driver.em_birthplace,
            em_email: driver.em_email,
            em_emergencynumber: driver.em_emergencynumber,
            em_firstname: driver.em_firstname,
            em_lastname: driver.em_lastname,
            em_no: driver.em_no,
            em_nationality: driver.em_nationality,
            em_phonenumber: driver.em_phonenumber,
        },
    });

    const { mutate } = useUpdateDriver();

    const onSubmit = async (values: z.infer<typeof driverSchema>) => {
        mutate(
            { json: values },
            {
                onSuccess: () => {
                    onClose()
                    toast(<ToastSuccess toastTitle="Chauffeur modifié !" />, {
                        style: {
                            backgroundColor: "green",
                        },
                    });
                },
            }
        );
    };

    return (
        <section className="flex flex-col gap-4 p-4 ">


            <Form {...form}>
                <form
                    className="grid grid-cols-2 grid-rows-9 gap-y-4  gap-x-8 h-fit"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="col-start-1 col-end-1 row-start-1 row-end-2">
                        <FormField
                            name={"em_birthday"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date de naissance</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="date"
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className=" row-start-2 row-end-3">
                        <FormField
                            name={"em_nationality"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nationalité</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-3 row-end-4">
                        <FormField
                            name={"em_phonenumber"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-4 row-end-5">
                        <FormField
                            name={"em_addons.permis"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Permis</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-5 row-end-6">
                        <FormField
                            name={"em_addons.date_embauche"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date d'embauche</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-6 row-end-7">
                        <FormField
                            name={"em_addons.cnss"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro CNSS</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-7 row-end-8">
                        <FormField
                            name={"em_addons.base_salary"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salaire de base</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-1 row-end-2">
                        <FormField
                            name={"em_firstname"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-2 row-end-3">
                        <FormField
                            name={"em_lastname"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-3 row-end-4">
                        <FormField
                            name={"em_birthplace"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lieu de naissance</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-4 row-end-5">
                        <FormField
                            name={"em_address"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adresse</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-5 row-end-6">
                        <FormField
                            name={"em_email"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-6 row-end-7">
                        <FormField
                            name={"em_emergencynumber"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact d'urgence</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-7 row-end-8">
                        <FormField
                            name={"em_addons.matricule"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de matricule</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-8 row-end-9">
                        <FormField
                            name={"em_addons.ipm"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro IPM</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-8 row-end-9">
                        <FormField
                            name={"em_addons.contract_type"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type de contract</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant={"destructive"}>Annuler</Button>
                        <Button type="submit">Confirmer</Button>
                    </div>
                </form>
            </Form>
        </section>
    );
};

export default UpdateDriverSection;
