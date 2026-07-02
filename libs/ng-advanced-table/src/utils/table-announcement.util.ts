import type {
  NatTableAccessibilityColumnVisibilityAnnouncementChange,
  NatTableAccessibilityColumnVisibilityAnnouncementContext,
  NatTableAccessibilityFilteringAnnouncementContext,
  NatTableAccessibilitySelectionAnnouncementContext,
  NatTableAccessibilitySortingAnnouncementContext,
  NatTableAccessibilityText
} from 'ng-advanced-table/locale';

import { hasSameColumnVisibility } from './row-state.util';
import { resolveFilterState, sortDirection } from './sorting.util';
import { describePageChange, describePageSizeChange } from './table-pagination-announcement.util';
import type { TableColumnAccessibilityState } from '../common/column-render.type';
import type { FormatAccessibilityNumber, TableAccessibilitySnapshot } from '../common/table-a11y.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';

/** Announcement text for a data-lifecycle change captured in the snapshot. */
export const describeDataStatusChange = (snapshot: TableAccessibilitySnapshot, text: NatTableAccessibilityText): string => {
  if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.loading) {
    return text.loadingState ?? '';
  }

  if (snapshot.dataStatus === NAT_TABLE_DATA_STATUS.error) {
    return text.errorState ?? '';
  }

  if (snapshot.visibleRows === 0) {
    return text.emptyState ?? '';
  }

  return '';
};

/** Announcement text for a sorting change captured in the snapshot. */
export const describeSortingChange = (snapshot: TableAccessibilitySnapshot, text: NatTableAccessibilityText): string => {
  const sortingState = snapshot.sorting;
  const formatter = text.sortingChange;
  const entry = sortingState.at(0);
  const columnLabel = entry ? (snapshot.columns.find((column) => column.id === entry.id)?.label ?? entry.id) : null;
  const sortState = entry ? sortDirection(entry.desc) : 'none';
  const sortedColumns = sortingState.map((sortEntry) => ({
    id: sortEntry.id,
    label: snapshot.columns.find((column) => column.id === sortEntry.id)?.label ?? sortEntry.id,
    sortState: sortDirection(sortEntry.desc)
  }));
  const context: NatTableAccessibilitySortingAnnouncementContext = {
    columnId: entry?.id ?? null,
    columnLabel,
    sortState,
    sortedColumns
  };

  return formatter?.(context) ?? '';
};

/** Announcement text for a filtering change captured in the snapshot. */
export const describeFilteringChange = (
  snapshot: TableAccessibilitySnapshot,
  text: NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string => {
  const formatter = text.filteringChange;
  const query = snapshot.globalFilter;
  const hasColumnFilters = !!snapshot.columnFiltersKey;
  const context: NatTableAccessibilityFilteringAnnouncementContext = {
    query: snapshot.globalFilter,
    filterState: resolveFilterState(!!query, hasColumnFilters),
    visibleRowsValue: snapshot.visibleRows,
    visibleRowsText: formatNumber(snapshot.visibleRows),
    totalRowsValue: snapshot.totalRows,
    totalRowsText: formatNumber(snapshot.totalRows)
  };

  if (formatter) {
    return formatter(context);
  }

  return '';
};

/** Announcement text for one or more column-visibility changes between snapshots. */
export const describeColumnVisibilityChange = (
  previous: readonly TableColumnAccessibilityState[],
  next: readonly TableColumnAccessibilityState[],
  text: NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string => {
  const changedColumns = next.reduce<NatTableAccessibilityColumnVisibilityAnnouncementChange[]>((result, column) => {
    const previousColumn = previous.find((candidate) => candidate.id === column.id);

    // Report a column when it is newly added (no `previousColumn`, so the optional
    // read is `undefined` and never equals a boolean) or when a column present in
    // both snapshots flipped visibility. An added column announces its arrival with
    // the `next` visibility state so the change that triggered the diff is never
    // silently dropped.
    if (previousColumn?.visible !== column.visible) {
      result.push({
        id: column.id,
        label: column.label,
        visibilityState: column.visible ? 'visible' : 'hidden'
      });
    }

    return result;
  }, []);

  // Columns dropped from `next` are no longer visible, so announce them as hidden
  // after the next-column entries.
  for (const column of previous) {
    if (!next.some((candidate) => candidate.id === column.id)) {
      changedColumns.push({ id: column.id, label: column.label, visibilityState: 'hidden' });
    }
  }

  const visibleCount = next.filter((column) => column.visible).length;
  const formatter = text.columnVisibilityChange;
  const context: NatTableAccessibilityColumnVisibilityAnnouncementContext = {
    changedColumns,
    visibleColumnsValue: visibleCount,
    visibleColumnsText: formatNumber(visibleCount),
    totalColumnsValue: next.length,
    totalColumnsText: formatNumber(next.length)
  };

  if (formatter) {
    return formatter(context);
  }

  return '';
};

/** Announcement text for a row-selection change captured in the snapshot. */
export const describeSelectionChange = (
  snapshot: TableAccessibilitySnapshot,
  text: NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string => {
  const formatter = text.selectionChange;
  const count = snapshot.selectedRowCount;
  const total = snapshot.totalRows;
  const context: NatTableAccessibilitySelectionAnnouncementContext = {
    selectedCountValue: count,
    selectedCountText: formatNumber(count),
    totalRowsValue: total,
    totalRowsText: formatNumber(total)
  };

  return formatter?.(context) ?? '';
};

/**
 * Diffs two accessibility snapshots and returns the announcement for the first
 * changed dimension, or `null` when nothing announceable changed. Mirrors the
 * priority order the service applied inline.
 *
 * `resolveText` is a thunk, not a value: it is invoked only inside the matching
 * branch, so the accessibility-text signal stays a *conditional* dependency of
 * the caller's effect — read only when there is an announceable change, exactly
 * as the pre-refactor inline dispatcher did.
 */
export const describeAccessibilityChange = (
  previous: TableAccessibilitySnapshot,
  next: TableAccessibilitySnapshot,
  resolveText: () => NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string | null => {
  if (previous.dataStatus !== next.dataStatus) {
    return describeDataStatusChange(next, resolveText());
  }

  if (previous.sortingKey !== next.sortingKey) {
    return describeSortingChange(next, resolveText());
  }

  if (previous.globalFilter !== next.globalFilter || previous.columnFiltersKey !== next.columnFiltersKey) {
    return describeFilteringChange(next, resolveText(), formatNumber);
  }

  if (!hasSameColumnVisibility(previous.columns, next.columns)) {
    return describeColumnVisibilityChange(previous.columns, next.columns, resolveText(), formatNumber);
  }

  if (previous.rowSelectionKey !== next.rowSelectionKey) {
    return describeSelectionChange(next, resolveText(), formatNumber);
  }

  if (previous.pagination.pageSize !== next.pagination.pageSize) {
    return describePageSizeChange(next, resolveText(), formatNumber);
  }

  if (previous.pagination.pageIndex !== next.pagination.pageIndex) {
    return describePageChange(next, resolveText(), formatNumber);
  }

  return null;
};
