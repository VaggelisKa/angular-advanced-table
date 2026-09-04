import * as i0 from '@angular/core';
import { inject, ElementRef, NgZone, DestroyRef, PLATFORM_ID, signal, afterRenderEffect, afterNextRender, Injectable, computed, untracked, effect, isDevMode, input, output, Directive } from '@angular/core';
import { NAT_TABLE_ROW_WINDOW_HOST, NAT_TABLE_BODY_STATE, NatTableService, NatTableRowRenderStrategyRegistry, hasNatTableStateValueChanged } from 'ng-advanced-table';
import { isPlatformBrowser } from '@angular/common';

/** Whether an element belongs to `host` rather than a nested NatTable. */
const isOwnedNatTableElement = (host, element) => element.closest('nat-table') === host;
/** Finds the nearest matching ancestor owned by `host`, skipping nested NatTable matches. */
const findOwnedNatTableAncestor = (host, element, selector) => {
    if (!(element instanceof Element)) {
        return null;
    }
    let candidate = element.closest(selector);
    while (candidate && host.contains(candidate)) {
        if (isOwnedNatTableElement(host, candidate)) {
            return candidate;
        }
        candidate = candidate.parentElement?.closest(selector) ?? null;
    }
    return null;
};
/** Finds the grid cell owned by `host` for a keyboard event target. */
const findOwnedNatTableCell = (host, target) => target instanceof Element && isOwnedNatTableElement(host, target)
    ? findOwnedNatTableAncestor(host, target, '[ngGridCell][data-column-id]')
    : null;
/** Finds the placeholder row (an unfetched remote-windowing slot) owned by `host` around a target. */
const findOwnedNatTablePlaceholderRow = (host, target) => findOwnedNatTableAncestor(host, target, 'tr.placeholder-row[data-row-index]');
/**
 * Finds any body row — loaded or placeholder — owned by `host` around a
 * target. Both carry the logical `data-row-index`, which header rows never do,
 * so a keydown or focusin in the header still resolves to `null`.
 */
const findOwnedNatTableBodyRow = (host, target) => findOwnedNatTableAncestor(host, target, 'tr.data-row[data-row-index]');
/** Queries only matches owned by `host`, excluding descendants of nested NatTables. */
const queryOwnedNatTableElements = (host, selector) => [...host.querySelectorAll(selector)].filter((candidate) => isOwnedNatTableElement(host, candidate));

