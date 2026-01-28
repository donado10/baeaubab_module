import { modFeatListSchema, moduleSchema } from "@/features/schema";
import { adminActionMiddleware } from "@/lib/admin-action-middleware";
import { saActionMiddleware } from "@/lib/sa-action-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";

const app = new Hono()
	.get(
		"",

		sessionMiddleware,
		adminActionMiddleware,
		async (c) => {
			const user = c.get("user");

			const database = c.get("databases");

			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4"
			);

			return c.json({
				modules: documents.documents.map((docs) => {
					return {
						Mod_No: docs.Mod_No,
						Mod_Description: docs.Mod_Description,
						Mod_Status: docs.Mod_Status,
						Mod_Features: docs.Mod_Features,
					};
				}),
			});
		}
	)
	.get("/:moduleId", sessionMiddleware, saActionMiddleware, async (c) => {
		const user = c.get("user");
		const moduleId = c.req.param("moduleId");

		if (!user.labels.includes("sa")) {
			return c.json({ message: "Unauthorized" }, 403);
		}

		const database = c.get("databases");

		const documents = await database.listDocuments(
			process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
			"69735730000d039bb4c4",
			[Query.equal("Mod_No", [moduleId])]
		);

		return c.json({
			modules: documents.documents.map((docs) => {
				return {
					Mod_No: docs.Mod_No,
					Mod_Description: docs.Mod_Description,
					Mod_Status: docs.Mod_Status,
					Mod_Features: docs.Mod_Features,
				};
			}),
		});
	})
	.post(
		"/create",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", moduleSchema),
		async (c) => {
			const { Mod_No, Mod_Status, Mod_Description } = c.req.valid("json");

			const database = c.get("databases");
			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				[Query.equal("Mod_No", [Mod_No])]
			);

			if (documents.total > 0) {
				return c.json({ message: "Le module existe déja" }, 401);
			}

			await database.createDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				ID.unique(),
				{
					Mod_No: Mod_No,
					Mod_Status: Mod_Status,
					Mod_Description: Mod_Description,
				}
			);

			return c.json({ success: true });
		}
	)
	.post(
		"/addFeatures",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", modFeatListSchema),
		async (c) => {
			const { module, list } = c.req.valid("json");

			const database = c.get("databases");

			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				[Query.equal("Mod_No", [module ?? ""])]
			);

			if (documents.total === 0) {
				return c.json({ message: "Le module n'existe pas" }, 401);
			}

			await database.updateDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				documents.documents[0].$id,
				{
					Mod_No: documents.documents[0].Mod_No,
					Mod_Status: documents.documents[0].Mod_Status,
					Mod_Description: documents.documents[0].Mod_Description,
					Mod_Features: list,
				}
			);

			return c.json({ success: true });
		}
	)
	.post(
		"/update",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", moduleSchema),
		async (c) => {
			const { Mod_No, Mod_Status, Mod_Description } = c.req.valid("json");

			const database = c.get("databases");

			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				[Query.equal("Mod_No", [Mod_No])]
			);

			if (documents.total === 0) {
				return c.json({ message: "Le module n'existe pas" }, 401);
			}

			await database.updateDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				documents.documents[0].$id,
				{
					Mod_No: Mod_No,
					Mod_Status: Mod_Status,
					Mod_Description: Mod_Description,
				}
			);

			return c.json({ success: true });
		}
	)
	.delete(
		"/delete",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", moduleSchema),
		async (c) => {
			const { Mod_No } = c.req.valid("json");

			const database = c.get("databases");
			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				[Query.equal("Mod_No", [Mod_No])]
			);

			if (documents.total === 0) {
				return c.json({ message: "Le module n'existe pas" }, 401);
			}

			await database.deleteDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"69735730000d039bb4c4",
				documents.documents[0].$id
			);

			return c.json({ success: true });
		}
	);
export default app;
