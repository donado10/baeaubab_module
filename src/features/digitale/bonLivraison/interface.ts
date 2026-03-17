import z from "zod";
import { entrepriseBonLivraisonSchema } from "./schema";

export type IentrepriseBonLivraisonSchema = z.infer<
	typeof entrepriseBonLivraisonSchema
>;
