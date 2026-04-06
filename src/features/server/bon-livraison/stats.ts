import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono()
	.get(
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

			const query = `select * from TRANSIT.dbo.fnc_GetCompanyMonthDetails(${year},${month}) order by en_no`;

			let result = await pool.request().query(query);

			return c.json({ result: [...result.recordset] });
		}
	)
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const query_total_clients = `
		select count(DO_ENTREPRISE_sage) as clients  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and do_type=3 and do_status !=2 group by DO_ENTREPRISE_sage 
	`;
		const query_total = `
		select count(*) as total FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and do_type=3 and do_status =1 and do_totalht is not null
	`;

		const query_valid = `
		select COUNT(*) as valid  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status=1 and do_type=3 and do_valide=1
	`;

		const query_waiting = `
		select COUNT(*) as waiting FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status=1 and do_type=3 and do_valide=0 and do_totalht is not null
	`;

		let result_total_clients = await pool.request().query(query_total_clients);
		let result_total = await pool.request().query(query_total);
		let result_valid = await pool.request().query(query_valid);
		let result_waiting = await pool.request().query(query_waiting);

		return c.json({
			results: {
				clients: result_total_clients.rowsAffected[0],
				total: result_total.recordset[0].total,
				valid: result_valid.recordset[0].valid,
				waiting: result_waiting.recordset[0].waiting,
			},
		});
	});

export default app;
