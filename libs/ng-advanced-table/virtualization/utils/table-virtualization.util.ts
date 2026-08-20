import type { NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualRange, NatTableVirtualizationOptions } from '../common/table-virtualization.type';

/** Default `overscan`: rows mounted beyond each visible edge of the viewport. */
export const NAT_TABLE_DEFAULT_OVERSCAN = 5;

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
export const isAppendedRowSequence = (previous: readonly string[], current: readonly string[]): boolean =>
  current.length >= previous.length &&
  (previous.length > 0 || current.length === 0) &&
  previous.every((rowId, index) => current[index] === rowId);

export const NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT = 10;

/**
 * Substituted for an unusable row height. A plausible height rather than `1`,
 * which would both hide every row and mount roughly `viewportHeight` of them.
 */
export const NAT_TABLE_FALLBACK_ROW_HEIGHT = 40;

/**
 * Clamps the consumer options to usable values: a non-positive or non-finite
 * row height falls back to `NAT_TABLE_FALLBACK_ROW_HEIGHT`, a negative or
 * non-finite overscan falls back to the default, and a fractional overscan is
 * floored (the directive warns for the invalid shapes in development builds).
 */
export const normalizeNatTableVirtualizationOptions = (
  options: NatTableVirtualizationOptions
): Required<NatTableVirtualizationOptions> => ({
  rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : NAT_TABLE_FALLBACK_ROW_HEIGHT,
  overscan:
    typeof options.overscan === 'number' && Number.isFinite(options.overscan) && options.overscan >= 0
      ? Math.floor(options.overscan)
      : NAT_TABLE_DEFAULT_OVERSCAN
});

/**
 * Development diagnostics for the raw options, one per issue. Each names the
 * value received: the usual cause is an unresolved signal, and `0`, `NaN`, and
 * `undefined` need different fixes.
 */
export const describeNatTableVirtualizationOptionIssues = (options: NatTableVirtualizationOptions): string[] => {
  const issues: string[] = [];

  if (!Number.isFinite(options.rowHeight) || options.rowHeight <= 0) {
    issues.push(
      `rowHeight must be a finite number above zero; got ${String(options.rowHeight)}, using ${NAT_TABLE_FALLBACK_ROW_HEIGHT}px.`
    );
  }

  if (options.overscan !== undefined && (!Number.isFinite(options.overscan) || options.overscan < 0)) {
    issues.push(
      `overscan must be a finite number at or above zero; got ${String(options.overscan)}, using ${NAT_TABLE_DEFAULT_OVERSCAN}.`
    );
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
export const normalizeNatTableRemoteRowCount = (remoteRowCount: number | undefined): number | null =>
  remoteRowCount !== undefined && Number.isInteger(remoteRowCount) && remoteRowCount >= 0 ? remoteRowCount : null;

/**
 * Window offset clamped so the loaded window fits inside the remote extent.
 * `0` outside remote windowing and for unusable values (the directive warns
 * for those in development builds).
 */
export const normalizeNatTableRowWindowOffset = (
  rowWindowOffset: number,
  remoteRowCount: number | null,
  loadedRowCount: number
): number => {
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
export const NAT_TABLE_MAX_SCROLL_EXTENT_PX = 16_000_000;

type NatTableRemoteWindowingDiagnosticsContext = {
  readonly remoteRowCount: number | undefined;
  readonly rowWindowOffset: number;
  /** Normalized fixed row height, used to project the remote total into a pixel extent. */
  readonly rowHeight: number;
  readonly loadedRowCount: number;
  readonly hasClientSorting: boolean;
  readonly hasClientFiltering: boolean;
  readonly hasClientPagination: boolean;
  readonly hasSubHeaders: boolean;
};

/**
 * Development diagnostics for the remote windowing inputs, one per issue.
 * Remote windowing decouples the scroll extent from the rows the table holds,
 * so every client-side row-model transformation over the loaded window silently
 * misrepresents the dataset — those combinations warn rather than half-work.
 */
export const describeNatTableRemoteWindowingIssues = (context: NatTableRemoteWindowingDiagnosticsContext): string[] => {
  const {
    remoteRowCount,
    rowWindowOffset,
    rowHeight,
    loadedRowCount,
    hasClientSorting,
    hasClientFiltering,
    hasClientPagination,
    hasSubHeaders
  } = context;
  const issues: string[] = [];

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
  } else if (Number.isInteger(rowWindowOffset) && rowWindowOffset >= 0 && rowWindowOffset + loadedRowCount > remote) {
    issues.push(
      `rowWindowOffset (${rowWindowOffset}) plus the ${loadedRowCount} loaded rows exceeds remoteRowCount (${remote}); clamping the window.`
    );
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

    issues.push(
      `remoteRowCount (${remote}) needs ${remote * rowHeight}px of scroll extent at rowHeight ${rowHeight}px, above the ` +
        `${NAT_TABLE_MAX_SCROLL_EXTENT_PX}px browsers can lay out — the extent is silently clamped and rows past about ` +
        `${effectiveMaxRows} become unreachable. Keep remoteRowCount at or below ${effectiveMaxRows} for this rowHeight.`
    );
  }

  return issues;
};

export const includeVirtualIndex = (indexes: readonly number[], index: number | null, count: number): number[] => {
  if (index === null || index < 0 || index >= count || indexes.includes(index)) {
    return [...indexes];
  }

  return [...indexes, index].sort((left, right) => left - right);
};

/** The mounted row indexes of a range, clamped to the logical row count. */
export const rangeToRowIndexes = (range: NatTableVirtualRange, rowCount: number): number[] => {
  const start = Math.max(0, Math.min(range.start, rowCount));
  const end = Math.max(start, Math.min(range.end, rowCount));

  return Array.from({ length: end - start }, (_, offset) => start + offset);
};

/** Whether the data row at `index` opens a sub-header group (its sub-header renders just above it). */
export const opensSubHeaderGroup = (subHeaderOffsets: readonly number[], index: number): boolean =>
  (subHeaderOffsets[index] ?? 0) > (index > 0 ? (subHeaderOffsets[index - 1] ?? 0) : 0);

/** Composite fixed-grid slot occupied by data row `index`. Strictly increasing. */
export const rowGridSlot = (subHeaderOffsets: readonly number[], index: number): number => index + (subHeaderOffsets[index] ?? 0);

/**
 * Slot where the row's mounted block begins — one above `rowGridSlot` for a
 * group opener, which travels with the sub-header above it. Strictly increasing.
 */
export const rowBlockStartSlot = (subHeaderOffsets: readonly number[], index: number): number =>
  rowGridSlot(subHeaderOffsets, index) - (opensSubHeaderGroup(subHeaderOffsets, index) ? 1 : 0);

/**
 * Materializes mounted row indexes as body-local items on the composite fixed
 * row grid. Data row `index` occupies slot `index + subHeaderOffsets[index]`;
 * when it opens a sub-header group, the item's extent grows one slot upward so
 * the mounted block (sub-header + data row) starts at the sub-header's top and
 * the spacer math stays a plain `start`/`end` walk.
 */
export const createVirtualItems = (
  indexes: readonly number[],
  rowHeight: number,
  subHeaderOffsets: readonly number[]
): NatTableVirtualItem[] =>
  indexes.map((index) => ({
    index,
    start: rowBlockStartSlot(subHeaderOffsets, index) * rowHeight,
    end: (rowGridSlot(subHeaderOffsets, index) + 1) * rowHeight
  }));

/** The window mounted before any layout measurement exists (first paint, SSR). */
export const createInitialVirtualRange = (rowCount: number): NatTableVirtualRange => ({
  start: 0,
  end: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT)
});
