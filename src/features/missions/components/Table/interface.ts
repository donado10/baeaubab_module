import z from "zod";
import { missionTableInfo } from "../../schema";

export type IMissionTableInfo = z.infer<typeof missionTableInfo>;
