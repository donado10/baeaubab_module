import { EPermission } from "@/lib/enum";
import { z } from "zod";

export const driverDocumentSchema = z.object({
	file: z.file().or(z.string()),
	hashname: z.string(),
	nom: z.string(),
	fileID: z.string().optional(),
});

export const driverTableInfo = z.object({
	em_no: z.string(),
	em_firstname: z.string(),
	em_lastname: z.string(),
	em_matricule: z.string(),
	em_status: z.string(),
	em_fullname: z.string(),
	em_car: z.array(z.string()),
	em_lastmission: z.string(),
	em_contract: z.string(),
});

export const driverSchema = z.object({
	em_no: z.string(),
	em_firstname: z.string().min(3, {
		message: "Veuillez renseigner le prénom du chauffeur",
	}),
	em_lastname: z.string().min(3, {
		message: "Veuillez renseigner le nom du chauffeur",
	}),
	em_birthday: z.string(),
	em_nationality: z
		.string()
		.min(3, { message: "Veuillez renseigner la nationalité" }),
	em_birthplace: z
		.string()
		.min(3, { message: "Veuillez renseigner le lieu de naissance" }),
	em_address: z
		.string()
		.min(3, { message: "Veuillez renseigner l'adresse du chauffeur" }),
	em_phonenumber: z
		.string()
		.min(9, { message: "Veuillez renseigner le numéro du chauffeur" })
		.max(14),
	em_emergencynumber: z
		.string()
		.min(9, { message: "Veuillez renseigner le numéro du chauffeur" })
		.max(14),
	em_email: z.email(),
	em_type: z.string(),
	em_addons: z.object({
		permis: z.string().optional(),
		date_embauche: z.string().optional(),
		cnss: z.string().optional(),
		base_salary: z.string().optional(),
		matricule: z.string().optional(),
		ipm: z.string().optional(),
		contract_type: z.string().optional(),
		status: z.string(),
		documents: z.array(driverDocumentSchema),
		cars: z.array(z.string()).optional(),
	}),
});
