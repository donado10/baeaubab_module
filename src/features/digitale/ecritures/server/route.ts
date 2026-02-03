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

		const [rows_refpiece] = await pool.query(
			"select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,Status from ecritures where year(date_facture)=? and month(date_facture)=? and ec_sens=0",
			[year, month]
		);

		const [rows_ecritures] = await pool.query(
			"select * from ecritures where year(date_facture)=? and month(date_facture)=? ",
			[year, month]
		);

		const ecritures_formated = Array.from(rows_refpiece).map((ref) => ({
			entete: ref,
			ligne: rows_ecritures.filter((ec) => ec.EC_RefPiece === ref.ec_refpiece),
		}));

		//console.log(ecritures_formated);
		return c.json({ results: ecritures_formated });
	}
);
export default app;
