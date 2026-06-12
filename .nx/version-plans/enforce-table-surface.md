---
ng-advanced-table: minor
ng-advanced-table-ui: minor
ng-advanced-table-utils: minor
---

Enforce that the core `<nat-table>` component must be used inside a `<nat-table-surface>` component.
Remove the `[for]` input binding from all companion components (`nat-table-search`, `nat-table-pager`, `nat-table-page-size`, `nat-table-column-visibility`, `nat-table-scroll-control`, `nat-render-metrics-filter`).
Migrate view state inputs and outputs from `<nat-table>` to `<nat-table-surface>` to centralize state management.
