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

export const modFeatListSchema = z.object({
	module: z.string().optional(),
	list: z.array(z.string()),
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

export const registerAdminSchema = z.object({
	User_No: z.string(),
	User_Username: z.string().min(1, {
		message: "Veuillez renseigner le nom d'utilisateur",
	}),
	User_FirstName: z.string().min(1, {
		message: "Veuillez renseigner le prénom de l'utilisateur",
	}),
	User_LastName: z.string().min(1, {
		message: "Veuillez renseigner le nom de l'utilisateur",
	}),
	User_Status: z.enum(["DISABLED", "ENABLED"]),
});

export const adminDefaultPassword = z.object({
	pwd: z.string().min(4, {
		message: "Le mot de passe par default doit être supérieur à 4 charactères",
	}),
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

export const moduleSchema = z.object({
	Mod_No: z
		.string()
		.min(1, { message: "Veuillez renseigner le nom du module" }),

	Mod_Description: z
		.string()
		.min(1, { message: "Veuillez donner la description du module" }),
	Mod_Status: z.enum(["DISABLED", "ENABLED"]),
	Mod_Features: z.array(z.string()).optional(),
});
export const featureSchema = z.object({
	Feat_No: z
		.string()
		.min(1, { message: "Veuillez renseigner le nom de la fonctionnalité" }),

	Feat_Description: z
		.string()
		.min(1, { message: "Veuillez donner la description de la fonctionnalité" }),
	Feat_Status: z.enum(["DISABLED", "ENABLED"]),
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
