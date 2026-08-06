---
ng-advanced-table: minor
---

Collapse `nat-table-surface` card padding around a projected list renderer.

A `<nat-list>` inside `<nat-table-surface>` draws its own item chrome, so the surface's card padding now collapses to `0` around it by default. The new public token `--nat-table-space-card-list` reopens it (it wins over the collapse at every viewport width, including the compact breakpoint).

The opt-in stock theme (`ng-advanced-table/components/theme.css`) also stops baking surface padding: `--nat-table-space-card` and `--nat-table-space-card-compact` now default to `0` (previously `18px 22px` / `14px 16px`). Consumers who want the old inset set the tokens themselves.
