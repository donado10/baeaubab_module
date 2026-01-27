import { EPermission } from "@/lib/enum";
import { z } from "zod";

export const missionActionSchema = z.object({
	miss_no: z.string(),
	status: z.string(),
	startingdate: z.string().or(z.null()).optional(),
	startinghour: z.string().or(z.null()).optional(),
	stopdate: z.string().or(z.null()).optional(),
	stophour: z.string().or(z.null()).optional(),
	failedcause: z.string().or(z.null()).optional(),
	actualfuelcost: z.number().or(z.null()).optional(),
	actualconsumption: z.number().or(z.null()).optional(),
	actualtotalcost: z.number().or(z.null()).optional(),
	budgetvariance: z.number().or(z.null()).optional(),
});

export const missionDocumentSchema = z.object({
	file: z.file().or(z.string()),
	hashname: z.string(),
	nom: z.string(),
	fileID: z.string().optional(),
});

export const missionRessourceCarSchema = z.object({
	car_no: z.string(),
	car_marque: z.string(),
	car_modele: z.string(),
	car_status: z.string(),
	car_matricule: z.string(),
	car_registrationcard: z.string(),
});
export const missionRessourceDriverSchema = z.object({
	em_no: z.string(),
	em_firstname: z.string(),
	em_lastname: z.string(),
	em_status: z.string(),
	em_permis: z.string(),
	em_phonenumber: z.string(),
});
export const missionRessourceSchema = z.object({
	car: missionRessourceCarSchema,
	driver: missionRessourceDriverSchema,
});

export const missionAffectationShema = z.object({
	miss_no: z.string(),
	miss_driver: z.string(),
	miss_car: z.string(),
});

export const missionTableInfo = z.object({
	miss_no: z.string(),
	miss_client: z.string(),
	miss_horaire: z.string(),
	miss_expectedhourdeparture: z.string(),
	miss_expectedhourarrival: z.string(),
	miss_trajetzone: z.string(),
	miss_budget: z.string(),
	miss_status: z.string(),
	miss_intitule: z.string(),
});

export const missionSchema = z.object({
	miss_no: z.string(),
	miss_intitule: z.string(),
	miss_description: z.string(),
	miss_client: z.string(),
	miss_trajetzone: z.string(),
	miss_expecteddatedeparture: z.string(),
	miss_expecteddatearrival: z.string(),
	miss_expectedhourdeparture: z.string(),
	miss_expectedhourarrival: z.string(),
	miss_expectedduration: z.string(),
	miss_expecteddistance: z.string(),
	miss_expectedfuelbudget: z.string(),
	miss_othersexpectedbudget: z.string(),
	miss_expectedtotalbudget: z.string(),
	miss_addons: z
		.object({
			datedepart: z.string().optional(),
			heuredepart: z.string().optional(),
			car: z.string().or(z.number()).optional(),
			driver: z.string().or(z.number()).optional(),
			status: z.string(),
			documents: z.array(missionDocumentSchema),
			startingdate: z.string().or(z.null()).optional(),
			startinghour: z.string().or(z.null()).optional(),
			stopdate: z.string().or(z.null()).optional(),
			stophour: z.string().or(z.null()).optional(),
			failedcause: z.string().or(z.null()).optional(),
			actualfuelcost: z.string().or(z.null()).optional(),
			actualconsumption: z.string().or(z.null()).optional(),
			actualtotalcost: z.string().or(z.null()).optional(),
			budgetvariance: z.string().or(z.null()).optional(),
		})
		.optional(),
});
