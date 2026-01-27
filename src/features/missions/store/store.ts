import { create } from "zustand";
import { TMissionSchema, TMissionTableInfoSchema } from "../interface";
import { missionTableInfo } from "../schema";

interface IFilter {
	status: string | null;
	mission_name: string | null;
}

interface IMissionState {
	missions: TMissionSchema[];
	setMissions: (items: TMissionSchema[]) => void;
	missionTableInfo: TMissionTableInfoSchema[];
	setMissionTableInfo: (items: TMissionTableInfoSchema[]) => void;
	filter: IFilter;
	setFilter: (filter: IFilter) => void;
	clear: () => void;
}

export const useMissionStore = create<IMissionState>()((set) => ({
	missions: [],
	missionTableInfo: [],
	filter: { status: null, mission_name: null },
	setMissions: (missions: TMissionSchema[]) => set({ missions: [...missions] }),

	setMissionTableInfo: (missions: TMissionTableInfoSchema[]) =>
		set({
			missionTableInfo: [...missions],
		}),
	setFilter: (filter: IFilter) => set({ filter: { ...filter } }),
	clear: () =>
		set({
			missions: [],
			missionTableInfo: [],
			filter: { status: null, mission_name: null },
		}),
}));
