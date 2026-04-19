# Plan: Ecriture-Comptable Job Endpoints

## TL;DR

Add 3 POST endpoints in `ecriture-comptable.ts` that publish messages to the `facture-jobs` RabbitMQ queue, triggering the 3 écritures-from-factures handlers in worker_2. Also extend `jobTypeEnum` to include the 3 new job types, and register the route in the main API router.

**Decisions**

- Uses `sessionMiddleware + adminActionMiddleware` (user confirmed admin-only)
- SSE reuses the existing `/digitale/facture/events` endpoint (same queue, same worker)
- Queue name: `"facture-jobs"` (hardcoded, consistent with existing facture.ts)
- `JobModule`: `"facture"` (consistent with worker_2 being the facture worker)

---

## Phase 1 — Extend JobType enum (blocks Phase 2)

**Step 1.** In `src/features/server/job/schema.ts`, add 3 new values to `jobTypeEnum`:

- `"ecrituresFromFacture"`
- `"ecrituresFromAllFactures"`
- `"ecrituresFromSelectedFactures"`

---

## Phase 2 — Implement the route file (depends on Step 1)

**Step 2.** Implement `src/features/server/ecriture-comptable/ecriture-comptable.ts`:

Imports needed:

- `Hono` from `"hono"`
- `zValidator` from `"@hono/zod-validator"`
- `z` from `"zod"`
- `amqp` from `"amqplib"`
- `ID` from `"node-appwrite"`
- `sessionMiddleware` from `"@/lib/session-middleware"`
- `adminActionMiddleware` from `"@/lib/admin-action-middleware"`
- `createJob` from `"@/features/server/job/create-job"`

Three POST endpoints on a Hono app with `.use(sessionMiddleware).use(adminActionMiddleware)`:

a) `POST /fromFacture`

- zValidator body: `{ year: z.string(), month: z.string(), do_no: z.string() }`
- Queue message: `{ jobId, year, month, do_no, type: "ecrituresFromFacture" }`
- createJob: `(jobId, "facture", "ecrituresFromFacture", user.$id)`

b) `POST /fromAllFactures`

- zValidator body: `{ year: z.string(), month: z.string() }`
- Queue message: `{ jobId, year, month, type: "ecrituresFromAllFactures" }`
- createJob: `(jobId, "facture", "ecrituresFromAllFactures", user.$id)`

c) `POST /fromSelectedFactures`

- zValidator body: `{ year: z.string(), month: z.string(), do_nos: z.array(z.string()) }`
- Queue message: `{ jobId, year, month, do_nos, type: "ecrituresFromSelectedFactures" }`
- createJob: `(jobId, "facture", "ecrituresFromSelectedFactures", user.$id)`

All 3 return `c.json({ results: [], jobId })`.

---

## Phase 3 — Register the route (depends on Phase 2)

**Step 3.** In `src/app/api/[[...route]]/route.ts`:

- Add import: `import ecritureComptable from "@/features/server/ecriture-comptable/ecriture-comptable";`
- Add route: `.route("/ecriture-comptable", ecritureComptable)` (after the facture routes)

---

## Relevant Files

- `src/features/server/job/schema.ts` — extend `jobTypeEnum`
- `src/features/server/ecriture-comptable/ecriture-comptable.ts` — implement (currently empty)
- `src/app/api/[[...route]]/route.ts` — register route
- `src/features/server/facture/facture.ts` — reference template for pattern
- `src/lib/admin-action-middleware.ts` — middleware to import
- `Queue/worker_2/handlers.py` — source of truth for message shapes

---

## Verification

1. TypeScript compilation: no errors on `jobTypeEnum` (new values used in createJob calls)
2. Manual test: POST `/api/ecriture-comptable/fromAllFactures` with `{ year: "2025", month: "01" }` returns `{ results: [], jobId: "..." }`
3. Confirm RabbitMQ message arrives on `facture-jobs` queue with correct `type` field
4. Confirm worker_2 dispatches to `EcrituresFromAllFacturesHandler` (check `FactureHandlerFactory._handlers`)

---

## Scope

- **In:** 3 POST endpoints + jobTypeEnum extension + route registration
- **Out:** SSE route (already exists at `/digitale/facture/events`), frontend hooks, worker changes
