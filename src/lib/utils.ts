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

// Example:
//console.log(formatDate("2025-12-10T00:00:00.000Z")); // "10/12/2025"
