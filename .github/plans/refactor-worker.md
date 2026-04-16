## Plan: Refactor `worker_4` with Factory Pattern

**TL;DR:** `worker_4/main.py` is a ~320-line monolith mixing DB access, date utilities, facture building, and job orchestration. The refactor splits it into 4 focused files and introduces a formal Factory pattern for job-type dispatch — replacing the existing ad-hoc `handler_map` lambdas in worker.py. The architecture is designed symmetrically so `worker_3` can receive identical treatment.

---

### Architecture diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     worker.py  (entry point)                  │
│         run_worker("facture-jobs", factory.build_map())       │
└────────────────────────┬──────────────────────────────────────┘
                         │ uses
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                    handlers.py  (dispatch layer)              │
│                   FactureHandlerFactory                       │
│   .create(job_type) → handler   .build_handler_map() → dict   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐     │
│  │           BaseFactureHandler (ABC)                   │     │
│  │  handle(data)  ← abstract                            │     │
│  └──────────┬──────────────┬──────────────────┬─────────┘     │
│             │              │                  │               │
│   AllFactures          ByEntreprise    FromBonLivraison       │
│    Handler              Handler            Handler            │
└─────────────┼──────────────┼──────────────────┼───────────────┘
              │ delegates    │                  │
              ▼              ▼                  ▼
┌───────────────────────────────────────────────────────────────┐
│               main.py  (process orchestration)                │
│                                                               │
│   main_process_factures()                                     │
│   main_process_facture_by_entreprise()                        │
│   main_process_factures_from_bl()                             │
│                      ↓ all call                               │
│              build_facture()                                  │
└────────────────┬──────────────────────┬───────────────────────┘
                 │                      │
      uses reads/writes           uses helpers
                 ▼                      ▼
┌────────────────────────┐   ┌──────────────────────────────────┐
│      db.py             │   │          utils.py                │
│                        │   │                                  │
│  READS:                │   │  get_current_date()              │
│   get_entreprises      │   │  get_last_day_of_month()         │
│   get_residences       │   │  calculate_totals()              │
│   get_facture_entete_* │   │  (+ existing: ini_settings, ...) │
│   get_agence_dg_*      │   └──────────────────────────────────┘
│   get_latest_facture_id│
│   get_transport_value  │
│                        │
│  WRITES:               │
│   handle_fact_entete   │
│   handle_fact_lignes   │
│   set_bl_valide        │
└────────────────────────┘
```

---

### Steps

**Phase 1 — Create `db.py`**

1. Create `Queue/worker_4/db.py`. Move all DB read functions (`get_entreprises`, `get_residences`, `get_facture_entete_detail_by_company_id`, `get_facture_entete_detail_by_company_id_and_bl`, `get_facture_entete_detail_by_residence_id`, `get_agence_dg_by_company_id`, `get_agence_dg_by_residence_id`, `get_latest_facture_id`, `get_transport_value`) and DB write functions (`handle_fact_entete`, `handle_fact_lignes`, `set_bl_valide`) here. DB imports (`dbo_mssql`, `execute_select_all`, `execute_select_one`) stay in this file.

**Phase 2 — Update utils.py** 2. Move `get_current_date`, `get_last_day_of_month`, `calculate_totals` from main.py into the existing utils.py. Add `from datetime import timedelta` (datetime is already imported).

**Phase 3 — Slim main.py** _(depends on phases 1 + 2)_ 3. Strip main.py down to the process-orchestration layer only: `build_facture` + the 3 `main_process_*` functions. Replace direct DB/utility calls with imports from `db` and `utils`.

**Phase 4 — Create `handlers.py`** _(depends on phase 3)_ 4. Create `Queue/worker_4/handlers.py`:

- `BaseFactureHandler` (ABC) with abstract `handle(data)`
- `AllFacturesHandler`, `ByEntrepriseHandler`, `FromBonLivraisonHandler` — each delegates to the corresponding `main_process_*` function
- `FactureHandlerFactory` with two classmethods: `create(job_type)` and `build_handler_map()` (builds the dict shape expected by `run_worker`)

**Phase 5 — Update worker.py** _(depends on phase 4)_ 5. Replace the current lambda `handler_map` with `FactureHandlerFactory.build_handler_map()`. Result is a ~5-line file.

---

### worker_3 mirror architecture (for when you refactor it)

The exact same 5-file split applies symmetrically:

| File          | Content                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db.py`       | `insert_new_*`, `handle_bl_entete`, `handle_bl_ligne`, `insert_bl_ligne`, `get_bl(s)`, `get_one_company_bls`, `get_price`, `update_entete/ligne`, `set_entreprise_sage`, `update_comptet_digital_entreprise`, `build_entreprise_residence`, `update_entreprise_tva`, `update_entreprise_id` |
| utils.py      | `increase_souche_number`, `split_souche`, `is_number`, `handle_artqteprix`                                                                                                                                                                                                                  |
| main.py       | `handle_clients`, `handle_livreurs`, `handle_bl`, `handle_bl_documents`, `handle_some_bl_document`, `update_entreprise`, `main_process_bl_detail`, `main_process_bl_one`                                                                                                                    |
| `handlers.py` | `AllBLHandler`, `SomeBLHandler`, `BLHandlerFactory`                                                                                                                                                                                                                                         |
| worker.py     | Uses `BLHandlerFactory.build_handler_map()`                                                                                                                                                                                                                                                 |

---

**Relevant files**

- main.py — strip to orchestration layer only
- worker.py — slim to factory entry point
- `Queue/worker_4/db.py` — NEW
- utils.py — UPDATED
- `Queue/worker_4/handlers.py` — NEW

**Verification**

1. Send `all`, `byEntreprise`, and `fromBonLivraison` job messages through the `facture-jobs` RabbitMQ queue
2. Confirm `DO_Type=6` records appear in `TRANSIT.dbo.F_DOCENTETE_DIGITAL`
3. Confirm processed BLs have `do_valide=1` and `do_facturereference` set
4. Confirm progress SSE events fire at each threshold

---
