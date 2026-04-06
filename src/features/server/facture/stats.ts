import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono().get(
	"/",
	zValidator(
		"query",
		z.object({
			year: z.string(),
			month: z.string(),
		})
	),
	async (c) => {
		const { month, year } = c.req.valid("query");

		const pool = await getConnection();

		const query = `select  * from transit.dbo.fnc_GetFactureCompanyMonthDetails(${year},${month}) order by do_no`;

		let result = await pool.request().query(query);

		return c.json({ result: [...result.recordset] });
	}
);
