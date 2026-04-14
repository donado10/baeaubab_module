import { Hono } from "hono";
import { getConnection } from "@/lib/db-mssql";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono()
	.use(sessionMiddleware)
	.get("/", async (c) => {
		const pool = await getConnection();

		const query = `select * from [TRANSIT].[dbo].[F_NOTIFICATION_DIGITAL] order by Notif_No desc`;
		const result = await pool.request().query(query);

		return c.json({
			results: [...result.recordset],
		});
	})
	.get("/count-unread", async (c) => {
		const pool = await getConnection();

		const query = `
			select count(*) as unreadCount
			from [TRANSIT].[dbo].[F_NOTIFICATION_DIGITAL]
			where isnull(Notif_Read, 0) <> 1
		`;
		const result = await pool.request().query(query);
		const unreadCount = result.recordset[0]?.unreadCount ?? 0;

		return c.json({ unreadCount });
	});

export default app;
