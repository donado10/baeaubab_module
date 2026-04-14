# Refactoring Execution Log

This document records every step implemented from `project-refactor.md`.

---

## Phase 1 — Security & Correctness

### Step 1.1 — Parameterize all raw MSSQL queries

**Files changed:**

- `src/lib/db-mssql.ts` — added typed `sqlQuery()` helper accepting an `inputs` map
- `src/features/server/bon-livraison/bon-livraison.ts` — all 7 helper functions rewritten with `.input()` bindings; dynamic IN-clauses use an `enParams` array pattern (`@en0`, `@en1`, …)
- `src/features/server/bon-livraison/stats.ts` — year/month bound with `sql.Int`
- `src/features/server/facture/facture.ts` — all helpers parameterized; stray `console.log(fact_list, en_no, year, month)` removed from `/cancelByDocument`
- `src/features/server/facture/stats.ts` — year/month bound with `sql.Int`
- `src/features/digitale/bonLivraison/server/route.ts` — all GET/POST queries parameterized; dynamic `en_list_invalid` DELETE uses named parameter arrays
- `src/features/digitale/bills/server/route.ts` — all GET/POST/DELETE queries parameterized; stray `console.log(documents)` removed from `GET /entreprise/list`

**Why:** String-interpolated SQL is vulnerable to injection (OWASP A03). Every user-controlled value now goes through a named parameter bound with an explicit MSSQL type.

---

### Step 1.2 — Fix middleware control-flow bugs

**Files changed:**

- `src/lib/admin-action-middleware.ts`
- `src/lib/sa-action-middleware.ts`

**What was wrong:**

- `adminActionMiddleware`: condition was non-inverted — the middleware called `next()` when the user _was not_ admin, and silently fell through when they were
- `saActionMiddleware`: same control-flow bug **plus** it was checking `user.labels.includes("admin")` instead of `"sa"`

**Fix applied:** Both files now use an early-return guard:

```ts
if (!user.labels.includes("...")) return c.json({ error: "..." }, 403);
await next();
```

---

### Step 1.3 — Add `sessionMiddleware` to unprotected routes

**Files changed:**

- `src/features/server/bon-livraison/bon-livraison.ts`
- `src/features/server/bon-livraison/stats.ts`
- `src/features/server/facture/facture.ts`
- `src/features/server/facture/stats.ts`
- `src/features/server/notification/notification.ts`

`.use(sessionMiddleware)` added at the top of each Hono app before any route handler, ensuring every endpoint in those routers is authenticated.

---

## Phase 2 — Code Deduplication

### Step 2.1 — SSE factory for event routes

**New file:** `src/features/digitale/_shared/server/createEventRoutes.ts`

A factory function `createEventRoutes(streamPath)` that closes over its own `clientsByJobId` Map and wires up:

- `GET {streamPath}` — SSE stream endpoint that streams job progress to the browser
- `POST /job-finished` — endpoint called by Python workers when a job completes

Each feature gets full Map isolation (no cross-feature leakage).

**Files replaced (now one-liners):**

- `src/features/digitale/ecritures/server/route_events.ts`
- `src/features/digitale/bonLivraison/server/route_events.ts`
- `src/features/digitale/bills/server/route_events.ts`

Approximately 100 lines of duplicated boilerplate removed.

---

### Step 2.2 — Deduplicate `use-generate-facture-from-bls`

**New file:** `src/features/digitale/_shared/api/use-generate-facture-from-bls.tsx`

Canonical implementation of the `useGenerateFacturesFromBonLivraison` TanStack Query mutation hook.

**Files replaced (now re-exports):**

- `src/features/digitale/bonLivraison/api/use-generate-facture-from-bls.tsx`
- `src/features/digitale/bills/api/use-generate-facture-from-bls.tsx`

---

### Step 2.4 — Rename `EStatus` → `EEcritureStatut`

Used language-server rename (`vscode_renameSymbol`) to rename the enum defined in `src/features/digitale/ecritures/store/store.ts`.

**43 edits across 10 files** including:

