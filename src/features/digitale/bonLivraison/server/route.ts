import { modFeatListSchema, moduleSchema } from "@/features/schema";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { saActionMiddleware } from "@/lib/sa-action-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import amqp from "amqplib";
import { pool } from "@/lib/db-mysql";
import z from "zod";
import { ID } from "node-appwrite";
import { getConnection } from "@/lib/db-mssql";
import { entrepriseBonLivraisonSchema } from "../schema";

const app = new Hono().get("/:year/:month", async (c) => {
	const year = c.req.param("year");
	const month = c.req.param("month");

	const pool = await getConnection();

	const query = `with lev1 as (select entreprise_id,count(do_no) as nbre_bls from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(created_at)=${year} and month(created_at)=${month} group by entreprise_id),
lev2 as (select entreprise_id,sum(DO_TotalHT) as totalHT from F_DOCENTETE_DIGITAL where DO_Status !=2 and year(created_at)=${year} and month(created_at)=${month} group by entreprise_id),
lev3 as (select lev1.entreprise_id as EN_No,nbre_bls as EN_BonLivraisons,totalHT as EN_TotalHT 
from lev1 inner join lev2 on lev1.entreprise_id = lev2.entreprise_id ),
lev4 as (select lev3.*,en.EN_Intitule,en.EN_TVA from lev3 inner join F_ENTREPRISE_DIGITAL en on lev3.EN_No = en.EN_No),
lev5 as (select CT_Entreprise,count(CT_Entreprise) as EN_Agences from F_COMPTET_DIGITAL  group by CT_Entreprise)
select lev4.*,lev5.EN_Agences from lev4 inner join lev5 on lev4.EN_No = lev5.CT_Entreprise order by en_no


`;

	let result = await pool.request().query(query);

	return c.json({ result: result.recordset });
});

export default app;
