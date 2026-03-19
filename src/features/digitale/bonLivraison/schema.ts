import { z } from "zod";

export const entrepriseBonLivraisonSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_BonLivraisons: z.coerce.number(),
	EN_Agences: z.coerce.number(),
	EN_TVA: z.coerce.number(),
	EN_TotalHT: z.coerce.number(),
});

export const bonLivraisonEnteteSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_Agences: z.coerce.number(),
	EN_Status: z.coerce.number(),
});
export const bonLivraisonLigneSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_Agences: z.coerce.number(),
	EN_Status: z.coerce.number(),
});

export const bonLivraisonSchema = z.object({
	entete: entrepriseBonLivraisonSchema,
});
