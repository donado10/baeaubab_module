import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { sha256 } from "js-sha256";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function hashString(str: string) {
	const input = str + Date.now();
	const hash = sha256(input);
	return hash;
}

export const MStatus = new Map<string, string>([
	["disponible", "Disponible"],
	["non_conforme", "Non Conforme"],
	["indisponible", "Indisponible"],
]);
export const MStatusCar = new Map<string, string>([
	["disponible", "Disponible"],
	["en_mission", "En Mission"],
	["indisponible", "Indisponible"],
]);
export const MStatusMission = new Map<string, string>([
	["terminees", "Terminée"],
	["echouees", "Echouée"],
	["en_cours", "En cours"],
	["créer", "Créer"],
]);

export function formatDate(p_date: string) {
	const date = new Date(p_date);
	const day = String(date.getUTCDate()).padStart(2, "0");
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const year = date.getUTCFullYear();
	return `${day}/${month}/${year}`;
}

export function getCurrentDate() {
	const now = new Date();

	const day = String(now.getDate()).padStart(2, "0");
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const year = now.getFullYear();

	return `${year}-${month}-${day}`;
}

export function getCurrentTime() {
	const now = new Date();

	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");

	return `${hours}:${minutes}`;
}

export function convertDate(timestamp: string) {
	const originalDate = new Date(timestamp);
	const firstOfMonth = new Date(
		Date.UTC(originalDate.getUTCFullYear(), originalDate.getUTCMonth(), 1)
	);

	return firstOfMonth.toISOString().split("T")[0];
}

export function getFrenchMonthName(month: number): string {
	const monthsInFrench: Map<number, string> = new Map([
		[1, "Janvier"],
		[2, "Février"],
		[3, "Mars"],
		[4, "Avril"],
		[5, "Mai"],
		[6, "Juin"],
		[7, "Juillet"],
		[8, "Août"],
		[9, "Septembre"],
		[10, "Octobre"],
		[11, "Novembre"],
		[12, "Décembre"],
	]);

	if (!monthsInFrench.has(month)) {
		throw new Error("Invalid month. Please provide a number between 1 and 12.");
	}

	return monthsInFrench.get(month)!;
}

export function isWithinRange(number: number, center: number, range: number) {
	return number >= center - range && number <= center + range;
}

// Example:
//console.log(formatDate("2025-12-10T00:00:00.000Z")); // "10/12/2025"
