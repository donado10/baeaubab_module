import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { createJob } from "@/features/server/job/create-job";

const app = new Hono()
	.use(sessionMiddleware)
	.use(adminActionMiddleware)
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
