import type { Signal } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

/** Fixed-row configuration for the opt-in `natTableVirtualize` directive. */
export type NatTableVirtualizationOptions = {
  /** Fixed height, in CSS pixels, of every rendered body row. */
  readonly rowHeight: number;
  /** Number of rows rendered before and after the visible range. Defaults to `6`. */
  readonly overscan?: number;
};

/** Engine-neutral virtual item consumed by the NatTable renderer. */
export type NatTableVirtualItem = {
  readonly index: number;
  readonly start: number;
  readonly end: number;
};

/** Internal strategy registered by an opt-in body-row renderer. */
export type NatTableRowRenderStrategy = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly totalSize: Signal<number>;
  readonly rowHeight: Signal<number>;
};

/** Internal imperative bridge used by virtualization focus coordination. */
export type NatTableVirtualizerController = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly rowHeight: Signal<number>;
  measure(): void;
  scrollToIndex(index: number, options?: { readonly align?: 'start' | 'center' | 'end' | 'auto' }): void;
  scrollToOffset(offset: number, options?: { readonly align?: 'start' | 'center' | 'end' | 'auto' }): void;
};

/** Focus movement resolved from a grid key before Angular Aria sees it. */
export type NatTableVirtualNavigationRequest = {
  readonly rowIndex: number;
  readonly columnId: string;
  readonly align: 'start' | 'end' | 'auto';
};

/** One logical TanStack row plus any native-flow space immediately before it. */
export type NatTableRenderedBodyRow<TData extends RowData> = {
  readonly row: Row<TData>;
  readonly logicalIndex: number;
  readonly beforeSize: number;
};

/** Engine-neutral body plan rendered by the single NatTable body template. */
export type NatTableBodyRenderPlan<TData extends RowData> = {
  readonly rows: readonly NatTableRenderedBodyRow<TData>[];
  readonly afterSize: number;
  readonly renderKey: string;
  readonly rowHeight: number | null;
  readonly virtualized: boolean;
};
