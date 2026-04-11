import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono().get("/", async (c) => {
	const pool = await getConnection();

	const query = `select * from [TRANSIT].[dbo].[F_NOTIFICATION_DIGITAL] order by Notif_No desc`;
	let result = await pool.request().query(query);

	return c.json({
		results: [...result.recordset],
	});
});

export default app;
