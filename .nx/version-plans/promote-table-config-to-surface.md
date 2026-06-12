---
ng-advanced-table: minor
ng-advanced-table-ui: minor
---

Promote table configuration inputs (`manualPageCount`, `stickyHeader`, `enableAnnouncements`, `locale`, `accessibilityText`) from `<nat-table>` to the `<nat-table-surface>` component. Also completely remove the redundant `enableColumnPinning` and `enableColumnReorder` inputs, since column pinning and column reordering capabilities are always supported by default and driven by the state model.
