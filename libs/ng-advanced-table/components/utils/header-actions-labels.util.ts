import type { Column, RowData } from '@tanstack/angular-table';

import type {
  NatTableAccessibilityHeaderActionLabels,
  NatTableAccessibilityHeaderActionMenuContext,
  NatTableAccessibilityHeaderActionMoveContext,
  NatTableAccessibilityHeaderActionPinContext,
  NatTableAccessibilityHeaderActionSortContext,
  NatTableColumnMoveDirection
} from 'ng-advanced-table/locale';

import type { NatTableSortDirection, NatTableSortIndicatorContext } from '../common/header-actions.type';

/** Side a pin action targets. */
export type NatTablePinSide = 'left' | 'right';

/** ARIA sort token corresponding to a TanStack sort direction. */
export type NatTableAriaSort = 'ascending' | 'descending' | 'none';

/** Sort attributes resolved from the header cell before building a sort label. */
type SortInfo = {
  readonly ariaSort: NatTableAriaSort;
  readonly sortPriority: number | null;
  readonly sortCount: number;
};

const buildSortContext = (label: string, sort: SortInfo): NatTableAccessibilityHeaderActionSortContext => ({
  label,
  sortState: sort.ariaSort,
  sortPriority: sort.sortPriority,
  sortCount: sort.sortCount
});

const buildPinContext = (
  label: string,
  side: NatTablePinSide,
  pinnedSide: NatTablePinSide | null
): NatTableAccessibilityHeaderActionPinContext => ({
  label,
  pinState: pinnedSide ? 'pinned' : 'unpinned',
  toggleAction: pinnedSide === side ? 'unpin' : 'pin',
  pinSide: side,
  pinnedSide
});

const buildMoveContext = (label: string, direction: NatTableColumnMoveDirection): NatTableAccessibilityHeaderActionMoveContext => ({
  label,
  direction
});

const buildMenuContext = (label: string): NatTableAccessibilityHeaderActionMenuContext => ({ label });

export const resolveSortLabel = (labels: NatTableAccessibilityHeaderActionLabels, label: string, sort: SortInfo): string =>
  labels.sortButton?.(buildSortContext(label, sort)) ?? '';

export const resolvePinLabel = (
  labels: NatTableAccessibilityHeaderActionLabels,
  label: string,
  side: NatTablePinSide,
  pinnedSide: NatTablePinSide | null
): string => labels.pinButton?.(buildPinContext(label, side, pinnedSide)) ?? '';

export const resolvePinText = (
  labels: NatTableAccessibilityHeaderActionLabels,
  label: string,
  side: NatTablePinSide,
  pinnedSide: NatTablePinSide | null
): string => labels.pinButtonText?.(buildPinContext(label, side, pinnedSide)) ?? '';

export const resolveMoveLabel = (
  labels: NatTableAccessibilityHeaderActionLabels,
  label: string,
  direction: NatTableColumnMoveDirection
): string => labels.moveButton?.(buildMoveContext(label, direction)) ?? '';

export const resolveMoveText = (
  labels: NatTableAccessibilityHeaderActionLabels,
  label: string,
  direction: NatTableColumnMoveDirection
): string => labels.moveButtonText?.(buildMoveContext(label, direction)) ?? '';

export const resolveMenuButtonLabel = (labels: NatTableAccessibilityHeaderActionLabels, label: string): string =>
  labels.menuButton?.(buildMenuContext(label)) ?? '';

export const resolveMenuLabel = (labels: NatTableAccessibilityHeaderActionLabels, label: string): string =>
  labels.menuLabel?.(buildMenuContext(label)) ?? '';

/** Maps a TanStack sort direction to its ARIA sort token. */
export const toAriaSort = (sortState: NatTableSortDirection): NatTableAriaSort => {
  if (sortState === 'asc') {
    return 'ascending';
  }

  if (sortState === 'desc') {
    return 'descending';
  }

  return 'none';
};

/** Builds the context passed to companion sort-indicator renderers. */
export const buildSortIndicatorContext = (
  sortState: NatTableSortDirection,
  ariaSort: NatTableAriaSort,
  column: Column<RowData, unknown>,
  label: string
): NatTableSortIndicatorContext<RowData> => ({
  $implicit: sortState,
  sortState,
  ariaSort,
  column,
  label
});
