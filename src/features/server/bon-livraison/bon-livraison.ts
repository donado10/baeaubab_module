import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { getConnection } from "@/lib/db-mssql";
import amqp from "amqplib";
import { ID } from "node-appwrite";

const getAdjacentEntreprises = async (
	entreprise_id: string,
	year: string,
	month: string
) => {
	const query = `
		WITH RankedRows AS (
    SELECT 
        DO_Entreprise_Sage,
        ROW_NUMBER() OVER (ORDER BY DO_Entreprise_Sage) AS rn
    FROM F_DOCENTETE_DIGITAL where year(created_at) = ${year} and month(created_at) = ${month} and DO_Type=3 group by DO_Entreprise_Sage
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
		previous: null,
		current: null,
		next: null,
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

const getBonLivraisonEntreprise = async (
	entreprise_id: string,
	year: string,
	month: string
) => {
	const pool = await getConnection();

	const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_Status,DO_Valide,created_at,DO_ENTREPRISE_SAGE as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Type=3 and DO_Entreprise_Sage='${entreprise_id}' )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No 
	`;
	const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,ART_Qte,DO_TotalHT,DO_Status,created_at,DO_ENTREPRISE_SAGE as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(created_at) = ${year} and MONTH(created_at)=${month} and DO_Type=3 and DO_Entreprise_Sage='${entreprise_id}' )
			select lev1.*,art.Art_Design,art.Art_Code from lev1 inner join F_ARTICLE_DIGITAL art on lev1.ART_No= art.Art_No 
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

			const entreprisesAdjacent = await getAdjacentEntreprises(
				entreprise_id,
				year,
				month
			);
			const entreprise = await getEntreprise(entreprise_id);
			const entrepriseDG = await getEntrepriseDG(entreprise_id);
			const documents = await getBonLivraisonEntreprise(
				entreprise_id,
				year,
				month
			);

			return c.json({
				results: {
					entreprise: entreprise,
					entrepriseDG: entrepriseDG,
					documents: documents,
					adjacent: entreprisesAdjacent,
				},
			});
		}
	)
	.post(
		"/updateBonLivraisonByEntreprise",
		zValidator(
			"json",
			z.object({
				en_list_valid: z.array(z.string()),
				en_list_invalid: z.array(z.string()),
				year: z.string(),
				month: z.string(),
			})
		),
		async (c) => {
			const { year, month, en_list_valid, en_list_invalid } =
				c.req.valid("json");

			if (en_list_invalid.length > 0) {
				const pool = await getConnection();
				const query = `delete from TRANSIT.dbo.F_DOCENTETE_DIGITAL where DO_ENTREPRISE_SAGE in (${en_list_invalid.map((en) => `'${en}'`).join(",")});
            delete from TRANSIT.dbo.F_DOCligne_DIGITAL where DO_ENTREPRISE_SAGE in (${en_list_invalid.map((en) => `'${en}'`).join(",")})
            `;

				await pool.request().query(query);
			}

			const conn = await amqp.connect(process.env.RABBIT_MQ_HOST!);
			const channel = await conn.createChannel();

			await channel.assertQueue("get_digital_bl_jobs");

			const jobId = ID.unique();

			const en_list = [...en_list_valid, ...en_list_invalid];

			channel.sendToQueue(
				"get_digital_bl_jobs",
				Buffer.from(
					JSON.stringify({
						jobId: jobId,
						year: year,
						month: month,
						en_list: en_list,
						type: "bl_some",
					})
				)
			);

			return c.json({ results: [], jobId: jobId });
		}
	);
export default app;
