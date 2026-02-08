import { Hono } from "hono";
import { stream } from "hono/streaming";
import { StreamingApi } from "hono/utils/stream";

type JobStatus = "done" | "failed" | "pending";

type JobUpdatePayload = {
	jobId: string;
	status: JobStatus;
	result?: unknown;
	error?: string;
};

type Client = {
	write: (chunk: string) => Promise<StreamingApi>;
	close: () => void;
};

const clientsByJobId = new Map<string, Set<Client>>();

function sendToJob(jobId: string, eventName: string, data: unknown): void {
	const clients = clientsByJobId.get(jobId);
	if (!clients) return;

	const payload = `event: ${eventName}\n` + `data: ${JSON.stringify(data)}\n\n`;

	for (const client of clients) {
		client.write(payload);
	}
}

const app = new Hono()
	.get("/:jobId", async (c) => {
		const jobId = c.req.query("jobId");
		if (!jobId) return c.text("Missing jobId", 400);

		return stream(c, async (s) => {
			// Hono will set headers on the Response via c.header
			c.header("Content-Type", "text/event-stream");
			c.header("Cache-Control", "no-cache, no-transform");
			c.header("Connection", "keep-alive");

			// Make a client wrapper
			const client: Client = {
				write: (chunk) => s.write(chunk),
				close: () => s.close(),
			};

			// Register
			if (!clientsByJobId.has(jobId)) clientsByJobId.set(jobId, new Set());
			clientsByJobId.get(jobId)!.add(client);

			// Tell client it's connected
			await s.write(`event: connected\ndata: ${JSON.stringify({ jobId })}\n\n`);

			// Keepalive ping
			const ping = setInterval(() => {
				s.write(`event: ping\ndata: {}\n\n`);
			}, 15000);

			// Cleanup when connection closes
			s.onAbort(() => {
				clearInterval(ping);
				const set = clientsByJobId.get(jobId);
				if (set) {
					set.delete(client);
					if (set.size === 0) clientsByJobId.delete(jobId);
				}
			});

			// Keep the stream open forever until aborted
			// (No need to do anything else here)
			await new Promise<void>(() => {});
		});
	})
	.post("/job-finished", async (c) => {
		const body = (await c.req.json()) as Partial<JobUpdatePayload>;
		const { jobId, status, result, error } = body;

		if (!jobId || !status) {
			return c.json({ error: "Missing jobId/status" }, 400);
		}

		// Send update to all SSE clients for that jobId
		sendToJob(jobId, "job_update", { jobId, status, result, error });

		// Optional: close streams when final
		if (status === "done" || status === "failed") {
			const clients = clientsByJobId.get(jobId);
			if (clients) {
				for (const client of clients) client.close();
				clientsByJobId.delete(jobId);
			}
		}

		return c.json({ ok: true });
	});
