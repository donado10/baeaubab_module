# Refactoring Execution Log

This document records every step implemented from `project-refactor.md`.  
All Queue/worker Python items (Phase 3 and Step 5.2) were intentionally **skipped**.

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

## Skipped Items

The following items from `project-refactor.md` were **not implemented** per the user's request:

| Phase    | Item                                    | Reason skipped              |
| -------- | --------------------------------------- | --------------------------- |
| Phase 3  | All Python worker refactoring           | Queue/worker items excluded |
| Step 5.2 | Worker HTTP error handling improvements | Queue/worker items excluded |
