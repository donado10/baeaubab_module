import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/features/schema";
import createAdminClient from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { setCookie } from "hono/cookie";
import { sessionMiddleware } from "@/lib/session-middleware";
import { AUTH_COOKIE } from "@/lib/constants";

const app = new Hono()
	.get("/current", sessionMiddleware, (c) => {
		const user = c.get("user");

		return c.json({ user });
	})
	.post("/login", zValidator("json", loginSchema), async (c) => {
		const { username, password } = c.req.valid("json");

		const { account } = await createAdminClient();

		const email = `${username.toLowerCase()}@amd.sn`;
		const password_ = `${password}123456789`;

		const session = await account.createEmailPasswordSession(email, password_);

		setCookie(c, AUTH_COOKIE, session.secret, {
			path: "/",
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30,
			sameSite: "strict",
			secure: false,
		});

		return c.json({ success: true, userID: session.userId });
	})
	.post("/logout", sessionMiddleware, async (c) => {
		const account = c.get("account");

		await account.deleteSessions();

		return c.json({ success: true });
	})
	.post("register", zValidator("json", registerSchema), async (c) => {
		const { username, password, confirmPassword } = c.req.valid("json");

		if (password != confirmPassword) {
			return c.json({ message: "The email and password are differents" });
		}

		const { account } = await createAdminClient();

		const email = `${username.toLowerCase()}@amd.sn`;
		const password_ = `${password}123456789`;

		await account.create(ID.unique(), email, password_, username);

		return c.json({ success: true });
	});

export default app;
