---
ng-advanced-table: patch
---

Refine column resizing for accessibility and correctness:

- Keyboard resizing now announces when a column reaches its minimum or maximum width. Stepping into a bound, or pressing Alt+Home / Alt+End, emits a localized "(minimum)" / "(maximum)" marker through the live region instead of hitting a silent wall, so keyboard and screen-reader users learn a column's range. The `columnResize` announcement context gains additive `atMinimum` / `atMaximum` flags, and the built-in locale formatters append the marker.
- `columnSizingMode: 'fixed'` is authoritative again: a resize can grow a column past the visible region and the table scrolls, as fixed layout was designed to. The viewport "fit" cap now applies to `fill` mode only.
- Fill-flex layout honors each column's `maxSize` and distributes the surplus with integer math so the resolved column widths sum exactly to the region (no sub-pixel overflow).
