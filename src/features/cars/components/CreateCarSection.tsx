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
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { carSchema } from "../schema";
import { Input } from "@/components/ui/input";
import CustomFormField from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TemplateUserIcon from "@/assets/images/template_user.svg";
import { FilesUploadContainer } from "@/features/cars/components/fileZone";
import { FileUploadContext } from "./context/file-upload";
import TableFilesUploadContainer from "./TableFilesUploadContainer";
import useCreateCar from "../api/use-create-car";
import useUploadDocumentCar from "../api/use-upload-documents-car";
import useDeleteDocumentCar from "../api/use-delete-documents-car";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";
import { SelectAvailability } from "./tableFilter";

function formDataToObject(formData: FormData) {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    // If the value is a File, keep it as-is
    obj[key] = value instanceof File ? value : value.toString();
  });

  return obj;
}

const CreateCarSection = () => {
  const form = useForm<z.infer<typeof carSchema>>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      car_no: "",
      car_fueltype: "",
      car_mileage: "",
      car_enginenumber: "",
      car_payload: "",
      car_acquisitiontype: "",
      car_circulationdate: "",
      car_acquisitionvalue: "",
      car_tankcapacity: "",
      car_chassisnumber: "",
      car_fiscalpower: "",
      car_acquisitiondate: "",
      car_registrationnumber: "",
      car_owner: "",
      car_addons: {
        matricule: "adkk",
        modele: "",
        year: "",
        marque: "",
        documents: [],
        assurance: "",
      },
    },
  });

  const { mutate } = useCreateCar();
  const mutateUploadDocuments = useUploadDocumentCar();
  const mutateDeleteDocuments = useDeleteDocumentCar();

  const fileUploadCtx = useContext(FileUploadContext);
  const onSubmit = async (values: z.infer<typeof carSchema>) => {
    let filesID: string[] = [];


    try {
      for (let index = 0; index < values.car_addons.documents.length; index++) {
        const form = new FormData();

        form.append(`file`, values.car_addons.documents[index].file);
        form.append(`hashname`, values.car_addons.documents[index].hashname);
        form.append(`nom`, values.car_addons.documents[index].nom);

        const { id: fileID } = await mutateUploadDocuments({
          form: {
            file: form.get("file") as File,
            hashname: form.get("hashname") as string,
            nom: form.get("nom") as string,
          },
        });

        filesID = [...filesID, fileID];

        values.car_addons.documents[index].file = fileID;
      }
    } catch (error) {
      if (filesID.length > 0) {
        await mutateDeleteDocuments({ json: { files: [...filesID] } });
        return;
      }
      return;
    }

    mutate(
      { json: values },
      {
        onError: async () => {
          await mutateDeleteDocuments({ json: { files: [...filesID] } });
        },
        onSuccess: () => {
          form.setValue("car_addons.assurance", "");
          form.setValue("car_addons.marque", "");
          form.setValue("car_addons.modele", "");
          form.setValue("car_addons.documents", []);
          form.setValue("car_addons.year", "");
          form.setValue("car_acquisitiontype", "");
          form.setValue("car_acquisitiondate", "");
          form.setValue("car_acquisitionvalue", "");
          form.setValue("car_chassisnumber", "");
          form.setValue("car_circulationdate", "");
          form.setValue("car_enginenumber", "");
          form.setValue("car_tankcapacity", "");
          form.setValue("car_payload", "");
          form.setValue("car_owner", "");
          form.setValue("car_fiscalpower", "");
          form.setValue("car_mileage", "");
          form.setValue("car_fueltype", "");
          form.setValue("car_addons.registrationcard", "");

          fileUploadCtx.cleanFileContext!();
          toast(<ToastSuccess toastTitle="Véhicule crée !" />, {
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
          Ajouter un chauffeur
        </span>
      </div>
      <Form {...form}>
        <form
          className="grid grid-cols-2 grid-rows-16 h-full gap-x-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="rounded-md w-fit p-4 mb-4 bg-[#D9D9D9]  row-span-2 flex items-center justify-center">
            <Image src={TemplateUserIcon} alt="aa" />
          </div>
          <div className="col-start-1 col-end-1 row-start-3 row-end-4">
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
          <div className=" row-start-4 row-end-5">
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
          <div className="col-start-1 col-end-1 row-start-5 row-end-6">
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
          <div className="col-start-1 col-end-1 row-start-6 row-end-7">
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
          <div className="col-start-1 col-end-1 row-start-7 row-end-8">
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
          <div className="col-start-1 col-end-1 row-start-8 row-end-9">
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
          <div className="col-start-1 col-end-1 row-start-9 row-end-10">
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
          <div className="col-start-2 col-end-2 row-start-9 row-end-10">
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
          <div className="col-start-2 col-end-2 row-start-10 row-end-11">
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
          <div className="col-start-1 col-end-1 row-start-10 -row-end-1 ">
            <FormField
              name="car_addons.documents"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-4">
                  <FilesUploadContainer />
                  <TableFilesUploadContainer form={form} />
                </div>
              )}
            />
          </div>
          <div className="col-start-2 col-end-2 row-start-11 -row-end-1 ">
            <FormField
              name="car_addons.documents"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-4">
                  <SelectAvailability
                    onAction={(value: string) => {
                      form.setValue("car_addons.status", value);
                    }}
                  />
                </div>
              )}
            />
          </div>
          <div className="col-start-2 col-end-2 row-start-12 -row-end-1">
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

export default CreateCarSection;
