/* eslint-disable max-lines -- cohesive table state/normalization/render-state helper module; splitting would scatter tightly-coupled utilities. */
import type { CdkDragDrop } from '@angular/cdk/drag-drop';

import type {
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  Header,
  HeaderGroup,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  Updater
} from '@tanstack/angular-table';

import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from './cell-interaction';
import type {
  ColumnRenderStateContext,
  ColumnReorderKeyboardDirection,
  ColumnReorderZone,
  NatTableCellTone,
  NatTableDataStatus,
  NatTableUserState,
  TableColumnAccessibilityState,
  TableColumnRenderState,
  TableColumnSizingState
} from '../common/table.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table.type';

export const DEFAULT_CELL_MAX_LINES = 2;

const DEFAULT_ROW_ID_INDEX_PREFIX = '__nat-table-row-index__:';

/**
 * Reads a column-keyed record entry, honestly typed `T | undefined`: a column id
 * absent from the record is `undefined` at runtime despite the value type. Lets
 * callers guard the result without a `no-unnecessary-condition` suppression.
 */
export const readColumnEntry = <T>(record: Record<string, T>, columnId: string): T | undefined => record[columnId];

const resolveColumnDefId = <TData extends RowData>(column: ColumnDef<TData, unknown>): string | null => {
  if (column.id) {
    return column.id;
  }

  const accessorKey = (column as { readonly accessorKey?: unknown }).accessorKey;

  if (typeof accessorKey === 'string') {
    return accessorKey;
  }

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

  for (const column of columns) {
    const childColumns = (
      column as ColumnDef<TData, unknown> & {
        readonly columns?: readonly ColumnDef<TData, unknown>[];
      }
    ).columns;

    if (childColumns?.length) {
      Object.assign(result, getUserColumnSizing(childColumns));
      continue;
    }

    const columnId = resolveColumnDefId(column);

    if (!columnId) {
      continue;
    }

    // TanStack applies default `size`, `minSize`, and `maxSize` to runtime
    // column definitions. Read the original input defs so only user-provided
    // sizing becomes rendered CSS.
    result[columnId] = {
      hasSize: column.size !== undefined,
      hasMinSize: column.minSize !== undefined,
      hasMaxSize: column.maxSize !== undefined
    };
  }

  return result;
};

export const originatesFromInteractiveDescendant = (event: Event): boolean => {
  const target = event.target;
  const currentTarget = event.currentTarget;

  if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
    return false;
  }

  const interactive = target.closest(ROW_ACTIVATE_INTERACTIVE_SELECTOR);

  if (!interactive) {
    return false;
  }

  return interactive !== currentTarget && currentTarget.contains(interactive);
};

/**
 * Dedupes sort entries by id (first wins). Collapses to a single primary sort
 * column unless `allowMulti` is set, in which case all deduped entries are kept.
 */
/** Removes duplicate sort entries by id, keeping the first occurrence. */
const dedupeSortEntries = (sorting: SortingState): SortingState => {
  const seen = new Set<string>();
  const deduped: SortingState = [];

  for (const entry of sorting) {
    if (seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    deduped.push(entry);
  }

  return deduped;
};

export const normalizeSortingState = (sorting: SortingState, allowMulti: boolean): SortingState => {
  if (!sorting.length) {
    return sorting;
  }

  const deduped = dedupeSortEntries(sorting);

  if (allowMulti) {
    // No duplicates removed → preserve the original reference for change detection.
    return deduped.length === sorting.length ? sorting : deduped;
  }

  const normalized = deduped.slice(0, 1);

  if (normalized.length === sorting.length && normalized[0] === sorting[0]) {
    return sorting;
  }

  const single = normalized[0];
  const original = sorting[0];

  if (normalized.length === 1 && sorting.length === 1 && single.id === original.id && single.desc === original.desc) {
    return sorting;
  }

  return normalized;
};

const uniqueStringValues = (values: readonly string[]): string[] => {
  const seen = new Set<string>();

  return values.filter((value) => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);

    return true;
  });
};

export const normalizeColumnOrder = (columnOrder: readonly string[], allLeafColumnIds: readonly string[]): ColumnOrderState => {
  const validColumnIds = new Set(allLeafColumnIds);
  const nextOrder = uniqueStringValues(columnOrder.filter((columnId) => validColumnIds.has(columnId)));

  for (const columnId of allLeafColumnIds) {
    if (!nextOrder.includes(columnId)) {
      nextOrder.push(columnId);
    }
  }

  return nextOrder;
};

