export const RESIZE_KEYBOARD_STEP = 8;

export const RESIZE_KEYBOARD_STEP_LARGE = 40;

/**
 * Minimum resize width for a column that does not declare its own `minSize`.
 * TanStack defaults `minSize` to 20px, which is narrower than the resize handle
 * hit area (`--nat-table-resize-handle-hit`, 24px / the WCAG 2.5.8 AA target):
 * a column dragged that small swallows its own handle (it overflows the cell and
 * stops being grabbable) and, in fill layout, collapses every neighbour to the
 * same sliver while the grown column overflows the region. Twice the hit target
 * keeps the handle fully inside the column plus a grabbable header strip. An
 * explicit `minSize` is always honoured as-is.
 */
export const DEFAULT_MIN_COLUMN_WIDTH = 48;
