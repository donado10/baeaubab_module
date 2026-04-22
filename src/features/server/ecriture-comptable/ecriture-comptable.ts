import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { createJob } from "@/features/server/job/create-job";
import { getConnection } from "@/lib/db-mssql";
import sql from "mssql";

const integrateAllProcedureName = "Transit.dbo.Ecriture_integrate_all_to_db";
const integrateSelectedProcedureName =
	"Transit.dbo.Ecriture_integrate_selected_to_db";

const integrateBaseSchema = z.object({
	year: z.string().trim().min(1, "Ce champ est requis"),
	month: z.string().trim().min(1, "Ce champ est requis"),
	journal: z.string().trim().min(1, "Ce champ est requis"),
	database: z.string().trim().min(1, "Ce champ est requis"),
});

const integrateSelectedSchema = integrateBaseSchema.extend({
	refpieces: z
		.array(z.string().trim().min(1, "Ce champ est requis"))
		.min(1, "Au moins une pièce est requise"),
});

const integrateOneSchema = integrateBaseSchema.extend({
	refpiece: z.string().trim().min(1, "Ce champ est requis"),
});

async function executeEcritureIntegrationProcedure({
	procedureName,
	year,
	month,
	journal,
	database,
	pieces,
}: {
	procedureName: string;
	year: string;
	month: string;
	journal: string;
	database: string;
	pieces?: string;
}) {
	const pool = await getConnection();
	const request = pool
		.request()
		.input("year", sql.Int, Number.parseInt(year, 10))
		.input("month", sql.Int, Number.parseInt(month, 10))
		.input("journal", sql.NVarChar, journal)
		.input("TargetDB", sql.NVarChar, database);

	if (pieces) {
		request.input("pieces", sql.NVarChar, pieces);
	}

	const result = await request.execute(procedureName);

	return {
		procedure: procedureName,
		rowsAffected: result.rowsAffected,
		recordset: result.recordset ?? [],
		recordsets: result.recordsets ?? [],
	};
}

function normalizeRefpieces(refpieces: string[]) {
	return refpieces.map((refpiece) => refpiece.trim()).join(",");
}

type EcritureRecord = Record<string, unknown> & {
	EC_RefPiece: string;
};

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

			const query_refpiece = `select JO_Num,JM_Date,EC_RefPiece,CT_Num,EC_Montant,EC_Valide from transit.dbo.f_ecriturec_temp   where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_sens=0 `;

			const result_refpiece = await pool.request().query(query_refpiece);

			const query_ecritures = `select * from transit.dbo.f_ecriturec_temp where year(jm_date)='${year}' and month(jm_date)='${month}' and ec_refpiece like 'FACT%'`;

			const result_ecritures = await pool.request().query(query_ecritures);
			const refpieces = result_refpiece.recordset as EcritureRecord[];
			const ecritures = result_ecritures.recordset as EcritureRecord[];

			const ecritures_formated = refpieces.map((ref) => ({
				entete: ref,
				ligne: ecritures.filter((ec) => ec.EC_RefPiece === ref.EC_RefPiece),
			}));

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
	.post("/integrateAll", zValidator("json", integrateBaseSchema), async (c) => {
		const { year, month, journal, database } = c.req.valid("json");
		const result = await executeEcritureIntegrationProcedure({
			procedureName: integrateAllProcedureName,
			year,
			month,
			journal,
			database,
		});

		return c.json({ result });
	})
	.post(
		"/integrateSelected",
		zValidator("json", integrateSelectedSchema),
		async (c) => {
			const { year, month, journal, database, refpieces } = c.req.valid("json");
			const result = await executeEcritureIntegrationProcedure({
				procedureName: integrateSelectedProcedureName,
				year,
				month,
				journal,
				database,
				pieces: normalizeRefpieces(refpieces),
			});

			return c.json({ result });
		},
	)
	.post("/integrateOne", zValidator("json", integrateOneSchema), async (c) => {
		const { year, month, journal, database, refpiece } = c.req.valid("json");
		const result = await executeEcritureIntegrationProcedure({
			procedureName: integrateSelectedProcedureName,
			year,
			month,
			journal,
			database,
			pieces: normalizeRefpieces([refpiece]),
		});

		return c.json({ result });
	})
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
