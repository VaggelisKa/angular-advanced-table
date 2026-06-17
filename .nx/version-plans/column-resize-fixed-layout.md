---
ng-advanced-table: minor
ng-advanced-table-ui: minor
---

Add a `columnSizingMode` input (`'fill'` default, or `'fixed'`) to the table surface and a matching layout mode in the table. `'fill'` keeps the existing behavior where columns stretch to fill the container. `'fixed'` makes column widths authoritative via `table-layout: fixed` and a generated `<colgroup>`, sizing the table to the exact sum of its columns so the region scrolls horizontally — which makes pointer and keyboard resizing pixel-exact (the dragged edge tracks the cursor) and the drag guide land exactly where the column edge will.

Also fixes column-resize correctness in both modes:

- Resized widths are clamped to each column's `minSize`/`maxSize` everywhere they are read and committed, so a drag past a bound can no longer store an out-of-range width or expose an `aria-valuenow` outside its own `aria-valuemin`/`aria-valuemax`.
- Pointer and touch resizing now announce the final width through the live region when the drag ends, matching the keyboard path, reading the committed width even under a controlled `columnSizing` binding.
- The drag guide is clamped to the column bounds (no overshoot past min/max) and mapped to the correct screen direction in RTL.
- `columnResizeDirection` is forwarded to TanStack from the resolved text direction so pointer-drag resizing is mirrored correctly in RTL.
