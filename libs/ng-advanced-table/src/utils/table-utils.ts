/* eslint-disable max-lines -- cohesive table state/normalization helper module; splitting would scatter tightly-coupled utilities. */
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  RowData,
  RowSelectionState,
  SortingState
} from '@tanstack/angular-table';

import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from './cell-interaction';
import type {
  ColumnReorderKeyboardDirection,
  NatTableDataStatus,
  TableColumnAccessibilityState,
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
