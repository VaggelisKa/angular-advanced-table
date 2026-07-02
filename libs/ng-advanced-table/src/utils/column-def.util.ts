import type { ColumnDef, RowData } from '@tanstack/angular-table';

import { DEFAULT_CELL_MAX_LINES } from '../common/column-meta.const';
import type { TableColumnSizingState } from '../common/column-render.type';

/**
 * Reads a column-keyed record entry, honestly typed `T | undefined`: a column id
 * absent from the record is `undefined` at runtime despite the value type. Lets
 * callers guard the result without a `no-unnecessary-condition` suppression.
 */
export const readColumnEntry = <T>(record: Record<string, T>, columnId: string): T | undefined => record[columnId];

const resolveColumnDefId = <TData extends RowData>(column: ColumnDef<TData, unknown>): string | null => {
  if (column.id) return column.id;

  const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') return accessorKey;

  return typeof column.header === 'string' ? column.header : null;
};

export const getColumnDefLeafIds = <TData extends RowData>(columns: readonly ColumnDef<TData, unknown>[]): string[] => {
  return columns.flatMap((column) => {
    const childColumns = (
      column as ColumnDef<TData, unknown> & {
        readonly columns?: readonly ColumnDef<TData, unknown>[];
      }
    ).columns;

    if (childColumns?.length) {
      return getColumnDefLeafIds(childColumns);
    }

    const columnId = resolveColumnDefId(column);

    return columnId ? [columnId] : [];
  });
};

export const getUserColumnSizing = <TData extends RowData>(
  columns: readonly ColumnDef<TData, unknown>[]
): Record<string, TableColumnSizingState> => {
  const result: Record<string, TableColumnSizingState> = {};

  // First declaration wins: when two columns resolve to the same id, keep the
  // earlier column's sizing hints rather than letting a later duplicate clobber
  // them. Surfacing a collision as data loss would be worse than deterministically
  // honouring the column the consumer declared first.
  const keepFirst = (columnId: string, sizing: TableColumnSizingState): void => {
    if (!(columnId in result)) {
      result[columnId] = sizing;
    }
  };

  for (const column of columns) {
    const childColumns = (
      column as ColumnDef<TData, unknown> & {
        readonly columns?: readonly ColumnDef<TData, unknown>[];
      }
    ).columns;

    if (childColumns?.length) {
      for (const [childId, childSizing] of Object.entries(getUserColumnSizing(childColumns))) {
        keepFirst(childId, childSizing);
      }
      continue;
    }

    const columnId = resolveColumnDefId(column);

    if (!columnId) continue;

    // TanStack applies default `size`, `minSize`, and `maxSize` to runtime
    // column definitions. Read the original input defs so only user-provided
    // sizing becomes rendered CSS.
    keepFirst(columnId, {
      hasSize: column.size !== undefined,
      hasMinSize: column.minSize !== undefined,
      hasMaxSize: column.maxSize !== undefined
    });
  }

  return result;
};

export const normalizeColumnDimension = (value: number | string | undefined): string | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? `${Math.round(value)}px` : null;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue ? trimmedValue : null;
  }

  return null;
};

export const normalizeCellMaxLines = (value: number): number | null => {
  // Only a positive, non-finite value (i.e. +Infinity) means "unlimited lines".
  // -Infinity and NaN are not usable line counts, so they fall back to the default
  // alongside zero and negative finite values.
  if (!Number.isFinite(value) && value > 0) {
    return null;
  }

  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : DEFAULT_CELL_MAX_LINES;
};

export const getNumericColumnWidth = (value: number | string | undefined): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const pixelMatch = /^(\d+(?:\.\d+)?)px$/i.exec(value.trim());

  if (!pixelMatch) {
    return null;
  }

  const width = Number(pixelMatch[1]);

  return Number.isFinite(width) && width >= 0 ? Math.round(width) : null;
};
