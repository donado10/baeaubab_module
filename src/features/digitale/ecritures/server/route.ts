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
import { get } from "http";

const app = new Hono()
	.post(
		"",
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
				"select  JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,Status from ecritures where year(date_facture)=? and month(date_facture)=? and ec_sens=0",
				[year, month]
			);

			const [rows_ecritures] = await pool.query(
				"select * from ecritures where year(date_facture)=? and month(date_facture)=? ",
				[year, month]
			);

			const ecritures_formated = Array.from(rows_refpiece).map((ref) => ({
				entete: ref,
				ligne: rows_ecritures.filter(
					(ec) => ec.EC_RefPiece === ref.ec_refpiece
				),
			}));

			//console.log(ecritures_formated);
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

			if (!check) {
			}
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
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	);

export default app;
