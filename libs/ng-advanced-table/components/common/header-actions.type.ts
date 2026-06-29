import type { Column, FlexRenderContent, HeaderContext, RowData } from '@tanstack/angular-table';

import type { NatTableColumnMoveDirection as CoreNatTableColumnMoveDirection } from 'ng-advanced-table';
import type { NatTableAccessibilityHeaderActionLabels } from 'ng-advanced-table/locale';

export type NatTableColumnMoveDirection = CoreNatTableColumnMoveDirection;

/** Current sort direction for a header cell. */
export type NatTableSortDirection = 'asc' | 'desc' | false;

/** Context passed to companion sort-indicator renderers. */
export type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
  /** Alias for `sortState`, useful for `let-state` style template bindings. */
  readonly $implicit: NatTableSortDirection;
  /** Current TanStack sort direction for the column. */
  readonly sortState: NatTableSortDirection;
  /** ARIA token applied to the header cell. */
  readonly ariaSort: 'ascending' | 'descending' | 'none';
  /** TanStack column instance for advanced custom indicators. */
  readonly column: Column<TData, unknown>;
  /** Resolved human-readable label for the column. */
  readonly label: string;
};

/**
 * Custom content accepted by `withNatTableHeaderActions(..., { sortIndicator })`.
 *
 * Return a string/number for simple glyph swaps, or a FlexRender-compatible
 * renderer for richer Angular content.
 */
export type NatTableSortIndicatorContent =
  | string
  | number
  | ((props: NatTableSortIndicatorContext<RowData>) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>)
  | null
  | undefined;

/** Custom header content accepted by columns wrapped with {@link withNatTableHeaderActions}. */
export type NatTableHeaderRenderContent =
  | string
  | number
  | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>)
  | null
  | undefined;

/**
 * Options for {@link withNatTableHeaderActions}.
 *
 * Use `sortIndicator` to replace the built-in unsorted/ascending/descending glyphs
 * while keeping the same sort, pin, and move-column menu behavior.
 */
export type NatTableHeaderActionsOptions = {
  /** Custom content rendered inside the sort button for each sortable column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Static locale override for generated action labels. Defaults to the hosting table locale. */
  readonly locale?: string;
  /** Optional accessibility label overrides for the built-in sort, pin, and move actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /** Enables left/right pin menu items when the controlled table can pin this column. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items when the controlled table can reorder this column. */
  readonly enableColumnReorderActions?: boolean;
};
