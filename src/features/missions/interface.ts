import z from "zod";
import {
	missionRessourceSchema,
	missionSchema,
	missionTableInfo,
} from "./schema";

export type MissionRessourceSchema = z.infer<typeof missionRessourceSchema>;

export type TMissionSchema = z.infer<typeof missionSchema>;
export type TMissionTableInfoSchema = z.infer<typeof missionTableInfo>;
