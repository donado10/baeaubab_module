import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createJob } from "@/features/server/job/create-job";
import sql from "mssql";

const getAdjacentEntreprises = async (
	entreprise_id: string,
	year: string,
	month: string,
) => {
	const query = `
		WITH RankedRows AS (
    SELECT 
        DO_Entreprise_Sage,
        ROW_NUMBER() OVER (ORDER BY DO_Entreprise_Sage) AS rn
    FROM F_DOCENTETE_DIGITAL where year(do_date) = @year and month(do_date) = @month and DO_Type=6 group by DO_Entreprise_Sage
	)
	SELECT 
		prev.DO_Entreprise_Sage as previous ,
		curr.DO_Entreprise_Sage as [current] ,
		next.DO_Entreprise_Sage as  [next]
	FROM RankedRows curr
	LEFT JOIN RankedRows prev ON prev.rn = curr.rn - 1
	LEFT JOIN RankedRows next ON next.rn = curr.rn + 1
	WHERE curr.DO_Entreprise_Sage = @entreprise_id
	`;
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("year", sql.Int, parseInt(year))
		.input("month", sql.Int, parseInt(month))
		.input("entreprise_id", sql.NVarChar, entreprise_id)
		.query(query);

	const values = result.recordset[0];
	let adjacents = {
		previous: null as any,
		current: null as any,
		next: null as any,
	};

	if (values?.previous) {
		adjacents.previous = await getEntreprise(values.previous);
	}
	if (values?.current) {
		adjacents.current = await getEntreprise(values.current);
	}
	if (values?.next) {
		adjacents.next = await getEntreprise(values.next);
	}

	return adjacents;
};

const getEntrepriseDG = async (entreprise_id: string) => {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("entreprise_id", sql.NVarChar, entreprise_id).query(`
		SELECT TOP 1 *
		FROM TRANSIT.dbo.F_COMPTET_DIGITAL
		WHERE CT_Entreprise_Sage = @entreprise_id AND CT_DG = 1
	`);

	return result.recordset[0];
};

const getEntreprise = async (entreprise_id: string) => {
	const pool = await getConnection();
	const result = await pool
		.request()
		.input("entreprise_id", sql.NVarChar, entreprise_id).query(`
		SELECT TOP 1 *
		FROM TRANSIT.dbo.F_ENTREPRISE_DIGITAL
		WHERE EN_No_Sage = @entreprise_id
	`);

	return result.recordset[0];
};

const getFactureEntreprise = async (
	entreprise_id: string,
	year: string,
	month: string,
) => {
	const pool = await getConnection();

	const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_TotalTVA,DO_TotalTTC,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type=6 )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.EN_No = @entreprise_id
	`;
	const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,Art_Design,ART_Qte,DO_TotalHT,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type=6 )
			select lev1.*, NULL as Art_Code from lev1 where lev1.EN_No = @entreprise_id
			`;
	let result_entete = await pool
		.request()
		.input("year", sql.Int, parseInt(year))
		.input("month", sql.Int, parseInt(month))
		.input("entreprise_id", sql.NVarChar, entreprise_id)
		.query(query_entete);
	let result_ligne = await pool
		.request()
		.input("year", sql.Int, parseInt(year))
		.input("month", sql.Int, parseInt(month))
		.input("entreprise_id", sql.NVarChar, entreprise_id)
		.query(query_ligne);

	const entetes = [...result_entete.recordset];
	const lignes = [...result_ligne.recordset];

	const documents = entetes.map((entete) => {
		const ligne = lignes.filter((li) => {
			return entete.DO_No === li.DO_No;
		});
		return {
			entete: entete,
			lignes: ligne,
		};
	});

	return documents;
};

