import { z } from "zod";

export const jobModuleEnum = z.enum(["ecritures", "bonLivraison", "facture"]);

export const jobTypeEnum = z.enum([
	"all",
	"some",
	"set_valid",
	"facture_detail",
	"bl_some",
	"byEntreprise",
	"fromBonLivraison",
	"forEntreprise",
]);

export const jobStatusEnum = z.enum(["pending", "done", "failed"]);

export const jobDigitalSchema = z.object({
	Job_No: z.number(),
	Job_Id: z.string().max(50),
	Job_Module: jobModuleEnum,
	Job_Type: jobTypeEnum,
	Job_Status: jobStatusEnum,
	Job_Progress: z.number().int().min(0).max(100),
	Job_Error: z.string().nullable(),
	Job_UserId: z.string().max(50),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});
