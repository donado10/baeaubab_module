import { create } from "zustand";
import { TDriverSchema, TDriverTableInfoSchema } from "../interface";
import { driverTableInfo } from "../schema";

interface IFilter {
	availability: string | null;
	contract_type: string | null;
	driver_name: string | null;
}

interface IDriverState {
	drivers: TDriverSchema[];
	setDrivers: (items: TDriverSchema[]) => void;
	driverTableInfo: TDriverTableInfoSchema[];
	setDriverTableInfo: (items: TDriverTableInfoSchema[]) => void;
	filter: IFilter;
	setFilter: (filter: IFilter) => void;
	clear: () => void;
}

export const useDriverStore = create<IDriverState>()((set) => ({
	drivers: [],
	driverTableInfo: [],
	filter: { availability: null, contract_type: null, driver_name: null },
	setDrivers: (drivers: TDriverSchema[]) => set({ drivers: [...drivers] }),

	setDriverTableInfo: (drivers: TDriverTableInfoSchema[]) =>
		set({
			driverTableInfo: [...drivers],
		}),
	setFilter: (filter: IFilter) => set({ filter: { ...filter } }),
	clear: () =>
		set({
			drivers: [],
			driverTableInfo: [],
			filter: { availability: null, contract_type: null, driver_name: null },
		}),
}));
