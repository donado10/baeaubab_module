import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { createJob } from "@/features/server/job/create-job";
import { getConnection } from "@/lib/db-mssql";

const app = new Hono()
	.use(sessionMiddleware)
	.use(adminActionMiddleware)
	.get(
		"/",
		sessionMiddleware,
		adminActionMiddleware,
		zValidator(
			"query",
			z.object({
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month } = c.req.valid("query");

			const pool = await getConnection();

			let query_refpiece = `select JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,EC_Valide from transit.dbo.f_ecriturec_temp   where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_sens=0 `;

			let result_refpiece = await pool.request().query(query_refpiece);

			let query_ecritures = `select * from transit.dbo.f_ecriturec_temp where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_refpiece like 'FACT%'`;

			let result_ecritures = await pool.request().query(query_ecritures);

			const ecritures_formated = Array.from(result_refpiece.recordset).map(
				(ref) => ({
					entete: ref,
					ligne: result_ecritures.recordset.filter(
						(ec) => ec.EC_RefPiece === ref.EC_RefPiece,
					),
				}),
			);

			console.log(ecritures_formated);

			return c.json({ results: ecritures_formated });
		},
	)
	.post(
		"/fromFacture",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
				do_no: z.string(),
			}),
		),
		async (c) => {
			const { year, month, do_no } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(jobId, "facture", "ecrituresFromFacture", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId,
						year,
						month,
						do_no,
						type: "ecrituresFromFacture",
					}),
				),
			);

			return c.json({ results: [], jobId });
		},
	)
	.post(
		"/fromAllFactures",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(jobId, "facture", "ecrituresFromAllFactures", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId,
						year,
						month,
						type: "ecrituresFromAllFactures",
					}),
				),
			);

			return c.json({ results: [], jobId });
		},
	)
	.post(
		"/fromSelectedFactures",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
				do_nos: z.array(z.string()),
			}),
		),
		async (c) => {
			const { year, month, do_nos } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(
				jobId,
				"facture",
				"ecrituresFromSelectedFactures",
				user.$id,
			);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId,
						year,
						month,
						do_nos,
						type: "ecrituresFromSelectedFactures",
					}),
				),
			);

			return c.json({ results: [], jobId });
		},
	);

export default app;
