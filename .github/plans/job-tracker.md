Here's the plan:

---

## Plan: Persistent Job Watcher via F_JOB_DIGITAL

Replace the ephemeral in-memory SSE-only job tracking with a persistent `F_JOB_DIGITAL` MSSQL table. Jobs appear in the notification popover's "Arrière-plan" tab instead of toasts. SSE is retained for real-time progress; the DB provides resumability on page reload.

**Current**: trigger job → SSE only → reload = lost  
**Proposed**: trigger job → DB row (pending) → SSE for live progress → DB updated on each worker callback → reload → fetch active jobs → reconnect SSE → resume

---

### Phase 1: Database & Schema

**Step 1.1** — Create `TRANSIT.dbo.F_JOB_DIGITAL` table:

- `Job_No` (INT IDENTITY PK), `Job_Id` (NVARCHAR(50) UNIQUE — Appwrite ID), `Job_Module` (ecritures/bonLivraison/facture), `Job_Type` (all/some/set_valid/facture_detail/etc.), `Job_Status` (pending/done/failed), **`Job_Progress INT` (0–100, percentage — not raw counts)**, `Job_Error` (NVARCHAR(MAX)), `Job_UserId`, `created_at`, `updated_at`

> **Why percentage over raw counts?** Storing a single `Job_Progress INT` instead of `Job_EcCount`/`Job_EcTotal` is simpler to persist, query, and display — the frontend needs a percentage for a progress bar anyway. Raw counts are ephemeral worker-side data with no value in the DB.

**Step 1.2** — New Zod schema + type at `src/features/server/job/schema.ts` and `interface.ts`

### Phase 2: Job API Routes

**Step 2.1** — New Hono route at src/features/server/job/job.ts:

- `GET /` — all jobs for current user (limit 50, desc)
- `GET /active` — pending jobs for current user
- `GET /:jobId` — single job by Job_Id

**Step 2.2** — Register `.route("/job", job)` in route.ts

### Phase 3: Modify Job Triggering

**Step 3.1** — Each endpoint that publishes to RabbitMQ now also INSERTs into `F_JOB_DIGITAL` with status=pending. Shared helper `createJob(pool, jobId, module, type, userId)` in `src/features/server/job/create-job.ts`.

**Files**: ecritures/route.ts (4 endpoints), bonLivraison/route.ts (2 endpoints), facture.ts (3 endpoints)

### Phase 4: Persist Status in Event Routes

**Step 4.1** — Modify `createEventRoutes.ts`: replace `ec_count`/`ec_total` with `progress?: number` (0–100) in `JobUpdatePayload`:

```ts
type JobUpdatePayload = {
	jobId: string;
	status: JobStatus;
	progress?: number; // 0–100
	error?: string;
};
```

The `POST /job-finished` handler UPDATEs `F_JOB_DIGITAL` (`Job_Status`, `Job_Progress`, `Job_Error`, `updated_at`) alongside the SSE broadcast. The backend absorbs the change transparently — workers just start sending `progress` instead of `ec_count`/`ec_total` (see Phase 8).

### Phase 5: Frontend Hooks

**Step 5.1** — New React Query hooks:

- `use-get-active-jobs.ts` — fetches `/api/job/active`, refetches every 5s
- `use-get-jobs.ts` — fetches `/api/job/` for the popover

### Phase 6: Notification Popover Rebuild

**Step 6.1** — "Arrière-plan" tab in popover.tsx shows jobs from `F_JOB_DIGITAL` instead of filtering notifications. Each job shows module label, **progress bar** (`w-[{progress}%]`), status badge (spinner for pending / check for done / X for failed), and timestamp.

**Step 6.2** — New `active-job-watcher.tsx` component mounted at **layout level** (always present). On page load, fetches active jobs and opens SSE connections per job. Maps `Job_Module` → SSE endpoint. Invalidates job queries on updates.

**Step 6.3** — Active jobs contribute to the notification bell badge count.

### Phase 7: Remove Toast-Based JobWatcher

**Step 7.1** — Remove `toast(() => <JobWatcher />)` from dialog components (~3 files). Mutations just trigger the job; the notification system handles display.

**Step 7.2** — Delete 7 unused JobWatcher component files:

- job-watcher.tsx
- Feature-specific wrappers in ecritures/, bills/, bonLivraison/, \_shared/

**Step 7.3** — Evaluate removing `IEvent`/`event`/`id_toast_job` from Zustand stores (no longer needed).

### Phase 8: Python Workers — Progress Throttling

