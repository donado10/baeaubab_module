import { featureSchema } from "@/features/schema";
import { saActionMiddleware } from "@/lib/sa-action-middleware";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";

const app = new Hono()
	.get(
		"",

		sessionMiddleware,
		saActionMiddleware,
		async (c) => {
			const user = c.get("user");

			if (!user.labels.includes("sa")) {
				return c.json({ message: "Unauthorized" }, 403);
			}

			const database = c.get("databases");

			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4"
			);

			return c.json({
				features: documents.documents.map((docs) => {
					return {
						Feat_No: docs.Feat_No,
						Feat_Description: docs.Feat_Description,
						Feat_Status: docs.Feat_Status,
					};
				}),
			});
		}
	)
	.post(
		"/create",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", featureSchema),
		async (c) => {
			const { Feat_No, Feat_Status, Feat_Description } = c.req.valid("json");

			const database = c.get("databases");
			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				[Query.equal("Feat_No", [Feat_No])]
			);

			if (documents.total > 0) {
				return c.json({ message: "Le feature existe déja" }, 401);
			}

			await database.createDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				ID.unique(),
				{
					Feat_No: Feat_No,
					Feat_Status: Feat_Status,
					Feat_Description: Feat_Description,
				}
			);

			return c.json({ success: true });
		}
	)
	.post(
		"/update",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", featureSchema),
		async (c) => {
			const { Feat_No, Feat_Status, Feat_Description } = c.req.valid("json");

			const database = c.get("databases");

			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				[Query.equal("Feat_No", [Feat_No])]
			);

			if (documents.total === 0) {
				return c.json({ message: "Le feature n'existe pas" }, 401);
			}

			await database.updateDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				documents.documents[0].$id,
				{
					Feat_No: Feat_No,
					Feat_Status: Feat_Status,
					Feat_Description: Feat_Description,
				}
			);

			return c.json({ success: true });
		}
	)
	.delete(
		"/delete",
		sessionMiddleware,
		saActionMiddleware,
		zValidator("json", featureSchema),
		async (c) => {
			const { Feat_No } = c.req.valid("json");

			const database = c.get("databases");
			const documents = await database.listDocuments(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				[Query.equal("Feat_No", [Feat_No])]
			);

			if (documents.total === 0) {
				return c.json({ message: "Le feature n'existe pas" }, 401);
			}

			await database.deleteDocument(
				process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
				"6973573c002947562ff4",
				documents.documents[0].$id
			);

			return c.json({ success: true });
		}
	);
export default app;
