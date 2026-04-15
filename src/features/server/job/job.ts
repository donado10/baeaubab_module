import { Hono } from "hono";
import { getConnection } from "@/lib/db-mssql";
import { sessionMiddleware } from "@/lib/session-middleware";
import sql from "mssql";

const app = new Hono()
	.use(sessionMiddleware)
	.get("/", async (c) => {
		const user = c.get("user");
		const pool = await getConnection();

		const result = await pool
			.request()
			.input("userId", sql.NVarChar(50), user.$id)
			.query(
				`SELECT TOP 50 *
				 FROM [TRANSIT].[dbo].[F_JOB_DIGITAL]
				 WHERE Job_UserId = @userId
				 ORDER BY created_at DESC`,
			);

		return c.json({ results: result.recordset });
	})
	.get("/active", async (c) => {
		const user = c.get("user");
		const pool = await getConnection();

		const result = await pool
			.request()
			.input("userId", sql.NVarChar(50), user.$id)
			.query(
				`SELECT *
				 FROM [TRANSIT].[dbo].[F_JOB_DIGITAL]
				 WHERE Job_UserId = @userId AND Job_Status = 'pending'
				 ORDER BY created_at DESC`,
			);

		return c.json({ results: result.recordset });
	})
	.get("/:jobId", async (c) => {
		const jobId = c.req.param("jobId");
		const user = c.get("user");
		const pool = await getConnection();

		const result = await pool
			.request()
			.input("jobId", sql.NVarChar(50), jobId)
			.input("userId", sql.NVarChar(50), user.$id)
			.query(
				`SELECT TOP 1 *
				 FROM [TRANSIT].[dbo].[F_JOB_DIGITAL]
				 WHERE Job_Id = @jobId AND Job_UserId = @userId`,
			);

		if (result.recordset.length === 0) {
			return c.json({ error: "Job introuvable" }, 404);
		}

		return c.json({ result: result.recordset[0] });
	});

export default app;
