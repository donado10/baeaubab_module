import z from "zod";
import {
	agenceSchema,
	documentEnteteSchema,
	documentLigneSchema,
	documentSchema,
	entrepriseBonLivraisonSchema,
	entrepriseSchema,
} from "./schema";

export type IEntrepriseBonLivraison = z.infer<
	typeof entrepriseBonLivraisonSchema
>;

export type IDocumentBonLivraison = z.infer<typeof documentSchema>;
export type IDocumentEnteteBonLivraison = z.infer<typeof documentEnteteSchema>;
export type IDocumentLigneBonLivraison = z.infer<typeof documentLigneSchema>;
export type IAgence = z.infer<typeof agenceSchema>;
export type IEntreprise = z.infer<typeof entrepriseSchema>;
