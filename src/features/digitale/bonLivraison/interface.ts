import z from "zod";
import {
	documentEnteteSchema,
	documentLigneSchema,
	documentSchema,
	entrepriseBonLivraisonSchema,
} from "./schema";

export type IEntrepriseBonLivraison = z.infer<
	typeof entrepriseBonLivraisonSchema
>;

export type IDocumentBonLivraison = z.infer<typeof documentSchema>;
export type IDocumentEnteteBonLivraison = z.infer<typeof documentEnteteSchema>;
export type IDocumentLigneBonLivraison = z.infer<typeof documentLigneSchema>;
