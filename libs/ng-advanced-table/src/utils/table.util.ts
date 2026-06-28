/* eslint-disable max-lines -- colocated pure helpers for the table component (render-state builders, updaters, geometry); kept together so the component stays this-less and small. */
import type { CdkDragDrop } from '@angular/cdk/drag-drop';

import type { CellContext, Column, Header, HeaderGroup, PaginationState, RowData, Updater } from '@tanstack/angular-table';

import {
  DEFAULT_CELL_MAX_LINES,
  isPrimitiveHeaderContent,
  isUnavailableRequiredInputError,
  normalizeCellMaxLines,
  normalizeColumnDimension,
  normalizeColumnLabel,
  readColumnEntry,
  resolveColumnLabel
} from './table-utils';
import type {
  ColumnRenderStateContext,
  ColumnReorderZone,
  NatTableCellTone,
  NatTableState,
  TableColumnRenderState,
  TableColumnSizingState
} from '../common/table.type';

/** Resizable column sort entry (the `desc` flag is all the aria mapping needs). */
type ColumnSortEntry = { readonly desc: boolean };

/** Accumulates sticky pinned offsets in iteration order: each column's offset is the running width sum before it. */
export const accumulatePinnedOffsets = <TData extends RowData>(
  columns: readonly Column<TData, unknown>[],
  widths: Record<string, number>
): Record<string, number> => {
  const offsets: Record<string, number> = {};
  let offset = 0;

  for (const column of columns) {
    offsets[column.id] = offset;
    offset += widths[column.id] ?? 0;
  }

  return offsets;
};

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
const normalizeMetaDimension = (value: number | string | undefined): string | null =>
  value !== undefined ? normalizeColumnDimension(value) : null;

/** A header min/max bound: the explicit meta value when set, else the resolved header width. */
const resolveHeaderBound = (metaValue: number | string | undefined, headerWidth: string | null): string | null => {
  if (metaValue !== undefined) {
    return normalizeColumnDimension(metaValue);
  }

  return headerWidth;
};

/** Maps the primary sort entry to its aria-sort value. */
const resolveAriaSort = (primarySortEntry: ColumnSortEntry | null): 'ascending' | 'descending' | null => {
  if (!primarySortEntry) {
    return null;
  }

  return primarySortEntry.desc ? 'descending' : 'ascending';
};

/** Maps a `desc` flag to its sort-direction announcement value. */
export const sortDirection = (desc: boolean): 'ascending' | 'descending' => (desc ? 'descending' : 'ascending');

/** Maps active filter sources to the announcement filter-state value. */
export const resolveFilterState = (
  hasGlobalFilter: boolean,
  hasColumnFilters: boolean
): 'global-and-column' | 'global' | 'column' | 'none' => {
  if (hasGlobalFilter) {
    return hasColumnFilters ? 'global-and-column' : 'global';
  }

  return hasColumnFilters ? 'column' : 'none';
};

/** Leaf column ids of a header row, skipping placeholder headers. */
export const getHeaderRowColumnIds = <TData extends RowData>(headerGroup: HeaderGroup<TData>): string[] =>
  headerGroup.headers.filter((header) => !header.isPlaceholder).map((header) => header.column.id);

/** Whether the primitive header label should be hidden in favour of the screen-reader-only label. */
export const shouldHidePrimitiveHeaderLabel = <TData extends RowData>(
  header: Header<TData, unknown>,
  columnState: { readonly hiddenHeaderLabel: string | null } | undefined
): boolean => !!columnState?.hiddenHeaderLabel && isPrimitiveHeaderContent(header.column.columnDef.header);

/** Keyboard keys that drive a column resize (Alt+Arrow steps; Alt+Home/End jump to bounds). */
const RESIZE_KEYS: ReadonlySet<string> = new Set(['ArrowLeft', 'ArrowRight', 'Home', 'End']);

/** Whether a keyboard event's key is one of the column-resize keys. */
export const isResizeKey = (event: KeyboardEvent): boolean => RESIZE_KEYS.has(event.key);

/** A column is resizable only when its definition opts in with `enableResizing: true`. */
export const isColumnResizable = <TData extends RowData>(column: Column<TData, unknown>): boolean =>
  column.columnDef.enableResizing === true;

/** A non-placeholder header whose column opts into resizing. */
export const canResizeColumn = <TData extends RowData>(header: Header<TData, unknown>): boolean =>
  !header.isPlaceholder && isColumnResizable(header.column);

/** Resolves the per-cell tone from the column's `meta.cellTone` callback. */
export const getCellTone = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: CellContext<TData, unknown>
): NatTableCellTone | null => column.columnDef.meta?.cellTone?.(context) ?? null;

/** Resolves which column id a header drag moved, falling back to the source row slot. */
export const resolveDraggedColumnId = (event: CdkDragDrop<string[]>, rowColumnIds: readonly string[]): string | null => {
  const draggedColumnId: unknown = event.item.data;

  if (typeof draggedColumnId === 'string' && rowColumnIds.includes(draggedColumnId)) {
    return draggedColumnId;
  }

  return rowColumnIds[event.previousIndex] ?? null;
};

