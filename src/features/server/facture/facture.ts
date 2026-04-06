import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";

const getFactureEntreprise = async (
	entreprise_id: string,
	year: string,
	month: string
) => {
	const pool = await getConnection();

	const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_TotalTVA,DO_TotalTTC,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6 )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.EN_No = '${entreprise_id}'
	`;
	const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,ART_Qte,DO_TotalHT,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6 )
			select lev1.*,NULL as Art_Design, NULL as Art_Code from lev1 where lev1.EN_No = '${entreprise_id}'
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

	return documents;
};

const app = new Hono()
	.get(
		"/entreprise/:entreprise_id",
		zValidator(
			"query",
			z.object({
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month } = c.req.valid("query");
			const { entreprise_id } = c.req.param();

			const documents = await getFactureEntreprise(entreprise_id, year, month);

			return c.json({
				results: {
					documents: documents,
				},
			});
		}
	)
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
