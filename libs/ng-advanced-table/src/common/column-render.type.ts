import type { Column, RowData } from '@tanstack/angular-table';

import type { NatTableUserState } from './table-state.type';

/** Column zones used for reordering and pinned-offset bookkeeping. */
export type ColumnReorderZone = 'left' | 'center' | 'right';

/** Keyboard reorder direction for a column (-1 = left, 1 = right). */
export type ColumnReorderKeyboardDirection = -1 | 1;

/** Result of a column reorder operation — returned so callers can announce the change. */
export type NatTableColumnReorderResult = {
  readonly movingColumnId: string;
  readonly zone: ColumnReorderZone;
  readonly nextVisibleZoneOrder: readonly string[];
};

/** Per-column accessibility descriptor used by the column-visibility summary. */
export type TableColumnAccessibilityState = {
  readonly id: string;
  readonly label: string;
  readonly visible: boolean;
};

/** Which intrinsic sizing hints a column declares. */
export type TableColumnSizingState = {
  readonly hasSize: boolean;
  readonly hasMinSize: boolean;
  readonly hasMaxSize: boolean;
};

/** Resolved per-column render state consumed by the table template. */
export type TableColumnRenderState = {
  readonly label: string;
  readonly hiddenHeaderLabel: string | null;
  readonly alignEnd: boolean;
  readonly pinnedLeft: boolean;
  readonly pinnedRight: boolean;
  readonly hasPinnedEdgeLeft: boolean;
  readonly hasPinnedEdgeRight: boolean;
  readonly left: number | null;
  readonly right: number | null;
  readonly width: string | null;
  readonly minWidth: string | null;
  readonly maxWidth: string | null;
  readonly constrainedWidth: boolean;
  readonly headerWidth: string | null;
  readonly headerMinWidth: string | null;
  readonly headerMaxWidth: string | null;
  readonly headerConstrainedWidth: boolean;
  readonly cellHeight: string | null;
  readonly cellMaxLines: number | null;
  readonly ariaSort: 'ascending' | 'descending' | null;
  readonly rowHeader: boolean;
  /** Precomputed space-separated CSS classes for header cells. */
  readonly headerClassMap: string;
  /** Precomputed space-separated CSS classes for body cells. */
  readonly cellClassMap: string;
};

/** Precomputed inputs shared across every column when building render state. */
export type ColumnRenderStateContext<TData extends RowData> = {
  readonly widths: Record<string, number>;
  readonly state: NatTableUserState;
  readonly userColumnSizing: Record<string, TableColumnSizingState>;
  readonly primarySortColumnId: string | null;
  readonly leftVisibleColumns: Column<TData, unknown>[];
  readonly rightVisibleColumns: Column<TData, unknown>[];
  readonly leftPinnedIds: ReadonlySet<string>;
  readonly rightPinnedIds: ReadonlySet<string>;
  readonly leftOffsets: Record<string, number>;
  readonly rightOffsets: Record<string, number>;
};
