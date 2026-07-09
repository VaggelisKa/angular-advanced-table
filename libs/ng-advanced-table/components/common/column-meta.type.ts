import type { CellContext, RowData } from '@tanstack/angular-table';

import type { NatTableAccessibilityHeaderActionLabels } from 'ng-advanced-table/locale';

import type { NatTableSortIndicatorContent } from './header-actions.type';
import type { NatTableColumnExportOptions } from './table-export.type';

/** Per-column options for the header action wrapper. */
type NatTableHeaderActionsColumnOptions = {
  /** Custom content rendered inside the sort button for this column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Optional accessibility label overrides for this column's built-in actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /**
   * Removes the built-in sort button/indicator for this column. Programmatic sorting via
   * `NatTable.patchState({ sorting })` (or `natTable.table.setSorting(...)` on the underlying
   * TanStack instance) and columnDef-level `enableSorting` are unaffected. Defaults to `true`.
   */
  readonly enableSortActions?: boolean;
  /** Enables left/right pin menu items for this column when the table can pin it. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items for this column when the table can reorder it. */
  readonly enableColumnReorderActions?: boolean;
};

/**
 * Extra metadata understood by companion UI when attached to a TanStack
 * column definition. This mirrors the workspace's internal contract without
 * exposing a private package to consumers.
 */
export type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
  /** Accessible label used by companion controls when the header is not a string. */
  readonly label?: string;
  /** Visually hidden header label for utility columns where a visible title would be redundant. */
  readonly hiddenHeaderLabel?: string;
  /** Horizontal alignment for header and body cells in the column. */
  readonly align?: 'start' | 'end';
  /** Marks the body cell for this column as the row header announced by screen readers. */
  readonly rowHeader?: boolean;
  /** Optional callback that maps a cell to a semantic tone. */
  readonly cellTone?: (context: CellContext<TData, TValue>) => 'positive' | 'negative' | 'neutral' | 'warning' | null;
  /** Optional body-cell height in pixels or any CSS length. Does not affect header cells. */
  readonly cellHeight?: number | string;
  /**
   * Maximum body-cell content lines before truncation. Defaults to 2; set to `Infinity` to disable.
   * Invalid explicit values fall back to 2 lines.
   */
  readonly cellMaxLines?: number;
  /** Optional header-only width in pixels. Does not affect body cells. */
  readonly headerSize?: number | string;
  /** Optional header-only minimum width in pixels. Does not affect body cells. */
  readonly headerMinSize?: number | string;
  /** Optional header-only maximum width in pixels. Does not affect body cells. */
  readonly headerMaxSize?: number | string;
  /** Optional table export behavior for this column. */
  readonly export?: NatTableColumnExportOptions<TData, TValue>;
};

declare module '@tanstack/table-core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- module augmentation requires interface merging, not a type alias
  interface ColumnMeta<TData extends RowData, TValue> extends NatTableColumnMeta<TData, TValue> {
    /**
     * Controls the shared header action wrapper for this column.
     *
     * Set to `false` to opt out of `withNatTableHeaderActions(...)`, or provide
     * overrides such as a per-column `sortIndicator` that merge with the
     * helper-level options for this column only.
     */
    readonly headerActions?: false | NatTableHeaderActionsColumnOptions;
  }
}
