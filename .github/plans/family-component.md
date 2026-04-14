## Plan: Component Classification Refactor

**TL;DR:** Two-phase refactor. Phase A reorganizes the existing flat components files into sub-folders by concern. Phase B promotes four fully generic components from `features/digitale/_shared/` up to components so they're available project-wide. Every step is independently verifiable.

---

## Phase A — Reorganize components (6 steps, all independent)

**A1 — Create `layout/`, move navigation/shell files**

Move 7 files: `app-sidebar`, `breadcrumb-container`, `module-switcher`, `nav-main`, `nav-secondary`, `nav-projects`, `nav-user`.

- app-sidebar.tsx itself uses relative imports for its siblings (`nav-main`, `nav-user`, `module-switcher`) — those become co-located references inside `layout/`.
- Import updates: layout.tsx (imports `app-sidebar` + `breadcrumbContainer`).

**A2 — Create `feedback/`, move status/toast/progress files**

Move 3 files: `CardStatus`, `progressBar`, `ToastComponents`.

- Import updates: layout.tsx (progressBar) + **7 feature API hooks** that import `ToastComponents` (`use-logout`, `use-login`, 3× modules hooks, `use-load-ecritures`).

**A3 — Create `actions/`, move `DropdownHeaderMenuSection`**

No current consumers — pure rename/move, zero import updates.

**A4 — Rename `datePickerRange/` → `filters/date-range-picker/`**

Rename 2 files. Verify internal cross-import between `DateRangePicker` and `date-input`. No external consumers found.

**A5 — Create `providers/`, move `queryProviders`**

- Import updates: layout.tsx and layout.tsx.

**A6 — Consolidate notification (eliminate duplicate)**

notification and notification are **identical**. Delete the `features/` copy.

- Import update: layout.tsx uses `@/features/notification/notification` → change to `@/components/notification/notification`.

---

## Phase B — Promote `_shared` components to components

These 4 files in `features/digitale/_shared/components/` take no store/domain imports directly — config is injected via props. Promoting them makes them available to all future features.

**B1 — `DataTable` → `components/data-display/data-table.tsx`**

- Update 2 files: `bonLivraison/Table/table.tsx`, `bills/Table/table.tsx`

**B2 — `DialogShell` → `components/dialogs/dialog-shell.tsx`**

- Update 8 files: all 6 `bonLivraison/dialogs/*.tsx`, BonLivraisonDetailSection.tsx, + check `bills/dialogs/dialog-shell.tsx`

**B3 — `PopoverFilterButton` → `components/filters/popover-filter-button.tsx`**

- Update 3 feature FilterSection.tsx wrappers (écritures, bonLivraison, bills)

**B4 — `JobWatcher` → `components/jobs/job-watcher.tsx`**

- Update 4 store-bound wrappers: JobWatcher.tsx and JobWatcherEntrepriseDetail.tsx in both bonLivraison and bills

---

## Final Structure

```
src/components/
├── ui/                    ← unchanged
├── layout/                ← A1
├── feedback/              ← A2
├── actions/               ← A3
├── filters/
│   ├── date-range-picker/ ← A4
│   └── popover-filter-button.tsx ← B3
├── providers/             ← A5
├── notification/          ← A6 (kept, features/ copy deleted)
├── data-display/          ← B1
├── dialogs/               ← B2
└── jobs/                  ← B4
```

## Relevant Files

- layout.tsx — imports progressBar, queryProviders
- layout.tsx — imports app-sidebar, breadcrumbContainer, notification, queryProviders
- components — 4 files promoted out

## Verification

1. `npx tsc --noEmit` — zero new errors
2. `grep -r "@/features/notification"` in src → 0 results after A6
3. `grep -r "_shared/components/DataTable\|DialogShell\|JobWatcher\|PopoverFilterButton"` → 0 results after Phase B
4. Navigate the app — sidebar, toasts, notifications, and dialogs all render

## Decisions / Scope Boundaries

- **PDF components excluded** (`DocumentPDFViewer`, `DocumentPDFRendered`) — they have domain-specific typed shapes; promote after genericizing.
- **Feature wrappers stay in place** — `DropdownMenuTable`, per-feature JobWatcher.tsx, FilterSection.tsx are store-bound and belong in their feature folder.
- ui is untouched.
- **Execution order:** A-steps can be batched (all independent); Phase B after Phase A is stable.
