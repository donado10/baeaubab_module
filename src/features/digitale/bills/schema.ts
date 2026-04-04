import { z } from "zod";

export const entrepriseFactureSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_BonLivraisons: z.coerce.number(),
	EN_Agences: z.coerce.number(),
	EN_TVA: z.coerce.number(),
	EN_TotalHT: z.coerce.number(),
	EN_TotalTVA: z.coerce.number(),
	EN_TotalTTC: z.coerce.number(),
});

export const factureEnteteSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_Agences: z.coerce.number(),
	EN_Status: z.coerce.number(),
});
export const factureLigneSchema = z.object({
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
	DO_TotalTVA: z.number(),
	DO_TotalTTC: z.number(),
	DO_Status: z.number(),
	EN_No: z.string(),
	CT_No: z.string(),
	CT_Intitule: z.string(),
	CT_Phone: z.string(),
	CT_Addresse: z.string(),
	CT_Email: z.string(),
	DO_Date: z.string(),
});
export const documentLigneSchema = z.object({
	DO_No: z.string(),
	Client_ID: z.string(),
	CT_Num: z.string(),
	ART_No: z.string(),
	Art_Code: z.string(),
	DO_PrixUnitaire: z.number(),
	ART_Qte: z.number(),
	DO_TotalHT: z.number(),
	DO_Status: z.number(),
	EN_No: z.string(),
	Art_Design: z.string(),
	DO_Date: z.string(),
});

export const documentSchema = z.object({
	entete: documentEnteteSchema,
	lignes: z.array(documentLigneSchema),
});

export const bonLivraisonSchema = z.object({
	entete: entrepriseFactureSchema,
});

export const agenceSchema = z.object({
	CT_No: z.number(),
	CT_Intitule: z.string(),
	CT_Num: z.string(),
	CT_TVA: z.string(),
	CT_DG: z.string(),
	CT_Entreprise: z.string(),
	CT_Phone: z.string(),
	CT_Addresse: z.string(),
	CT_Email: z.string(),
	created_at: z.string(),
});
