import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";

const app = new Hono()
	.post(
		"/generate",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month } = c.req.valid("json");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("generate_digital_fact_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"generate_digital_fact_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						type: "all",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/generateFromBonLivraison",
		zValidator(
			"json",
			z.object({
				en_list: z.array(z.string()),
				bl_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month, en_list, bl_list } = c.req.valid("json");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("generate_digital_fact_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"generate_digital_fact_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						type: "fromBonLivraison",
						en_list: en_list,
						bl_list: bl_list,
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/generateByEntreprise",
		zValidator(
			"json",
			z.object({
				en_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month, en_list } = c.req.valid("json");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("generate_digital_fact_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"generate_digital_fact_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						en_list: en_list,
						type: "byEntreprise",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	);

export default app;
