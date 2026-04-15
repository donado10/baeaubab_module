import type { z } from "zod";
import type {
	jobDigitalSchema,
	jobModuleEnum,
	jobStatusEnum,
	jobTypeEnum,
} from "./schema";

export type JobDigital = z.infer<typeof jobDigitalSchema>;
export type JobModule = z.infer<typeof jobModuleEnum>;
export type JobType = z.infer<typeof jobTypeEnum>;
export type JobStatus = z.infer<typeof jobStatusEnum>;
