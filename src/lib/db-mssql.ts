// /lib/db.ts
import "server-only";
import { ConnectionPool, config as SQLConfig } from "mssql";

const dbConfig: SQLConfig = {
	user: process.env.MSSQLSERVER_USER as string,
	password: process.env.MSSQLSERVER_PASSWORD as string,
	server: process.env.MSSQLSERVER_ADDRESS as string,
	database: process.env.MSSQLSERVER_DATABASE as string,
	options: {
		encrypt: false, // for Azure or SSL connections
		trustServerCertificate: true, // for local dev
	},
};

let pool: ConnectionPool | null = null;

export async function getConnection(): Promise<ConnectionPool> {
	if (pool) {
		return pool;
	}

	try {
		pool = await new ConnectionPool(dbConfig).connect();
		return pool;
	} catch (error) {
		console.error("Failed to connect to the database:", error);
		throw error;
	}
}
