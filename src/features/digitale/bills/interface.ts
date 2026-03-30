import z from "zod";
import {
	agenceSchema,
	documentEnteteSchema,
	documentLigneSchema,
	documentSchema,
	entrepriseFactureSchema,
} from "./schema";

export type IEntrepriseFacture = z.infer<typeof entrepriseFactureSchema>;

export type IDocumentFacture = z.infer<typeof documentSchema>;
export type IDocumentEnteteFacture = z.infer<typeof documentEnteteSchema>;
export type IDocumentLigneFacture = z.infer<typeof documentLigneSchema>;
export type IAgence = z.infer<typeof agenceSchema>;
