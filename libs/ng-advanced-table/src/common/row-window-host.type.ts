import type { ElementRef, Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { Column, HeaderGroup, Row, RowData } from '@tanstack/angular-table';

import type { NatTableSubHeaderGroup } from './sub-header.type';
import type { NatTableUserState } from './table-state.type';
import type { NatTableBodyState } from './table-status.type';

/**
 * The slice of table state a body-row rendering strategy needs to size, mount,
 * and focus a window of rows.
 *
 * This exists so `ng-advanced-table/virtualization` can drive the table without
 * core exporting `NatTableState` itself — that class is the internal per-table
 * hub and is deliberately not a public commitment. `NatTableState` structurally
 * satisfies this contract and `NatTable` aliases the token to it.
 */
export type NatTableRowWindowHost<TData extends RowData = RowData> = {
  /** Rows in the final sorted/filtered/paginated model — the complete logical set. */
  readonly bodyRows: Signal<readonly Row<TData>[]>;
  /** Currently rendered body branch, used to recover focus across state-row transitions. */
  readonly bodyState: Signal<NatTableBodyState>;
  /** The consumer-supplied data array, used to detect wholesale replacement. */
  readonly data: Signal<readonly TData[]>;
  /** Header rows, used to offset absolute ARIA row positions. */
  readonly headerGroups: Signal<readonly HeaderGroup<TData>[]>;
  /**
   * Whether `target` is an interactive control the cell delegates grid focus
   * to. Lets a row-window strategy tell a real grid focus target from an
   * unrelated descendant without core exposing its cell-interaction internals.
   */
  isDelegatedCellControl(cell: HTMLElement, target: HTMLElement): boolean;
  /** Full user state, used to reset the window when the row model changes. */
  readonly mergedState: Signal<NatTableUserState>;
  /** Trimmed caption text, used when measuring non-body chrome in the scroll region. */
  readonly resolvedCaption: Signal<string>;
  /** Whether the header sticks inside the scroll region. */
  readonly stickyHeader: Signal<boolean>;
  /** Sub-header segments, which the fixed-height strategy cannot size. */
  readonly subHeaderGroups: Signal<ReadonlyMap<string, NatTableSubHeaderGroup<TData>>>;
  /** The scrollable table region a strategy observes and scrolls. */
  readonly tableRegionRef: Signal<ElementRef<HTMLElement> | undefined>;
  /** Visible leaf columns in render order, used to restore focus by column. */
  readonly visibleColumns: Signal<readonly Column<TData, unknown>[]>;
};

/** Resolves the row-window host for the enclosing table. Provided by `NatTable`. */
export const NAT_TABLE_ROW_WINDOW_HOST = new InjectionToken<NatTableRowWindowHost>('NAT_TABLE_ROW_WINDOW_HOST');
