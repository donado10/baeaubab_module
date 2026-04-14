import { createMiddleware } from "hono/factory";

export const saActionMiddleware = createMiddleware(async (c, next) => {
	const currentUser = c.get("user");

	if (!currentUser.labels.includes("sa")) {
		return c.json({ message: "Unauthorized" }, 403);
	}
	await next();
});
