import z from "zod";
import { carSchema, carTableInfo } from "./schema";

export type TCarSchema = z.infer<typeof carSchema>;
export type TCarTableInfoSchema = z.infer<typeof carTableInfo>;
