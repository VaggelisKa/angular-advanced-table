---
ng-advanced-table: minor
---

Add opt-in fixed-height row virtualization through the `NatTableVirtualize` directive and `NatTableVirtualizationOptions`, shipped as a new `ng-advanced-table/virtualization` secondary entry point. The TanStack Virtual adapter keeps one native table and scroll region, preserves the final sorted/filtered/paginated row model, renders accessibility-hidden native spacer rows, exposes absolute ARIA row positions, bridges keyboard focus across unmounted ranges, and starts new render-metrics cycles as the mounted window changes.

Virtualization composes with sticky headers, pinned columns, column sizing, reordering, selection, pagination, state rows, and row activation. TanStack Virtual remains an internal tree-shakeable runtime dependency, so consumers use only the NatTable-owned API. The feature is documented with a 10,000-row showcase example.

The row-render strategy registry is an optional `NatTableState` dependency, provided only by `NatTable`. Renderer shells that never virtualize, such as `NatList`, provide nothing and stay free of any virtualization import; an absent registry reads as "no strategy" and every row renders.

`@tanstack/angular-virtual` is confined to the new entry point, so applications that never import `ng-advanced-table/virtualization` no longer pay for that engine — a bundle of `NatTable` alone drops from 206.8 kB to 195.0 kB minified and stops importing TanStack Virtual (a further ~24.6 kB minified / ~7.7 kB gzipped) entirely. Core keeps the engine-neutral half of the contract: `NatTableRowRenderStrategy`, `NatTableBodyRenderPlan`, and `NatTableRowRenderStrategyRegistry` are now public from `ng-advanced-table`, together with `NAT_TABLE_ROW_WINDOW_HOST`/`NatTableRowWindowHost` — a narrow view of table state that lets an opt-in renderer drive row windows without core exporting `NatTableState`. The plan-building helper stays internal: strategies register through the registry and core builds the body plan itself.

Because virtualized bodies mount only a window of rows, `aria-rowcount` and body `aria-rowindex` are now derived from the logical row model instead of the DOM. Sub-header rows are counted in that numbering, so grouped tables report unbroken row positions whether or not they are virtualized. Sub-header rows are not supported inside a virtualized table — they add body rows the fixed-height virtualizer never sized — and development builds warn when both are configured on one table.

This first strategy virtualizes only the rows already supplied to the table. Server-side page-at-a-time fetching works through the existing manual pagination inputs; cursor-driven and incrementally loaded remote data are documented as unsupported.
