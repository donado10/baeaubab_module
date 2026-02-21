import z from "zod";
import {
	ecritureEnteteLigneSchema,
	ecritureEnteteDigitalSchema,
	ecritureLigneDigitalSchema,
} from "./schema";

export type IEcritureEnteteLigne = z.infer<typeof ecritureEnteteLigneSchema>;
export type IEcritureEntete = z.infer<typeof ecritureEnteteDigitalSchema>;
export type IEcritureLigne = z.infer<typeof ecritureLigneDigitalSchema>;

export interface IEcritureError {
	Balanced: string;
	JO_Num: string;
	JM_Date: string;
	EC_Jour: string;
	EC_Date: string;
	EC_Piece: string;
	EC_RefPiece: string;
	CG_Num: string;
	CT_Num: string;
	EC_Intitule: string;
	EC_Sens: string;
	EC_Montant: string;
}
