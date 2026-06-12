---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-locales: minor
ng-advanced-table-utils: patch
---

Add row selection to `<nat-table>`: new `enableRowSelection` and `selectionMode` inputs, a `rowSelection` state slice with controlled/uncontrolled support and single-mode normalization, a `rowSelectionChange` output, `aria-selected` on body rows, a polite live announcement for selection changes, and a dev-mode warning when `getRowId` is missing. `ng-advanced-table-ui` gains `withNatTableSelectionColumn(...)` plus the `NatTableSelectionCheckbox` component with locale-resolved labels, `ng-advanced-table-locales` gains the `selectionChange` announcement formatter and the UI `selection` label section, and `ng-advanced-table-utils` picks up the `rowSelection` field in its render-metrics state contract.
