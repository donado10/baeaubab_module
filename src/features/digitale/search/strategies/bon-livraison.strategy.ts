import { Truck } from "lucide-react";
import { ISearchStrategy } from "../types";

export const bonLivraisonStrategy: ISearchStrategy = {
	type: "bon-livraison",
	label: "Bon de Livraison",
	placeholder: "Rechercher un bon de livraison (n°, client…)",
	Icon: Truck,
	formatResult: (raw) => ({
		id: String(raw.DO_No),
		label: `BL #${raw.DO_No}`,
		sublabel: raw.CT_Intitule ?? "",
		badge: raw.DO_Valide === 1 ? "Valide" : "En attente",
		amount: raw.DO_TotalHT,
		href: `/m1/bon-livraison/entreprise/${raw.EN_No}`,
	}),
};
