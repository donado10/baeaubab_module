import z from "zod";
import { ecritureDigitalSchema } from "../../schema";

export type IEcritureDigital = z.infer<typeof ecritureDigitalSchema>;
