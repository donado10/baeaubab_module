import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import amqp from "amqplib";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";

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
    FROM F_DOCENTETE_DIGITAL where year(do_date) = ${year} and month(do_date) = ${month} and DO_Type=6 group by DO_Entreprise_Sage
	)
	SELECT 
		prev.DO_Entreprise_Sage as previous ,
		curr.DO_Entreprise_Sage as [current] ,
		next.DO_Entreprise_Sage as  [next]
	FROM RankedRows curr
	LEFT JOIN RankedRows prev ON prev.rn = curr.rn - 1
	LEFT JOIN RankedRows next ON next.rn = curr.rn + 1
	WHERE curr.DO_Entreprise_Sage = '${entreprise_id}'
	`;
	const pool = await getConnection();
	const result = await pool.request().query(query);

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
	const query = `
		SELECT TOP 1 *
		FROM TRANSIT.dbo.F_COMPTET_DIGITAL
		WHERE CT_Entreprise_Sage = '${entreprise_id}' AND CT_DG = 1
	`;
	const pool = await getConnection();
	const result = await pool.request().query(query);

	return result.recordset[0];
};

const getEntreprise = async (entreprise_id: string) => {
	const query = `
		SELECT TOP 1 *
		FROM TRANSIT.dbo.F_ENTREPRISE_DIGITAL
		WHERE EN_No_Sage = '${entreprise_id}'
	`;
	const pool = await getConnection();
	const result = await pool.request().query(query);

	return result.recordset[0];
};

const getFactureEntreprise = async (
	entreprise_id: string,
	year: string,
	month: string,
) => {
	const pool = await getConnection();

	const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_TotalTVA,DO_TotalTTC,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6 )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.EN_No = '${entreprise_id}'
	`;
	const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,Art_Design,ART_Qte,DO_TotalHT,DO_Status,DO_Date,DO_Entreprise_Sage as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(do_date) = ${year} and MONTH(do_date)=${month} and do_type=6 )
			select lev1.*, NULL as Art_Code from lev1 where lev1.EN_No = '${entreprise_id}'
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
				en_list: z.array(z.string()),
				bl_list: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			}),
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
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.delete(
		"/cancel",
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

			const query = `
				delete from transit.dbo.f_docentete_digital where year(DO_Date) = ${year} and month(DO_Date) = ${month} and do_type=6 and do_entreprise_sage in (${en_list.map((en) => `'${en}'`).join(",")});
				delete from transit.dbo.f_docligne_digital where year(DO_Date) = ${year} and month(DO_Date) = ${month} and do_type=6 and do_entreprise_sage in (${en_list.map((en) => `'${en}'`).join(",")});
				update transit.dbo.f_docentete_digital
				set do_valide=0,DO_FactureReference=NULL
				where year(created_at) = ${year} and month(created_at) = ${month} and do_type=3 and do_entreprise_sage in (${en_list.map((en) => `'${en}'`).join(",")});
				update transit.dbo.f_docligne_digital
				set DO_FactureReference=NULL
				where year(created_at) = ${year} and month(created_at) = ${month} and do_type=3 and do_entreprise_sage in (${en_list.map((en) => `'${en}'`).join(",")});
				
				`;
			await pool.request().query(query);

			return c.json({ result: "done" });
		},
	)
	.delete(
		"/cancelByDocument",
		zValidator(
			"json",
			z.object({
				fact_list: z.array(z.string()),
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { year, month, fact_list, en_no } = c.req.valid("json");

			console.log(fact_list, en_no, year, month);
			const pool = await getConnection();

			const query = `
				delete from transit.dbo.f_docentete_digital where year(DO_Date) = ${year} and month(DO_Date) = ${month} and do_type=6 and do_entreprise_sage in ('${en_no}') and DO_No in (${fact_list.map((bl) => `'${bl}'`).join(",")});
				delete from transit.dbo.f_docligne_digital where year(DO_Date) = ${year} and month(DO_Date) = ${month} and do_type=6 and do_entreprise_sage in ('${en_no}') and DO_No in (${fact_list.map((bl) => `'${bl}'`).join(",")});
				update transit.dbo.f_docentete_digital
				set do_valide=0,DO_FactureReference=NULL
				where year(created_at) = ${year} and month(created_at) = ${month} and do_type=3 and do_entreprise_sage in ('${en_no}') and DO_FactureReference in (${fact_list.map((bl) => `'${bl}'`).join(",")});
				update transit.dbo.f_docligne_digital
				set DO_FactureReference=NULL
				where year(created_at) = ${year} and month(created_at) = ${month} and do_type=3 and do_entreprise_sage in ('${en_no}') and DO_FactureReference in (${fact_list.map((bl) => `'${bl}'`).join(",")});
				
				`;

			await pool.request().query(query);

			return c.json({ result: "done" });
		},
	);

export default app;
