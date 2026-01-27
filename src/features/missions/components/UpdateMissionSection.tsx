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
import { missionSchema } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";
import useGetMission from "../api/use-get-mission";
//import useUpdateMission from "../api/use-update-mission";
import { TMissionSchema } from "../interface";
import { Textarea } from "@/components/ui/textarea";
import useUpdateMission from "../api/use-update-mission";



export const UpdateMissionContainer = ({ miss_no, onClose }: { miss_no: string, onClose: () => void }) => {
    const { data, isPending } = useGetMission(miss_no)

    if (isPending) {
        return <></>
    }

    return <UpdateMissionSection onClose={onClose} mission={data.result[0]} />
}



export const UpdateMissionSection = ({ mission, onClose }: { mission: TMissionSchema, onClose: () => void }) => {
    const form = useForm<z.infer<typeof missionSchema>>({
        resolver: zodResolver(missionSchema),
        defaultValues: {
            miss_no: mission.miss_no,
            miss_intitule: mission.miss_intitule,
            miss_description: mission.miss_description,
            miss_client: mission.miss_client,
            miss_trajetzone: mission.miss_trajetzone,
            miss_expecteddatedeparture: mission.miss_expecteddatedeparture,
            miss_expecteddatearrival: mission.miss_expecteddatearrival,
            miss_expectedhourdeparture: mission.miss_expectedhourdeparture,
            miss_expectedhourarrival: mission.miss_expectedhourarrival,
            miss_expectedduration: mission.miss_expectedduration,
            miss_expecteddistance: mission.miss_expecteddistance,
            miss_expectedfuelbudget: mission.miss_expectedfuelbudget,
            miss_othersexpectedbudget: mission.miss_othersexpectedbudget,
            miss_expectedtotalbudget: mission.miss_expectedtotalbudget,
            miss_addons: {
                car: mission.miss_addons?.car,
                driver: mission.miss_addons?.driver,
                status: mission.miss_addons?.status,
                documents: mission.miss_addons?.documents,
                datedepart: mission.miss_addons?.datedepart,
                failedcause: mission.miss_addons?.failedcause,
                heuredepart: mission.miss_addons?.heuredepart,
                startingdate: mission.miss_addons?.startingdate,
                startinghour: mission.miss_addons?.startinghour,
                stopdate: mission.miss_addons?.stopdate,
                stophour: mission.miss_addons?.stophour,
                actualconsumption: mission.miss_addons?.actualconsumption,
                actualfuelcost: mission.miss_addons?.actualfuelcost,
                actualtotalcost: mission.miss_addons?.actualtotalcost,
                budgetvariance: mission.miss_addons?.budgetvariance,
            },
        },
    });

    const { mutate } = useUpdateMission();

    const onSubmit = async (values: z.infer<typeof missionSchema>) => {

        mutate(
            { json: values },
            {
                onSuccess: () => {
                    onClose()
                    toast(<ToastSuccess toastTitle="Mission modifié !" />, {
                        style: {
                            backgroundColor: "green",
                        },
                    });
                },
            }
        );
    };

    return (
        <section className="flex flex-col gap-4 p-4 min-h-full ">
            <div className="w-full flex items-center justify-center mb-4">
                <span className="font-bold text-primary text-2xl">
                    Ajouter une mission
                </span>
            </div>
            <Form {...form}>
                <form
                    className="grid grid-cols-2 grid-rows-10 h-full gap-x-8 gap-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="col-start-1 col-end-1 row-start-1 row-end-2">
                        <FormField
                            name={"miss_intitule"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Intitulé mission</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-2 row-end-3">
                        <FormField
                            name={"miss_client"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-3 row-end-4">
                        <FormField
                            name={"miss_trajetzone"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trajet</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
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
                            name={"miss_expectedfuelbudget"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget carburant estimée</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-5 row-end-6">
                        <FormField
                            name={"miss_expectedtotalbudget"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget total estimé</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-6 row-end-7">
                        <FormField
                            name={"miss_othersexpectedbudget"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Budget autres estimée</FormLabel>
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
                    <div className="col-start-2 col-end-2 row-start-1 row-end-2">
                        <FormField
                            name={"miss_expecteddatedeparture"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date prévue départ</FormLabel>
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
                    <div className="col-start-2 col-end-2 row-start-3 row-end-4">
                        <FormField
                            name={"miss_expecteddatearrival"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date prévue arrivée</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-4 row-end-5">
                        <FormField
                            name={"miss_expectedhourarrival"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Heure prévue arrivée</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="time"
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>


                    <div className="col-start-2 col-end-2 row-start-2 row-end-3">
                        <FormField
                            name={"miss_expectedhourdeparture"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Heure prévue de départ</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-5 row-end-6">
                        <FormField
                            name={"miss_expecteddistance"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Distance estimée</FormLabel>
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
                    <div className="col-start-2 col-end-2 row-start-6 row-end-7">
                        <FormField
                            name={"miss_expectedduration"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durée estimée</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>



                    <div className="col-start-1 col-end-3 row-start-7 row-end-10 h-full">
                        <FormField
                            name={"miss_description"}
                            control={form.control}

                            render={({ field }) => (
                                <FormItem className="h-full  block ">
                                    <FormLabel className="gap-0 mb-4">Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80 h-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-11">
                        <div className="ml-auto gap-4 flex items-center w-fit">
                            <Button
                                variant="destructive"
                                type="submit"
                                className=" text-white"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="default"
                                type="submit"
                                className="bg-[#34C759] text-white"
                            >
                                Confirmer
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </section>
    );
};