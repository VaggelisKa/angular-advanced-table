---
ng-advanced-table: minor
---

Rework keyboard and fill-layout column resizing.

Fill layout now resizes pixel-exact. When at least one column opts into resizing, fill mode renders authoritative widths (a colgroup under `table-layout: fixed`) that sum to the visible region: resized columns keep their exact width and the remaining columns flex — each at or above its `minSize` — to keep the table filled. Resizing a column (pointer or keyboard) reflows the others to absorb the change, so the table never overflows or leaves a gap and a column can only grow into the space the others can yield. Previously fill used `table-layout: auto`, which treated widths as hints, so a resize redistributed space unpredictably and a single keyboard step could jump a column far past one increment. The resize base is also clamped to the column's own `minSize`/`maxSize`, so a fill-stretched measurement can no longer seed an out-of-range base.

Keyboard resizing moves entirely onto the column header — the resize handle is now a mouse-only drag affordance (`aria-hidden`, no longer a tab stop), removing one tab stop per resizable column. Focus a header and press `Alt`+Left/Right Arrow to step the width or `Alt`+Home/End to jump to its min/max bound (RTL-aware, fit-clamped, announced through the existing live region). The previous `role="separator"` window-splitter control and its `Shift` big-step are removed.

BREAKING: the `columnResizeHandleLabel` and `columnResizeHandleValueText` accessibility-text formatters and the `NatTableAccessibilityColumnResizeHandleContext` type are removed from the public API of `ng-advanced-table` and `ng-advanced-table/locale` (the separator they labelled no longer exists). The `resizeKeyboardInstructions` locale default now describes the `Alt`+Arrow / `Alt`+Home/End header gesture. The per-column `enableResizing` opt-in and `fill` vs `fixed` sizing modes are documented in the README.
