import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z, { string } from "zod";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";
import amqp from "amqplib";
import sql from "mssql";

const app = new Hono()

	.get(
		"/entreprise/dg",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
			}),
		),
		async (c) => {
			const { en_no } = c.req.valid("query");

			const pool = await getConnection();

			const result = await pool
				.request()
				.input("en_no", sql.NVarChar, en_no)
				.query(
					`select * from TRANSIT.dbo.F_COMPTET_DIGITAL where ct_dg=1 and ct_entreprise=@en_no`,
				);

			return c.json({ result: result.recordset[0] });
		},
	)
	.get(
		"/entreprise/list",
		zValidator(
			"query",
			z.object({
				en_no: z.string(),
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { en_no, month, year } = c.req.valid("query");

			const pool = await getConnection();

			const query_entete = `
		with lev1 as (select DO_No,Client_ID,CT_Num,DO_TotalHT,DO_TotalTVA,DO_TotalTTC,DO_Status,DO_Date,entreprise_id as EN_No FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type=6 )
			select lev1.*,ct.CT_No,ct.CT_Intitule,ct.CT_Phone,ct.CT_Addresse,ct.CT_Email from lev1 inner join TRANSIT.DBO.F_COMPTET_DIGITAL ct on lev1.Client_ID= ct.CT_No where lev1.EN_No = @en_no
	`;
			const query_ligne = `
			with lev1 as (select DO_No,Client_ID,CT_Num,ART_No,ART_Qte,DO_TotalHT,DO_Status,DO_Date,entreprise_id as EN_No,DO_PrixUnitaire FROM [TRANSIT].[dbo].[F_DOCligne_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type=6 )
			select lev1.*,NULL as Art_Design, NULL as Art_Code from lev1 where lev1.EN_No = @en_no
			`;
			let result_entete = await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.input("en_no", sql.NVarChar, en_no)
				.query(query_entete);
			let result_ligne = await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.input("en_no", sql.NVarChar, en_no)
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

			return c.json({ result: documents ?? [] });
		},
	)
	.get("/:year/:month", async (c) => {
		const month = c.req.param("month");
		const year = c.req.param("year");

		const pool = await getConnection();

		const result_total = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select sum(do_totalttc) as total  FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month and do_type=6`,
			);

		const result_taxable = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select sum(do_totalttc) as taxable   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month  and do_type=6 and do_totalttc != do_totalht`,
			);

		const result_exo = await pool
			.request()
			.input("year", sql.Int, parseInt(year))
			.input("month", sql.Int, parseInt(month))
			.query(
				`select sum(do_totalttc) as exo   FROM [TRANSIT].[dbo].[F_DOCENTETE_DIGITAL] where YEAR(do_date) = @year and MONTH(do_date)=@month  and do_type=6 and do_totalttc = do_totalht`,
			);

		return c.json({
			results: {
				total: result_total.recordset[0].total,
				taxable: result_taxable.recordset[0].taxable,
				exo: result_exo.recordset[0].exo,
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
			}),
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
					}),
				),
			);

			return c.json({ results: [], jobId: jobId });
		},
	)
	.post(
		"/generateFacturesDigital",
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
		"/generateFacturesDigitalByEntreprise",
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
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				year: z.string(),
				month: z.string(),
			}),
		),
		async (c) => {
			const { month, year } = c.req.valid("json");

			const pool = await getConnection();

			const result = await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.query(`with lev1 as (select entreprise_id,count(do_no) as nbre_bls from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(DO_Date)=@year and month(DO_Date)=@month and do_type = 6 group by entreprise_id),
			lev2 as (select entreprise_id,sum(DO_TotalHT) as totalHT,sum(DO_TotalTVA) as totalTVA,sum(DO_TotalTTC) as totalTTC from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(DO_Date)=@year and month(DO_Date)=@month and do_type=6 group by entreprise_id),
			lev3 as (select lev1.entreprise_id as EN_No,nbre_bls as EN_BonLivraisons,totalHT as EN_TotalHT,totalTTC as EN_TotalTTC,totalTVA as EN_TotalTVA 
			from lev1 inner join lev2 on lev1.entreprise_id = lev2.entreprise_id ),
			lev4 as (select lev3.*,en.EN_Intitule,en.EN_TVA from lev3 inner join F_ENTREPRISE_DIGITAL en on lev3.EN_No = en.EN_No),
			lev5 as (select CT_Entreprise,count(CT_Entreprise) as EN_Agences from F_COMPTET_DIGITAL  group by CT_Entreprise)
			select lev4.*,lev5.EN_Agences from lev4 inner join lev5 on lev4.EN_No = lev5.CT_Entreprise order by en_no`);

			const result2 = await pool
				.request()
				.input("year", sql.Int, parseInt(year))
				.input("month", sql.Int, parseInt(month))
				.query(`with lev1 as (select ct_num, COUNT(DO_No) as nbre_bls from F_DOCENTETE_DIGITAL where year(DO_Date) = @year and month(DO_Date) = @month and entreprise_id is null and DO_Status !=2 and do_type = 6 group by CT_Num),
			lev2 as (select ct_num,sum(DO_TotalHT) as totalHT,sum(DO_TotalTVA) as totalTVA,sum(DO_TotalTTC) as totalTTC from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(DO_Date)=@year and month(DO_Date)=@month and do_type = 6 group by CT_Num),
			lev3 as (select lev1.ct_num as EN_CL,nbre_bls as EN_BonLivraisons,totalHT as EN_TotalHT,totalTTC as EN_TotalTTC,totalTVA as EN_TotalTVA  from lev1 inner join lev2 on lev1.ct_num = lev2.CT_Num )
			select ct.CT_No as EN_No,ct.CT_TVA as EN_TVA,ct.type_client_id as EN_Type,lev3.EN_BonLivraisons,lev3.EN_TotalHT,lev3.EN_TotalTVA,lev3.EN_TotalTTC,CT_Intitule as EN_Intitule,1 as EN_Agences from lev3 inner join F_COMPTET_DIGITAL ct on lev3.EN_CL = ct.CT_Num`);

			return c.json({ result: [...result.recordset, ...result2.recordset] });
		},
	)
	.delete(
		"/all",
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
				.input("month", sql.Int, parseInt(month)).query(`
			delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6;
			delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6;
			update transit.dbo.f_docentete_digital
			set do_valide=0
			where year(created_at) = @year and month(created_at) = @month and do_type=3
			`);

			return c.json({ result: "done" });
		},
	)
	.delete(
		"/some",
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
			delete from transit.dbo.f_docentete_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and entreprise_id in (${enParams});
			delete from transit.dbo.f_docligne_digital where year(DO_Date) = @year and month(DO_Date) = @month and do_type=6 and entreprise_id in (${enParams});
			update transit.dbo.f_docentete_digital
			set do_valide=0
			where year(created_at) = @year and month(created_at) = @month and do_type=3 and entreprise_id in (${enParams});
			`);

			return c.json({ result: "done" });
		},
	);

export default app;
