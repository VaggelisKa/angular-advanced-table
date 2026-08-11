import type { Signal } from '@angular/core';

import type { NatTableVirtualItem } from 'ng-advanced-table';

/** Fixed-row configuration for the opt-in `natTableVirtualize` directive. */
export type NatTableVirtualizationOptions = {
  /** Fixed height, in CSS pixels, of every rendered body row. */
  readonly rowHeight: number;
  /**
   * Extra rows mounted beyond each visible edge of the viewport. The window
   * only remounts once fewer than half of these remain on a scrolled-toward
   * side, so scrolling re-renders in batches. Defaults to `5`.
   */
  readonly overscan?: number;
};

/** Contiguous half-open row-index window `[start, end)` mounted in the table body. */
export type NatTableVirtualRange = {
  readonly start: number;
  readonly end: number;
};

/** Inputs for one row-window computation over body-local scroll state. */
export type NatTableVirtualRangeContext = {
  /** Scroll offset from the top of the body rows, in CSS pixels, never negative. */
  readonly scrollOffset: number;
  /** Height of the scrollable table region, in CSS pixels. */
  readonly viewportSize: number;
  /** Fixed row height, in CSS pixels, greater than zero. */
  readonly rowHeight: number;
  /** Total number of logical body rows. */
  readonly rowCount: number;
  /** The currently mounted range, carried for overscan hysteresis. */
  readonly currentRange: NatTableVirtualRange;
  /** Extra rows mounted beyond each visible edge, a non-negative integer. */
  readonly overscan: number;
  /**
   * Running count of sub-header rows rendered at or before each data row, by
   * page index — empty when the table renders no sub-headers. Places data row
   * `i` at composite slot `i + subHeaderOffsets[i]` on the fixed row grid.
   */
  readonly subHeaderOffsets: readonly number[];
};

/** Inputs for resolving the scroll offset that brings one fixed-height row into view. */
export type NatTableScrollTargetContext = {
  readonly align: 'start' | 'end' | 'auto';
  /** Current scroll offset of the table region. */
  readonly scrollTop: number;
  /** The row's top edge in region scroll coordinates. */
  readonly rowTop: number;
  readonly rowHeight: number;
  /** Sticky header overlay height, `0` when the header does not stick. */
  readonly stickyOverlayHeight: number;
  readonly viewportHeight: number;
};

/** Internal imperative bridge used by virtualization focus coordination. */
export type NatTableVirtualizerController = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly rowHeight: Signal<number>;
  measure(): void;
  scrollToIndex(index: number, options?: { readonly align?: 'start' | 'end' | 'auto' }): void;
  scrollToOffset(offset: number): void;
};

/** Focus movement resolved from a grid key before Angular Aria sees it. */
export type NatTableVirtualNavigationRequest = {
  readonly rowIndex: number;
  readonly columnId: string;
  readonly align: 'start' | 'end' | 'auto';
};
