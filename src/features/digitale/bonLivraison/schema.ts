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

export const documentEnteteSchema = z.object({
	DO_No: z.string(),
	Client_ID: z.string(),
	CT_Num: z.string(),
	DO_TotalHT: z.number(),
	DO_Status: z.number(),
	EN_No: z.string(),
	CT_No: z.string(),
	CT_Intitule: z.string(),
});
export const documentLigneSchema = z.object({
	DO_No: z.string(),
	Client_ID: z.string(),
	CT_Num: z.string(),
	ART_No: z.string(),
	ART_Qte: z.number(),
	DO_TotalHT: z.number(),
	DO_Status: z.number(),
	EN_No: z.string(),
	Art_Design: z.string(),
});

export const documentSchema = z.object({
	entete: documentEnteteSchema,
	lignes: z.array(documentLigneSchema),
});

export const bonLivraisonSchema = z.object({
	entete: entrepriseBonLivraisonSchema,
});
