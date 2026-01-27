import { ToastSuccess } from "@/components/ToastComponents";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { carSchema } from "../schema";
import z from "zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import TemplateUserIcon from "@/assets/images/template_user.svg";
import useGetCar from "../api/use-ger-car";
import useUpdateCar from "../api/use-update-car";



export const UpdateCarContainer = ({ car_no, onClose }: { car_no: string, onClose: () => void }) => {
    const { data, isPending } = useGetCar(car_no)

    if (isPending) {
        return <></>
    }

    return <UpdateCarSection car={data.result[0]} onClose={onClose} />
}

const UpdateCarSection = ({ car, onClose }: { car?: z.infer<typeof carSchema>, onClose: () => void }) => {
    const form = useForm<z.infer<typeof carSchema>>({
        resolver: zodResolver(carSchema),
        defaultValues: {
            car_no: car?.car_no,
            car_fueltype: car?.car_fueltype,
            car_mileage: car?.car_mileage,
            car_enginenumber: car?.car_enginenumber,
            car_payload: car?.car_payload,
            car_acquisitiontype: car?.car_acquisitiontype,
            car_circulationdate: car?.car_circulationdate,
            car_acquisitionvalue: car?.car_acquisitionvalue,
            car_tankcapacity: car?.car_tankcapacity,
            car_chassisnumber: car?.car_chassisnumber,
            car_fiscalpower: car?.car_fiscalpower,
            car_acquisitiondate: car?.car_acquisitiondate,
            car_registrationnumber: car?.car_registrationnumber,
            car_owner: car?.car_owner,
            car_addons: {
                status: car?.car_addons.status,
                matricule: car?.car_addons.matricule,
                modele: car?.car_addons.modele,
                year: car?.car_addons.year,
                marque: car?.car_addons.marque,
                documents: car?.car_addons.documents,
                registrationcard: car?.car_addons.registrationcard,
                assurance: car?.car_addons.assurance,
            },
        },
    });

    console.log(form.formState.errors)
    const { mutate } = useUpdateCar();
    const onSubmit = async (values: z.infer<typeof carSchema>) => {

        mutate(
            { json: values },
            {
                onSuccess: () => {
                    onClose()
                    toast(<ToastSuccess toastTitle="Véhicule modifié !" />, {
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
            <Form {...form}>
                <form
                    className="grid grid-cols-2 grid-rows-10 h-full gap-x-8 gap-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <div className="col-start-1 col-end-1 row-start-1 row-end-2">
                        <FormField
                            name={"car_addons.modele"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modele</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
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
                            name={"car_fueltype"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type de carburant</FormLabel>
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
                            name={"car_mileage"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kilométrage actuel</FormLabel>
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
                            name={"car_enginenumber"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro du moteur</FormLabel>
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
                            name={"car_payload"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Charge utile</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-6 row-end-7">
                        <FormField
                            name={"car_acquisitiontype"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type d'acquisition</FormLabel>
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
                            name={"car_circulationdate"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date de mise en circulation</FormLabel>
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
                    <div className="col-start-1 col-end-1 row-start-8 row-end-9">
                        <FormField
                            name={"car_acquisitionvalue"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valeur d'acquisition</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-1 col-end-1 row-start-9 row-end-10">
                        <FormField
                            name={"car_owner"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Propriétaire</FormLabel>
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
                            name={"car_addons.marque"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marque</FormLabel>
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
                            name={"car_addons.year"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Année de fabrication</FormLabel>
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
                            name={"car_tankcapacity"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capacité de réservoir</FormLabel>
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
                            name={"car_chassisnumber"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de chassis</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                            className=" rounded-md bg-[#D9D9D9]/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-5 row-end-6">
                        <FormField
                            name={"car_fiscalpower"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Puissance fiscale</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-6 row-end-7">
                        <FormField
                            name={"car_acquisitiondate"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date d'acquisition</FormLabel>
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
                    <div className="col-start-2 col-end-2 row-start-7 row-end-8">
                        <FormField
                            name={"car_addons.registrationcard"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de la carte à grise</FormLabel>
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
                            name={"car_addons.assurance"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assurance</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-start-2 col-end-2 row-start-9 row-end-10">
                        <FormField
                            name={"car_addons.matricule"}
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Matricule</FormLabel>
                                    <FormControl>
                                        <Input {...field} className=" rounded-md bg-[#D9D9D9]/80" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-4 row-start-10 row-end-11">
                        <Button variant={"destructive"} onClick={onClose}>Annuler</Button>
                        <Button type="submit">Confirmer</Button>
                    </div>
                </form>
            </Form>
        </section>
    );
};
