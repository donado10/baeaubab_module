"use server";

import z from "zod";
import { missionSchema } from "./schema";
import { MissionRessourceSchema } from "./interface";

export const getSelectedMission = async (missionID: string) => {
	const response = await fetch(
		`http://127.0.0.1:3000/api/missions/${missionID}`
	);

	return (await response.json()).result[0] as z.infer<typeof missionSchema>;
};
export const getRessourceMission = async (
	driver: string | number,
	car: string | number
) => {
	const response = await fetch(
		`http://127.0.0.1:3000/api/missions/ressources/${driver ? driver : -1}/${car ? car : -1}`
	);
	const ressources = await response.json();

	return ressources.result as MissionRessourceSchema;
};
