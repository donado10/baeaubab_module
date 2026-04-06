import { z } from "zod";

export const entrepriseBonLivraisonSchema = z.object({
	EN_No: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_BonLivraisons: z.coerce.number(),
	EN_Agences: z.coerce.number(),
	EN_TVA: z.coerce.number(),
	EN_TotalHT: z.coerce.number(),
	EN_Type: z.coerce.number().optional(),
	EN_Valide: z.coerce.number(),
});

export const entrepriseSchema = z.object({
	EN_No_Sage: z.coerce.string(),
	EN_No_Digital: z.coerce.number(),
	EN_Intitule: z.coerce.string(),
	EN_TVA: z.coerce.number(),
	created_at: z.string(),
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
	DO_Valide: z.number(),
	EN_No: z.string(),
	CT_No: z.string(),
	CT_Intitule: z.string(),
	CT_Phone: z.string(),
	CT_Addresse: z.string(),
	CT_Email: z.string(),
	created_at: z.string(),
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
	created_at: z.string(),
});

export const documentSchema = z.object({
	entete: documentEnteteSchema,
	lignes: z.array(documentLigneSchema),
});

export const bonLivraisonSchema = z.object({
	entete: entrepriseBonLivraisonSchema,
});

export const agenceSchema = z.object({
	CT_No: z.number(),
	CT_Intitule: z.string(),
	CT_Num: z.string(),
	CT_TVA: z.string(),
	CT_DG: z.string(),
	CT_Entreprise_Sage: z.string(),
	CT_Phone: z.string(),
	CT_Addresse: z.string(),
	CT_Email: z.string(),
	created_at: z.string(),
	type_client_id: z.number(),
});
