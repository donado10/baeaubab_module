import { modFeatListSchema, moduleSchema } from "@/features/schema";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { saActionMiddleware } from "@/lib/sa-action-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import amqp from "amqplib";
import { pool } from "@/lib/db-mysql";
import z from "zod";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono()
	.get("/errors", async (c) => {
		const refpiece = c.req.param("refpiece");

		const pool = await getConnection();

		const query = `select * from transit.dbo.f_ecriturec_invalid`;

		let result = await pool.request().query(query);

		return c.json({ result: result.recordset });
	})
	.get("/error/:refpiece", async (c) => {
		const refpiece = c.req.param("refpiece");

		const pool = await getConnection();

		const query = `select * from transit.dbo.f_ecriturec_invalid where ec_refpiece='${refpiece}'`;

		let result = await pool.request().query(query);

		return c.json({ result: result.recordset[0] });
	})
	.post(
		"/digital",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month } = c.req.valid("json");

			const [rows_refpiece] = await pool.query(
				"select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,fact.montant_a_payer as Montant_reel,ec.Status as Status from ecritures ec inner join factures fact on ec.facture_id=fact.id where year(date_facture)=? and month(date_facture)=? and ec_sens=0",
				[year, month]
			);

			const [rows_ecritures] = await pool.query(
				"select * from ecritures where year(date_facture)=? and month(date_facture)=? ",
				[year, month]
			);

			const query_errors = `select * from transit.dbo.f_ecriturec_invalid`;

			const pool_ = await getConnection();
			let result_errors = await pool_.request().query(query_errors);

			const ecritures_formated = Array.from(rows_refpiece).map((ref) => ({
				entete: ref,
				ligne: rows_ecritures.filter(
					(ec) => ec.EC_RefPiece === ref.EC_RefPiece
				),
				error: result_errors.recordset.filter(
					(err) => err.EC_RefPiece === ref.EC_RefPiece
				),
			}));

			return c.json({ results: ecritures_formated });
		}
	)
	.post(
		"/sage",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month } = c.req.valid("json");

			const pool = await getConnection();

			let query_refpiece = `select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,fact.montant_ttc as Montant_reel,row_status as Status from transit.dbo.f_ecriturec_temp ec inner join transit.dbo.f_facture_digital fact on ec.facture_id = fact.facture_id where year(date_facture)='${year}' and month(date_facture)='${month}' and ec_sens=0`;

			let result_refpiece = await pool.request().query(query_refpiece);

			let query_ecritures = `select * from transit.dbo.f_ecriturec_temp where year(date_facture)='${year}' and month(date_facture)='${month}' `;

			let result_ecritures = await pool.request().query(query_ecritures);

			const query_errors = `select * from transit.dbo.f_ecriturec_invalid`;

			let result_errors = await pool.request().query(query_errors);

			const ecritures_formated = Array.from(result_refpiece.recordset).map(
				(ref) => ({
					entete: ref,
					ligne: result_ecritures.recordset.filter(
						(ec) => ec.EC_RefPiece === ref.EC_RefPiece
					),
					error: result_errors.recordset.filter(
						(err) => err.EC_RefPiece === ref.EC_RefPiece
					),
				})
			);

			return c.json({ results: ecritures_formated });
		}
	)
	.post(
		"/withCheck",
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
			const { year, month, check } = c.req.valid("json");

			const conn = await amqp.connect("amqp://guest:guest@172.16.2.4:5672");
			const channel = await conn.createChannel();

			await channel.assertQueue("check_digital_ec_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"check_digital_ec_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						check: check,
						type: "all",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/checkBills",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
				bills: z.array(z.string()),
			})
		),
		async (c) => {
			const { year, month, bills } = c.req.valid("json");

			const conn = await amqp.connect("amqp://guest:guest@172.16.2.4:5672");
			const channel = await conn.createChannel();

			await channel.assertQueue("check_digital_ec_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"check_digital_ec_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						bills: bills,
						type: "some",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	);

export default app;
