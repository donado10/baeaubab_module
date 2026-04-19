Let me explore the relevant code to understand the full picture before planning.

Read [](file:///home/igf/baeaubab_module/Queue/worker_2/handlers.py)

Read [](file:///home/igf/baeaubab_module/Queue/worker_2/utils.py#1-1), lines 1 to 120

Read [](file:///home/igf/baeaubab_module/Queue/worker_2/worker.py)

Read memory [](file:///home/igf/.vscode-server/data/User/workspaceStorage/e48b7313fc949ab06065ae8f1206d2e0-1/GitHub.copilot-chat/memory-tool/memories/M2FjMDBkOGEtZjRjMy00ZDlhLWIyM2YtY2MzOTU0ZjNjYTlk/plan.md)

I found the existing plan in session memory. It's mostly aligned with your request, but needs one key update: `get_latest_facture_id` should also be called **inside** the builder class, not passed as a parameter. Let me update the plan and present it.

Updated memory file [](file:///home/igf/.vscode-server/data/User/workspaceStorage/e48b7313fc949ab06065ae8f1206d2e0-1/GitHub.copilot-chat/memory-tool/memories/M2FjMDBkOGEtZjRjMy00ZDlhLWIyM2YtY2MzOTU0ZjNjYTlk/plan.md)

Updated memory file [](file:///home/igf/.vscode-server/data/User/workspaceStorage/e48b7313fc949ab06065ae8f1206d2e0-1/GitHub.copilot-chat/memory-tool/memories/M2FjMDBkOGEtZjRjMy00ZDlhLWIyM2YtY2MzOTU0ZjNjYTlk/plan.md)

Updated memory file [](file:///home/igf/.vscode-server/data/User/workspaceStorage/e48b7313fc949ab06065ae8f1206d2e0-1/GitHub.copilot-chat/memory-tool/memories/M2FjMDBkOGEtZjRjMy00ZDlhLWIyM2YtY2MzOTU0ZjNjYTlk/plan.md)

Good, the plan is updated. Here's the final plan:

---

## Refactoring Plan: `build_facture` → Factory Pattern

### Goal

Replace the monolithic `build_facture` function with a class hierarchy using Factory + Template Method patterns. The current logic becomes **`FactureGeneraleBuilder` (FC1)**. Future facture cases (FC2, FC3…) plug in by adding a new subclass and registering it in the factory.

### New file: `Queue/worker_2/builders.py`

**`BaseFactureBuilder` (ABC)**

- `__init__(self, year, month)` — common time params
- `get_agent(self)` — **abstract**; each subclass fetches its own headquarter entity (currently `agence_dg`)
- `get_latest_facture_id(self)` — calls `db.get_latest_facture_id()` internally (no longer passed as param)
- `build(self, entetes)` — **template method** orchestrating: `get_agent()` → `get_latest_facture_id()` → `get_transport()` → `calculate_totals()` → `handle_fact_entete()` → `handle_fact_lignes()` → `set_bl_valide()` → commit. Returns `(True, latest_fact_id)` or `(False, None)`

**`FactureGeneraleBuilder(BaseFactureBuilder)` — FC1**

- `__init__(self, company_id, year, month)` — stores `company_id`
- `get_agent(self)` → calls `get_agence_dg_by_company_id(self.company_id)`

**`FactureBuilderFactory`**

- `_builders = {"generale": FactureGeneraleBuilder}`
- `create(cls, case_type, identifier, year, month)` → returns the right builder

### Changes to `main.py`

All 4 `generate_factures_*` functions simplify from:

```python
agence_dg = get_agence_dg_by_company_id(entreprise)
if agence_dg:
    build_facture(agence_dg, entetes, latest_fact_id, year, month)
    latest_fact_id += 1
```

to:

```python
builder = FactureBuilderFactory.create("generale", entreprise, year, month)
success, fact_id = builder.build(entetes)
```

- Remove standalone `build_facture` function
- Remove `get_agence_dg_by_company_id` and `get_latest_facture_id` from `main.py` imports (they move into the builder)

### Key Decisions

| Decision                                 | Rationale                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `get_agent()` inside each subclass       | User's explicit request — no `agence_dg` as parameter                                     |
| `get_latest_facture_id()` inside builder | User's explicit request — called fresh each `build()` call                                |
| Template Method for `build()`            | Base orchestrates the sequence; subclasses override only `get_agent()` (and future hooks) |
| `build()` returns `(bool, int\|None)`    | Callers need to know if facture was created for progress tracking                         |
| No changes to `db.py` / utils.py         | Existing functions reused as-is from inside the builder                                   |
| handlers.py unchanged                    | Already uses a separate Factory for job dispatch                                          |

### Files Affected

- builders.py — **NEW**
- main.py — refactor callers, remove `build_facture`
- db.py — no changes
- utils.py — no changes
- handlers.py — no changes

### Future extensibility

Adding FC2 (e.g., résidence-based factures) means:

1. Create `FactureResidenceBuilder` with `get_agent()` calling `get_agence_dg_by_residence_id()`
2. Register `"residence": FactureResidenceBuilder` in the factory
3. Done — no changes to base class or existing builders
