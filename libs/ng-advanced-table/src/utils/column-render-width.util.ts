import type { Column, RowData } from '@tanstack/angular-table';

import { normalizeColumnDimension } from './column-def.util';
import type { TableColumnSizingState } from '../common/column-render.type';

/**
 * The rendered body/header width for a column: a resized width wins (falling back to the
 * column's own size), otherwise an explicitly-sized column uses its def size, else null.
 */
const resolveColumnRenderWidth = <TData extends RowData>(
  column: Column<TData, unknown>,
  sizing: TableColumnSizingState | undefined,
  resizedWidth: number | undefined,
  widths: Record<string, number>
): string | null => {
  const hasExplicitWidth = sizing?.hasSize === true || resizedWidth !== undefined;

  if (!hasExplicitWidth) {
    return null;
  }

  const numeric = resizedWidth !== undefined ? (widths[column.id] ?? column.getSize()) : column.getSize();

  return normalizeColumnDimension(numeric);
};

/** A min/max dimension: the explicit def value when the column declares it, else the resolved width. */
const resolveSizedDimension = (hasBound: boolean, boundValue: number | undefined, width: string | null): string | null => {
  if (hasBound) {
    return normalizeColumnDimension(boundValue);
  }

  return width;
};

/** Normalizes an optional meta dimension (size/height) to a CSS string or null. */
export const normalizeMetaDimension = (value: number | string | undefined): string | null =>
  value !== undefined ? normalizeColumnDimension(value) : null;

/** A header min/max bound: the explicit meta value when set, else the resolved header width. */
const resolveHeaderBound = (metaValue: number | string | undefined, headerWidth: string | null): string | null => {
  if (metaValue !== undefined) {
    return normalizeColumnDimension(metaValue);
  }

  return headerWidth;
};

/** Body/header width trio (width drives min/max defaults when no explicit bound is set). */
export const buildColumnWidths = <TData extends RowData>(
  column: Column<TData, unknown>,
  sizing: TableColumnSizingState | undefined,
  resizedWidth: number | undefined,
  widths: Record<string, number>
): { readonly width: string | null; readonly minWidth: string | null; readonly maxWidth: string | null } => {
  const width = resolveColumnRenderWidth(column, sizing, resizedWidth, widths);

  return {
    width,
    minWidth: resolveSizedDimension(sizing?.hasMinSize === true, column.columnDef.minSize, width),
    maxWidth: resolveSizedDimension(sizing?.hasMaxSize === true, column.columnDef.maxSize, width)
  };
};

/** Header width trio. A user-resized column drives the header too; otherwise header-only meta sizing applies. */
export const buildHeaderWidths = <TData extends RowData>(
  meta: Column<TData, unknown>['columnDef']['meta'],
  resizedDimension: string | null
): { readonly headerWidth: string | null; readonly headerMinWidth: string | null; readonly headerMaxWidth: string | null } => {
  const headerWidth = resizedDimension ?? normalizeMetaDimension(meta?.headerSize);

  return {
    headerWidth,
    headerMinWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMinSize, headerWidth),
    headerMaxWidth: resizedDimension ?? resolveHeaderBound(meta?.headerMaxSize, headerWidth)
  };
};
