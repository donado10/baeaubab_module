import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";
import amqp from "amqplib";
import { ID } from "node-appwrite";

const app = new Hono().post(
	"/updateBonLivraisonByEntreprise",
	zValidator(
		"json",
		z.object({
			en_list_valid: z.array(z.string()),
			en_list_invalid: z.array(z.string()),
			year: z.string(),
			month: z.string(),
		})
	),
	async (c) => {
		const { year, month, en_list_valid, en_list_invalid } = c.req.valid("json");

		console.log(year, month, en_list_valid, en_list_invalid);

		if (en_list_invalid.length > 0) {
			const pool = await getConnection();
			const query = `delete from TRANSIT.dbo.F_DOCENTETE_DIGITAL where DO_ENTREPRISE_SAGE in (${en_list_invalid.map((en) => `'${en}'`).join(",")});
            delete from TRANSIT.dbo.F_DOCligne_DIGITAL where DO_ENTREPRISE_SAGE in (${en_list_invalid.map((en) => `'${en}'`).join(",")})
            `;

			await pool.request().query(query);
		}

		const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
		const channel = await conn.createChannel();

		await channel.assertQueue("get_digital_bl_jobs");

		const jobId = ID.unique();

		const en_list = [...en_list_valid, ...en_list_invalid];

		channel.sendToQueue(
			"get_digital_bl_jobs",
			Buffer.from(
				JSON.stringify({
					jobId: jobId,
					year: year,
					month: month,
					en_list: en_list,
					type: "bl_some",
				})
			)
		);

		return c.json({ results: [], jobId: jobId });
	}
);
export default app;
