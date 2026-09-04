import * as _angular_core from '@angular/core';
import { RowData } from '@tanstack/angular-table';

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

declare class NatTableVirtualize<TData extends RowData = RowData> {
    readonly natTableVirtualize: _angular_core.InputSignal<NatTableVirtualizationOptions>;
    /**
     * Remote windowing: total logical rows of the dataset the table represents
     * without holding it. The scroll extent, `aria-rowcount`, and
     * `(virtualRangeChange)` indexes take this total, and every logical index
     * outside the loaded window renders as a placeholder row. Omitted (the
     * default), every existing behavior is unchanged and the loaded row model
     * remains the full extent.
     */
    readonly remoteRowCount: _angular_core.InputSignal<number | undefined>;
    /**
     * Remote windowing: logical index of the first `data` row — the one
     * contiguous loaded window's start. Ignored while `remoteRowCount` is unset.
     * Defaults to `0`.
     */
    readonly rowWindowOffset: _angular_core.InputSignal<number>;
    /** Emits the mounted row window whenever it moves. See `NatTableVirtualRangeChange`. */
    readonly virtualRangeChange: _angular_core.OutputEmitterRef<NatTableVirtualRangeChange>;
    private readonly state;
    private readonly natTableService;
    private readonly registry;
    private readonly engine;
    private readonly focus;
    private readonly validation;
    private readonly destroyRef;
    private readonly normalizedOptions;
    protected readonly rowHeight: _angular_core.Signal<number>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableVirtualize<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableVirtualize<any>, "nat-table[natTableVirtualize]", never, { "natTableVirtualize": { "alias": "natTableVirtualize"; "required": true; "isSignal": true; }; "remoteRowCount": { "alias": "remoteRowCount"; "required": false; "isSignal": true; }; "rowWindowOffset": { "alias": "rowWindowOffset"; "required": false; "isSignal": true; }; }, { "virtualRangeChange": "virtualRangeChange"; }, never, never, true, never>;
}

export { NatTableVirtualize };
export type { NatTableVirtualRangeChange, NatTableVirtualizationOptions };