- `store/store.ts` (definition)
- `TableContainer.tsx`
- `DialogIntegrateEcritures.tsx`
- `DialogRecheckEcritures.tsx`
- `DialogAnnulerEcritures.tsx`
- `DialogLoadEcritures.tsx`
- and 4 additional component files

The old name `EStatus` was a generic, ambiguous identifier colliding with any future status enum in the codebase. `EEcritureStatut` follows the project's French domain naming convention.

---

## Phase 4 — Dead Code & Component Cleanup

### Step 4.1 — Remove dead imports and fix copy-paste bug

**Files changed:**

- `src/features/digitale/ecritures/components/FilterSection.tsx` — removed unused `import { boolean } from "zod"`
- `src/features/digitale/bonLivraison/components/FilterSection.tsx` — removed unused `import { boolean } from "zod"`
- `src/features/digitale/bills/components/FilterSection.tsx`:
  - Removed unused `import { boolean } from "zod"`
  - Fixed copy-paste bug: `useEntrepriseBonLivraisonStore` had been imported and called instead of the correct `useEntrepriseFactureStore`, causing the filter state to write into the wrong Zustand store

---

### Step 4.2 — Unify FilterSection components

**New file:** `src/features/digitale/_shared/components/PopoverFilterButton.tsx`

A single shared `PopoverFilterButton` component parameterized by a `useStore` hook prop:

```tsx
<PopoverFilterButton useStore={useMyStore}>{trigger}</PopoverFilterButton>
```

The component owns all the internal `CheckboxFilter`, `EcartCompliance`, and `PopoverFilter` sub-components; feature files are now thin wrappers that supply their respective store hook.

**Files replaced (now thin wrappers):**

- `src/features/digitale/ecritures/components/FilterSection.tsx` → passes `useEcritureEnteteLigneStore`
- `src/features/digitale/bonLivraison/components/FilterSection.tsx` → passes `useEntrepriseBonLivraisonStore`
- `src/features/digitale/bills/components/FilterSection.tsx` → passes `useEntrepriseFactureStore`

Approximately 240 lines of triplicated component code replaced by a single 120-line shared implementation.

---

## Phase 5 (partial) — Type Safety

### Step 5.1 — `sqlQuery` typed helper

Added to `src/lib/db-mssql.ts`:

```ts
export async function sqlQuery(
	queryText: string,
	inputs: Record<
		string,
		{ type: ISqlType | (() => ISqlType); value: unknown }
	> = {},
);
```

Wraps the `mssql` request API with a `Record`-based inputs map so callers do not need to manually construct `request.input(...)` chains for every query.

---

## Phase 3 — Python Worker Refactoring

### Step 3.1 — Extract shared database packages into `Queue/shared/`

**New files:**

