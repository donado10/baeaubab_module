import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";
import sql from "mssql";

/**
 * Shared query schema — minimum 2 chars (matches the frontend's debounce guard),
 * maximum 100 chars to prevent oversized inputs.
 */
const querySchema = z.object({
	q: z.string().min(2).max(100),
});

const app = new Hono()

	/**
	 * GET /search/entreprise?q=...
	 * Searches F_ENTREPRISE_DIGITAL by EN_No_Sage or EN_Intitule.
	 */
	.get("/entreprise", zValidator("query", querySchema), async (c) => {
		const { q } = c.req.valid("query");
		const pool = await getConnection();

		const result = await pool.request().input("q", sql.NVarChar(100), `%${q}%`)
			.query(`
				SELECT TOP 15
					EN_No_Digital,
					EN_No_Sage,
					EN_Intitule
				FROM TRANSIT.dbo.F_ENTREPRISE_DIGITAL en inner join F_COMPTET_DIGITAL ct  on en.EN_No_Sage = ct.CT_Entreprise_Sage 
				WHERE  ( EN_No_Sage LIKE @q 
					OR EN_Intitule LIKE @q 
					OR ct.CT_Num LIKE @q) and ct.CT_DG=1
				ORDER BY EN_Intitule
			`);

		console.log(result.recordset);
		return c.json({ results: result.recordset });
	})

	/**
	 * GET /search/bon-livraison?q=...
	 * Searches F_DOCENTETE_DIGITAL (DO_Type = 3) by DO_No.
	 * Joins F_COMPTET_DIGITAL for the client label.
	 */
	.get("/bon-livraison", zValidator("query", querySchema), async (c) => {
		const { q } = c.req.valid("query");
		const pool = await getConnection();

		const result = await pool.request().input("q", sql.NVarChar(20), `%${q}%`)
			.query(`
				SELECT TOP 15
					d.DO_No,
					d.DO_TotalHT,
					d.DO_Valide,
					d.DO_Entreprise_Sage AS EN_No,
					d.created_at,
					c.CT_Intitule
				FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL d
				LEFT JOIN TRANSIT.dbo.F_COMPTET_DIGITAL c
					ON d.Client_ID = c.CT_No
				WHERE d.DO_Type = 3
				  AND CAST(d.DO_No AS VARCHAR(20)) LIKE @q
				ORDER BY d.DO_No DESC
			`);

		return c.json({ results: result.recordset });
	})

	/**
	 * GET /search/facture?q=...
	 * Searches F_DOCENTETE_DIGITAL (DO_Type = 6) by DO_No.
	 * Joins F_ENTREPRISE_DIGITAL for the company label.
	 */
	.get("/facture", zValidator("query", querySchema), async (c) => {
		const { q } = c.req.valid("query");
		const pool = await getConnection();

		const result = await pool.request().input("q", sql.NVarChar(20), `%${q}%`)
			.query(`
				SELECT TOP 15
					d.DO_No,
					d.DO_TotalTTC,
					d.DO_Date,
					e.EN_Intitule
				FROM TRANSIT.dbo.F_DOCENTETE_DIGITAL d
				LEFT JOIN TRANSIT.dbo.F_ENTREPRISE_DIGITAL e
					ON d.DO_Entreprise_Digital = e.EN_No_Digital
				WHERE d.DO_Type = 6
				  AND CAST(d.DO_No AS VARCHAR(20)) LIKE @q
				ORDER BY d.DO_No DESC
			`);

		return c.json({ results: result.recordset });
	});

export default app;
