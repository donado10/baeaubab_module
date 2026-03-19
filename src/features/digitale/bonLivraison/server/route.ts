import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono()
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const query_total = `
			select count(*) as total  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month}
		`;

		const query_valid = `
			select COUNT(*) as valid   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status=1
		`;

		const query_deleted = `
			select COUNT(*) as deleted   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status!=1
		`;

		let result_total = await pool.request().query(query_total);
		let result_valid = await pool.request().query(query_valid);
		let result_deleted = await pool.request().query(query_deleted);

		console.log(result_total.recordset[0].total);
		console.log(result_valid.recordset[0].valid);
		console.log(result_deleted.recordset[0].deleted);

		return c.json({
			results: {
				total: result_total.recordset[0].total,
				valid: result_valid.recordset[0].valid,
				deleted: result_deleted.recordset[0].deleted,
			},
		});
	})
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { month, year } = c.req.valid("json");

			const pool = await getConnection();

			const query = `with lev1 as (select entreprise_id,count(do_no) as nbre_bls from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(created_at)=${year} and month(created_at)=${month} group by entreprise_id),
lev2 as (select entreprise_id,sum(DO_TotalHT) as totalHT from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(created_at)=${year} and month(created_at)=${month} group by entreprise_id),
lev3 as (select lev1.entreprise_id as EN_No,nbre_bls as EN_BonLivraisons,totalHT as EN_TotalHT 
from lev1 inner join lev2 on lev1.entreprise_id = lev2.entreprise_id ),
lev4 as (select lev3.*,en.EN_Intitule,en.EN_TVA from lev3 inner join F_ENTREPRISE_DIGITAL en on lev3.EN_No = en.EN_No),
lev5 as (select CT_Entreprise,count(CT_Entreprise) as EN_Agences from F_COMPTET_DIGITAL  group by CT_Entreprise)
select lev4.*,lev5.EN_Agences from lev4 inner join lev5 on lev4.EN_No = lev5.CT_Entreprise order by en_no


`;

			let result = await pool.request().query(query);

			return c.json({ result: result.recordset });
		}
	);

export default app;
