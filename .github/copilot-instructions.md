# Baeaubab Module — Copilot Instructions

## Project Overview

**Baeaubab** (`tbo_2`) is an accounting, billing, and logistics management system for a Senegalese business context (`.sn` domain). It manages invoices, shipping documents, and digital accounting journal entries across a dual-database setup with a distributed job-processing backend.

---

## Domain Glossary (French)

| Term            | Meaning                       |
| --------------- | ----------------------------- |
| `écritures`     | Accounting journal entries    |
| `facture`       | Invoice                       |
| `bon livraison` | Shipping / delivery document  |
| `entreprise`    | Company                       |
| `comptet`       | Customer / GL account         |
| `compteG`       | General ledger account        |
| `résidence`     | Branch / residence            |
| `client`        | Customer                      |
| `JO_Num`        | Journal number                |
| `EC_RefPiece`   | Accounting entry reference    |
| `CG_Num`        | General ledger account number |
| `CT_Num`        | Customer account number       |

Always use these domain terms in variable names, comments, and API routes—**do not invent English equivalents for existing French field names**.

---

## Tech Stack

| Layer         | Technology                                                         |
| ------------- | ------------------------------------------------------------------ |
| Frontend      | Next.js 15 (App Router), React 19, TypeScript 5, TailwindCSS 4     |
| API           | Hono 4 with `@hono/zod-validator`, exposed via `/api/[[...route]]` |
| Auth          | Appwrite 21 sessions — cookie name: `tbo-cookie`                   |
| UI            | Radix UI / shadcn primitives, Lucide icons                         |
| Data fetching | TanStack React Query v5                                            |
| Tables        | TanStack React Table v8                                            |
| PDF           | `@react-pdf/renderer`                                              |
| Primary DB    | MSSQL 12 (accounting core — `TRANSIT.dbo.*`, `gbaeaubab23.dbo.*`)  |
| Digital DB    | MySQL 3 (digital records — `ecritures`, `factures`, `customers`)   |
| Job queue     | RabbitMQ 3 (4 queues — see Queue Workers section)                  |
| Workers       | Python 3 (pyodbc + mysql.connector, one worker per container)      |
| Validation    | Zod (all error messages in **French**)                             |

---

## Code Conventions

### File & Folder Naming

- **kebab-case** for all files: `bon-livraison.ts`, `use-mobile.ts`, `app-sidebar.tsx`
- **camelCase** for exported functions and variables: `getCurrent`, `getConnection`, `sessionMiddleware`
- **PascalCase** for React components: `SignInCard`, `NotificationSection`, `CardStatus`

### TypeScript

- Strict mode is **off** (`noImplicitAny: false`, `strictNullChecks: false`)
- Prefer explicit types at function boundaries; avoid `any` unless interfacing legacy data
- Use `import type` for type-only imports

### Zod Schemas

- All validation schemas go in `src/features/schema.ts` (global) or `src/features/<module>/schema.ts` (module-specific)
- All user-facing messages must be in **French**
- Example:
  ```ts
  z.string().min(1, "Ce champ est requis");
  ```

### React Components & Hooks

- Custom hooks live in `src/hooks/`; name them `use-<name>.ts`
- React Query hooks live in `src/features/<module>/api/`; name them `use-<verb>-<resource>.ts`
- UI queries return `{ data, isLoading, error }` — handle all three states

### Styling

- Default dark background: `bg-[#101010]`
- Utility-first with TailwindCSS; avoid inline styles
- Use `cn()` from `src/lib/utils.ts` for conditional class merging

---

## Architecture

### API Layer (Hono)

- All routes are registered in `src/app/api/[[...route]]/route.ts`
- Route files live in `src/features/<module>/server/route.ts`
- Always apply middleware in this order: `sessionMiddleware` → `adminActionMiddleware` (if admin-only) → `zValidator` → handler
- Use parameterized queries with `sql.NVarChar()` / `sql.Int()` for all MSSQL queries — never string-interpolate SQL
- Export `AppType` from the route entry for RPC client type inference

### Session & Auth Middleware

- `sessionMiddleware` (in `src/lib/session-middleware.ts`): validates `tbo-cookie`, attaches `account`, `databases`, `storage`, `users`, `user` to Hono context
- Admin check: `user.labels.includes("admin")`
- SA check: `user.labels.includes("sa")`

