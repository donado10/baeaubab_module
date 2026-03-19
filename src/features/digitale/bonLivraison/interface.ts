import z from "zod";
import { entrepriseBonLivraisonSchema } from "./schema";

export type IEntrepriseBonLivraison = z.infer<
	typeof entrepriseBonLivraisonSchema
>;
