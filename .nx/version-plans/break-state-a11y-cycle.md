---
ng-advanced-table: patch
---

refactor(core,components): break NatTableState ↔ NatTableA11yService circular import

Move column reorder announcements from `NatTableState.applyVisibleZoneReorder` to the
interaction-site callers (`NatTableReorderService` for drag-drop/keyboard and
`NatTableHeaderActions` for header-action menus). `applyVisibleZoneReorder` and
`moveColumnByDelta` now return a `NatTableColumnReorderResult | null` so callers can
announce the move themselves. This eliminates the static import cycle between
`table.state.ts` and `table-a11y.service.ts`.
