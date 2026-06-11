import type { ColumnDef, RowData } from '@tanstack/angular-table';

/**
 * Column transform: takes the current column list and returns the next one.
 * Every `withX(...)` helper in the companion packages has this shape.
 */
export type NatTableColumnTransform<TData extends RowData = RowData> = (
  columns: readonly ColumnDef<TData, unknown>[],
) => ColumnDef<TData, unknown>[];

/**
 * Applies column transforms left to right, so the call reads top to bottom
 * instead of inside-out. Each transform is a `(columns) => columns` function;
 * helpers that take extra arguments are wrapped in a lambda:
 *
 * ```ts
 * composeColumns(
 *   columns,
 *   (cols) => withRenderMetricsColumn(cols, store),
 *   (cols) => withNatTableHeaderActions(cols, opts),
 * );
 * // === withNatTableHeaderActions(withRenderMetricsColumn(columns, store), opts)
 * ```
 *
 * Option-only helpers (e.g. `withRowNumberColumn`, `withNatTableSelectionColumn`)
 * already match the transform shape and can be passed directly.
 *
 * With no transforms it returns a shallow copy of `columns` (identity).
 */
export function composeColumns<TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[],
  ...transforms: readonly NatTableColumnTransform<TData>[]
): ColumnDef<TData, unknown>[] {
  return transforms.reduce<ColumnDef<TData, unknown>[]>(
    (current, transform) => transform(current),
    [...columns],
  );
}
