import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";
import { sessionMiddleware } from "@/lib/session-middleware";
import sql from "mssql";

const app = new Hono().use(sessionMiddleware).get(
	"/",
	zValidator(
		"query",
		z.object({
			year: z.string(),
			month: z.string(),
		}),
	),
	async (c) => {
		const { month, year } = c.req.valid("query");

		const pool = await getConnection();

		const result_total = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`  select count(*) as total FROM [TRANSIT].[dbo].[F_ECRITUREC_TEMP] where year(jm_date)='${year}' and month(jm_date)='${month}'`,
			);
		const result_valid = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`  select count(*) as valid FROM [TRANSIT].[dbo].[F_ECRITUREC_TEMP] where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_valide=1`,
			);
		const result_invalid = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`  select count(*) as invalid FROM [TRANSIT].[dbo].[F_ECRITUREC_TEMP] where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_valide=0`,
			);

		return c.json({
			result: {
				total: result_total.recordset[0].total,
				valid: result_valid.recordset[0].valid,
				invalid: result_invalid.recordset[0].invalid,
			},
		});
	},
);

export default app;
