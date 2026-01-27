import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";
import drivers from "@/features/drivers/server/route";
import cars from "@/features/cars/server/route";
import missions from "@/features/missions/server/route";
export const runtime = "nodejs";

const app = new Hono().basePath("api");

const routes = app
  .route("/auth", auth)
  .route("/drivers", drivers)
  .route("/cars", cars)
  .route("/missions", missions);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
