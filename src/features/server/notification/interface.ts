import z from "zod";
import { notificationSchema } from "./schema";

export type INotificationSchema = z.infer<typeof notificationSchema>;
