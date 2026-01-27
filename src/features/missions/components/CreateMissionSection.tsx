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
import { missionSchema } from "../schema";
import { Input } from "@/components/ui/input";
import CustomFormField from "@/components/CustomFormField";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TemplateUserIcon from "@/assets/images/template_user.svg";
import { FilesUploadContainer } from "@/features/missions/components/fileZone";
import { FileUploadContext } from "./context/file-upload";
import TableFilesUploadContainer from "./TableFilesUploadContainer";
import useCreateMission from "../api/use-create-mission";
import useUploadDocumentMission from "../api/use-upload-documents-mission";
import useDeleteDocumentMission from "../api/use-delete-documents-mission";
import { toast } from "sonner";
import { ToastSuccess } from "@/components/ToastComponents";
import { Textarea } from "@/components/ui/textarea";

function formDataToObject(formData: FormData) {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    // If the value is a File, keep it as-is
    obj[key] = value instanceof File ? value : value.toString();
  });

  return obj;
}

const CreateMissionSection = () => {
  const form = useForm<z.infer<typeof missionSchema>>({
    resolver: zodResolver(missionSchema),
    defaultValues: {
      miss_no: "",
      miss_intitule: "",
      miss_description: "",
      miss_client: "",
      miss_trajetzone: "",
      miss_expecteddatedeparture: "",
      miss_expecteddatearrival: "",
      miss_expectedhourdeparture: "",
      miss_expectedhourarrival: "",
      miss_expectedduration: "",
      miss_expecteddistance: "",
      miss_expectedfuelbudget: "",
      miss_othersexpectedbudget: "",
      miss_expectedtotalbudget: "",
      miss_addons: {
        car: "",
        driver: "",
        status: "créer",
        documents: [],
      },
    },
  });

  const { mutate } = useCreateMission();
  const mutateUploadDocuments = useUploadDocumentMission();
  const mutateDeleteDocuments = useDeleteDocumentMission();

  const fileUploadCtx = useContext(FileUploadContext);
  const onSubmit = async (values: z.infer<typeof missionSchema>) => {
    let filesID: string[] = [];

    if (!values.miss_addons?.documents) {
      values.miss_addons!.documents = []
    }


    if (values.miss_addons) {

      try {
        for (
          let index = 0;
          index < values.miss_addons.documents.length;
          index++
        ) {
          const form = new FormData();

          form.append(`file`, values.miss_addons.documents[index].file);
          form.append(`hashname`, values.miss_addons.documents[index].hashname);
          form.append(`nom`, values.miss_addons.documents[index].nom);

          const { id: fileID } = await mutateUploadDocuments({
            form: {
              file: form.get("file") as File,
              hashname: form.get("hashname") as string,
              nom: form.get("nom") as string,
            },
          });

          filesID = [...filesID, fileID];

          values.miss_addons.documents[index].file = fileID;
        }
      } catch (error) {
        if (filesID.length > 0) {
          await mutateDeleteDocuments({ json: { files: [...filesID] } });
          return;
        }
        return;
      }
    }

    mutate(
      { json: values },
      {
        onError: async () => {
          await mutateDeleteDocuments({ json: { files: [...filesID] } });
        },
        onSuccess: () => {
          form.setValue("miss_expecteddatedeparture", "");
          form.setValue("miss_expecteddatearrival", "");
          form.setValue("miss_expectedhourdeparture", "");
          form.setValue("miss_expectedhourarrival", "");
          form.setValue("miss_expectedduration", "");
          form.setValue("miss_expecteddistance", "");
          form.setValue("miss_expectedfuelbudget", "");
          form.setValue("miss_othersexpectedbudget", "");
          form.setValue("miss_expectedtotalbudget", "");
          form.setValue("miss_expectedduration", "");
          form.setValue("miss_intitule", "");
          form.setValue("miss_client", "");
          form.setValue("miss_trajetzone", "");
          form.setValue("miss_description", "");
          form.setValue("miss_addons.documents", []);

          fileUploadCtx.cleanFileContext!();
          toast(<ToastSuccess toastTitle="Mission crée !" />, {
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
          className="grid grid-cols-2 grid-rows-16 h-full gap-x-8 gap-y-4"
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
          <div className="col-start-1 col-end-1 row-start-11 -row-end-1 ">
            <FormField
              name="miss_addons.documents"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-4">
                  <FilesUploadContainer />
                  <TableFilesUploadContainer form={form} />
                </div>
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

export default CreateMissionSection;
