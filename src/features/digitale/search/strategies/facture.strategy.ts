import { Receipt } from "lucide-react";
import { ISearchStrategy } from "../types";

export const factureStrategy: ISearchStrategy = {
	type: "facture",
	label: "Facture",
	placeholder: "Rechercher une facture (n°, entreprise…)",
	Icon: Receipt,
	formatResult: (raw) => ({
		id: String(raw.DO_No),
		label: `FAC #${raw.DO_No}`,
		sublabel: raw.EN_Intitule ?? "",
		amount: raw.DO_TotalTTC,
		date: raw.DO_Date,
		href: `/m1/facture/entreprise/${raw.EN_No}?year=${new Date(raw.DO_Date).getFullYear()}&month=${new Date(raw.DO_Date).getMonth() + 1}`,
	}),
};
