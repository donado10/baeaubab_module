import { getConnection } from "@/lib/db-mssql";
import sql from "mssql";
import type { JobModule, JobType } from "./interface";

export async function createJob(
	jobId: string,
	module: JobModule,
	type: JobType,
	userId: string,
) {
	const pool = await getConnection();
	await pool
		.request()
		.input("jobId", sql.NVarChar(50), jobId)
		.input("module", sql.NVarChar(50), module)
		.input("type", sql.NVarChar(50), type)
		.input("userId", sql.NVarChar(50), userId)
		.query(
			`INSERT INTO [TRANSIT].[dbo].[F_JOB_DIGITAL]
			 (Job_Id, Job_Module, Job_Type, Job_UserId)
			 VALUES (@jobId, @module, @type, @userId)`,
		);
}
