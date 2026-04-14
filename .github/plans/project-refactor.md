Let me start by exploring the codebase in depth to understand the current state before drafting a refactoring plan.

Searched codebase for "route.ts API routes Hono registration", 28 results

Let me explore more areas of the codebase to understand the full picture.

Searched codebase for "SQL query string interpolation getConnection pool request", 25 results

Searched codebase for "store zustand create IBaseStore feature store", 22 results

Searched codebase for "worker.py callback channel basic_consume RabbitMQ process message", 16 results

Now I have a thorough understanding of the codebase. Here is the comprehensive refactoring plan:

---

# Baeaubab Refactoring Plan

## Phase 1 — Critical Security Fixes (Highest Priority)

### 1.1 SQL Injection: Parameterize all MSSQL queries

Almost every server route uses **string interpolation** for SQL parameters instead of `pool.request().input()`. Only search.ts does it correctly.

**Affected files:**

- bon-livraison.ts — `${year}`, `${month}`, `${entreprise_id}`
- stats.ts — `${year}`, `${month}`
- facture.ts — `${year}`, `${month}`, `${entreprise_id}`
- stats.ts — `${year}`, `${month}`
- route.ts — `${en_no}`, `${year}`, `${month}`
- route.ts — `${en_no}`, `${year}`, `${month}`
- route.ts — various

**Pattern to follow** (from search.ts):

```ts
const result = await pool
	.request()
	.input("year", sql.Int, parseInt(year))
	.input("month", sql.Int, parseInt(month))
	.query(`SELECT * FROM fnc(...) WHERE YEAR(x) = @year AND MONTH(x) = @month`);
```

### 1.2 Fix middleware bugs

**`saActionMiddleware`** in sa-action-middleware.ts checks for `"admin"` instead of `"sa"`:

```ts
// Current (broken) — identical to adminActionMiddleware
if (currentUser.labels.includes("admin")) { … }
// Should be:
if (currentUser.labels.includes("sa")) { … }
```

**Both middlewares** in admin-action-middleware.ts and sa-action-middleware.ts have a control-flow bug — the `return c.json(…, 403)` always executes because there's no `return` before `await next()`:

```ts
// Current (broken):
if (currentUser.labels.includes("admin")) {
	await next();
}
return c.json({ message: "Unauthorized" }, 403); // ← always runs

// Fixed:
if (!currentUser.labels.includes("admin")) {
	return c.json({ message: "Unauthorized" }, 403);
}
await next();
```

### 1.3 Add missing authentication

Routes in server (bon-livraison, facture, notification, search) **do not apply `sessionMiddleware`**. Any unauthenticated user can query the accounting data. Apply `sessionMiddleware` to every route.

---

## Phase 2 — Eliminate Code Duplication (TypeScript)

### 2.1 Unify SSE route_events.ts into a shared factory

Three files are **identical**:

- ecritures/route_events.ts
- bonLivraison/route_events.ts
- bills/route_events.ts

**Action:** Create `src/features/digitale/_shared/server/createEventRoutes.ts` — a factory that returns a configured Hono app. Each feature's route_events.ts becomes a one-liner:

```ts
export default createEventRoutes();
```

### 2.2 Remove duplicate API hooks

bills/api/use-generate-facture-from-bls.tsx is a **copy** of bonLivraison/api/use-generate-facture-from-bls.tsx. Keep one (in `_shared/api/` or whichever feature owns the endpoint) and re-export from the other.

### 2.3 Consolidate overlapping route endpoints

bills/server/route.ts and bonLivraison/server/route.ts both expose `/entreprise/dg` with nearly identical SQL. Extract the shared queries into a common data-access utility in `src/features/digitale/_shared/server/queries.ts`.

### 2.4 Unify `EStatus` enum

The écritures store in ecritures/store/store.ts defines its own `EStatus` with French string values (`"Intégré"`, `"Valide"`, etc.), while \_shared/types.ts defines `EStatus` with numeric values. Reconcile into a single shared enum that covers all cases.

---

## Phase 3 — Eliminate Code Duplication (Python Workers)

### 3.1 Extract shared database.py into a single package

All 4 workers contain **identical** copies of:

- `mssql_baeaubab/database.py`
- `mysql_digital/database.py`
- `utils.py`

