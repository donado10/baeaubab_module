import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";
import { sessionMiddleware } from "@/lib/session-middleware";
import sql from "mssql";

const app = new Hono()
	.use(sessionMiddleware)
	.get(
		"/stats",
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

			const result = await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.query(
					`select  * from transit.dbo.fnc_GetFactureCompanyMonthDetails(@year,@month) order by DO_Entreprise_Sage`,
				);

			return c.json({ result: [...result.recordset] });
		},
	)
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const result_total_factures = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select count(DO_ENTREPRISE_sage) as total_factures  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type in (6,7)`,
			);

		const result_factures = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select count(DO_No) as factures  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type in (6)`,
			);

		const result_comptabilises = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select count(DO_No) as comptabilises  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)= @month and do_type in (7) `,
			);

		return c.json({
			results: {
				total_factures: result_total_factures.recordset[0].total_factures,
				factures: result_factures.recordset[0].factures,
				comptabilises: result_comptabilises.recordset[0].comptabilises,
			},
		});
	});

export default app;
