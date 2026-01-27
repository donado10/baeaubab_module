import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { driverSchema } from "@/features/drivers/schema";

type Props = {};

const CustomFormField = ({
  label,
  form,
  name,
}: {
  form: UseFormReturn<z.infer<typeof driverSchema>>;
  name: string;
  label: string;
}) => {
  return (
    <FormField
      name={"em_firstname"}
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} className=" rounded-xl bg-[#D9D9D9]/80" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
