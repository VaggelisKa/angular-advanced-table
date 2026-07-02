import type { Column, ColumnSizingState, RowData } from '@tanstack/angular-table';

import type { TableColumnSizingState } from '../../common/column-render.type';
import { readColumnEntry } from '../../utils/column-def.util';
import { DEFAULT_MIN_COLUMN_WIDTH, RESIZE_KEYBOARD_STEP, RESIZE_KEYBOARD_STEP_LARGE } from '../column-resize.const';

type ColumnResizeBounds = { readonly min: number; readonly max: number | null };

type ClampWidthFn<TData extends RowData> = (column: Column<TData, unknown>, width: number) => number;

/** Resize bounds for a column: honoured `minSize`/`maxSize`, else the default minimum. */
export const getColumnResizeBounds = <TData extends RowData>(
  column: Column<TData, unknown>,
  userColumnSizing: Record<string, TableColumnSizingState>,
  minWidth = DEFAULT_MIN_COLUMN_WIDTH
): ColumnResizeBounds => {
  const explicitMin = readColumnEntry(userColumnSizing, column.id)?.hasMinSize === true;
  const rawMin = explicitMin ? column.columnDef.minSize : minWidth;
  // `?? minWidth` only substitutes null/undefined, so a NaN minSize would slip
  // through and poison `Math.max`. Guard with `Number.isFinite` (as the maxSize
  // path does) so a bad min falls back to the safe default width.
  const safeMin = typeof rawMin === 'number' && Number.isFinite(rawMin) ? rawMin : minWidth;
  const min = Math.max(Math.round(safeMin), 1);
  const rawMax = column.columnDef.maxSize;
  const max = typeof rawMax === 'number' && Number.isFinite(rawMax) && rawMax < Number.MAX_SAFE_INTEGER ? Math.round(rawMax) : null;

  return { min, max };
};

/** Clamps a width into `[min, max]` (max optional) and rounds to a positive integer. */
export const clampWidth = (width: number, bounds: ColumnResizeBounds): number => {
  const { min, max } = bounds;
  // A non-finite min (NaN) would make `Math.max` return NaN and defeat the
  // floor-at-one safety net; treat it as "no lower bound" so the universal floor
  // of 1 applies instead.
  const safeMin = Number.isFinite(min) ? min : 1;
  const clamped = Math.max(safeMin, max !== null ? Math.min(max, width) : width);

  return Math.max(Math.round(clamped), 1);
};

/**
 * Target width for one keyboard resize step, or `null` when the key is not a
 * resize key. Arrow keys step by `RESIZE_KEYBOARD_STEP` toward/away from the
 * inline edge (direction-aware); Home/End jump to the min/max.
 */
export const computeKeyboardResizeWidth = ({
  key,
  current,
  min,
  max,
  isRtl
}: {
  readonly key: string;
  readonly current: number;
  readonly min: number;
  readonly max: number | null;
  readonly isRtl: boolean;
}): number | null => {
  const step = RESIZE_KEYBOARD_STEP;
  const towardEdge = isRtl ? -step : step;
  let next: number;

  switch (key) {
    case 'ArrowLeft':
      next = current - towardEdge;
      break;
    case 'ArrowRight':
      next = current + towardEdge;
      break;
    case 'Home':
      next = min;
      break;
    case 'End':
      next = max ?? current + RESIZE_KEYBOARD_STEP_LARGE;
      break;
    default:
      return null;
  }

  return Math.max(min, max !== null ? Math.min(max, next) : next);
};

/**
 * Clamps every entry of a column-sizing map to its column's resize bounds,
 * returning the original reference when nothing changed.
 */
export const clampColumnSizingWidths = <TData extends RowData>(
  sizing: ColumnSizingState,
  getColumn: (columnId: string) => Column<TData, unknown> | undefined,
  clampColumnWidth: ClampWidthFn<TData>
): ColumnSizingState => {
  let result: ColumnSizingState | null = null;

  for (const columnId of Object.keys(sizing)) {
    const column = getColumn(columnId);

    if (!column) continue;

    const clamped = clampColumnWidth(column, sizing[columnId]);

    if (clamped !== sizing[columnId]) {
      (result ??= { ...sizing })[columnId] = clamped;
    }
  }

  return result ?? sizing;
};
