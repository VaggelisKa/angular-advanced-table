import type { Column, RowData } from '@tanstack/angular-table';

import { normalizeCellMaxLines, readColumnEntry } from './column-def.util';
import { normalizeColumnLabel, resolveColumnLabel } from './column-label.util';
import { buildColumnWidths, buildHeaderWidths, normalizeMetaDimension } from './column-render-width.util';
import { DEFAULT_CELL_MAX_LINES } from '../common/column-meta.const';
import type { ColumnRenderStateContext, TableColumnRenderState } from '../common/column-render.type';

/** Resizable column sort entry (the `desc` flag is all the aria mapping needs). */
type ColumnSortEntry = { readonly desc: boolean };

/** Pinned-edge flags and sticky offsets for a column within its zone. */
type ColumnPinnedEdges = {
  readonly pinnedLeft: boolean;
  readonly pinnedRight: boolean;
  readonly hasPinnedEdgeLeft: boolean;
  readonly hasPinnedEdgeRight: boolean;
  readonly left: number | null;
  readonly right: number | null;
};

/** Scalar render flags derived once, shared by the class-map builders and the render state. */
type ColumnRenderFlags = {
  readonly alignEnd: boolean;
  readonly isRowHeader: boolean;
  readonly cellClamped: boolean;
  readonly constrainedWidth: boolean;
  readonly headerConstrainedWidth: boolean;
};

/** Pinned-edge flags and sticky offsets for a column within its zone. */
const buildPinnedEdges = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: ColumnRenderStateContext<TData>
): ColumnPinnedEdges => {
  const pinnedLeft = context.leftPinnedIds.has(column.id);
  const pinnedRight = context.rightPinnedIds.has(column.id);

  return {
    pinnedLeft,
    pinnedRight,
    hasPinnedEdgeLeft: pinnedLeft && context.leftVisibleColumns.at(-1)?.id === column.id,
    hasPinnedEdgeRight: pinnedRight && context.rightVisibleColumns.at(0)?.id === column.id,
    left: pinnedLeft ? (context.leftOffsets[column.id] ?? 0) : null,
    right: pinnedRight ? (context.rightOffsets[column.id] ?? 0) : null
  };
};

/** The primary (first) sort entry for a column, or null when it is not the primary sort. */
const findPrimarySortEntry = <TData extends RowData>(
  context: ColumnRenderStateContext<TData>,
  columnId: string
): ColumnSortEntry | null => {
  if (context.primarySortColumnId !== columnId) {
    return null;
  }

  return context.state.sorting.find((entry) => entry.id === columnId) ?? null;
};

/** Maps the primary sort entry to its aria-sort value. */
const resolveAriaSort = (primarySortEntry: ColumnSortEntry | null): 'ascending' | 'descending' | null => {
  if (!primarySortEntry) {
    return null;
  }

  return primarySortEntry.desc ? 'descending' : 'ascending';
};

/** Joins truthy entries into a space-separated class string. */
const buildClassMap = (entries: (string | false)[]): string => entries.filter(Boolean).join(' ');

/** Header class map for a column's `<th>`. */
const buildHeaderClassMap = (edges: ColumnPinnedEdges, flags: ColumnRenderFlags): string =>
  buildClassMap([
    'header-cell',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    flags.alignEnd && 'is-align-end',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    flags.headerConstrainedWidth && 'is-width-constrained'
  ]);

/** Cell class map for a column's `<td>` / row-header `<th>`. */
const buildCellClassMap = (edges: ColumnPinnedEdges, flags: ColumnRenderFlags): string =>
  buildClassMap([
    'data-cell',
    flags.isRowHeader && 'data-row-header',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    flags.alignEnd && 'is-align-end',
    flags.cellClamped && 'is-cell-clamped',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    flags.constrainedWidth && 'is-width-constrained'
  ]);

/** Builds one column's full render state from the shared context. */
export const buildColumnRenderState = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: ColumnRenderStateContext<TData>
): TableColumnRenderState => {
  const { state, userColumnSizing, widths } = context;
  const sizing = userColumnSizing[column.id];
  const resizedWidth = readColumnEntry(state.columnSizing, column.id);
  const meta = column.columnDef.meta;
  const { width, minWidth, maxWidth } = buildColumnWidths(column, sizing, resizedWidth, widths);
  const resizedDimension = resizedWidth !== undefined ? width : null;
  const { headerWidth, headerMinWidth, headerMaxWidth } = buildHeaderWidths(meta, resizedDimension);
  const edges = buildPinnedEdges(column, context);
  const primarySortEntry = findPrimarySortEntry(context, column.id);
  const cellMaxLines = normalizeCellMaxLines(meta?.cellMaxLines ?? DEFAULT_CELL_MAX_LINES);

  const flags: ColumnRenderFlags = {
    alignEnd: meta?.align === 'end',
    isRowHeader: !!meta?.rowHeader,
    cellClamped: cellMaxLines !== null,
    constrainedWidth: width !== null || maxWidth !== null,
    headerConstrainedWidth: headerWidth !== null || headerMaxWidth !== null
  };

  return {
    label: resolveColumnLabel(column),
    hiddenHeaderLabel: normalizeColumnLabel(meta?.hiddenHeaderLabel),
    alignEnd: flags.alignEnd,
    ...edges,
    width,
    minWidth,
    maxWidth,
    constrainedWidth: flags.constrainedWidth,
    headerWidth,
    headerMinWidth,
    headerMaxWidth,
    headerConstrainedWidth: flags.headerConstrainedWidth,
    cellHeight: normalizeMetaDimension(meta?.cellHeight),
    cellMaxLines,
    ariaSort: resolveAriaSort(primarySortEntry),
    rowHeader: flags.isRowHeader,
    headerClassMap: buildHeaderClassMap(edges, flags),
    cellClassMap: buildCellClassMap(edges, flags)
  };
};
