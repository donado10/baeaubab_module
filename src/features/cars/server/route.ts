import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/features/schema";
import createAdminClient from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { setCookie } from "hono/cookie";
import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "@/lib/constants";
import { client } from "@/lib/db-pgsql";
import { carDocumentSchema, carSchema } from "../schema";
import { InputFile } from "node-appwrite/file";
import z from "zod";

const app = new Hono()
	.get("/", async (c) => {
		const result = await client.query("SELECT * FROM f_car");

		return c.json({ result: result.rows });
	})
	.get("/availableCar", async (c) => {
		const result = await client.query("SELECT * FROM f_car ");

		return c.json({ result: result.rows });
	})
	.get("/statsAvailability", async (c) => {
		const result = await client.query(
			`SELECT
			SUM(CASE WHEN car_addons ->> 'status' = 'disponible' THEN 1 ELSE 0 END) AS disponible,
			SUM(CASE WHEN car_addons ->> 'status' = 'en_mission' THEN 1 ELSE 0 END) AS en_mission,
			SUM(CASE WHEN car_addons ->> 'status' = 'indisponible' THEN 1 ELSE 0 END) AS indisponible
			FROM public.f_car `
		);

		console.log(result.rows[0]);
		return c.json({ result: result.rows[0] });
	})
	.get("/marques", async (c) => {
		const result = await client.query(
			"SELECT car_addons ->> 'marque' as car_marque FROM f_car "
		);

		return c.json({ result: result.rows });
	})
	.get("/marque/:marqueID", async (c) => {
		const marqueID = c.req.param("marqueID");
		const result = await client.query(
			"SELECT * FROM f_car where car_addons ->> 'marque' = $1",
			[marqueID]
		);

		return c.json({ result: result.rows });
	})
	.get("/carsInfoTable", async (c) => {
		const result =
			await client.query(`select car_no, car_addons ->> 'matricule' as car_matricule ,
      car_addons ->> 'modele' as car_modele,
      (emp.em_firstname || ' ' || emp.em_lastname) as car_fullname,
      car.car_mileage as car_mileage,car_addons ->>'status' as car_status
      from public.f_car car left join public.f_employee emp
      on (emp.em_addons->>'car')::int =car.car_no
 `);
		return c.json({ result: result.rows });
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
	.get("/:car", async (c) => {
		const car = c.req.param("car");
		const result = await client.query(
			"SELECT * FROM public.f_car where car_no = $1",
			[car]
		);

		return c.json({ result: result.rows });
	})
	.put("/", zValidator("json", carSchema), async (c) => {
		const values = c.req.valid("json");

		const result = await client.query(
			"CALL public.update_car ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
			[
				values.car_no,
				values.car_fueltype,
				values.car_tankcapacity,
				values.car_mileage,
				values.car_chassisnumber,
				values.car_enginenumber,
				values.car_fiscalpower,
				values.car_payload,
				values.car_acquisitiondate,
				values.car_acquisitiontype,
				values.car_registrationnumber,
				values.car_circulationdate,
				values.car_acquisitionvalue,
				values.car_owner,
				values.car_addons,
			]
		);

		return c.json({ message: "véhicule mise à jour" });
	})
	.post("/", zValidator("json", carSchema), async (c) => {
		const values = c.req.valid("json");

		await client.query(
			"CALL public.insert_car ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
			[
				values.car_fueltype,
				values.car_tankcapacity,
				values.car_mileage,
				values.car_chassisnumber,
				values.car_enginenumber,
				values.car_fiscalpower,
				values.car_payload,
				values.car_acquisitiondate,
				values.car_acquisitiontype,
				values.car_registrationnumber,
				values.car_circulationdate,
				values.car_acquisitionvalue,
				values.car_owner,
				values.car_addons,
			]
		);

		return c.json({ message: "Véhicule crée" });
	})
	.post("/uploadFile", zValidator("form", carDocumentSchema), async (c) => {
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
	.delete("/", zValidator("json", carSchema), async (c) => {
		const values = c.req.valid("json");

		const result = await client.query(
			"DELETE FROM public.f_car WHERE car_no=$1",
			[values.car_no]
		);

		return c.json({ message: "véhicule supprimé" });
	});

export default app;
