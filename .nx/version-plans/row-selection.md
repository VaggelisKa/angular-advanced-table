---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-locales: minor
ng-advanced-table-utils: patch
---

Add row selection to `<nat-table>`: new `enableRowSelection` and `selectionMode` inputs, a `rowSelection` state slice with controlled/uncontrolled support and single-mode normalization, `aria-selected` on body rows, grid-level `aria-multiselectable` in multiple mode, a polite live announcement for selection changes, and a dev-mode warning when `getRowId` is missing. Selection state flows through `NatTableService`, and `<nat-table-surface>` exposes it via a new `rowSelectionChange` output alongside the other slice outputs. `ng-advanced-table-ui` gains `withNatTableSelectionColumn(...)` plus the `NatTableSelectionCheckbox` component with locale-resolved labels, `ng-advanced-table-locales` gains the `selectionChange` announcement formatter and the UI `selection` label section, and `ng-advanced-table-utils` picks up the `rowSelection` field in its render-metrics state contract.
