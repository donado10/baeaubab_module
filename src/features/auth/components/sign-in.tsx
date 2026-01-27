"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import React from "react";
import useLogin from "../api/use-login";
import { loginSchema } from "@/features/schema";
import { redirect } from "next/navigation";

const SignInCard = () => {
  const { mutate, isPending } = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-3/4 max-w-[30rem] p-4">
      <CardTitle className="text-center">Connexion</CardTitle>
      <Separator />
      <CardContent className="flex flex-col justify-between">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="username..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="password..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              disabled={isPending}
              type="submit"
              variant="default"
              className="w-full hover:cursor-pointer"
            >
              Valider
            </Button>
          </form>
        </Form>
        <CardFooter className="mt-8 flex items-center justify-between p-0">
          {" "}
          <Link href="/sign-up">
            <Button className="cursor-pointer" variant="link">
              S'inscrire
            </Button>
          </Link>
          <Link href="/forget-password">
            <Button className="cursor-pointer" variant="link">
              Mot de passe oublié
            </Button>
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