- `Queue/shared/__init__.py`
- `Queue/shared/utils.py` — canonical copy of `configure()`, `ini_settings()`, `write_to_file()`, `get_log_timestamp()`
- `Queue/shared/mssql_baeaubab/__init__.py`
- `Queue/shared/mssql_baeaubab/database.py` — superset version with `execute_select_one()` and `execute_select_all()`
- `Queue/shared/mysql_digital/__init__.py`
- `Queue/shared/mysql_digital/database.py` — superset version (removed debug `print(config['MYSQL'])` from worker's copy)

All 4 worker `main.py` files updated to import from `shared.*` instead of local copies:

```python
# Before:
from mssql_baeaubab.database import database_objects as dbo_mssql
from mysql_digital.database import database_objects as dbo_mysql
from utils import ini_settings

# After:
from shared.mssql_baeaubab.database import database_objects as dbo_mssql
from shared.mysql_digital.database import database_objects as dbo_mysql
from shared.utils import ini_settings
```

**Why:** All 4 workers had identical copies of `mssql_baeaubab/database.py`, `mysql_digital/database.py`, and `utils.py`. A bug fix or feature addition required editing 4 files. Now there is a single source of truth.

---

### Step 3.2 — Extract shared worker boilerplate into `worker_base.py`

**New file:** `Queue/shared/worker_base.py`

Contains:

- `connect_with_retry(host, tries, delay)` — RabbitMQ connection with retry logic
- `post_job_status(api_endpoint, job_id, status, ec_total, ec_count)` — HTTP POST with 3 retries, 10s timeout, and logging (also satisfies **Step 5.2**)
- `run_worker(queue_name, handler_map, api_endpoint)` — complete consumer lifecycle: connection, channel setup, queue declaration, message dispatch, and error handling
- `get_api_base_url()` — reads base URL from `settings.ini [API]` section (also satisfies **Step 3.3**)

Each `worker.py` is now a thin configuration file:

```python
from shared.worker_base import run_worker
from main import main_process_all, main_process_some, main_process_set_valid

handler_map = {
    "all": lambda data: main_process_all(data["jobId"], data["year"], data["month"]),
    "some": lambda data: main_process_some(data["jobId"], data["year"], data["month"], data["bills"]),
    "set_valid": lambda data: main_process_set_valid(data["jobId"], data["year"], data["month"], data["bills"]),
}

if __name__ == "__main__":
    run_worker("check_digital_ec_jobs", handler_map, "digitale/ecritures/events/job-finished")
```

Approximately 280 lines of duplicated boilerplate across 4 worker.py files replaced by a single 100-line shared module.

---

### Step 3.3 — Extract hardcoded API URLs into config

**Files changed:**

- `Queue/worker/configuration/settings.ini`
- `Queue/worker_2/configuration/settings.ini`
- `Queue/worker_3/configuration/settings.ini`
- `Queue/worker_4/configuration/settings.ini`

Added `[API]` section to each:

```ini
[API]
base_url = http://172.30.0.1:3000
```

`worker_base.py` reads from this config via `get_api_base_url()` with a hardcoded fallback. All 16 hardcoded `http://172.30.0.1:3000` occurrences across worker files replaced with config-driven calls to `post_job_status()`.

---

### Step 5.2 — Worker HTTP error handling

Integrated into `post_job_status()` in `Queue/shared/worker_base.py`:

- 3-attempt retry with 1s delay between failures
- 10-second timeout per request
- `resp.raise_for_status()` to catch HTTP errors
- Structured logging via Python `logging` module (replaces raw `print()`)
- Handler-level `try/except` in `run_worker()` catches unhandled exceptions, posts "failed" status, and continues consuming

**Why:** Previously, any `requests.post()` failure (network error, API down) would crash the worker's callback, killing the consumer and silently losing the job.

---

## Phase 4 — Dead Code & Component Cleanup (continued)

### Step 4.1 — Remove all remaining `console.log` statements

**35 active `console.log` + 5 commented-out** removed across 26 files:

**Server/lib files:**

- `src/features/server/search/search.ts` — removed `console.log(result.recordset)`
- `src/lib/coordinates.ts` — removed `console.log(position)` and `console.log("Geolocation not supported")`
- `src/lib/utils.ts` — removed commented `//console.log(formatDate(...))`

**Ecritures feature:**

- `src/features/digitale/ecritures/components/DialogTableDetail.tsx` — removed `console.log(open)`
- `src/features/digitale/ecritures/components/DialogIntegrateEcritures.tsx` — removed `console.log(id_toast)`
- `src/features/digitale/ecritures/components/JobWatcher.tsx` — removed 3 `console.log` calls (RESULT, readyState)
- `src/features/digitale/ecritures/components/EcritureDigitaleSection.tsx` — removed `console.log(store.billCart)`
- `src/features/digitale/ecritures/components/DialogSetValidateEcritures.tsx` — removed 3 `console.log` calls (error, val, compliantBillsOnly)
- `src/features/digitale/ecritures/server/route.ts` — removed 2 `console.log` calls (result_montant_reel, filter debug)
- `src/features/digitale/ecritures/components/Table/TableCorrectionDetail.tsx` — removed `console.log(values)` and `console.log(form.formState.errors)`
- `src/features/digitale/ecritures/components/Table/columns.tsx` — removed commented `// console.log(table.getRowModel()...)`

**BonLivraison feature:**

- `src/features/digitale/bonLivraison/components/TableEntrepriseDetail/table.tsx` — removed `console.log(data)`
- `src/features/digitale/bonLivraison/components/Table/TableCorrectionDetail.tsx` — removed `console.log(values)` and `console.log(form.formState.errors)`
- `src/features/digitale/bonLivraison/components/DocumentPDFRendered.tsx` — removed `console.log(agence)`
- `src/features/digitale/bonLivraison/components/TableEntrepriseDetail/columns.tsx` — removed commented `// console.log(...)`
- `src/features/digitale/bonLivraison/components/Table/columns.tsx` — removed commented `// console.log(...)`
- `src/features/digitale/bonLivraison/api/use-get-bon-livraison.tsx` — removed `console.log(year, month)`
- `src/features/digitale/bonLivraison/api/use-generate-factures.tsx` — removed `console.log(json)`
- `src/features/digitale/bonLivraison/api/use-update-bon-livraison.tsx` — removed `console.log(json)`
- `src/features/digitale/bonLivraison/api/use-delete-factures.tsx` — removed `console.log(json)`

**Bills feature:**

- `src/features/digitale/bills/components/DocumentPDFRendered.tsx` — removed `console.log(agence)`
- `src/features/digitale/bills/components/FactureSection.tsx` — removed `console.log(store.billCart)`
- `src/features/digitale/bills/components/Table/TableCorrectionDetail.tsx` — removed `console.log(values)` and `console.log(form.formState.errors)`
- `src/features/digitale/bills/components/Table/columns.tsx` — removed commented `// console.log(...)`
- `src/features/digitale/bills/components/DialogLoadFacture.tsx` — removed `console.log(year, month)`
- `src/features/digitale/bills/components/routes/FactureDetailSection.tsx` — removed `console.log(data.results.documents)`
- `src/features/digitale/bills/api/use-delete-factures.tsx` — removed `console.log(json)`
- `src/features/digitale/bills/api/use-delete-facture.tsx` — removed `console.log(json)`
- `src/features/digitale/bills/api/use-generate-factures.tsx` — removed `console.log(json)`
- `src/features/digitale/bills/api/use-generate-facture-by-entreprise.tsx` — removed `console.log(json)`

**Search feature:**

- `src/features/digitale/search/components/SearchCommand.tsx` — removed `console.log(results)`

---

## Docker & Infrastructure Fixes

### Fix Dockerfile WORKDIR bugs

**Files changed:**

- `Queue/worker_3/Dockerfile` — WORKDIR changed from `/worker_2` (copy-paste bug) to `/app`
- `Queue/worker_4/Dockerfile` — WORKDIR changed from `/worker_2` (copy-paste bug) to `/app`
- `Queue/worker/Dockerfile` — WORKDIR changed from `/worker` to `/app`
- `Queue/worker_2/Dockerfile` — WORKDIR changed from `/worker_2` to `/app`

All Dockerfiles updated to use `context: .` (Queue root) build context, copying `shared/` and worker-specific code separately. Combined individual `RUN pip install` lines into single `RUN pip install --no-cache-dir` command. Removed `RUN python setup.py install` (no longer needed since imports use `shared.*`).

### Fix docker-compose.yaml

**File changed:** `Queue/docker-compose.yaml`

- Added missing `worker` and `worker_2` services
- Changed all worker build contexts from `./worker_X` to `context: .` with `dockerfile: worker_X/Dockerfile` (required for shared package access)
- Added `bridge-baeaubab` network to all workers (previously only RabbitMQ had it, so workers couldn't reach `172.30.0.1`)
- Removed bind-mount volumes from worker_3/worker_4 (not needed with proper Docker builds)

### Fix worker_2/main.py bare function call

**File changed:** `Queue/worker_2/main.py`

Removed `process_facture_general('', 2026, 1, 'VTEDC3', 'F_GBAEAUBAB23')` which was a **bare call at module level** — it executed every time the module was imported (i.e., every worker startup), running an unintended batch job.

Also removed dead commented-out test calls at the end of `Queue/worker_4/main.py`.

---

## Skipped Items

| Phase    | Item                                    | Reason                                                         |
| -------- | --------------------------------------- | -------------------------------------------------------------- |
| Step 2.3 | Consolidate overlapping route endpoints | N/A — `bills/server/route.ts` does not exist; no overlap found |
| Step 3.4 | Split monolithic main.py files          | Large effort; deferred for future iteration                    |