export const normalizeColumnPinning = (columnPinning: ColumnPinningState, allLeafColumnIds: readonly string[]): ColumnPinningState => {
  const validColumnIds = new Set(allLeafColumnIds);
  const leftColumnIds = columnPinning.left ?? [];
  const rightColumnIds = columnPinning.right ?? [];

  return {
    left: uniqueStringValues(leftColumnIds.filter((columnId) => validColumnIds.has(columnId))),
    right: uniqueStringValues(rightColumnIds.filter((columnId) => validColumnIds.has(columnId)))
  };
};

export const normalizeDataStatus = (status: NatTableDataStatus): NatTableDataStatus => {
  return status === NAT_TABLE_DATA_STATUS.loading || status === NAT_TABLE_DATA_STATUS.error ? status : NAT_TABLE_DATA_STATUS.success;
};

export const moveItemInArrayCopy = (values: readonly string[], fromIndex: number, toIndex: number): string[] => {
  const nextValues = [...values];
  // `.at(0)` on the removed-elements array is honestly typed `string | undefined`:
  // an out-of-range fromIndex makes splice return [], so movedValue is undefined.
  const movedValue = nextValues.splice(fromIndex, 1).at(0);

  if (movedValue === undefined) return nextValues;

  nextValues.splice(toIndex, 0, movedValue);

  return nextValues;
};

export const getColumnMoveTargetIndex = (
  columnIds: readonly string[],
  columnId: string,
  directionDelta: ColumnReorderKeyboardDirection
): number | null => {
  const currentIndex = columnIds.indexOf(columnId);
  const nextIndex = currentIndex + directionDelta;

  return currentIndex !== -1 && nextIndex >= 0 && nextIndex < columnIds.length ? nextIndex : null;
};

export const replaceIdsInSlots = (
  currentOrder: readonly string[],
  nextVisibleOrder: readonly string[],
  movableIds: ReadonlySet<string>
): string[] => {
  const nextValues = [...nextVisibleOrder];

  return currentOrder.map((columnId) => {
    if (!movableIds.has(columnId)) {
      return columnId;
    }

    return nextValues.shift() ?? columnId;
  });
};

export const hasSameStringOrder = (left: readonly string[], right: readonly string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

export const matchesFilterQuery = (value: unknown, query: string): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value).toLowerCase().includes(query);
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase().includes(query);
  }

  if (Array.isArray(value)) {
    return value.some((item) => matchesFilterQuery(item, query));
  }

  return false;
};

