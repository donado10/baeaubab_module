import z from "zod";
import {
	ecritureEnteteLigneSchema,
	ecritureEnteteDigitalSchema,
} from "./schema";

export type IEcritureEnteteLigne = z.infer<typeof ecritureEnteteLigneSchema>;
export type IEcritureEntete = z.infer<typeof ecritureEnteteDigitalSchema>;
