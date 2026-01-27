import { EPermission } from "@/lib/enum";
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Veuillez renseigner le nom d'utilisateur",
  }),
  password: z
    .string()
    .min(1, { message: "Veuillez renseigner le mot de passe" }),
});

export const registerSchema = z
  .object({
    username: z.string().min(1, {
      message: "Veuillez renseigner le nom d'utilisateur",
    }),
    password: z
      .string()
      .min(4, { message: "Veuillez renseigner le mot de passe" }),
    confirmPassword: z
      .string()
      .min(4, { message: "Veuillez confirmer le mot de passe" }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Les mots de passe sont différents",
    path: ["confirmPassword"],
  });

export const validateSchema = z.object({
  piece: z.string().min(1, { message: "Veuillez renseigner la pièce" }),
  date: z.string().min(4, { message: "Veuillez renseigner la date" }),
  case_param: z
    .string()
    .min(1, { message: "Veuillez renseigner le type d'intégration" }),
});
export const loadSchema = z.object({
  date_param1: z.string().min(4, { message: "Veuillez renseigner la date" }),
  date_param2: z.string().min(4, { message: "Veuillez renseigner la date" }),
  case_param: z
    .string()
    .min(1, { message: "Veuillez renseigner le type d'intégration" }),
});

export const caseSchema = z.object({
  name: z.string().min(1, { message: "Veuillez renseigner le nom du case" }),
  alias: z
    .string()
    .min(1, { message: "Veuillez saisir un alias" })
    .max(3, { message: "Veuiller donner un alias inférieur à 3" }),
  description: z
    .string()
    .min(1, { message: "Veuillez donner la description du case" }),
});

export const casePermissionSchema = z.object({
  id: z.string().nullable(),
  caseID: z.string().min(1),
  caseName: z.string().min(1, { message: "The case name is required" }),

  permissions: z.nativeEnum(EPermission).array(),
});

export const casespermissionsSchema = z.object({
  userID: z.string().min(1),
  cases_permissions: z.array(casePermissionSchema),
});
