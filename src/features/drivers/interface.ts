import z from "zod";
import { missionSchema } from "../missions/schema";
import { driverSchema, driverTableInfo } from "./schema";

export type TDriverSchema = z.infer<typeof driverSchema>;
export type TDriverTableInfoSchema = z.infer<typeof driverTableInfo>;
