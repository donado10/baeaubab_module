import { EPermission } from "@/lib/enum";
import { z } from "zod";

export const ecritureLigneDigitalSchema = z.object({
	id: z.number(),
	JO_Num: z.string(),
	EC_No: z.number(),
	JM_Date: z.string(),
	EC_Jour: z.number(),
	EC_Date: z.string(),
	EC_Piece: z.number(),
	EC_RefPiece: z.string(),
	CG_Num: z.string(),
	CT_Num: z.string(),
	EC_Intitule: z.string(),
	EC_Echeance: z.number(),
	EC_Sens: z.number(),
	EC_Montant: z.number(),
	Status: z.number(),
});

export const ecritureEnteteDigitalSchema = z.object({
	JO_Num: z.string(),
	JM_Date: z.string(),
	EC_RefPiece: z.string(),
	CT_Num: z.string(),
	EC_Montant: z.number(),
	Status: z.number(),
});

export const ecritureEnteteLigneSchema = z.array(
	z.object({
		entete: ecritureEnteteDigitalSchema,
		ligne: z.array(ecritureLigneDigitalSchema),
	})
);
