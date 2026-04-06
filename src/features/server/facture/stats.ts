import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono()
	.get(
		"/stats",
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

			console.log(result.recordset);

			return c.json({ result: [...result.recordset] });
		}
	)
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const query_total_factures = `
    select count(DO_ENTREPRISE_sage) as total_factures  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6 
`;
		const query_ca_total = `
    select sum(DO_TotalTTC) as ca_total  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6
`;

		const query_ca_exonore = `
select sum(DO_TotalTTC) as ca_exonore  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)= ${month} and do_type=6 and DO_TotalHT = DO_TotalTTC`;

		const query_ca_taxable = `
select sum(DO_TotalTTC) as ca_taxable  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)= ${month} and do_type=6 and DO_TotalHT != DO_TotalTTC`;

		let result_total_factures = await pool
			.request()
			.query(query_total_factures);
		let result_total = await pool.request().query(query_ca_total);
		let result_exonore = await pool.request().query(query_ca_exonore);
		let result_taxable = await pool.request().query(query_ca_taxable);

		return c.json({
			results: {
				factures: result_total_factures.recordset[0].total_factures,
				total: result_total.recordset[0].ca_total,
				exonore: result_exonore.recordset[0].ca_exonore,
				taxable: result_taxable.recordset[0].ca_taxable,
			},
		});
	});

export default app;
