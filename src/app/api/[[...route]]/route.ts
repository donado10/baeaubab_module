import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";
import ecritureDigitale from "@/features/digitale/ecritures/server/route";
import modules from "@/features/modules/server/route";
export const runtime = "nodejs";

const app = new Hono().basePath("api");

const routes = app
	.route("/auth", auth)
	.route("/modules", modules)
	.route("/digitale/ecritures", ecritureDigitale);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
