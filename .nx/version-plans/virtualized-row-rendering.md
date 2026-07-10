---
ng-advanced-table: minor
---

Add opt-in fixed-height row virtualization through the `NatTableVirtualize` directive and `NatTableVirtualizationOptions`. The TanStack Virtual adapter keeps one native table and scroll region, preserves the final sorted/filtered/paginated row model, renders accessibility-hidden native spacer rows, exposes absolute ARIA row positions, bridges keyboard focus across unmounted ranges, and starts new render-metrics cycles as the mounted window changes.

Virtualization composes with sticky headers, pinned columns, column sizing, reordering, selection, pagination, state rows, and row activation. It requires `@tanstack/angular-virtual` as a companion peer dependency and is documented with a 10,000-row showcase example.
