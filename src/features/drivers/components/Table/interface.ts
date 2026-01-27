import z from "zod";
import { driverTableInfo } from "../../schema";

export type IDriveTableInfo = z.infer<typeof driverTableInfo>;
