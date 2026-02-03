import { modFeatListSchema, moduleSchema } from "@/features/schema";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { saActionMiddleware } from "@/lib/sa-action-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { pool } from "@/lib/db-mysql";
import z from "zod";

const app = new Hono().post(
	"",
	sessionMiddleware,
	adminActionMiddleware,
	zValidator(
		"json",
		z.object({
			year: z.string(),
			month: z.string(),
			check: z.boolean(),
		})
	),
	async (c) => {
		const { year, month } = c.req.valid("json");

		const [rows] = await pool.query("select * from ecritures ", [year, month]);

		console.log(rows);
		return c.json({});
	}
);
export default app;
