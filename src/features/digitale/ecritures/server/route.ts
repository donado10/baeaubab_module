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
import { ecritureEnteteLigneSchema, ecritureSchema } from "../schema";

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
				"select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,ec.Status as Status,facture_id from ecritures ec inner join factures fact on ec.facture_id=fact.id where year(date_facture)=? and month(date_facture)=? and ec_sens=0 and ec_refpiece like 'FACT%'",
				[year, month]
			);

			const [rows_ecritures] = await pool.query(
				"select * from ecritures where year(date_facture)=? and month(date_facture)=? and ec_refpiece like 'FACT%'",
				[year, month]
			);

			const query_errors = `select * from transit.dbo.f_ecriturec_invalid`;
			const query_montant_reel = `select facture_id,montant_ttc from transit.dbo.f_facture_digital where facture_id in (${Array.from(
				rows_refpiece
			)
				.map((ref) => `'${ref.facture_id}'`)
				.join(",")})`;

			const pool_ = await getConnection();
			let result_errors = await pool_.request().query(query_errors);
			let result_montant_reel = await pool_.request().query(query_montant_reel);

			console.log(result_montant_reel);

			const ecritures_formated = Array.from(rows_refpiece).map((ref) => {
				console.log(
					result_montant_reel.recordset.filter((value) => {
						return value.facture_id == ref.facture_id;
					})
				);
				return {
					entete: {
						...ref,
						Montant_reel:
							result_montant_reel.recordset.filter((value) => {
								return value.facture_id == ref.facture_id;
							})[0]?.montant_ttc ?? -1,
					},
					ligne: rows_ecritures.filter(
						(ec) => ec.EC_RefPiece === ref.EC_RefPiece
					),
					error: result_errors.recordset.filter(
						(err) => err.EC_RefPiece === ref.EC_RefPiece
					),
				};
			});

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

			let query_refpiece = `select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,fact.montant_ttc as Montant_reel,row_status as Status from transit.dbo.f_ecriturec_temp ec inner join transit.dbo.f_facture_digital fact on ec.facture_id = fact.facture_id where year(date_facture)='${year}' and month(date_facture)='${month}' and ec_sens=0 and ec_refpiece like 'FACT%'`;

			let result_refpiece = await pool.request().query(query_refpiece);

			let query_ecritures = `select * from transit.dbo.f_ecriturec_temp where year(date_facture)='${year}' and month(date_facture)='${month}' and ec_refpiece like 'FACT%'`;

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

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
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

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
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
	)
	.post(
		"/setBillsValid",
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

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
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
						type: "set_valid",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/correctBills",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator("json", ecritureEnteteLigneSchema),
		async (c) => {
			const ecritures_ = c.req.valid("json").map((ec) => ec.entete.EC_RefPiece);
			const ecritures = c.req.valid("json").map((ec) => ec.ligne);

			ecritures.forEach((ecriture) => {
				ecriture.forEach(async (ec) => {
					const query = `update ecritures
					set JM_Date='${ec.JM_Date}',
					CG_Num='${ec.CG_Num}',CT_Num='${ec.CT_Num}',EC_Intitule='${ec.EC_Intitule}',EC_Montant='${ec.EC_Montant}'
					where id = ${ec.id}
					`;
					const [rows] = await pool.query(query);
				});
			});

			return c.json({ results: ecritures_ });
		}
	)

	.post(
		"/integrateBills",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
				journal: z.string(),
				database: z.string(),
			})
		),
		async (c) => {
			const { journal, database, month, year } = c.req.valid("json");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("integrate_digital_ec_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"integrate_digital_ec_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: Number(year),
						month: Number(month),
						journal: journal,
						database: database,
						type: "facture_detail",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.delete(
		"/bills",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
				bills: z.array(z.string()),
				database: z.string(),
				journal: z.string(),
			})
		),
		async (c) => {
			const { year, month, bills, database, journal } = c.req.valid("json");
			const pool_mssql = await getConnection();

			const query_delete_bills = `delete from ${database}.dbo.f_ecriturec where ec_refpiece in (${bills.map((bill: string) => "'" + bill + "'").join(",")})`;

			const query_update_bills_status_sage = `update transit.dbo.f_ecriturec_temp
			set row_status = 2
			where ec_refpiece in (${bills.map((bill: string) => "'" + bill + "'").join(",")})`;

			const query_update_bills_status_digital = `update ecritures
			set status = 2
			where ec_refpiece in (${bills.map((bill: string) => "'" + bill + "'").join(",")})`;

			await pool_mssql.request().query(query_delete_bills);
			await pool_mssql.request().query(query_update_bills_status_sage);

			await pool.query(query_update_bills_status_digital);

			return c.json({ result: [] });
		}
	);

export default app;
