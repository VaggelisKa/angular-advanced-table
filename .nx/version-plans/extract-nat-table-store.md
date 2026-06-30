---
ng-advanced-table: minor
---

Extract NatTableState as a per-table-instance state owner, consolidating TanStack wiring, internal state signals, column width resolution, resize/reorder state, and a11y announcements out of the NatTable component. The component becomes a thin template consumer + DOM-coupled lifecycle manager. Also merges the duplicate `table.util.ts` into `table-utils.ts`.

Renames the public API type `NatTableState` → `NatTableUserState` to disambiguate from the new internal `NatTableState` class. The `NatTableUiState` alias continues to work as before.
