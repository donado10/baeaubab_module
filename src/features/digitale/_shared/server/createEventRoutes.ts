import { Hono } from "hono";
import { stream } from "hono/streaming";

type JobStatus = "done" | "failed" | "pending";

type JobUpdatePayload = {
	jobId: string;
	status: JobStatus;
	ec_total: string;
	ec_count: string;
	result?: unknown;
	error?: string;
};

type Client = {
	write: (chunk: string) => Promise<void> | void;
	close: () => void;
};

/**
 * Factory that creates a Hono SSE event app for job status streaming.
 * @param streamPath  Path for the SSE GET endpoint (e.g. "/:jobId" or "/jobId/:jobId")
 */
export function createEventRoutes(streamPath: string = "/:jobId") {
	const clientsByJobId = new Map<string, Set<Client>>();

	function sendToJob(jobId: string, eventName: string, data: unknown): void {
		const clients = clientsByJobId.get(jobId);
		if (!clients) return;

		const payload =
			`event: ${eventName}\n` + `data: ${JSON.stringify(data)}\n\n`;

		for (const client of clients) {
			client.write(payload);
		}
	}

	const app = new Hono()
		.get(streamPath, async (c) => {
			const jobId = c.req.param("jobId");
			if (!jobId) return c.text("Missing jobId", 400);

			return stream(c, async (s) => {
				c.header("Content-Type", "text/event-stream");
				c.header("Cache-Control", "no-cache, no-transform");
				c.header("Connection", "keep-alive");

				const client: Client = {
					write: (chunk) => s.write(chunk),
					close: () => s.close(),
				};

				if (!clientsByJobId.has(jobId)) clientsByJobId.set(jobId, new Set());
				clientsByJobId.get(jobId)!.add(client);

				await s.write(
					`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`,
				);

				const ping = setInterval(() => {
					s.write(`event: ping\ndata: {}\n\n`);
				}, 3000);

				s.onAbort(() => {
					clearInterval(ping);
					const set = clientsByJobId.get(jobId);
					if (set) {
						set.delete(client);
						if (set.size === 0) clientsByJobId.delete(jobId);
					}
				});

				await new Promise<void>(() => {});
			});
		})
		.post("/job-finished", async (c) => {
			const body = (await c.req.json()) as Partial<JobUpdatePayload>;
			const { jobId, status, ec_total, ec_count, result, error } = body;

			if (!jobId || !status) {
				return c.json({ error: "Missing jobId/status" }, 400);
			}

			sendToJob(jobId, "job_update", {
				jobId,
				status,
				ec_total,
				ec_count,
				result,
				error,
			});

			if (status === "done" || status === "failed") {
				const clients = clientsByJobId.get(jobId);
				if (clients) {
					for (const client of clients) client.close();
					clientsByJobId.delete(jobId);
				}
			}

			return c.json({ ok: true });
		});

	return app;
}
