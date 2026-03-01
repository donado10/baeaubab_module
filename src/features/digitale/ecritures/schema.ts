import { z } from "zod";

export const ecritureLigneDigitalSchema = z.object({
	id: z.coerce.number(),
	JO_Num: z.coerce.string(),
	EC_No: z.coerce.number(),
	JM_Date: z.coerce.string(),
	EC_Jour: z.coerce.number(),
	EC_Date: z.coerce.string(),
	EC_Piece: z.coerce.number(),
	EC_RefPiece: z.coerce.string(),
	CG_Num: z.coerce.string(),
	CT_Num: z.coerce.string(),
	EC_Intitule: z.coerce.string(),
	EC_Echeance: z.coerce.number(),
	EC_Sens: z.coerce.number(),
	EC_Montant: z.coerce.number(),
});

export const ecritureErrorSchema = z.object({
	Balanced: z.coerce.string(),
	Compliance: z.coerce.string(),
	JO_Num: z.coerce.string(),
	JM_Date: z.coerce.string(),
	EC_Jour: z.coerce.string(),
	EC_Date: z.coerce.string(),
	EC_Piece: z.coerce.string(),
	EC_RefPiece: z.coerce.string(),
	CG_Num: z.coerce.string(),
	CT_Num: z.coerce.string(),
	EC_Intitule: z.coerce.string(),
	EC_Sens: z.coerce.string(),
	EC_Montant: z.coerce.string(),
});

export const ecritureEnteteDigitalSchema = z.object({
	JO_Num: z.coerce.string(),
	JM_Date: z.coerce.string(),
	EC_RefPiece: z.coerce.string(),
	CT_Num: z.coerce.string(),
	EC_Montant: z.coerce.number(),
	Montant_reel: z.coerce.number().optional(),
	Status: z.coerce.number(),
});

export const ecritureSchema = z.object({
	entete: ecritureEnteteDigitalSchema,
	ligne: z.array(ecritureLigneDigitalSchema),
	error: z.array(ecritureErrorSchema),
});

export const ecritureEnteteLigneSchema = z.array(ecritureSchema);
