import { z } from "zod";

export const notificationSchema = z.object({
	Notif_No: z.number(),
	Notif_Module: z.string().nullable(),
	Notif_RecipientType: z.number().nullable(),
	Notif_RecipientUserId: z.number().nullable(),
	Notif_Source: z.string(),
	Notif_Type: z.string().nullable(),
	Notif_RessourceType: z.string().nullable(),
	Notif_RessourceId: z.number().nullable(),
	Notif_Message: z.string().nullable(),
	Notif_Read: z.number().nullable(),
	Notif_Handled: z.number().nullable(),
	created_at: z.date().nullable(),
});
