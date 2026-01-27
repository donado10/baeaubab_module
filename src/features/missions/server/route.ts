import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/features/schema";
import createAdminClient from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { setCookie } from "hono/cookie";
import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "@/lib/constants";
import { client } from "@/lib/db-pgsql";
import {
	missionActionSchema,
	missionAffectationShema,
	missionDocumentSchema,
	missionSchema,
} from "../schema";
import { InputFile } from "node-appwrite/file";
import z, { string } from "zod";

const app = new Hono()
	.get("/", async (c) => {
		const result = await client.query("SELECT * FROM f_mission");

		return c.json({ result: result.rows });
	})
	.get("/ressources/:em_no/:car_no", async (c) => {
		const { car_no, em_no } = c.req.param();

		const driver = (
			await client.query(
				"SELECT em_no,em_firstname,em_lastname,em_addons ->> 'permis' as em_permis,em_phonenumber,em_addons ->> 'status' as em_status FROM f_employee where em_no = $1",
				[em_no]
			)
		).rows[0];

		const car = (
			await client.query(
				"SELECT car_no,car_addons ->> 'marque' as car_marque,car_addons ->> 'modele' as car_modele, car_addons->>'matricule' as car_matricule,car_addons ->> 'registrationcard' as car_registrationcard,car_addons ->> 'status' as car_status  FROM f_car where car_no = $1",
				[car_no]
			)
		).rows[0];

		return c.json({ result: { car: car, driver: driver } });
	})
	.get("/statsStatus", async (c) => {
		const result = await client.query(
			`SELECT
				SUM(CASE WHEN miss_addons ->> 'status' = 'echouees' THEN 1 ELSE 0 END) AS echouees,
				SUM(CASE WHEN miss_addons ->> 'status' = 'en_cours' THEN 1 ELSE 0 END) AS en_cours,
				SUM(CASE WHEN miss_addons ->> 'status' = 'terminees' THEN 1 ELSE 0 END) AS terminees,
				SUM(CASE WHEN miss_addons ->> 'status' = 'créer' THEN 1 ELSE 0 END) AS créer
			FROM public.f_mission`
		);

		return c.json({ result: result.rows[0] });
	})
	.get("/statMission/:miss_no", async (c) => {
		const miss_no = c.req.param("miss_no");
		const result = await client.query(
			`SELECT
				miss_addons ->> 'actualfuelcost' AS miss_actualfuelcost,
				miss_addons ->> 'actualconsumption'  AS miss_actualconsumption,
				miss_addons ->> 'actualtotalcost'  AS miss_actualtotalcost,
				miss_addons ->> 'budgetvariance'  AS miss_budgetvariance
			FROM public.f_mission where miss_no=$1`,
			[miss_no]
		);

		return c.json({ result: result.rows[0] });
	})
	.get("/missionsInfoTable", async (c) => {
		const result =
			await client.query(`select miss_no,miss_intitule, miss_client ,miss_expectedhourdeparture,
		miss_expectedhourarrival,miss_trajetzone,
      miss_expectedtotalbudget as miss_budget, 
	  miss_addons ->> 'status' as miss_status
      from public.f_mission
 `);

		const format_result = result.rows.map((row) => {
			return {
				...row,
				miss_horaire: `De ${row.miss_expectedhourdeparture} à ${row.miss_expectedhourarrival}`,
			};
		});

		return c.json({ result: format_result });
	})
	.get("/file/:fileID", async (c) => {
		const fileID = c.req.param("fileID");
		const storage = (await createAdminClient()).storage;

		const bucket_id = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

		const file_metadata = await storage.getFile(
			bucket_id, // bucketId
			fileID // fileId
		);

		const result = await storage.getFileDownload(
			bucket_id, // bucketId
			fileID // fileId
		);

		return new Response(result, {
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Disposition": `attachment; filename="${file_metadata.name}.pdf"`,
			},
		});
	})
	.get("/:mission", async (c) => {
		const mission = c.req.param("mission");
		const result = await client.query(
			"SELECT * FROM public.f_mission where miss_no = $1",
			[mission]
		);

		return c.json({ result: result.rows });
	})
	.post("/", zValidator("json", missionSchema), async (c) => {
		const values = c.req.valid("json");

		await client.query(
			"CALL public.insert_mission ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
			[
				values.miss_intitule,
				values.miss_description,
				values.miss_client,
				values.miss_trajetzone,
				values.miss_expecteddatedeparture,
				values.miss_expecteddatearrival,
				values.miss_expectedhourdeparture,
				values.miss_expectedhourarrival,
				values.miss_expectedduration,
				values.miss_expecteddistance,
				values.miss_expectedfuelbudget,
				values.miss_othersexpectedbudget,
				values.miss_expectedtotalbudget,
				values.miss_addons,
			]
		);

		return c.json({ message: "Mission crée" });
	})
	.put("/", zValidator("json", missionSchema), async (c) => {
		const values = c.req.valid("json");

		await client.query(
			"CALL public.update_mission ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
			[
				values.miss_no,
				values.miss_intitule,
				values.miss_description,
				values.miss_client,
				values.miss_trajetzone,
				values.miss_expecteddatedeparture,
				values.miss_expecteddatearrival,
				values.miss_expectedhourdeparture,
				values.miss_expectedhourarrival,
				values.miss_expectedduration,
				values.miss_expecteddistance,
				values.miss_expectedfuelbudget,
				values.miss_othersexpectedbudget,
				values.miss_expectedtotalbudget,
				values.miss_addons,
			]
		);

		return c.json({ message: "Mission mis à jour" });
	})
	.post("/uploadFile", zValidator("form", missionDocumentSchema), async (c) => {
		const fileSchema = z.instanceof(File);
		const bucket_id = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

		const file = c.req.valid("form");

		const storage = (await createAdminClient()).storage;
		const file_id = ID.unique();

		if (fileSchema.safeParse(file.file)) {
			const response = await storage.createFile(
				bucket_id,
				file_id,
				InputFile.fromBuffer(file.file, file.nom + "." + "pdf")
			);
		}

		return c.json({ message: "files uploaded", id: file_id });
	})
	.post(
		"/affectationMission",
		zValidator("json", missionAffectationShema),
		async (c) => {
			const { miss_no, miss_car, miss_driver } = c.req.valid("json");

			const result = await client.query(
				`update public.f_mission 
				set miss_addons = miss_addons || '{"car": ${miss_car} ,"driver": ${miss_driver} }'::jsonb where miss_no=$1 `,
				[miss_no]
			);

			return c.json({ message: "mission affectée" });
		}
	)
	.post(
		"/statusMission",
		zValidator("json", missionActionSchema),
		async (c) => {
			const values = c.req.valid("json");

			const values_arr = Object.entries(values);

			let values_obj = "";

			values_arr.forEach((val, i, arr) => {
				values_obj =
					values_obj +
					`"${val[0]}":"${val[1]}"${arr.length == i + 1 ? "" : ","}`;
			});

			const query = `update public.f_mission 
			set miss_addons = miss_addons || '{${values_obj}}'::jsonb where miss_no=$1`;

			if (values.status === "en_cours") {
				await client.query(
					`update public.f_employee em
				set em_addons = em.em_addons || '{"status":"indisponible"}'::JSONB
				FROM public.f_mission miss
				where (miss.miss_addons->>'driver')::INT = em.em_no::INT and miss.miss_no=$1`,
					[values.miss_no]
				);

				await client.query(
					`update public.f_car car
				set car_addons = car.car_addons || '{"status":"en_mission"}'::JSONB
				FROM public.f_mission miss
				where (miss.miss_addons->>'car')::INT = car.car_no::INT and miss.miss_no=$1`,
					[values.miss_no]
				);
			}

			if (values.status === "terminees") {
				await client.query(
					`update public.f_employee em
				set em_addons = em.em_addons || '{"status":"disponible"}'::JSONB
				FROM public.f_mission miss
				where (miss.miss_addons->>'driver')::INT = em.em_no::INT and miss.miss_no=$1`,
					[values.miss_no]
				);

				await client.query(
					`update public.f_car car
				set car_addons = car.car_addons || '{"status":"disponible"}'::JSONB
				FROM public.f_mission miss
				where (miss.miss_addons->>'car')::INT = car.car_no::INT and miss.miss_no=$1`,
					[values.miss_no]
				);
			}

			const result = await client.query(` ${query}`, [values.miss_no]);

			return c.json({ message: "status changé", status: values.status });
		}
	)
	.delete(
		"/deleteFile",
		zValidator("json", z.object({ files: z.array(z.string()) })),
		async (c) => {
			const fileSchema = z.instanceof(File);
			const bucket_id = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

			const { files } = c.req.valid("json");

			const storage = (await createAdminClient()).storage;

			for (let index = 0; index < files.length; index++) {
				const response = await storage.deleteFile(bucket_id, files[index]);
			}

			return c.json({ message: "files deleted" });
		}
	)
	.delete("/", zValidator("json", missionSchema), async (c) => {
		const values = c.req.valid("json");

		const result = await client.query(
			"DELETE FROM public.f_mission WHERE mission_no=$1",
			[values.miss_no]
		);

		return c.json({ message: "mission supprimé" });
	});

export default app;
