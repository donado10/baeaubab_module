import { Building2 } from "lucide-react";
import { ISearchStrategy } from "../types";

export const entrepriseStrategy: ISearchStrategy = {
	type: "entreprise",
	label: "Entreprise",
	placeholder: "Rechercher une entreprise (nom, identifiant…)",
	Icon: Building2,
	formatResult: (raw) => ({
		id: String(raw.EN_No_Digital),
		label: raw.EN_Intitule,
		sublabel: `ID Sage: ${raw.EN_No_Sage}`,
		href: `/m1/bon-livraison/entreprise/${raw.EN_No_Digital}`,
	}),
};
