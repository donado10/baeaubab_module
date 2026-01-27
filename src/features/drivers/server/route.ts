import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/features/schema";
import createAdminClient from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { setCookie } from "hono/cookie";
import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "@/lib/constants";
import { client } from "@/lib/db-pgsql";
import { driverDocumentSchema, driverSchema } from "../schema";
import { InputFile } from "node-appwrite/file";
import z from "zod";

const app = new Hono()
	.get("/", async (c) => {
		const result = await client.query(
			"SELECT * FROM public.f_employee where em_type=1"
		);

		return c.json({ result: result.rows });
	})
	.get("/availableDriver", async (c) => {
		const result = await client.query(
			"SELECT * FROM public.f_employee where em_type=1"
		);

		return c.json({ result: result.rows });
	})
	.get("/statsAvailability", async (c) => {
		const result = await client.query(
			`SELECT
			SUM(CASE WHEN em_addons ->> 'status' = 'disponible' THEN 1 ELSE 0 END) AS disponible,
			SUM(CASE WHEN em_addons ->> 'status' = 'non_conforme' THEN 1 ELSE 0 END) AS non_conforme,
			SUM(CASE WHEN em_addons ->> 'status' = 'indisponible' THEN 1 ELSE 0 END) AS indisponible
			FROM public.f_employee `
		);

		return c.json({ result: result.rows[0] });
	})
	.get("/driversInfoTable", async (c) => {
		const result =
			await client.query(`select em_no, (em_firstname || ' ' || em_lastname) as em_fullname,
      em_addons ->> 'matricule' as em_matricule,
      em_addons ->> 'vehicule' as em_car
      ,em_addons ->> 'last_mission' as em_lastmission,
      em_addons ->> 'status' as em_status,
	  em_addons ->> 'contract_type' as em_contract from f_employee `);

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
	.get("/:driver", async (c) => {
		const driver = c.req.param("driver");
		const result = await client.query(
			"SELECT * FROM public.f_employee where em_no = $1",
			[driver]
		);

		return c.json({ result: result.rows });
	})
	.post("/", zValidator("json", driverSchema), async (c) => {
		const values = c.req.valid("json");

		const result = await client.query(
			"CALL public.insert_employee ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
			[
				values.em_firstname,
				values.em_lastname,
				values.em_birthday,
				values.em_nationality,
				values.em_birthplace,
				values.em_address,
				values.em_phonenumber,
				values.em_emergencynumber,
				values.em_email,
				Number(values.em_type),
				values.em_addons,
			]
		);

		return c.json({ message: "chauffeur crée" });
	})
	.put("/", zValidator("json", driverSchema), async (c) => {
		const values = c.req.valid("json");

		const result = await client.query(
			"CALL public.update_employee ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
			[
				values.em_no,
				values.em_firstname,
				values.em_lastname,
				values.em_birthday,
				values.em_nationality,
				values.em_birthplace,
				values.em_address,
				values.em_phonenumber,
				values.em_emergencynumber,
				values.em_email,
				Number(values.em_type),
				values.em_addons,
			]
		);

		return c.json({ message: "chauffeur mise à jour" });
	})
	.post("/uploadFile", zValidator("form", driverDocumentSchema), async (c) => {
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
			const { files } = c.req.valid("json");
			const bucket_id = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

			const storage = (await createAdminClient()).storage;

			for (let index = 0; index < files.length; index++) {
				const response = await storage.deleteFile(bucket_id, files[index]);
			}

			return c.json({ message: "files deleted" });
		}
	)
	.delete("/:driverId", async (c) => {
		const driverId = c.req.param("driverId");

		const resultSelect = await client.query(
			"SELECT em_addons ->> 'documents' as em_documents FROM public.f_employee where em_type=1 and em_no=$1",
			[driverId]
		);

		const documents = JSON.parse(resultSelect.rows[0].em_documents).map(
			(doc) => doc.file
		);

		console.log(documents);

		const bucket_id = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

		const storage = (await createAdminClient()).storage;

		for (let index = 0; index < documents.length; index++) {
			const response = await storage.deleteFile(bucket_id, documents[index]);
		}

		const resultDelete = await client.query(
			"DELETE FROM public.f_employee WHERE em_no=$1",
			[driverId]
		);

		return c.json({ message: "chauffeur supprimé" });
	});

export default app;
