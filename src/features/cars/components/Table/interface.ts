import z from "zod";
import { carTableInfo } from "../../schema";

export type ICarTableInfo = z.infer<typeof carTableInfo>;