const app = new Hono()
	.use(sessionMiddleware)
	.get(
		"/entreprise/:entreprise_id",
		zValidator(
			"query",
			z.object({
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month } = c.req.valid("query");
			const { entreprise_id } = c.req.param();

			const documents = await getFactureEntreprise(entreprise_id, year, month);
			const entreprise = await getEntreprise(entreprise_id);
			const entrepriseDG = await getEntrepriseDG(entreprise_id);
			const adjacent = await getAdjacentEntreprises(entreprise_id, year, month);

			return c.json({
				results: {
					documents: documents,
					entreprise: entreprise,
					entrepriseDG: entrepriseDG,
					adjacent: adjacent,
				},
			});
		},
	)
	.post(
		"/generate",
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
			await createJob(jobId, "facture", "all", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						type: "all",
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.post(
		"/generateFromBonLivraison",
		zValidator(
			"json",
			z.object({
				en_no: z.string(),
				bl_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, en_no, bl_list } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(jobId, "facture", "fromBonLivraison", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						type: "fromBonLivraison",
						en_no: en_no,
						bl_list: bl_list,
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.post(
		"/generateByEntreprise",
		zValidator(
			"json",
			z.object({
				en_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, en_list } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(jobId, "facture", "byEntreprise", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						en_list: en_list,
						type: "byEntreprise",
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.post(
		"/generateForEntreprise",
		zValidator(
			"json",
			z.object({
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, en_no } = c.req.valid("json");
			const user = c.get("user");

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("facture-jobs");

			const jobId = ID.unique();
			await createJob(jobId, "facture", "forEntreprise", user.$id);

			channel.sendToQueue(
				"facture-jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						en_no: en_no,
						type: "forEntreprise",
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.delete(
		"cancelAllSingleEntreprise",
		zValidator(
			"json",
			z.object({
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, en_no } = c.req.valid("json");

			const pool = await getConnection();
			await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.input("en_no", sql.NVarChar, en_no).query(`
					delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and do_entreprise_sage = @en_no;
					delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and do_entreprise_sage = @en_no;
					update transit.dbo.f_docentete_digital
					set do_valide=0,DO_FactureReference=NULL
					where year(created_at) = @year and month(created_at) = @month and do_type=3 and do_entreprise_sage = @en_no and DO_FactureReference is not null;
					update transit.dbo.f_docligne_digital
					set DO_FactureReference=NULL
					where year(created_at) = @year and month(created_at) = @month and do_type=3 and do_entreprise_sage = @en_no and DO_FactureReference is not null;
				`);
			return c.json({ result: "done" });
		},
	)
	.delete(
		"cancelAll",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month } = c.req.valid("json");

			const pool = await getConnection();
			await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.query(
					`
			delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6;
			delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6;
			update transit.dbo.f_docentete_digital
			set do_valide=0,DO_FactureReference=NULL
			where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference is not null;
			update transit.dbo.f_docligne_digital
			set DO_FactureReference=NULL
			where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference is not null;
		`,
					{
						year: parseInt(year),
						month: parseInt(month),
					},
				);

			return c.json({ result: "done" });
		},
	)
	.delete(
		"/cancelSingle",
		zValidator(
			"json",
			z.object({
				fact_no: z.string(),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, fact_no } = c.req.valid("json");

			const pool = await getConnection();
			await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.input("fact_no", sql.NVarChar, fact_no).query(`
					delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and DO_No = @fact_no;
					delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and DO_No = @fact_no;
					update transit.dbo.f_docentete_digital
					set do_valide=0,DO_FactureReference=NULL
					where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference = @fact_no;
					update transit.dbo.f_docligne_digital
					set DO_FactureReference=NULL
					where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference = @fact_no;
				`);

			return c.json({ result: "done" });
		},
	)
	.delete(
		"/cancelByEntreprise",
		zValidator(
			"json",
			z.object({
				en_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, en_list } = c.req.valid("json");

			const pool = await getConnection();
			const req = pool.request();
			req.input("year", sql.Int, parseInt(year));
			req.input("month", sql.Int, parseInt(month));
			const enParams = en_list
				.map((en, i) => {
					req.input(`en${i}`, sql.NVarChar, en);
					return `@en${i}`;
				})
				.join(",");

			await req.query(`
				delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and do_entreprise_sage in (${enParams});
				delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and do_entreprise_sage in (${enParams});
				update transit.dbo.f_docentete_digital
				set do_valide=0,DO_FactureReference=NULL
				where year(created_at) = @year and month(created_at) = @month and do_type=3 and do_entreprise_sage in (${enParams});
				update transit.dbo.f_docligne_digital
				set DO_FactureReference=NULL
				where year(created_at) = @year and month(created_at) = @month and do_type=3 and do_entreprise_sage in (${enParams});
			`);

			return c.json({ result: "done" });
		},
	)
	.delete(
		"/cancelSelected",
		zValidator(
			"json",
			z.object({
				fact_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, fact_list } = c.req.valid("json");

			const pool = await getConnection();
			const req = pool.request();
			req.input("year", sql.Int, parseInt(year));
			req.input("month", sql.Int, parseInt(month));
			const factParams = fact_list
				.map((bl, i) => {
					req.input(`fact${i}`, sql.NVarChar, bl);
					return `@fact${i}`;
				})
				.join(",");

			await req.query(`
				delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and DO_No in (${factParams});
				delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and DO_No in (${factParams});
				update transit.dbo.f_docentete_digital
				set do_valide=0,DO_FactureReference=NULL
				where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference in (${factParams});
				update transit.dbo.f_docligne_digital
				set DO_FactureReference=NULL
				where year(created_at) = @year and month(created_at) = @month and do_type=3 and DO_FactureReference in (${factParams});
			`);

			return c.json({ result: "done" });
		},
	);

export default app;