### SSE / Real-time Jobs

- Long-running jobs publish status via RabbitMQ; workers call `POST /api/.../events/job-finished`
- SSE routes (`route_events.ts`) maintain a client registry by `jobId` and stream updates

### Database Access

- **MSSQL**: use `getConnection()` from `src/lib/db-mssql.ts` (singleton pool)
- **MySQL**: use the pool from `src/lib/db-mysql.ts` (10-connection limit)
- **Python workers**: use `database_objects()` singletons from `mssql_baeaubab/database.py` and `mysql_digital/database.py`

### Queue Workers

All workers declare their queue as **durable** and auto-acknowledge after processing. Each sends HTTP progress updates via `POST /api/.../events/job-finished`.

| Folder            | Queue                        | Purpose                                                               |
| ----------------- | ---------------------------- | --------------------------------------------------------------------- |
| `Queue/worker/`   | `check_digital_ec_jobs`      | Validate `écritures` (balance, format, GL/customer account existence) |
| `Queue/worker_2/` | `integrate_digital_ec_jobs`  | Post validated entries into the general ledger (`F_ECRITUREC`)        |
| `Queue/worker_3/` | `get_digital_bl_jobs`        | Import delivery documents (`bon livraisons`) from MySQL into MSSQL    |
| `Queue/worker_4/` | `generate_digital_fact_jobs` | Generate invoices (`factures`, `DO_Type=6`) from validated BLs        |

**Message shapes by worker:**

```jsonc
// worker — check_digital_ec_jobs
{ "jobId": string, "type": "all" | "some" | "set_valid", "year": int, "month": int, "bills"?: string[] }

// worker_2 — integrate_digital_ec_jobs
{ "jobId": string, "type": "facture_detail", "year": int, "month": int, "journal": string, "database": string }

// worker_3 — get_digital_bl_jobs
{ "jobId": string, "type": "all" | "bl_some", "year": int, "month": int, "en_list"?: string[] }

// worker_4 — generate_digital_fact_jobs
{ "jobId": string, "type": "all" | "byEntreprise" | "fromBonLivraison", "year": int, "month": int, "en_list"?: string[], "bl_list"?: string[] }
```

**Processing pipeline (sequential):** worker 3 → worker 4 → worker 1 → worker 2

---

## Permission Model

```typescript
enum EPermission {
	READ, // View documents
	VALIDATE, // Approve entries
	BLOCK, // Reject entries
	INVALIDATE, // Mark as invalid
	UPDATE, // Modify records
	DELETE, // Remove records
}
```

- Permissions are checked per feature per user
- Role labels (`"admin"`, `"sa"`) live in Appwrite `user.labels`
- When adding a new protected route, always apply the appropriate middleware rather than inline role checks

---

## Design Patterns

- **Use the Factory or Abstract Factory pattern** whenever you need to create families of related objects (e.g., multiple database connection strategies, multiple document processors, or multiple worker message handlers). Prefer this over large `if/switch` blocks for object creation.
- Prefer **singleton** for shared resources (DB connection pools, Appwrite client)
- Prefer **middleware composition** over decorators or HOCs for cross-cutting concerns in Hono routes
- Use **Zod + React Hook Form** for all user-facing forms; never build custom validation logic

---

## Database Table Reference (key tables)

| Alias                  | Full Name                          | Description                          |
| ---------------------- | ---------------------------------- | ------------------------------------ |
| `F_ENTREPRISE_DIGITAL` | `TRANSIT.dbo.F_ENTREPRISE_DIGITAL` | Companies                            |
| `F_COMPTET_DIGITAL`    | `TRANSIT.dbo.F_COMPTET_DIGITAL`    | GL customer accounts                 |
| `F_DOCENTETE_DIGITAL`  | `TRANSIT.dbo.F_DOCENTETE_DIGITAL`  | Documents (invoices=6, deliveries=3) |
| `f_comptet`            | `transit.dbo.f_comptet`            | Legacy customer records              |
| `f_compteG`            | `gbaeaubab23.dbo.f_compteG`        | General ledger accounts              |
| `ecritures`            | MySQL `ecritures`                  | Digital journal entries              |
| `factures`             | MySQL `factures`                   | Digital invoices                     |
| `customers`            | MySQL `customers`                  | Digital customer data                |
