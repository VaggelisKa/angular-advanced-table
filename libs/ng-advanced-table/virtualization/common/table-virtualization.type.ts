import type { Signal } from '@angular/core';

import type { NatTableVirtualItem } from 'ng-advanced-table';

/** Fixed-row configuration for the opt-in `natTableVirtualize` directive. */
export type NatTableVirtualizationOptions = {
  /** Fixed height, in CSS pixels, of every rendered body row. */
  readonly rowHeight: number;
  /** Number of rows rendered before and after the visible range. Defaults to `6`. */
  readonly overscan?: number;
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
  /** Logical body-row index, or `null` for the always-mounted first header cell. */
  readonly rowIndex: number | null;
  readonly columnId: string;
  readonly align: 'start' | 'end' | 'auto';
};
