import type { Column, ColumnSizingState, RowData } from '@tanstack/angular-table';

import { getNumericColumnWidth, readColumnEntry } from './column-def.util';
import type { TableColumnSizingState } from '../common/column-render.type';

type ClampWidthFn<TData extends RowData> = (column: Column<TData, unknown>, width: number) => number;

type FillFlexWidthDeps<TData extends RowData> = {
  /** Measured region viewport width the flex columns fill. */
  readonly container: number;
  /** Clamps a width to a column's resize bounds. */
  readonly clamp: ClampWidthFn<TData>;
  /** Resolves a column's resize bounds (min plus optional max). */
  readonly getBounds: (column: Column<TData, unknown>) => { readonly min: number; readonly max: number | null };
  /** Looks up a visible column by id. */
  readonly getColumn: (columnId: string) => Column<TData, unknown> | undefined;
};

type IntrinsicWidthDeps<TData extends RowData> = {
  /** Header-measured widths keyed by column id. */
  readonly measured: Record<string, number>;
  /** User-declared sizing flags keyed by column id. */
  readonly userSizing: Record<string, TableColumnSizingState>;
  /** Whether the table renders authoritative (colgroup) widths. */
  readonly usesAuthoritativeLayout: boolean;
  /** Clamps a width to a column's resize bounds. */
  readonly clamp: ClampWidthFn<TData>;
};

/**
 * Fill-flex widths: resized columns keep their clamped width, unresized columns
 * share the remaining region surplus weighted by their intrinsic size.
 */
export const computeFillFlexWidths = <TData extends RowData>(
  visibleColumns: readonly Column<TData, unknown>[],
  columnSizing: ColumnSizingState,
  deps: FillFlexWidthDeps<TData>
): Record<string, number> => {
  const { container, clamp, getBounds, getColumn } = deps;
  const widths: Record<string, number> = {};
  const flex: { readonly id: string; readonly weight: number; readonly min: number }[] = [];
  let sumPinned = 0;
  let totalWeight = 0;
  let sumFlexMins = 0;

  for (const column of visibleColumns) {
    const resizedWidth = readColumnEntry(columnSizing, column.id);

    if (resizedWidth !== undefined) {
      const width = clamp(column, resizedWidth);

      widths[column.id] = width;
      sumPinned += width;
    } else {
      const rawSize = column.getSize();
      // A NaN size must not poison the shared `totalWeight` (and thus every flex
      // column's distributed width). Fall back to the floor weight of 1, matching
      // the safe default the maxSize path already guards for with `Number.isFinite`.
      const weight = Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1;
      const min = getBounds(column).min;

      flex.push({ id: column.id, weight, min });
      totalWeight += weight;
      sumFlexMins += min;
    }
  }

  if (flex.length === 0) {
    return widths;
  }

  const surplus = Math.max(0, container - sumPinned - sumFlexMins);
  let distributedSurplus = 0;

  flex.forEach(({ id, weight, min }, index) => {
    const extra = index === flex.length - 1 ? surplus - distributedSurplus : Math.floor((surplus * weight) / totalWeight);

    distributedSurplus += extra;
    const flexColumn = getColumn(id);
    const flexMax = flexColumn ? getBounds(flexColumn).max : null;
    const width = min + Math.max(0, extra);

    widths[id] = flexMax !== null ? Math.min(width, flexMax) : width;
  });

  return widths;
};

/** Per-column intrinsic width used when the table does not fill-flex. */
export const resolveIntrinsicColumnWidth = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: {
    readonly measuredWidth: number | undefined;
    readonly sizing: TableColumnSizingState | undefined;
    readonly resizedWidth: number | undefined;
    readonly usesAuthoritativeLayout: boolean;
  },
  clamp: ClampWidthFn<TData>
): number => {
  const { measuredWidth, sizing, resizedWidth, usesAuthoritativeLayout } = context;

  if (resizedWidth !== undefined) {
    return clamp(column, resizedWidth);
  }

  if (!usesAuthoritativeLayout && measuredWidth !== undefined && measuredWidth > 0) {
    return measuredWidth;
  }

  const rawSize = column.getSize();
  const fixedWidth = sizing?.hasSize === true ? getNumericColumnWidth(rawSize) : null;
  // Guard NaN so the floor-at-one default stays a real safe fallback instead of
  // silently propagating NaN through as a resolved width.
  const defaultWidth = Number.isFinite(rawSize) ? Math.max(Math.round(rawSize), 1) : 1;

  return fixedWidth ?? defaultWidth;
};

/** Intrinsic widths for every visible column (resized width wins, else measured, else def size). */
export const computeIntrinsicWidths = <TData extends RowData>(
  visibleColumns: readonly Column<TData, unknown>[],
  columnSizing: ColumnSizingState,
  deps: IntrinsicWidthDeps<TData>
): Record<string, number> => {
  const { measured, userSizing, usesAuthoritativeLayout, clamp } = deps;
  const result: Record<string, number> = {};

  for (const column of visibleColumns) {
    result[column.id] = resolveIntrinsicColumnWidth(
      column,
      {
        measuredWidth: measured[column.id],
        sizing: userSizing[column.id],
        resizedWidth: columnSizing[column.id],
        usesAuthoritativeLayout
      },
      clamp
    );
  }

  return result;
};
