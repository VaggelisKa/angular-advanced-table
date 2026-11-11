import { RowData } from "@tanstack/angular-table";
import * as i0 from "@angular/core";
import { Signal } from "@angular/core";
import { NatTableVirtualItem } from "ng-advanced-table";
/** Fixed-row configuration for the opt-in `natTableVirtualize` directive. */
type NatTableVirtualizationOptions = {
  /** Fixed height, in CSS pixels, of every rendered body row. */
  readonly rowHeight: number;
  /**
   * Extra rows mounted beyond each visible edge of the viewport. The window
   * only remounts once fewer than half of these remain on a scrolled-toward
   * side, so scrolling re-renders in batches. Defaults to `5`.
   */
  readonly overscan?: number;
};
/**
 * The mounted row window, reported by `(virtualRangeChange)`.
 *
 * Indexes are positions in the current row model — the sorted, filtered, and
 * paginated rows the table renders — not positions in the source `data` array.
 * Both bounds are inclusive; an empty row model reports `startIndex: 0`,
 * `endIndex: -1`, `count: 0`.
 *
 * Emitted once per window change, which the engine's overscan hysteresis
 * batches, so a fast scroll produces a handful of events rather than one per
 * frame. Intended for fetch-on-approach: compare `endIndex` against the loaded
 * row count and start the next page before the reader reaches it.
 */
type NatTableVirtualRangeChange = {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly count: number;
};
/** Contiguous half-open row-index window `[start, end)` mounted in the table body. */
type NatTableVirtualRange = {
  readonly start: number;
  readonly end: number;
};
/** Inputs for one row-window computation over body-local scroll state. */
type NatTableVirtualRangeContext = {
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
type NatTableScrollTargetContext = {
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
type NatTableVirtualizerController = {
  readonly items: Signal<readonly NatTableVirtualItem[]>;
  readonly rowHeight: Signal<number>;
  /** Logical rows the window spans: the remote total under remote windowing, else the row model. */
  readonly rowCount: Signal<number>;
  /** Logical index of the first loaded row; `0` outside remote windowing. */
  readonly rowWindowOffset: Signal<number>;
  measure(): void;
  scrollToIndex(index: number, options?: {
    readonly align?: 'start' | 'end' | 'auto';
  }): void;
  scrollToOffset(offset: number): void;
};
/** Focus movement resolved from a grid key before Angular Aria sees it. */
type NatTableVirtualNavigationRequest = {
  /** Logical body-row index, or `null` for the always-mounted first header row. */
  readonly rowIndex: number | null;
  readonly columnId: string;
  readonly align: 'start' | 'end' | 'auto';
};
export declare class NatTableVirtualize<TData extends RowData = RowData> {
  readonly natTableVirtualize: import("@angular/core").InputSignal<NatTableVirtualizationOptions>;
  /**
   * Remote windowing: total logical rows of the dataset the table represents
   * without holding it. The scroll extent, `aria-rowcount`, and
   * `(virtualRangeChange)` indexes take this total, and every logical index
   * outside the loaded window renders as a placeholder row. Omitted (the
   * default), every existing behavior is unchanged and the loaded row model
   * remains the full extent.
   */
  readonly remoteRowCount: import("@angular/core").InputSignal<number | undefined>;
  /**
   * Remote windowing: logical index of the first `data` row — the one
   * contiguous loaded window's start. Ignored while `remoteRowCount` is unset.
   * Defaults to `0`.
   */
  readonly rowWindowOffset: import("@angular/core").InputSignal<number>;
  /** Emits the mounted row window whenever it moves. See `NatTableVirtualRangeChange`. */
  readonly virtualRangeChange: import("@angular/core").OutputEmitterRef<NatTableVirtualRangeChange>;
  private readonly state;
  private readonly natTableService;
  private readonly registry;
  private readonly engine;
  private readonly focus;
  private readonly validation;
  private readonly destroyRef;
  private readonly normalizedOptions;
  protected readonly rowHeight: import("@angular/core").Signal<number>;
  /**
   * Usable remote total or `null`. Kept free of any row-model read because it
   * feeds core through the strategy contract, where core consumes it while
   * building the TanStack options; see `normalizeNatTableRemoteRowCount`.
   */
  private readonly normalizedRemoteRowCount;
  /** Logical rows the window spans: the remote total under remote windowing, else the row model. */
  private readonly logicalRowCount;
  /** Logical index of the first loaded row, clamped into the remote extent; `0` outside remote windowing. */
  private readonly normalizedRowWindowOffset;
  /**
   * The engine's contiguous window plus the focused row, kept mounted while it
   * scrolls out of range so roving grid focus never lands on a removed cell.
   */
  private readonly virtualItems;
  /**
   * Every rendered fixed-height row: the logical data rows plus one row per
   * sub-header group. Under remote windowing core disables sub-headers, so the
   * offsets are empty and the extent is exactly one slot per logical row.
   */
  private readonly totalSize;
  private readonly controller;
  private readonly strategy;
  constructor();
  /**
   * The contiguous mounted window: the engine range, not `virtualItems`, whose
   * retained focused row can sit far outside it and misreport the position.
   */
  private readonly mountedRange;
  private registerRangeChangeEffect;
  /**
   * The four state slices whose changes rebuild the row model. The custom
   * equality collapses unrelated state traffic (per-frame columnSizing updates
   * during a drag-resize, selection toggles, visibility changes) so the reset
   * effect below never re-runs, and never re-measures, for them.
   */
  private readonly rowModelState;
  /** Row-id sequence of the current row model, compared position by position by the append test below. */
  private readonly rowIdSequence;
  private registerRowModelResetEffect;
  private registerOptionValidationEffect;
  /** Whether anything can client-sort the row model: the sort UI enabler, or an active sorting state. */
  private hasClientSortingInput;
  /** Whether anything can client-filter the row model: a registered search control, or active filter state. */
  private hasClientFilteringInput;
  /**
   * Whether a sub-header column is configured, read from the table meta: core
   * disables the groups themselves under remote windowing, so the rendered
   * offsets cannot reveal the configuration.
   */
  private hasSubHeaderConfiguration;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableVirtualize<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NatTableVirtualize<any>, "nat-table[natTableVirtualize]", never, {
    "natTableVirtualize": {
      "alias": "natTableVirtualize";
      "required": true;
      "isSignal": true;
    };
    "remoteRowCount": {
      "alias": "remoteRowCount";
      "required": false;
      "isSignal": true;
    };
    "rowWindowOffset": {
      "alias": "rowWindowOffset";
      "required": false;
      "isSignal": true;
    };
  }, {
    "virtualRangeChange": "virtualRangeChange";
  }, never, never, true, never>;
}
export type { NatTableVirtualRangeChange, NatTableVirtualizationOptions };