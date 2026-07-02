import type { RowData, RowSelectionState } from '@tanstack/angular-table';

import type { TableColumnAccessibilityState } from '../common/column-render.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';

const DEFAULT_ROW_ID_INDEX_PREFIX = '__nat-table-row-index__:';

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

export const normalizeDataStatus = (status: NatTableDataStatus): NatTableDataStatus => {
  return status === NAT_TABLE_DATA_STATUS.loading || status === NAT_TABLE_DATA_STATUS.error ? status : NAT_TABLE_DATA_STATUS.success;
};

export const matchesFilterQuery = (value: unknown, query: string): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  const normalizedQuery = query.toLowerCase();

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value).toLowerCase().includes(normalizedQuery);
  }

  if (value instanceof Date) {
    return value.toISOString().toLowerCase().includes(normalizedQuery);
  }

  if (Array.isArray(value)) {
    return value.some((item) => matchesFilterQuery(item, query));
  }

  return false;
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
