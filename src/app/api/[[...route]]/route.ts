import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";
import ecritureDigitale from "@/features/digitale/ecritures/server/route";
import bonLivraison2 from "@/features/digitale/bonLivraison/server/route";
import bonLivraison from "@/features/server/bon-livraison/bon-livraison";
import bonLivraisonStats from "@/features/server/bon-livraison/stats";
import facture from "@/features/digitale/bills/server/route";
import ecritureDigitaleEvents from "@/features/digitale/ecritures/server/route_events";
import bonLivraisonEvents from "@/features/digitale/bonLivraison/server/route_events";
import factureEvents from "@/features/digitale/bills/server/route_events";
import modules from "@/features/modules/server/route";
export const runtime = "nodejs";

const app = new Hono().basePath("api");

const routes = app
	.route("/auth", auth)
	.route("/bon-livraison", bonLivraison)
	.route("/bon-livraison/stats", bonLivraisonStats)
	.route("/digitale/ecritures", ecritureDigitale)
	.route("/digitale/ecritures/events", ecritureDigitaleEvents)
	.route("/digitale/bonLivraison/events", bonLivraisonEvents)
	.route("/digitale/facture/events", factureEvents)
	.route("/digitale/bonLivraison", bonLivraison2)
	.route("/digitale/facture", facture)
	.route("/modules", modules);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