export const resolveDefaultRowId = <TData extends RowData>(row: TData, index: number, parent?: { readonly id: string }): string => {
  const id = typeof row === 'object' && row !== null ? (row as { readonly id?: unknown }).id : undefined;

  if (typeof id === 'string' && id.trim()) {
    return id;
  }

  if (typeof id === 'number' && Number.isFinite(id)) {
    return String(id);
  }

  const fallbackId = `${DEFAULT_ROW_ID_INDEX_PREFIX}${index}`;

  return parent ? `${parent.id}.${fallbackId}` : fallbackId;
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
  if (value === Infinity) {
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

export const isUnavailableRequiredInputError = (error: unknown): error is Error & { readonly code?: number } => {
  return error instanceof Error && Math.abs((error as { readonly code?: number }).code ?? 0) === 950;
};

export const hasSameWidths = (left: Record<string, number>, right: Record<string, number>): boolean => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
};

export const normalizeColumnLabel = (label: string | undefined): string | null => {
  const normalized = label?.trim() ?? '';

  return normalized || null;
};

export const resolveColumnLabel = <TData extends RowData>(column: Column<TData, unknown>): string => {
  const hiddenHeaderLabel = normalizeColumnLabel(column.columnDef.meta?.hiddenHeaderLabel);

  if (hiddenHeaderLabel) {
    return hiddenHeaderLabel;
  }

  const metaLabel = column.columnDef.meta?.label;

  if (metaLabel) {
    return metaLabel;
  }

  if (typeof column.columnDef.header === 'string') {
    return column.columnDef.header;
  }

  const accessorKey = (column.columnDef as { readonly accessorKey?: unknown }).accessorKey;

  return typeof accessorKey === 'string' ? accessorKey : column.id || 'Column';
};

export const isPrimitiveHeaderContent = <TData extends RowData>(header: ColumnDef<TData, unknown>['header']): boolean => {
  return typeof header === 'string' || typeof header === 'number';
};

export const serializeSorting = (sorting: SortingState): string => {
  return sorting.map((entry) => `${entry.id}:${entry.desc ? 'desc' : 'asc'}`).join('|');
};

// Filter values are expected to be JSON-serializable consumer state. This guard
// only keeps accessibility snapshotting from crashing when a consumer passes an
// unsupported value; it does not try to define semantics for arbitrary objects.
const serializeColumnFilterValue = (value: unknown): string => {
  try {
    const serialized = JSON.stringify(value) as string | undefined;

    return serialized ?? String(value);
  } catch {
    return '[unserializable]';
  }
};

export const serializeColumnFilters = (columnFilters: ColumnFiltersState): string => {
  return columnFilters.map((entry) => `${entry.id}:${serializeColumnFilterValue(entry.value)}`).join('|');
};

/** Collapses a multi-row selection map to its first selected key by sort order in single mode. */
export const normalizeRowSelection = (selection: RowSelectionState, allowMulti: boolean): RowSelectionState => {
  if (allowMulti) {
    return selection;
  }

  const selectedIds = Object.keys(selection)
    .filter((id) => selection[id])
    .sort();

  if (selectedIds.length <= 1) {
    return selection;
  }

  return { [selectedIds[0]]: true };
};

export const serializeRowSelection = (selection: RowSelectionState): string => {
  return Object.keys(selection)
    .filter((id) => selection[id])
    .sort()
    .join('|');
};

export const hasSameColumnVisibility = (
  current: readonly TableColumnAccessibilityState[],
  next: readonly TableColumnAccessibilityState[]
): boolean => {
  if (current.length !== next.length) {
    return false;
  }

  // Intentionally ignores label changes so swapping i18n labels (or any other
  // purely cosmetic column-def change) does not flow through to a misleading
  // visibility announcement on the live region.
  return current.every((column) => {
    const nextColumn = next.find((candidate) => candidate.id === column.id);

    if (!nextColumn) {
      return false;
    }

    return nextColumn.visible === column.visible;
  });
};

// ─── Render-state builders, updaters, and geometry (merged from table.util.ts) ───

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
export const resolveSeedState = (initialState: Partial<NatTableUserState>, defaults: NatTableUserState): NatTableUserState => ({
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

/** Joins truthy entries into a space-separated class string. */
const buildClassMap = (entries: (string | false)[]): string => entries.filter(Boolean).join(' ');

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

  const alignEnd = meta?.align === 'end';
  const constrainedWidth = width !== null || maxWidth !== null;
  const headerConstrainedWidth = headerWidth !== null || headerMaxWidth !== null;
  const cellClamped = normalizeCellMaxLines(meta?.cellMaxLines ?? DEFAULT_CELL_MAX_LINES) !== null;

  const headerClassMap = buildClassMap([
    'header-cell',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    alignEnd && 'is-align-end',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    headerConstrainedWidth && 'is-width-constrained'
  ]);

  const isRowHeader = !!meta?.rowHeader;

  const cellClassMap = buildClassMap([
    'data-cell',
    isRowHeader && 'data-row-header',
    edges.hasPinnedEdgeLeft && 'has-pinned-edge-left',
    edges.hasPinnedEdgeRight && 'has-pinned-edge-right',
    alignEnd && 'is-align-end',
    cellClamped && 'is-cell-clamped',
    edges.pinnedLeft && 'is-pinned-left',
    edges.pinnedRight && 'is-pinned-right',
    constrainedWidth && 'is-width-constrained'
  ]);

  return {
    label: resolveColumnLabel(column),
    hiddenHeaderLabel: normalizeColumnLabel(meta?.hiddenHeaderLabel),
    alignEnd,
    ...edges,
    width,
    minWidth,
    maxWidth,
    constrainedWidth,
    headerWidth,
    headerMinWidth,
    headerMaxWidth,
    headerConstrainedWidth,
    cellHeight: normalizeMetaDimension(meta?.cellHeight),
    cellMaxLines: normalizeCellMaxLines(meta?.cellMaxLines ?? DEFAULT_CELL_MAX_LINES),
    ariaSort: resolveAriaSort(primarySortEntry),
    rowHeader: isRowHeader,
    headerClassMap,
    cellClassMap
  };
};