/** Measures native table offsets and the scrollport needed by the windowing engine. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
class NatTableVirtualLayoutService {
    state = inject(NAT_TABLE_ROW_WINDOW_HOST);
    elementRef = inject(ElementRef);
    ngZone = inject(NgZone);
    destroyRef = inject(DestroyRef);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    resizeObserver = null;
    observedCaption = null;
    viewportFrame = null;
    /** Distance from the region's scroll origin to the top of `<tbody>`, in CSS pixels. */
    bodyOffset = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "bodyOffset" }] : /* istanbul ignore next */ []));
    /** Height of the sticky header overlay covering the top of the scrollport. */
    stickyOverlayHeight = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "stickyOverlayHeight" }] : /* istanbul ignore next */ []));
    /** Client height of the scrollable table region. */
    viewportHeight = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "viewportHeight" }] : /* istanbul ignore next */ []));
    constructor() {
        afterRenderEffect({
            earlyRead: () => {
                this.state.resolvedCaption();
                // A primitive on purpose: the header-group array changes identity on
                // unrelated state changes, and size-only changes are covered by the
                // ResizeObserver.
                this.state.headerRowCount();
                this.state.stickyHeader();
                return this.readMeasurements();
            },
            write: (measurements) => {
                this.syncCaptionObservation();
                this.applyMeasurements(measurements());
            }
        });
        afterNextRender(() => {
            this.observeLayout();
            this.observeViewport();
        });
        this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
    }
    /**
     * Imperative re-measure for window resets that must not wait a render.
     * Unlike the render-effect path this can run during server rendering, where
     * the DOM implements no layout — so it must bail outside the browser.
     */
    measure() {
        if (!this.isBrowser) {
            return;
        }
        this.applyMeasurements(this.readMeasurements());
    }
    /**
     * Window resizes and orientation changes may move the region without
     * resizing it, which the region-scoped ResizeObserver cannot see. Both
     * events are observed passively outside the Angular zone and coalesced to
     * one re-measure per animation frame. Runs from `afterNextRender`, so the
     * cleanup it registers only ever exists where `window` does.
     */
    observeViewport() {
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('resize', this.onViewportChange, { passive: true });
            window.addEventListener('orientationchange', this.onViewportChange, { passive: true });
        });
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('resize', this.onViewportChange);
            window.removeEventListener('orientationchange', this.onViewportChange);
            if (this.viewportFrame !== null) {
                cancelAnimationFrame(this.viewportFrame);
                this.viewportFrame = null;
            }
        });
    }
    onViewportChange = () => {
        if (this.viewportFrame !== null) {
            return;
        }
        this.viewportFrame = requestAnimationFrame(() => {
            this.viewportFrame = null;
            this.measure();
        });
    };
    observeLayout() {
        const region = this.state.tableRegionRef()?.nativeElement;
        const table = region?.querySelector('table');
        const header = table?.querySelector('thead');
        if (!region || !table || !header || typeof ResizeObserver === 'undefined') {
            return;
        }
        this.resizeObserver = new ResizeObserver(() => this.measure());
        this.resizeObserver.observe(region);
        this.resizeObserver.observe(header);
        this.syncCaptionObservation();
    }
    /**
     * The caption lives under `@if`, so toggling it replaces the node and would
     * leave the observer watching a detached element. The render effect above
     * re-runs on `resolvedCaption()` changes and re-targets the observer here.
     */
    syncCaptionObservation() {
        // Ownership-scoped, unlike the measurements below: those read elements
        // this table always renders, so its own come first in document order. A
        // caption sits behind `@if`, so an absent one would resolve to a nested
        // table's — a node that mounts and unmounts as rows scroll.
        const caption = queryOwnedNatTableElements(this.elementRef.nativeElement, 'table caption').at(0) ?? null;
        if (!this.resizeObserver || caption === this.observedCaption) {
            return;
        }
        if (this.observedCaption) {
            this.resizeObserver.unobserve(this.observedCaption);
        }
        if (caption) {
            this.resizeObserver.observe(caption);
        }
        this.observedCaption = caption;
    }
    readMeasurements() {
        const region = this.state.tableRegionRef()?.nativeElement;
        const table = region?.querySelector('table');
        const body = table?.querySelector('tbody');
        const header = table?.querySelector('thead');
        if (!region || !body || !header) {
            return null;
        }
        const regionRect = region.getBoundingClientRect();
        const bodyRect = body.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const firstHeaderCell = header.querySelector('th');
        const stickyTop = firstHeaderCell ? Number.parseFloat(getComputedStyle(firstHeaderCell).top) || 0 : 0;
        return {
            bodyOffset: Math.max(0, bodyRect.top - regionRect.top - region.clientTop + region.scrollTop),
            stickyOverlayHeight: Math.max(0, headerRect.height + stickyTop),
            viewportHeight: region.clientHeight
        };
    }
    applyMeasurements(measurements) {
        if (measurements) {
            this.bodyOffset.set(measurements.bodyOffset);
            this.stickyOverlayHeight.set(measurements.stickyOverlayHeight);
            this.viewportHeight.set(measurements.viewportHeight);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualLayoutService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualLayoutService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualLayoutService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Whether a focusout event means the reader left the table, so focus retention
 * clears. Chromium also fires focusout when the focused node is removed from
 * the DOM — exactly what a remote window fill does when it swaps the focused
 * cell's row — and there the retained position must survive so the recovery
 * effect can put focus back on the same logical slot. A reader genuinely
 * leaving the table always leaves a connected target behind.
 */
const shouldClearNatTableFocusRetention = (event, host) => {
    if (event.target instanceof Node && !event.target.isConnected) {
        return false;
    }
    const relatedTarget = event.relatedTarget;
    return !(relatedTarget instanceof Node) || !host.contains(relatedTarget);
};
const readDataRowFocus = (host, target) => {
    const cell = findOwnedNatTableAncestor(host, target, 'tbody [ngGridCell]');
    const row = cell ? findOwnedNatTableAncestor(host, cell, 'tr.data-row[data-row-id]') : null;
    const rowId = row?.dataset['rowId'];
    const columnId = cell?.dataset['columnId'];
    if (rowId !== undefined && columnId !== undefined) {
        return { rowId, columnId };
    }
    return null;
};
const readNatTableActiveBodyFocus = (host, firstColumnId) => {
    const target = host.ownerDocument.activeElement;
    if (!target || !host.contains(target)) {
        return null;
    }
    const dataRowFocus = readDataRowFocus(host, target);
    if (dataRowFocus) {
        return dataRowFocus;
    }
    const stateCell = findOwnedNatTableAncestor(host, target, 'tbody [ngGridCell].table-state');
    return stateCell && firstColumnId ? { rowId: null, columnId: firstColumnId } : null;
};

/*
 * Pin-aware horizontal reveal, deliberately local rather than a generalization
 * of core's reorder-only `scrollElementHorizontallyIntoView`: how much this
 * feature adds to core is its weakest axis, and cross-window focus recovery is
 * the only caller needing pin-zone geometry today. Accepted gap: non-virtualized
 * tables keep the original, pin-unaware reveal. Promote when a second caller
 * earns it.
 */
const resolveUnpinnedBounds = (host, regionRect) => {
    // Ownership-scoped: a bare descendant query finds a nested table's pinned
    // header when this table has none, revealing against the wrong pin zone.
    const pinnedLeft = queryOwnedNatTableElements(host, 'thead .has-pinned-edge-left').at(0)?.getBoundingClientRect();
    const pinnedRight = queryOwnedNatTableElements(host, 'thead .has-pinned-edge-right').at(0)?.getBoundingClientRect();
    let visibleLeft = regionRect.left;
    let visibleRight = regionRect.right;
    if (pinnedLeft && pinnedLeft.left <= regionRect.left + 1) {
        visibleLeft = Math.min(pinnedLeft.right, regionRect.right);
    }
    if (pinnedRight && pinnedRight.right >= regionRect.right - 1) {
        visibleRight = Math.max(pinnedRight.left, regionRect.left);
    }
    return visibleLeft < visibleRight ? { left: visibleLeft, right: visibleRight } : null;
};
const resolveHorizontalDelta = (table, cellRect, bounds) => {
    const visibleWidth = bounds.right - bounds.left;
    if (cellRect.width > visibleWidth) {
        return table.dir === 'rtl' ? cellRect.right - bounds.right : cellRect.left - bounds.left;
    }
    if (cellRect.left < bounds.left) {
        return cellRect.left - bounds.left;
    }
    if (cellRect.right > bounds.right) {
        return cellRect.right - bounds.right;
    }
    return 0;
};
const scrollNatTableCellHorizontallyIntoView = (region, cell) => {
    const table = cell.closest('table');
    const host = cell.closest('nat-table');
    if (!table || !host || cell.matches('.is-pinned-left, .is-pinned-right')) {
        return;
    }
    const bounds = resolveUnpinnedBounds(host, region.getBoundingClientRect());
    if (!bounds) {
        return;
    }
    const delta = resolveHorizontalDelta(table, cell.getBoundingClientRect(), bounds);
    if (delta !== 0) {
        region.scrollLeft += delta;
    }
};

const matchingHeaderCells = (host, columnId) => {
    const headers = queryOwnedNatTableElements(host, 'thead [ngGridCell][data-column-id]');
    const matchingHeader = headers.find((candidate) => candidate.dataset['columnId'] === columnId);
    return matchingHeader ? [matchingHeader] : [];
};
const resolveNatTablePendingFocusCells = (host, pending) => {
    if (pending.preferHeader) {
        return queryOwnedNatTableElements(host, 'thead [ngGridCell][data-column-id]');
    }
    if (pending.rowIndex === null) {
        const bodyFallback = queryOwnedNatTableElements(host, 'tbody [ngGridCell]').at(0);
        return bodyFallback ? [bodyFallback] : matchingHeaderCells(host, pending.columnId);
    }
    const row = queryOwnedNatTableElements(host, 'tr.data-row').find((candidate) => Number(candidate.dataset['rowIndex']) === pending.rowIndex);
    return row
        ? [...row.querySelectorAll('[ngGridCell][data-column-id]')].filter((cell) => isOwnedNatTableElement(host, cell))
        : [];
};

/** Default `overscan`: rows mounted beyond each visible edge of the viewport. */
const NAT_TABLE_DEFAULT_OVERSCAN = 5;
/**
 * Whether `current` is `previous` with rows appended — the only row-model
 * change that leaves every already-visible row exactly where it was, so the
 * mounted window and scroll position survive it.
 *
 * Row IDs are compared structurally so arbitrary consumer IDs cannot erase
 * sequence boundaries. Sorting, filtering, paging, and replaced data rewrite
 * some earlier position and therefore fail the prefix comparison.
 *
 * A first load (empty to non-empty) is a rebuild rather than an append: there
 * is no prefix the reader was already looking at.
 */
const isAppendedRowSequence = (previous, current) => current.length >= previous.length &&
    (previous.length > 0 || current.length === 0) &&
    previous.every((rowId, index) => current[index] === rowId);
const NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT = 10;
/**
 * Substituted for an unusable row height. A plausible height rather than `1`,
 * which would both hide every row and mount roughly `viewportHeight` of them.
 */
const NAT_TABLE_FALLBACK_ROW_HEIGHT = 40;
/**
 * Clamps the consumer options to usable values: a non-positive or non-finite
 * row height falls back to `NAT_TABLE_FALLBACK_ROW_HEIGHT`, a negative or
 * non-finite overscan falls back to the default, and a fractional overscan is
 * floored (the directive warns for the invalid shapes in development builds).
 */
const normalizeNatTableVirtualizationOptions = (options) => ({
    rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : NAT_TABLE_FALLBACK_ROW_HEIGHT,
    overscan: typeof options.overscan === 'number' && Number.isFinite(options.overscan) && options.overscan >= 0
        ? Math.floor(options.overscan)
        : NAT_TABLE_DEFAULT_OVERSCAN
});
/**
 * Development diagnostics for the raw options, one per issue. Each names the
 * value received: the usual cause is an unresolved signal, and `0`, `NaN`, and
 * `undefined` need different fixes.
 */
const describeNatTableVirtualizationOptionIssues = (options) => {
    const issues = [];
    if (!Number.isFinite(options.rowHeight) || options.rowHeight <= 0) {
        issues.push(`rowHeight must be a finite number above zero; got ${String(options.rowHeight)}, using ${NAT_TABLE_FALLBACK_ROW_HEIGHT}px.`);
    }
    if (options.overscan !== undefined && (!Number.isFinite(options.overscan) || options.overscan < 0)) {
        issues.push(`overscan must be a finite number at or above zero; got ${String(options.overscan)}, using ${NAT_TABLE_DEFAULT_OVERSCAN}.`);
    }
    return issues;
};
/**
 * Valid `remoteRowCount` input value, or `null` when absent or unusable.
 * Deliberately independent of the loaded row model: the result feeds core's
 * TanStack options through the strategy contract, where reading the row model
 * would read the table from inside its own options. Core and the plan builder
 * clamp it against the loaded rows where that is safe.
 */
const normalizeNatTableRemoteRowCount = (remoteRowCount) => remoteRowCount !== undefined && Number.isInteger(remoteRowCount) && remoteRowCount >= 0 ? remoteRowCount : null;
/**
 * Window offset clamped so the loaded window fits inside the remote extent.
 * `0` outside remote windowing and for unusable values (the directive warns
 * for those in development builds).
 */
const normalizeNatTableRowWindowOffset = (rowWindowOffset, remoteRowCount, loadedRowCount) => {
    if (remoteRowCount === null || !Number.isInteger(rowWindowOffset) || rowWindowOffset < 0) {
        return 0;
    }
    return Math.min(rowWindowOffset, Math.max(0, remoteRowCount - loadedRowCount));
};
/**
 * Conservative cross-engine ceiling for the body's scroll extent, in CSS
 * pixels. Layout engines compute in fixed-point units backed by a 32-bit
 * integer and clamp element heights silently past their maximum: Blink and
 * WebKit (Safari included, so Safari 16.5) share the 1/64-px `LayoutUnit`,
 * whose ceiling is 2^31 / 64 ≈ 33,554,432px; Gecko uses 60-per-px app units
 * in an int32, giving ≈ 2^30 / 60 ≈ 17,895,697px. Past the ceiling the spacer
 * rows stop growing while the logical extent keeps counting, so scroll
 * position and logical index silently diverge and the far rows become
 * unreachable. 16,000,000px sits under the lowest engine ceiling (Gecko) with
 * margin for header, caption, and spacer rounding.
 */
const NAT_TABLE_MAX_SCROLL_EXTENT_PX = 16_000_000;
/**
 * Development diagnostics for the remote windowing inputs, one per issue.
 * Remote windowing decouples the scroll extent from the rows the table holds,
 * so every client-side row-model transformation over the loaded window silently
 * misrepresents the dataset — those combinations warn rather than half-work.
 */
const describeNatTableRemoteWindowingIssues = (context) => {
    const { remoteRowCount, rowWindowOffset, rowHeight, loadedRowCount, hasClientSorting, hasClientFiltering, hasClientPagination, hasSubHeaders } = context;
    const issues = [];
    if (remoteRowCount !== undefined && !(Number.isInteger(remoteRowCount) && remoteRowCount >= 0)) {
        issues.push(`remoteRowCount must be a non-negative integer; got ${String(remoteRowCount)}, ignoring it.`);
    }
    if (!(Number.isInteger(rowWindowOffset) && rowWindowOffset >= 0)) {
        issues.push(`rowWindowOffset must be a non-negative integer; got ${String(rowWindowOffset)}, using 0.`);
    }
    const remote = normalizeNatTableRemoteRowCount(remoteRowCount);
    if (remote === null) {
        return issues;
    }
    if (remote < loadedRowCount) {
        issues.push(`remoteRowCount (${remote}) is smaller than the ${loadedRowCount} loaded rows; using the loaded row count.`);
    }
    else if (Number.isInteger(rowWindowOffset) && rowWindowOffset >= 0 && rowWindowOffset + loadedRowCount > remote) {
        issues.push(`rowWindowOffset (${rowWindowOffset}) plus the ${loadedRowCount} loaded rows exceeds remoteRowCount (${remote}); clamping the window.`);
    }
    if (hasClientSorting) {
        issues.push('remoteRowCount requires manualSorting: client-side sorting would sort the loaded window, not the dataset.');
    }
    if (hasClientFiltering) {
        issues.push('remoteRowCount requires manualFiltering: client-side filtering would filter the loaded window, not the dataset.');
    }
    if (hasClientPagination) {
        issues.push('remoteRowCount requires manualPagination: client-side pagination would paginate the loaded window, not the dataset.');
    }
    if (hasSubHeaders) {
        issues.push('sub-header rows are not supported with remoteRowCount; they are disabled while it is set.');
    }
    if (remote * rowHeight > NAT_TABLE_MAX_SCROLL_EXTENT_PX) {
        const effectiveMaxRows = Math.floor(NAT_TABLE_MAX_SCROLL_EXTENT_PX / rowHeight);
        issues.push(`remoteRowCount (${remote}) needs ${remote * rowHeight}px of scroll extent at rowHeight ${rowHeight}px, above the ` +
            `${NAT_TABLE_MAX_SCROLL_EXTENT_PX}px browsers can lay out — the extent is silently clamped and rows past about ` +
            `${effectiveMaxRows} become unreachable. Keep remoteRowCount at or below ${effectiveMaxRows} for this rowHeight.`);
    }
    return issues;
};
const includeVirtualIndex = (indexes, index, count) => {
    if (index === null || index < 0 || index >= count || indexes.includes(index)) {
        return [...indexes];
    }
    return [...indexes, index].sort((left, right) => left - right);
};
/** The mounted row indexes of a range, clamped to the logical row count. */
const rangeToRowIndexes = (range, rowCount) => {
    const start = Math.max(0, Math.min(range.start, rowCount));
    const end = Math.max(start, Math.min(range.end, rowCount));
    return Array.from({ length: end - start }, (_, offset) => start + offset);
};
/** Whether the data row at `index` opens a sub-header group (its sub-header renders just above it). */
const opensSubHeaderGroup = (subHeaderOffsets, index) => (subHeaderOffsets[index] ?? 0) > (index > 0 ? (subHeaderOffsets[index - 1] ?? 0) : 0);
/** Composite fixed-grid slot occupied by data row `index`. Strictly increasing. */
const rowGridSlot = (subHeaderOffsets, index) => index + (subHeaderOffsets[index] ?? 0);
/**
 * Slot where the row's mounted block begins — one above `rowGridSlot` for a
 * group opener, which travels with the sub-header above it. Strictly increasing.
 */
const rowBlockStartSlot = (subHeaderOffsets, index) => rowGridSlot(subHeaderOffsets, index) - (opensSubHeaderGroup(subHeaderOffsets, index) ? 1 : 0);
/**
 * Materializes mounted row indexes as body-local items on the composite fixed
 * row grid. Data row `index` occupies slot `index + subHeaderOffsets[index]`;
 * when it opens a sub-header group, the item's extent grows one slot upward so
 * the mounted block (sub-header + data row) starts at the sub-header's top and
 * the spacer math stays a plain `start`/`end` walk.
 */
const createVirtualItems = (indexes, rowHeight, subHeaderOffsets) => indexes.map((index) => ({
    index,
    start: rowBlockStartSlot(subHeaderOffsets, index) * rowHeight,
    end: (rowGridSlot(subHeaderOffsets, index) + 1) * rowHeight
}));
/** The window mounted before any layout measurement exists (first paint, SSR). */
const createInitialVirtualRange = (rowCount) => ({
    start: 0,
    end: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT)
});

/**
 * Smallest data-row index whose `slotOf` value is at least `slot`. Returns
 * `rowCount` when no row reaches it, mirroring a lower-bound binary search.
 * `slotOf` must be strictly increasing, which both slot mappings are.
 */
const lowerBoundBySlot = (rowCount, slot, slotOf) => {
    let low = 0;
    let high = rowCount;
    while (low < high) {
        const middle = (low + high) >>> 1;
        if (slotOf(middle) < slot) {
            low = middle + 1;
        }
        else {
            high = middle;
        }
    }
    return low;
};
/**
 * The library's own row-windowing algorithm, operating on body-local offsets
 * over the table's existing scroll container.
 *
 * Windowing runs on the composite fixed-height grid: data row `i` occupies
 * slot `i + subHeaderOffsets[i]`, so any sub-header row rendered before a
 * group-opening row shifts every later row down one slot. Without sub-headers
 * the slot is the index and the math collapses to plain division.
 *
 * The mounted window is the visible row span extended by `overscan` rows on
 * each side. Hysteresis: an already-mounted window is kept as long as at least
 * half the overscan (minimum one row) remains mounted beyond each visible edge (edges clamped by
 * the data count always as settled). Scrolling therefore re-renders in
 * half-overscan batches instead of on every frame.
 */
const computeNatTableRowWindow = (context) => {
    const { scrollOffset, viewportSize, rowHeight, rowCount, currentRange, overscan, subHeaderOffsets } = context;
    if (rowCount === 0 || rowHeight <= 0) {
        return { start: 0, end: 0 };
    }
    const firstSlot = Math.max(0, Math.floor(scrollOffset / rowHeight));
    const lastSlot = Math.ceil((scrollOffset + viewportSize) / rowHeight);
    const firstVisible = Math.min(rowCount - 1, lowerBoundBySlot(rowCount, firstSlot, (index) => rowGridSlot(subHeaderOffsets, index)));
    // Block starts, not row slots: a group opener's sub-header sits one slot
    // above it, so measuring from the row drops that row when its sub-header is
    // the last visible slot — a blank strip when no overscan absorbs it.
    const lastVisible = Math.max(firstVisible + 1, Math.min(rowCount, lowerBoundBySlot(rowCount, lastSlot, (index) => rowBlockStartSlot(subHeaderOffsets, index))));
    const keepRows = Math.max(1, Math.floor(overscan / 2));
    // Unsettled once an edge is too close, or once the window is far wider than
    // the viewport needs — a shrunken region would otherwise keep every mounted
    // row until the reader scrolls past an edge.
    const isSettled = currentRange.end <= rowCount &&
        currentRange.end - currentRange.start <= lastVisible - firstVisible + 2 * overscan + keepRows &&
        (currentRange.start === 0 || currentRange.start + keepRows <= firstVisible) &&
        (currentRange.end === rowCount || currentRange.end - keepRows >= lastVisible);
    if (isSettled) {
        return { start: currentRange.start, end: currentRange.end };
    }
    return {
        start: Math.max(0, firstVisible - overscan),
        end: Math.min(rowCount, lastVisible + overscan)
    };
};

const PAGE_DELTAS = {
    PageDown: 1,
    PageUp: -1
};
const ARROW_DELTAS = {
    ArrowDown: 1,
    ArrowUp: -1
};
const clampRowIndex = (index, rowCount) => Math.min(Math.max(index, 0), Math.max(rowCount - 1, 0));
const hasAnyModifier = (event) => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
const resolveGridEnd = (event, rowCount, lastColumnId) => {
    const isGridEnd = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === 'End';
    return isGridEnd && rowCount > 0 && lastColumnId ? { rowIndex: rowCount - 1, columnId: lastColumnId, align: 'end' } : null;
};
const resolveGridHome = (event, firstColumnId) => {
    const isGridHome = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === 'Home';
    return isGridHome && firstColumnId ? { rowIndex: null, columnId: firstColumnId, align: 'start' } : null;
};
const resolvePageRowIndex = (context) => {
    const { currentRowIndex, delta, rowsPerPage, rowCount, subHeaderOffsets } = context;
    const targetSlot = rowGridSlot(subHeaderOffsets, currentRowIndex) + delta * rowsPerPage;
    return clampRowIndex(lowerBoundBySlot(rowCount, targetSlot, (index) => rowGridSlot(subHeaderOffsets, index)), rowCount);
};
const resolvePage = (context) => {
    const { key, currentRowIndex, currentColumnId, rowCount, rowsPerPage, subHeaderOffsets } = context;
    const delta = PAGE_DELTAS[key];
    return delta === undefined
        ? null
        : {
            rowIndex: resolvePageRowIndex({ currentRowIndex, delta, rowsPerPage, rowCount, subHeaderOffsets }),
            columnId: currentColumnId,
            align: 'start'
        };
};
const resolveArrow = (context) => {
    const { key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount } = context;
    const delta = ARROW_DELTAS[key];
    const target = delta === undefined ? currentRowIndex : currentRowIndex + delta;
    return delta === undefined || target < 0 || target >= rowCount || mountedRowIndexes.has(target)
        ? null
        : { rowIndex: target, columnId: currentColumnId, align: 'auto' };
};
const resolveNatTableVirtualNavigation = (config) => {
    const { event, currentRowIndex, currentColumnId, firstColumnId, lastColumnId, mountedRowIndexes, rowCount, rowsPerPage, subHeaderOffsets = [] } = config;
    const gridEdge = resolveGridHome(event, firstColumnId) ?? resolveGridEnd(event, rowCount, lastColumnId);
    if (gridEdge) {
        return gridEdge;
    }
    if (currentRowIndex === null || hasAnyModifier(event)) {
        return null;
    }
    const page = resolvePage({ key: event.key, currentRowIndex, currentColumnId, rowCount, rowsPerPage, subHeaderOffsets });
    if (page) {
        return page;
    }
    return resolveArrow({ key: event.key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount });
};

/* eslint-disable max-lines -- focus retention residual: one service owns roving-focus capture, id- and position-based retention, keyboard interception, and recovery across row-model, state-row, and remote window-fill transitions; the pieces share the same DOM listeners and retained signals, so splitting only relocates the coupling. */
/** Keeps roving grid focus stable while body rows enter and leave the DOM. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
class NatTableVirtualFocusService {
    elementRef = inject(ElementRef);
    state = inject(NAT_TABLE_ROW_WINDOW_HOST);
    layout = inject(NatTableVirtualLayoutService);
    destroyRef = inject(DestroyRef);
    controller = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    /**
     * Last body row the grid's roving tabstop landed on, kept while focus stays
     * anywhere inside the table host. It survives focus moving to in-table
     * chrome (header cells, in-cell controls), so the Aria grid's remembered
     * cell is still in the DOM when focus returns.
     */
    retainedRowId = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "retainedRowId" }] : /* istanbul ignore next */ []));
    /**
     * Logical position of the body cell the roving tabstop last landed on —
     * placeholder or loaded row alike. Placeholder rows have no row id, so this
     * is their only retention; for loaded rows it is the fallback when a remote
     * window fill removes the retained row id from the model. Either way it lets
     * the pending-focus effect put focus back on the same logical slot when a
     * fill replaces the focused cell's DOM node.
     */
    retainedCellPosition = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "retainedCellPosition" }] : /* istanbul ignore next */ []));
    pendingFocus = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pendingFocus" }] : /* istanbul ignore next */ []));
    /**
     * Logical index by row id, rebuilt only when the row model changes. Lazy:
     * `focusedLogicalIndex` reads it only while a row is focused, so a table the
     * user never focuses never builds the map — and each focus move while
     * navigating costs one lookup instead of an O(n) scan.
     */
    rowIndexById = computed(() => {
        const indexById = new Map();
        this.state.bodyRows().forEach((row, index) => indexById.set(row.id, index));
        return indexById;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowIndexById" }] : /* istanbul ignore next */ []));
    /** Logical index of the retained row — offset into remote coordinates under remote windowing. */
    focusedLogicalIndex = computed(() => {
        // The row id follows the row through reorders and appends, so it wins
        // whenever it still resolves; the static logical position covers the rows
        // an id cannot: placeholders, and loaded rows a window fill removed.
        const retainedRowId = this.retainedRowId();
        const loadedIndex = retainedRowId === null ? undefined : this.rowIndexById().get(retainedRowId);
        if (loadedIndex !== undefined) {
            return loadedIndex + this.rowWindowOffset();
        }
        return this.retainedCellPosition()?.logicalIndex ?? null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "focusedLogicalIndex" }] : /* istanbul ignore next */ []));
    rowWindowOffset() {
        return this.controller()?.rowWindowOffset() ?? 0;
    }
    constructor() {
        const host = this.elementRef.nativeElement;
        host.addEventListener('keydown', this.onKeydownCapture, true);
        host.addEventListener('focusin', this.onFocusIn);
        host.addEventListener('focusout', this.onFocusOut);
        this.destroyRef.onDestroy(() => {
            host.removeEventListener('keydown', this.onKeydownCapture, true);
            host.removeEventListener('focusin', this.onFocusIn);
            host.removeEventListener('focusout', this.onFocusOut);
        });
        this.registerPendingFocusEffect();
    }
    connect(controller) {
        this.controller.set(controller);
    }
    /** Captures body focus before a row-model or state-row transition. Returns a logical row index. */
    prepareRowModelReset() {
        const controller = this.controller();
        this.pendingFocus.set(null);
        const activeFocus = readNatTableActiveBodyFocus(this.elementRef.nativeElement, this.state.visibleColumns().at(0)?.id);
        // A focused placeholder has no row id to follow through the reset; it
        // falls back to the first surviving row in the same column.
        const placeholderFocus = this.readActivePlaceholderFocus();
        this.retainedCellPosition.set(null);
        if (!controller || (!activeFocus && !placeholderFocus)) {
            this.retainedRowId.set(null);
            return null;
        }
        const columnId = activeFocus?.columnId ?? placeholderFocus?.columnId ?? '';
        const targetIndex = this.resolveResetTargetIndex(activeFocus ? activeFocus.rowId : null);
        const targetRowId = targetIndex === null ? null : (this.state.bodyRows()[targetIndex]?.id ?? null);
        const logicalTargetIndex = targetIndex === null ? null : targetIndex + this.rowWindowOffset();
        this.retainedRowId.set(targetRowId);
        this.pendingFocus.set({ rowIndex: logicalTargetIndex, columnId });
        return logicalTargetIndex;
    }
    /** The focused placeholder cell, when document focus currently sits inside one. */
    readActivePlaceholderFocus() {
        const host = this.elementRef.nativeElement;
        const target = host.ownerDocument.activeElement;
        if (!target || !host.contains(target)) {
            return null;
        }
        const row = findOwnedNatTablePlaceholderRow(host, target);
        const cell = findOwnedNatTableCell(host, target);
        if (!row || !cell) {
            return null;
        }
        const logicalIndex = Number(row.dataset['rowIndex']);
        return Number.isInteger(logicalIndex) ? { logicalIndex, columnId: cell.dataset['columnId'] ?? '' } : null;
    }
    resolveResetTargetIndex(rowId) {
        if (this.state.bodyState() !== NAT_TABLE_BODY_STATE.rows || this.state.bodyRows().length === 0) {
            return null;
        }
        return rowId === null ? 0 : (this.rowIndexById().get(rowId) ?? 0);
    }
    onFocusIn = (event) => {
        const host = this.elementRef.nativeElement;
        const bodyRow = findOwnedNatTableBodyRow(host, event.target);
        if (!bodyRow) {
            return;
        }
        // Loaded rows retain by id (which follows the row through the model) and
        // by logical position (which survives the id vanishing in a window fill);
        // placeholder rows have only the position.
        this.retainedRowId.set(bodyRow.dataset['rowId'] ?? null);
        const logicalIndex = Number(bodyRow.dataset['rowIndex']);
        const cell = findOwnedNatTableCell(host, event.target);
        this.retainedCellPosition.set(Number.isInteger(logicalIndex) && cell ? { logicalIndex, columnId: cell.dataset['columnId'] ?? '' } : null);
    };
    onFocusOut = (event) => {
        if (!shouldClearNatTableFocusRetention(event, this.elementRef.nativeElement)) {
            return;
        }
        const target = event.target;
        // Chromium dispatches this focusout while a cell being removed is still
        // connected, indistinguishable at event time from the reader leaving the
        // table. Decide after the DOM update settles: a detached target was a
        // removal (a window fill swapping the focused cell's row) and retention
        // must survive for the recovery effect; anything else genuinely departed.
        queueMicrotask(() => {
            if (target instanceof Node && !target.isConnected) {
                return;
            }
            this.retainedRowId.set(null);
            this.retainedCellPosition.set(null);
        });
    };
    // eslint-disable-next-line complexity -- capture handler validates DOM focus, mounted range, viewport, and key intent before interception.
    onKeydownCapture = (event) => {
        const controller = this.controller();
        const target = event.target instanceof HTMLElement ? event.target : null;
        const cell = findOwnedNatTableCell(this.elementRef.nativeElement, target);
        const isGridFocusTarget = target !== null && cell !== null && (target === cell || this.state.isDelegatedCellControl(cell, target));
        if (!controller || !cell || !isGridFocusTarget || event.defaultPrevented) {
            return;
        }
        // Ownership-scoped: a bare `closest` walks straight out of this table when
        // the focused cell sits in the header, and an enclosing table's data row
        // would hand the header cell that row's index instead of `null`. Loaded
        // and placeholder rows both carry the logical `data-row-index`, so arrow
        // and page navigation work identically from an unfetched slot.
        const row = findOwnedNatTableBodyRow(this.elementRef.nativeElement, cell);
        const rowIndexValue = row?.dataset['rowIndex'];
        const currentRowIndex = rowIndexValue === undefined ? null : Number(rowIndexValue);
        const request = resolveNatTableVirtualNavigation({
            event,
            currentRowIndex: Number.isInteger(currentRowIndex) ? currentRowIndex : null,
            currentColumnId: cell.dataset['columnId'] ?? '',
            firstColumnId: this.state.visibleColumns().at(0)?.id,
            lastColumnId: this.state.visibleColumns().at(-1)?.id,
            mountedRowIndexes: new Set(controller.items().map((item) => item.index)),
            rowCount: controller.rowCount(),
            rowsPerPage: this.resolveRowsPerPage(controller),
            subHeaderOffsets: this.state.subHeaderRowOffsets()
        });
        if (!request) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        this.pendingFocus.set({ ...request, preferHeader: request.rowIndex === null });
        if (request.rowIndex === null) {
            controller.scrollToOffset(0);
        }
        else {
            controller.scrollToIndex(request.rowIndex, { align: request.align });
        }
    };
    resolveRowsPerPage(controller) {
        const rowHeight = controller.rowHeight();
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!region) {
            return 1;
        }
        const bodyStart = Math.max(0, this.layout.bodyOffset() - region.scrollTop);
        const stickyOverlay = this.state.stickyHeader() ? this.layout.stickyOverlayHeight() : 0;
        const visibleBodyHeight = region.clientHeight - Math.max(bodyStart, stickyOverlay);
        return Math.max(1, Math.floor(visibleBodyHeight / rowHeight));
    }
    registerPendingFocusEffect() {
        afterRenderEffect(() => {
            const controller = this.controller();
            const pendingFocus = this.pendingFocus();
            controller?.items();
            // A window fill swaps a placeholder row's DOM node for the fetched row,
            // so the row model is a focus-recovery trigger too.
            this.state.bodyRows();
            const request = pendingFocus ?? this.resolveDroppedBodyFocus();
            if (!request) {
                return;
            }
            const cells = resolveNatTablePendingFocusCells(this.elementRef.nativeElement, request);
            const cell = cells.find((candidate) => candidate.dataset['columnId'] === request.columnId) ?? cells.at(0);
            if (cell) {
                cell.focus({ preventScroll: true });
                const region = this.state.tableRegionRef()?.nativeElement;
                if (region) {
                    scrollNatTableCellHorizontallyIntoView(region, cell);
                }
                this.pendingFocus.set(null);
            }
        });
    }
    /**
     * Focus dropped by a window fill: the reader was on a body cell — a
     * placeholder, or a loaded row the fill removed — its node was replaced, and
     * browsers move focus to the body without a focusout (which would have
     * cleared the retained position). Anywhere else focus could legitimately be —
     * still inside the table, or moved away through a real focusout — this stays
     * `null` so focus is never stolen.
     */
    resolveDroppedBodyFocus() {
        const retainedPosition = this.retainedCellPosition();
        if (retainedPosition === null) {
            return null;
        }
        const host = this.elementRef.nativeElement;
        const activeElement = host.ownerDocument.activeElement;
        const focusDropped = !activeElement || activeElement === host.ownerDocument.body || !activeElement.isConnected;
        if (!focusDropped) {
            return null;
        }
        // One-shot: a successful recovery re-arms the position through its own
        // focusin, and a failed one must not leave a stale position behind that a
        // later row-model change could use to steal focus from the page.
        this.retainedCellPosition.set(null);
        return { rowIndex: retainedPosition.logicalIndex, columnId: retainedPosition.columnId };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualFocusService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualFocusService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualFocusService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Resolves the scroll offset that brings a fixed-height row into view: 'start'
 * lands it just below the sticky overlay, 'end' at the viewport bottom, and
 * 'auto' scrolls the minimum needed — or not at all (`null`) when the row is
 * already fully visible below the sticky overlay.
 */
const resolveNatTableScrollTarget = (context) => {
    const { align, scrollTop, rowTop, rowHeight, stickyOverlayHeight, viewportHeight } = context;
    const startTarget = Math.max(0, rowTop - stickyOverlayHeight);
    const endTarget = Math.max(0, rowTop + rowHeight - viewportHeight);
    if (align === 'start') {
        return startTarget;
    }
    if (align === 'end') {
        return endTarget;
    }
    if (rowTop < scrollTop + stickyOverlayHeight) {
        return startTarget;
    }
    return rowTop + rowHeight > scrollTop + viewportHeight ? endTarget : null;
};

/**
 * Drives the mounted row window from the table region's scroll state, using
 * the library's own overscan windowing algorithm over the existing scroll
 * container.
 *
 * A dedicated virtual-scroll viewport element is deliberately not introduced:
 * a content-wrapper `translateY` offset would put the sticky `<thead>` and
 * sticky pinned cells inside a per-frame-transformed ancestor — the exact
 * geometry native table spacer rows avoid. Scroll events are observed with one
 * passive listener registered outside the Angular zone and coalesced to
 * animation frames, so windowing work never outruns paint.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
class NatTableVirtualScrollEngine {
    state = inject(NAT_TABLE_ROW_WINDOW_HOST);
    layout = inject(NatTableVirtualLayoutService);
    ngZone = inject(NgZone);
    destroyRef = inject(DestroyRef);
    options = null;
    /** Logical rows the window spans — the remote total under remote windowing, else the row model. */
    logicalRowCount = null;
    observedRegion = null;
    scrollFrame = null;
    mountedRange = signal({ start: 0, end: NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mountedRange" }] : /* istanbul ignore next */ []));
    /** The mounted half-open row-index window. May exceed a shrunken row model until the next update. */
    range = this.mountedRange.asReadonly();
    constructor() {
        this.destroyRef.onDestroy(() => this.detachScrollListener());
    }
    /** Wires the engine to the normalized directive options and logical row count and starts tracking. */
    connect(options, logicalRowCount) {
        this.options = options;
        this.logicalRowCount = logicalRowCount;
        this.registerRegionAttachmentEffect();
        this.registerRangeUpdateEffect();
    }
    /** Re-measures layout and recomputes the window in one imperative step. */
    measure() {
        this.layout.measure();
        this.updateRange();
    }
    scrollToIndex(index, align) {
        const region = this.state.tableRegionRef()?.nativeElement;
        const options = this.options;
        if (!region || !options) {
            return;
        }
        const rowHeight = untracked(options).rowHeight;
        const subHeaderOffsets = untracked(this.state.subHeaderRowOffsets);
        // A group-opening row travels with the sub-header row above it: target the
        // two-slot block so 'start' reveals the sub-header, not just the data row.
        const opensGroup = opensSubHeaderGroup(subHeaderOffsets, index);
        const slot = index + (subHeaderOffsets[index] ?? 0) - (opensGroup ? 1 : 0);
        const target = resolveNatTableScrollTarget({
            align,
            scrollTop: region.scrollTop,
            rowTop: untracked(this.layout.bodyOffset) + slot * rowHeight,
            rowHeight: (opensGroup ? 2 : 1) * rowHeight,
            stickyOverlayHeight: untracked(this.state.stickyHeader) ? untracked(this.layout.stickyOverlayHeight) : 0,
            viewportHeight: untracked(this.layout.viewportHeight)
        });
        if (target !== null) {
            // scrollTop assignment instead of scrollTo(): identical instant-scroll
            // semantics in browsers, but also safe on server DOMs that implement no
            // scrolling API.
            region.scrollTop = target;
            this.updateRange();
        }
    }
    scrollToOffset(offset) {
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!region) {
            return;
        }
        region.scrollTop = Math.max(0, offset);
        this.updateRange();
    }
    registerRegionAttachmentEffect() {
        effect(() => {
            const region = this.state.tableRegionRef()?.nativeElement ?? null;
            untracked(() => this.attachScrollListener(region));
        });
    }
    registerRangeUpdateEffect() {
        effect(() => {
            // Everything that moves the window besides raw scrolling: the logical
            // extent (which tracks the row model outside remote windowing), the
            // sub-header slots, the measured geometry, and the directive options.
            this.logicalRowCount?.();
            this.state.subHeaderRowOffsets();
            this.layout.viewportHeight();
            this.layout.bodyOffset();
            this.options?.();
            untracked(() => this.updateRange());
        });
    }
    attachScrollListener(region) {
        if (region === this.observedRegion) {
            return;
        }
        this.detachScrollListener();
        this.observedRegion = region;
        if (!region) {
            return;
        }
        this.ngZone.runOutsideAngular(() => region.addEventListener('scroll', this.onScroll, { passive: true }));
    }
    detachScrollListener() {
        this.observedRegion?.removeEventListener('scroll', this.onScroll);
        this.observedRegion = null;
        if (this.scrollFrame !== null) {
            cancelAnimationFrame(this.scrollFrame);
            this.scrollFrame = null;
        }
    }
    onScroll = () => {
        if (this.scrollFrame !== null) {
            return;
        }
        this.scrollFrame = requestAnimationFrame(() => {
            this.scrollFrame = null;
            this.updateRange();
        });
    };
    updateRange() {
        const options = this.options;
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!options || !region) {
            return;
        }
        const { rowHeight, overscan } = untracked(options);
        const rowCount = this.logicalRowCount === null ? untracked(this.state.bodyRows).length : untracked(this.logicalRowCount);
        const viewportSize = untracked(this.layout.viewportHeight);
        // Unmeasured region (first paint, SSR): keep the initial mount instead of
        // collapsing the window to nothing.
        const next = viewportSize <= 0
            ? createInitialVirtualRange(rowCount)
            : computeNatTableRowWindow({
                scrollOffset: Math.max(0, region.scrollTop - untracked(this.layout.bodyOffset)),
                viewportSize,
                rowHeight,
                rowCount,
                currentRange: untracked(this.mountedRange),
                overscan,
                subHeaderOffsets: untracked(this.state.subHeaderRowOffsets)
            });
        const current = untracked(this.mountedRange);
        if (next.start !== current.start || next.end !== current.end) {
            this.mountedRange.set(next);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualScrollEngine, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualScrollEngine });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualScrollEngine, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/** Body row kinds the fixed-height contract covers, with the label used in the warning. */
const ROW_KINDS = [
    ['tr.data-row', 'data'],
    ['tr.sub-header-row', 'sub-header']
];
/** Development diagnostics for the fixed-row virtualization contract. */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- one instance is scoped to NatTableVirtualize.
class NatTableVirtualValidationService {
    elementRef = inject(ElementRef);
    state = inject(NAT_TABLE_ROW_WINDOW_HOST);
    destroyRef = inject(DestroyRef);
    regionResizeRevision = signal(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "regionResizeRevision" }] : /* istanbul ignore next */ []));
    regionResizeObserver = null;
    rowHeight = null;
    items = null;
    /** Logical rows the window spans — the remote total under remote windowing, else the row model. */
    logicalRowCount = null;
    constructor() {
        // Not development-only: an unbounded region makes the window converge on
        // every row, and it is the failure most likely to surface only in
        // production. Two property reads behind a once-per-table latch.
        this.registerBoundedRegionValidationEffect();
        // The rest are development diagnostics: production builds register nothing,
        // so the scroll hot path never pays for the render-effect wakeups or the
        // per-window DOM measurements they perform.
        if (!isDevMode()) {
            return;
        }
        afterNextRender(() => this.observeRegionSize());
        this.registerRowHeightValidationEffect();
        this.destroyRef.onDestroy(() => this.regionResizeObserver?.disconnect());
    }
    connect(rowHeight, items, logicalRowCount) {
        this.rowHeight = rowHeight;
        this.items = items;
        this.logicalRowCount = logicalRowCount;
    }
    observeRegionSize() {
        const region = this.state.tableRegionRef()?.nativeElement;
        if (!region || typeof ResizeObserver === 'undefined') {
            return;
        }
        this.regionResizeObserver = new ResizeObserver(() => this.regionResizeRevision.update((revision) => revision + 1));
        this.regionResizeObserver.observe(region);
    }
    registerBoundedRegionValidationEffect() {
        let hasWarned = false;
        afterRenderEffect({
            earlyRead: () => {
                // The logical extent, not the loaded rows: under remote windowing an
                // unbounded region converges the window on the whole remote range —
                // exactly when this warning matters most — while the loaded window can
                // sit at or below the bootstrap count (even empty) and would suppress
                // it. Before `connect`, fall back to the row model.
                const rowCount = this.logicalRowCount === null ? this.state.bodyRows().length : this.logicalRowCount();
                const region = this.state.tableRegionRef()?.nativeElement;
                this.regionResizeRevision();
                return region ? { clientHeight: region.clientHeight, rowCount, scrollHeight: region.scrollHeight } : null;
            },
            write: (measurementsSignal) => {
                const measurements = measurementsSignal();
                if (hasWarned ||
                    !measurements ||
                    measurements.clientHeight <= 0 ||
                    measurements.scrollHeight > measurements.clientHeight + 1 ||
                    measurements.rowCount <= NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT) {
                    return;
                }
                hasWarned = true;
                console.warn('[ng-advanced-table] natTableVirtualize needs a bounded region; set --nat-table-height or --nat-table-max-height.');
            }
        });
    }
    /**
     * The fixed-height contract covers every body `<tr>` the engine sizes: data
     * rows and sub-header rows alike, since both occupy one composite slot on
     * the fixed row grid.
     */
    registerRowHeightValidationEffect() {
        // Latched per row kind: one latch would report a data-row mismatch, get
        // fixed, then hide a sub-header one for the session. Only the first mounted
        // row of each kind is measured — this runs on every window move.
        const warnedKinds = new Set();
        afterRenderEffect({
            earlyRead: () => {
                const expectedHeight = this.rowHeight?.() ?? 0;
                this.items?.();
                for (const [selector, label] of ROW_KINDS) {
                    if (warnedKinds.has(label)) {
                        continue;
                    }
                    const actualHeight = this.elementRef.nativeElement.querySelector(selector)?.getBoundingClientRect().height ?? 0;
                    if (actualHeight > 0 && Math.abs(actualHeight - expectedHeight) > 1) {
                        return { label, actualHeight, expectedHeight };
                    }
                }
                return null;
            },
            write: (mismatchSignal) => {
                const mismatch = mismatchSignal();
                if (!mismatch || warnedKinds.has(mismatch.label)) {
                    return;
                }
                warnedKinds.add(mismatch.label);
                console.warn(`[ng-advanced-table] natTableVirtualize expected ${mismatch.expectedHeight}px rows but measured ` +
                    `${mismatch.actualHeight}px on a ${mismatch.label} row.`);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualValidationService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualValidationService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualValidationService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/* eslint-disable max-lines -- directive shell: input normalization, strategy/controller/engine wiring, reset semantics, and development diagnostics for both fixed-row and remote windowing live behind the one selector; the reactive graph they share does not split without cross-service signal plumbing. */
class NatTableVirtualize {
    natTableVirtualize = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "natTableVirtualize" }] : /* istanbul ignore next */ []));
    /**
     * Remote windowing: total logical rows of the dataset the table represents
     * without holding it. The scroll extent, `aria-rowcount`, and
     * `(virtualRangeChange)` indexes take this total, and every logical index
     * outside the loaded window renders as a placeholder row. Omitted (the
     * default), every existing behavior is unchanged and the loaded row model
     * remains the full extent.
     */
    remoteRowCount = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "remoteRowCount" }] : /* istanbul ignore next */ []));
    /**
     * Remote windowing: logical index of the first `data` row — the one
     * contiguous loaded window's start. Ignored while `remoteRowCount` is unset.
     * Defaults to `0`.
     */
    rowWindowOffset = input(0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowWindowOffset" }] : /* istanbul ignore next */ []));
    /** Emits the mounted row window whenever it moves. See `NatTableVirtualRangeChange`. */
    virtualRangeChange = output();
    state = inject(NAT_TABLE_ROW_WINDOW_HOST);
    natTableService = inject(NatTableService);
    registry = inject(NatTableRowRenderStrategyRegistry);
    engine = inject(NatTableVirtualScrollEngine);
    focus = inject(NatTableVirtualFocusService);
    validation = inject(NatTableVirtualValidationService);
    destroyRef = inject(DestroyRef);
    normalizedOptions = computed(() => normalizeNatTableVirtualizationOptions(this.natTableVirtualize()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "normalizedOptions" }] : /* istanbul ignore next */ []));
    rowHeight = computed(() => this.normalizedOptions().rowHeight, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowHeight" }] : /* istanbul ignore next */ []));
    /**
     * Usable remote total or `null`. Kept free of any row-model read because it
     * feeds core through the strategy contract, where core consumes it while
     * building the TanStack options; see `normalizeNatTableRemoteRowCount`.
     */
    normalizedRemoteRowCount = computed(() => normalizeNatTableRemoteRowCount(this.remoteRowCount()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "normalizedRemoteRowCount" }] : /* istanbul ignore next */ []));
    /** Logical rows the window spans: the remote total under remote windowing, else the row model. */
    logicalRowCount = computed(() => {
        const loadedRowCount = this.state.bodyRows().length;
        const remoteRowCount = this.normalizedRemoteRowCount();
        return remoteRowCount === null ? loadedRowCount : Math.max(remoteRowCount, loadedRowCount);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "logicalRowCount" }] : /* istanbul ignore next */ []));
    /** Logical index of the first loaded row, clamped into the remote extent; `0` outside remote windowing. */
    normalizedRowWindowOffset = computed(() => normalizeNatTableRowWindowOffset(this.rowWindowOffset(), this.normalizedRemoteRowCount(), this.state.bodyRows().length), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "normalizedRowWindowOffset" }] : /* istanbul ignore next */ []));
    /**
     * The engine's contiguous window plus the focused row, kept mounted while it
     * scrolls out of range so roving grid focus never lands on a removed cell.
     */
    virtualItems = computed(() => {
        const rowCount = this.logicalRowCount();
        const mountedIndexes = rangeToRowIndexes(this.engine.range(), rowCount);
        return createVirtualItems(includeVirtualIndex(mountedIndexes, this.focus.focusedLogicalIndex(), rowCount), this.rowHeight(), this.state.subHeaderRowOffsets());
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "virtualItems" }] : /* istanbul ignore next */ []));
    /**
     * Every rendered fixed-height row: the logical data rows plus one row per
     * sub-header group. Under remote windowing core disables sub-headers, so the
     * offsets are empty and the extent is exactly one slot per logical row.
     */
    totalSize = computed(() => (this.logicalRowCount() + (this.state.subHeaderRowOffsets().at(-1) ?? 0)) * this.rowHeight(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "totalSize" }] : /* istanbul ignore next */ []));
    controller = {
        items: this.virtualItems,
        rowHeight: this.rowHeight,
        rowCount: this.logicalRowCount,
        rowWindowOffset: this.normalizedRowWindowOffset,
        measure: () => this.engine.measure(),
        scrollToIndex: (index, options) => this.engine.scrollToIndex(index, options?.align ?? 'auto'),
        scrollToOffset: (offset) => this.engine.scrollToOffset(offset)
    };
    strategy = {
        items: this.virtualItems,
        totalSize: this.totalSize,
        rowHeight: this.rowHeight,
        logicalRowCount: this.normalizedRemoteRowCount,
        rowWindowOffset: this.normalizedRowWindowOffset
    };
    constructor() {
        const unregister = this.registry.register(this.strategy);
        this.engine.connect(this.normalizedOptions, this.logicalRowCount);
        this.focus.connect(this.controller);
        this.validation.connect(this.rowHeight, this.virtualItems, this.logicalRowCount);
        this.destroyRef.onDestroy(unregister);
        this.registerOptionValidationEffect();
        this.registerRowModelResetEffect();
        this.registerRangeChangeEffect();
    }
    /**
     * The contiguous mounted window: the engine range, not `virtualItems`, whose
     * retained focused row can sit far outside it and misreport the position.
     */
    mountedRange = computed(() => {
        const indexes = rangeToRowIndexes(this.engine.range(), this.logicalRowCount());
        return { startIndex: indexes.at(0) ?? 0, endIndex: indexes.at(-1) ?? -1, count: indexes.length };
    }, { ...(ngDevMode ? { debugName: "mountedRange" } : /* istanbul ignore next */ {}), equal: (previous, current) => previous.startIndex === current.startIndex && previous.endIndex === current.endIndex && previous.count === current.count });
    registerRangeChangeEffect() {
        effect(() => {
            const range = this.mountedRange();
            untracked(() => this.virtualRangeChange.emit(range));
        });
    }
    /**
     * The four state slices whose changes rebuild the row model. The custom
     * equality collapses unrelated state traffic (per-frame columnSizing updates
     * during a drag-resize, selection toggles, visibility changes) so the reset
     * effect below never re-runs, and never re-measures, for them.
     */
    rowModelState = computed(() => {
        const { sorting, globalFilter, columnFilters, pagination } = this.state.mergedState();
        return { sorting, globalFilter, columnFilters, pagination };
    }, { ...(ngDevMode ? { debugName: "rowModelState" } : /* istanbul ignore next */ {}), equal: (previous, current) => !hasNatTableStateValueChanged(previous, current) });
    /** Row-id sequence of the current row model, compared position by position by the append test below. */
    rowIdSequence = computed(() => this.state.bodyRows().map((row) => row.id), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowIdSequence" }] : /* istanbul ignore next */ []));
    registerRowModelResetEffect() {
        let previous = null;
        effect(() => {
            // Tracked so any data replacement re-measures, but deliberately not part
            // of the reset condition: live-polling consumers replace the array with
            // identical row ids every cycle, and yanking an unfocused reader back to
            // the top on each poll would make virtualized live data unusable.
            this.state.data();
            const bodyState = this.state.bodyState();
            const rowIdSequence = this.rowIdSequence();
            const rowModelState = this.rowModelState();
            const remoteRowCount = this.normalizedRemoteRowCount();
            // Tracked so a rowHeight change re-measures the mounted rows. The window
            // offset is tracked the same way: a window fill re-measures and remaps
            // without resetting.
            this.rowHeight();
            this.normalizedRowWindowOffset();
            // Reference comparison suffices for rowModelState: the computed's custom
            // equality keeps the previous object whenever the slices are value-equal.
            //
            // A pure append is not a reset: an unchanged prefix means every row the
            // reader is looking at is still where it was, so "load more" fetching
            // keeps its scroll position.
            //
            // Under remote windowing the row-id sequence is exempt entirely: swapping
            // the loaded window is the normal fill after the reader deliberately
            // scrolled somewhere, so only genuine model changes — sorting, filters,
            // pagination, a body-state transition, or a changed remote total — reset.
            const shouldReset = previous !== null &&
                (previous.bodyState !== bodyState ||
                    previous.rowModelState !== rowModelState ||
                    previous.remoteRowCount !== remoteRowCount ||
                    (remoteRowCount === null && !isAppendedRowSequence(previous.rowIdSequence, rowIdSequence)));
            previous = { bodyState, rowIdSequence, rowModelState, remoteRowCount };
            untracked(() => {
                const focusTargetIndex = shouldReset ? this.focus.prepareRowModelReset() : null;
                this.controller.measure();
                if (shouldReset) {
                    if (focusTargetIndex === null) {
                        this.controller.scrollToOffset(0);
                    }
                    else {
                        this.controller.scrollToIndex(focusTargetIndex, { align: 'auto' });
                    }
                }
            });
        });
    }
    registerOptionValidationEffect() {
        // Diagnostics only — production builds register no effect at all.
        if (!isDevMode()) {
            return;
        }
        effect(() => {
            for (const issue of describeNatTableVirtualizationOptionIssues(this.natTableVirtualize())) {
                console.warn(`[ng-advanced-table] natTableVirtualize.${issue}`);
            }
        });
        effect(() => {
            const issues = describeNatTableRemoteWindowingIssues({
                remoteRowCount: this.remoteRowCount(),
                rowWindowOffset: this.rowWindowOffset(),
                rowHeight: this.rowHeight(),
                loadedRowCount: this.state.bodyRows().length,
                hasClientSorting: !this.natTableService.manualSorting() && this.hasClientSortingInput(),
                hasClientFiltering: !this.natTableService.manualFiltering() && this.hasClientFilteringInput(),
                hasClientPagination: !this.natTableService.manualPagination() && this.natTableService.hasPagination(),
                hasSubHeaders: this.hasSubHeaderConfiguration()
            });
            for (const issue of issues) {
                console.warn(`[ng-advanced-table] ${issue}`);
            }
        });
    }
    /** Whether anything can client-sort the row model: the sort UI enabler, or an active sorting state. */
    hasClientSortingInput() {
        return this.natTableService.enableSorting() || this.state.mergedState().sorting.length > 0;
    }
    /** Whether anything can client-filter the row model: a registered search control, or active filter state. */
    hasClientFilteringInput() {
        const { globalFilter, columnFilters } = this.state.mergedState();
        return this.natTableService.hasSearch() || globalFilter.trim() !== '' || columnFilters.length > 0;
    }
    /**
     * Whether a sub-header column is configured, read from the table meta: core
     * disables the groups themselves under remote windowing, so the rendered
     * offsets cannot reveal the configuration.
     */
    hasSubHeaderConfiguration() {
        const meta = this.natTableService.controller()?.table.options.meta;
        return typeof meta?.natTableSubHeaderColumnId === 'string';
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualize, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.1.1", type: NatTableVirtualize, isStandalone: true, selector: "nat-table[natTableVirtualize]", inputs: { natTableVirtualize: { classPropertyName: "natTableVirtualize", publicName: "natTableVirtualize", isSignal: true, isRequired: true, transformFunction: null }, remoteRowCount: { classPropertyName: "remoteRowCount", publicName: "remoteRowCount", isSignal: true, isRequired: false, transformFunction: null }, rowWindowOffset: { classPropertyName: "rowWindowOffset", publicName: "rowWindowOffset", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { virtualRangeChange: "virtualRangeChange" }, host: { properties: { "style.--sys-nat-table-virtual-row-height.px": "rowHeight()" } }, providers: [
            NatTableVirtualFocusService,
            NatTableVirtualLayoutService,
            NatTableVirtualScrollEngine,
            NatTableVirtualValidationService
        ], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatTableVirtualize, decorators: [{
            type: Directive,
            args: [{
                    selector: 'nat-table[natTableVirtualize]',
                    providers: [
                        NatTableVirtualFocusService,
                        NatTableVirtualLayoutService,
                        NatTableVirtualScrollEngine,
                        NatTableVirtualValidationService
                    ],
                    host: {
                        '[style.--sys-nat-table-virtual-row-height.px]': 'rowHeight()'
                    }
                }]
        }], ctorParameters: () => [], propDecorators: { natTableVirtualize: [{ type: i0.Input, args: [{ isSignal: true, alias: "natTableVirtualize", required: true }] }], remoteRowCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "remoteRowCount", required: false }] }], rowWindowOffset: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowWindowOffset", required: false }] }], virtualRangeChange: [{ type: i0.Output, args: ["virtualRangeChange"] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { NatTableVirtualize };
//# sourceMappingURL=ng-advanced-table-virtualization.mjs.map
