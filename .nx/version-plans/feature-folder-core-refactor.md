---
ng-advanced-table: patch
---

Reorganize the core `ng-advanced-table` entry into feature folders. Leaf capabilities move under `src/feature/<name>/` — `hotkey-a11y/`, `cell-interaction/`, `reorder/`, and `resize/` — each nesting its own `common`/`utils`/`domain-logic` element folders so their consts, pure helpers, services, and directives are boundary-typed by the deepest folder. The shared `common`/`utils`/`ui`/`domain-logic` layers, the `src/feature/table.ts` shell, and the per-instance state hub (`src/domain-logic/table.state.ts` plus the TanStack table instance) stay core. Internal refactor and file layout only — no public API, `exports`, or runtime behavior change; the published bundles are unchanged.