**Step 8.1** — Add `should_post_progress()` helper to `Queue/shared/worker_base.py`. Replace `ec_total`/`ec_count` params in `post_job_status` with a single `progress: int = 0` (0–100). Adaptive threshold based on job size for a natural UX — no robotically-uniform updates:

```python
def should_post_progress(ec_count: int, ec_total: int, last_pct: int, threshold: int = None) -> tuple[bool, int]:
    """
    Returns (should_post, new_last_pct).
    Threshold adapts to job size:
      - ec_total < 100   → 10% steps  (≤ 10 updates)
      - 100 ≤ ec_total < 1000 → 5% steps  (≤ 20 updates)
      - ec_total ≥ 1000  →  2% steps  (≤ 50 updates)
    """
    if ec_total == 0:
        return False, last_pct
    if threshold is None:
        threshold = 10 if ec_total < 100 else (5 if ec_total < 1000 else 2)
    current_pct = int((ec_count / ec_total) * 100)
    if current_pct >= last_pct + threshold:
        return True, current_pct
    return False, last_pct
```

**Step 8.2** — Update processing loops in each worker's `main.py` to track `last_pct` locally and only call `post_job_status` at milestone crossings:

```python
last_pct = 0
for i, record in enumerate(records):
    process(record)
    should, last_pct = should_post_progress(i + 1, total, last_pct)
    if should:
        post_job_status(api_endpoint, job_id, "pending", progress=last_pct)
```

This caps HTTP POSTs to ≤ 50 per job regardless of record count — no SSE/DB flooding.

**Files**: `Queue/shared/worker_base.py`, `Queue/worker/main.py`, `Queue/worker_2/main.py`, `Queue/worker_3/main.py`, `Queue/worker_4/main.py`

---

### Verification

1. Trigger a job → verify row in `F_JOB_DIGITAL` with `Job_Status='pending'`, `Job_Progress=0`
2. Let worker process a large batch → verify `Job_Progress` increments only at threshold milestones (not every record)
3. Confirm SSE still streams `job_update` events with `progress` field during processing (dev tools Network tab)
4. Job completes → verify `Job_Status='done'`, `Job_Progress=100` in DB; popover shows check badge
5. Start a job → **reload page** → confirm notification popover shows the active job with correct progress
6. Force worker failure → verify `Job_Status='failed'` with `Job_Error` populated in DB and error message visible in popover
7. Trigger 2+ simultaneous jobs → verify each tracked independently with separate progress bars
8. Active/unread jobs contribute to the notification bell badge count

### Decisions

- **Separate `F_JOB_DIGITAL` table** — clean schema, not overloading `F_NOTIFICATION_DIGITAL`
- **SSE + DB hybrid** — SSE for real-time UX, DB for persistence and resume-on-reload
- **Popover only** — no more toasts; Arrière-plan is the single place for background jobs
- **`Job_Progress INT (0–100)` instead of raw counts** — single column, no frontend division, natural progress bar; workers compute pct and throttle
- **Adaptive throttle thresholds** — 10%/5%/2% steps based on job size, capping at ≤ 50 POSTs per job
- **`Job_UserId`** — tracks who triggered the job, enables per-user filtering

### Further Considerations

1. **Job expiry / cleanup**: Old completed and failed jobs should not accumulate indefinitely. Recommend a scheduled SQL Agent job (or a periodic API endpoint) that deletes rows older than N days where `Job_Status IN ('done','failed')`. N=30 is a reasonable default.

2. **Module-to-SSE endpoint mapping**: `active-job-watcher.tsx` needs a config map from `Job_Module` → SSE URL prefix. This is a small object, but it must stay in sync whenever a new module or SSE route is added. Consider colocating it with the feature config objects already used across the digitale features.

3. **Unread badge**: Active background jobs (status=pending) and newly finished jobs (status=done, unread) should both contribute to the notification bell badge count. Consider adding a separate `UNION` branch in the `/count-unread` query or a dedicated `/api/job/count-active` endpoint.

4. **Stuck job detection**: If a worker crashes mid-job, the row stays `pending` forever. Consider a server-side guard: any `pending` job older than a configurable timeout (e.g., 2 hours) should be auto-marked `failed` with a `Job_Error` of `'Worker timeout'`. This can be a lightweight check on the `GET /active` query.

5. **Multi-user visibility**: Currently `Job_UserId` scopes jobs per user. Admins may want to see all active background jobs across users — consider a `GET /api/job/all` route behind `adminActionMiddleware` for operational visibility.
