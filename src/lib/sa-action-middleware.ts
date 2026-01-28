import { createMiddleware } from "hono/factory";

export const saActionMiddleware = createMiddleware(async (c, next) => {
	const currentUser = c.get("user");

	if (currentUser.labels.includes("admin")) {
		await next();
	}
	return c.json({ message: "Unauthorized" }, 403);
});