/** Maps a column's pin state to its reorder zone. */
export const getColumnZone = <TData extends RowData>(column: Column<TData, unknown>): ColumnReorderZone => {
  const pinnedState = column.getIsPinned();

  if (pinnedState === 'left') {
    return 'left';
  }

  if (pinnedState === 'right') {
    return 'right';
  }

  return 'center';
};

/** Scrolls `element` just into view horizontally within `scrollContainer`. */
export const scrollElementHorizontallyIntoView = (scrollContainer: HTMLElement, element: HTMLElement): void => {
  const containerRect = scrollContainer.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  if (elementRect.left < containerRect.left) {
    scrollContainer.scrollLeft -= containerRect.left - elementRect.left;

    return;
  }

  if (elementRect.right > containerRect.right) {
    scrollContainer.scrollLeft += elementRect.right - containerRect.right;
  }
};

/** Resolves a TanStack `Updater<T>` (value or function) against the current value. */
export const resolveUpdater = <T>(currentValue: T, updater: Updater<T> | undefined): T => {
  if (updater === undefined) {
    return currentValue;
  }

  return updater instanceof Function ? updater(currentValue) : updater;
};

/** Resets pagination to the first page while preserving page size. */
export const firstPageUpdater: Updater<PaginationState> = (currentPagination) => ({
  ...currentPagination,
  pageIndex: 0
});

/**
 * Reads a required signal input, returning `fallback` while the input is still
 * unavailable (Angular throws NG0950 before the first binding). Re-throws anything else.
 */
export const readRequiredInput = <T>(reader: () => T, fallback: T): T => {
  try {
    return reader();
  } catch (error) {
    if (isUnavailableRequiredInputError(error)) {
      return fallback;
    }

    throw error;
  }
};

/** Returns `value` when defined, otherwise `fallback` (kept as a call so callers stay `??`-free). */
const orDefault = <T>(value: T | undefined, fallback: T): T => value ?? fallback;

/**
 * Fills every slice of a partial initial state from `defaults`, leaving the caller to
 * apply `this`-dependent normalization (sorting/selection) and the globalFilter gate.
 */
export const resolveSeedState = (initialState: Partial<NatTableState>, defaults: NatTableState): NatTableState => ({
  sorting: orDefault(initialState.sorting, defaults.sorting),
  globalFilter: orDefault(initialState.globalFilter, defaults.globalFilter),
  columnFilters: orDefault(initialState.columnFilters, defaults.columnFilters),
  columnVisibility: orDefault(initialState.columnVisibility, defaults.columnVisibility),
  columnOrder: orDefault(initialState.columnOrder, defaults.columnOrder),
  columnPinning: orDefault(initialState.columnPinning, defaults.columnPinning),
  columnSizing: orDefault(initialState.columnSizing, defaults.columnSizing),
  rowSelection: orDefault(initialState.rowSelection, defaults.rowSelection),
  pagination: {
    pageIndex: orDefault(initialState.pagination?.pageIndex, defaults.pagination.pageIndex),
    pageSize: orDefault(initialState.pagination?.pageSize, defaults.pagination.pageSize)
  }
});

/** Resolves a pinning zone's column ids to their visible Column objects, preserving order. */
export const resolvePinnedZoneColumns = <TData extends RowData>(
  zoneColumnIds: readonly string[] | undefined,
  visibleColumnsById: ReadonlyMap<string, Column<TData, unknown>>
): Column<TData, unknown>[] =>
  (zoneColumnIds ?? [])
    .map((columnId) => visibleColumnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => !!column);

/** Body/header width trio (width drives min/max defaults when no explicit bound is set). */
const buildColumnWidths = <TData extends RowData>(
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
const buildHeaderWidths = <TData extends RowData>(
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

/** Pinned-edge flags and sticky offsets for a column within its zone. */
const buildPinnedEdges = <TData extends RowData>(
  column: Column<TData, unknown>,
  context: ColumnRenderStateContext<TData>
): {
  readonly pinnedLeft: boolean;
  readonly pinnedRight: boolean;
  readonly hasPinnedEdgeLeft: boolean;
  readonly hasPinnedEdgeRight: boolean;
  readonly left: number | null;
  readonly right: number | null;
} => {
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

  return {
    label: resolveColumnLabel(column),
    hiddenHeaderLabel: normalizeColumnLabel(meta?.hiddenHeaderLabel),
    alignEnd: meta?.align === 'end',
    ...edges,
    width,
    minWidth,
    maxWidth,
    constrainedWidth: width !== null || maxWidth !== null,
    headerWidth,
    headerMinWidth,
    headerMaxWidth,
    headerConstrainedWidth: headerWidth !== null || headerMaxWidth !== null,
    cellHeight: normalizeMetaDimension(meta?.cellHeight),
    cellMaxLines: normalizeCellMaxLines(meta?.cellMaxLines ?? DEFAULT_CELL_MAX_LINES),
    ariaSort: resolveAriaSort(primarySortEntry),
    rowHeader: !!meta?.rowHeader
  };
};
