import { createMiddleware } from "hono/factory";

export const adminActionMiddleware = createMiddleware(async (c, next) => {
	const currentUser = c.get("user");

	if (!currentUser.labels.includes("admin")) {
		return c.json({ message: "Unauthorized" }, 403);
	}
	await next();
});