**Action:** Create `Queue/shared/` with these modules. Each worker's Dockerfile copies or mounts the shared package. Workers import from the shared location.

### 3.2 Extract shared worker.py boilerplate

All 4 worker.py files share:

- `connect_with_retry()` function
- RabbitMQ channel setup
- `basic_consume` + exception handling pattern

**Action:** Create `Queue/shared/worker_base.py` with a `run_worker(queue_name, handler_fn)` function. Each worker.py becomes:

```python
from shared.worker_base import run_worker
from main import handle
run_worker("check_digital_ec_jobs", handle)
```

### 3.3 Extract hardcoded API URLs into config

All workers hardcode `http://172.30.0.1:3000/api/...`. Move this to `configuration/settings.ini` under a `[API]` section and read it at startup.

### 3.4 Split monolithic main.py files

`worker_3/main.py` (~730 lines) and `worker/main.py` (~550 lines) are large single files mixing data access, business logic, and HTTP calls.

**Action per worker:** Split into:

- `handlers.py` — high-level job handler functions
- `queries.py` — SQL queries and data access
- `transforms.py` — data transformation logic
- main.py — remains as the entry-point re-exporting handler functions

---

## Phase 4 — Frontend Cleanup

### 4.1 Remove dead code and `console.log` statements

Multiple files have `console.log` left in:

- use-get-bon-livraison.tsx
- use-generate-factures.tsx
- route.ts

Unused imports (`useQuery` imported but unused, `boolean` from zod, `string` from zod).

### 4.2 Unify FilterSection.tsx components

bills/FilterSection.tsx and bonLivraison/FilterSection.tsx are nearly identical. Extract a shared `FilterSection` into `_shared/components/` that accepts a store hook as a prop (consistent with the existing `FeatureConfig` pattern).

---

## Phase 5 — Architectural Improvements

### 5.1 Create a typed MSSQL query helper

To prevent future SQL injection regressions, create a thin wrapper in db-mssql.ts:

```ts
export async function query(
	queryText: string,
	inputs: Record<string, { type: ISqlType; value: unknown }>,
) {
	const pool = await getConnection();
	const req = pool.request();
	for (const [name, { type, value }] of Object.entries(inputs)) {
		req.input(name, type, value);
	}
	return req.query(queryText);
}
```

All routes switch to this helper, making it structurally impossible to forget parameterization.

### 5.2 Add error handling to worker HTTP callbacks

Workers call `requests.post(...)` to report progress but don't handle failures. If the API is down, the worker crashes silently. Wrap in try/except with logging.

---

## Execution Order Summary

| Step | Phase                          | Risk                       | Effort |
| ---- | ------------------------------ | -------------------------- | ------ |
| 1    | 1.1 — Parameterize SQL         | Critical security fix      | Medium |
| 2    | 1.2 — Fix middleware bugs      | Critical auth bypass       | Small  |
| 3    | 1.3 — Add sessionMiddleware    | Critical auth gap          | Small  |
| 4    | 2.1 — Unify SSE route_events   | Low risk, code dup         | Small  |
| 5    | 3.1 — Shared worker DB package | Medium risk (Docker)       | Medium |
| 6    | 3.2 — Shared worker base       | Medium risk                | Small  |
| 7    | 2.2 — Deduplicate API hooks    | Low risk                   | Small  |
| 8    | 2.3 — Shared server queries    | Low risk                   | Medium |
| 9    | 2.4 — Unify EStatus            | Low risk, needs testing    | Small  |
| 10   | 4.1 — Remove dead code         | No risk                    | Small  |
| 11   | 4.2 — Shared FilterSection     | Low risk                   | Medium |
| 12   | 3.3 — Config-based API URLs    | Low risk                   | Small  |
| 13   | 3.4 — Split worker main.py     | Medium risk, needs testing | Large  |
| 14   | 5.1 — Typed query helper       | Low risk                   | Medium |
| 15   | 5.2 — Worker error handling    | Low risk                   | Small  |

---

Phases 1 (security) should be done first and is non-negotiable. Phases 2-3 (deduplication) deliver the biggest maintainability gains. Phases 4-5 are polish and prevention.

Want me to start implementing any of these phases?
