import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z, { string } from "zod";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";
import amqp from "amqplib";

const app = new Hono()

	.get(
		"/entreprise/dg",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
			})
		),
		async (c) => {
			const { en_no } = c.req.valid("query");

			const pool = await getConnection();

			let query = `
			select * from TRANSIT.dbo.F_COMPTET_DIGITAL where ct_dg=1 and ct_entreprise=${en_no}
			`;
			let result = await pool.request().query(query);

			if (result.recordset.length > 0) {
				return c.json({ result: result.recordset[0] });
			}

			query = `
			select top 1 * from TRANSIT.dbo.F_COMPTET_DIGITAL where ct_dg=0 and ct_entreprise=${en_no}
			`;

			result = await pool.request().query(query);
			return c.json({ result: result.recordset[0] });
		}
	)
	.get(
		"/entreprise/residence",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
			})
		),
		async (c) => {
			const { en_no } = c.req.valid("query");

			const pool = await getConnection();

			const query = `
			select * from TRANSIT.dbo.F_COMPTET_DIGITAL where  ct_no=${en_no}
			`;
			let result = await pool.request().query(query);

			return c.json({ result: result.recordset[0] });
		}
	)
	.get(
		"/entreprise/list",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { en_no, month, year } = c.req.valid("query");

			const pool = await getConnection();

			const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_Status,created_at,entreprise_id as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.EN_No = ${en_no}
	`;
			const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,ART_Qte,DO_TotalHT,DO_Status,created_at,entreprise_id as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} )
			select lev1.*,art.Art_Design,art.Art_Code from lev1 inner join F_ARTICLE_DIGITAL art on lev1.ART_No= art.Art_No where lev1.EN_No = ${en_no}
			`;
			let result_entete = await pool.request().query(query_entete);
			let result_ligne = await pool.request().query(query_ligne);

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

			return c.json({ result: documents });
		}
	)
	.get(
		"/entreprise/residence/list",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { en_no, month, year } = c.req.valid("query");

			const pool = await getConnection();

			const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_Status,created_at,entreprise_id as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.Client_ID = ${en_no}
	`;
			const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,ART_Qte,DO_TotalHT,DO_Status,created_at,entreprise_id as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} )
			select lev1.*,art.Art_Design,art.Art_Code from lev1 inner join F_ARTICLE_DIGITAL art on lev1.ART_No= art.Art_No where lev1.Client_ID = ${en_no}
			`;
			let result_entete = await pool.request().query(query_entete);
			let result_ligne = await pool.request().query(query_ligne);

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

			return c.json({ result: documents });
		}
	)
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const query_total = `
			select count(*) as total  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month}
		`;

		const query_valid = `
			select COUNT(*) as valid   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status=1
		`;

		const query_deleted = `
			select COUNT(*) as deleted   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Status!=1
		`;

		let result_total = await pool.request().query(query_total);
		let result_valid = await pool.request().query(query_valid);
		let result_deleted = await pool.request().query(query_deleted);

		return c.json({
			results: {
				total: result_total.recordset[0].total,
				valid: result_valid.recordset[0].valid,
				deleted: result_deleted.recordset[0].deleted,
			},
		});
	})
	.post(
		"/getBonLivraisonDigital",
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

			await channel.assertQueue("get_digital_bl_jobs");

			const jobId = ID.unique();

			channel.sendToQueue(
				"get_digital_bl_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/generateFacturesDigital",
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
		"/generateFacturesDigitalByEntreprise",
		zValidator(
			"json",
			z.object({
				en_list: z.array(z.string()),
				residence_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month, en_list, residence_list } = c.req.valid("json");

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
						residence_list: residence_list,
						type: "byEntreprise",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	)
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { month, year } = c.req.valid("json");

			const pool = await getConnection();

			const query = `select * from TRANSIT.dbo.fnc_GetCompanyMonthDetails(${year},${month})`;
			const query2 = `select * from fnc_GetResidenceMonthDetails(${year},${month})`;

			let result = await pool.request().query(query);
			let result2 = await pool.request().query(query2);

			return c.json({ result: [...result.recordset, ...result2.recordset] });
		}
	);

export default app;
