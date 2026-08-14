import { isDevMode } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

import type {
  NatTableBodyRenderPlan,
  NatTableRenderedBodyRow,
  NatTableRowRenderStrategy,
  NatTableVirtualItem
} from '../common/row-render-strategy.type';

const isUsableVirtualItem = (item: NatTableVirtualItem, rowCount: number, totalSize: number): boolean =>
  Number.isInteger(item.index) &&
  item.index >= 0 &&
  item.index < rowCount &&
  Number.isFinite(item.start) &&
  item.start >= 0 &&
  Number.isFinite(item.end) &&
  item.end > item.start &&
  item.end <= totalSize;

const renderAllRows = <TData extends RowData>(rows: readonly Row<TData>[], windowOffset: number): NatTableBodyRenderPlan<TData> => ({
  rows: rows.map((row, index) => ({ kind: 'row', row, logicalIndex: windowOffset + index, beforeSize: 0 })),
  afterSize: 0
});

/**
 * `NatTableRowRenderStrategy` is a public SPI, so these rejections are
 * reachable from consumer code — and both fail invisibly. Rejected metrics
 * mount every row (a frozen page on a large dataset), and discarded items
 * leave a table that looks structurally correct, spacers and scrollbar
 * included, with rows simply missing.
 *
 * Keyed by a short tag rather than the message so a per-call count can vary
 * without re-warning, and kept terse: the strings ship to production even
 * though `isDevMode()` stops them printing there.
 */
const warned = new Set<string>();

const warnOnce = (tag: string, message: string): void => {
  if (!isDevMode() || warned.has(tag)) {
    return;
  }

  warned.add(tag);
  console.warn(`[ng-advanced-table] Row-render strategy: ${message}`);
};

/**
 * Remote windowing extent supplied by the strategy, normalized so the loaded
 * rows always fit inside it: the logical count is clamped up to the loaded row
 * count, and the window offset is clamped into `[0, count - loaded]`. `null`
 * when the strategy declares no remote extent — the loaded rows are the extent.
 */
const resolveLogicalExtent = (
  strategy: NatTableRowRenderStrategy,
  loadedRowCount: number
): { readonly rowCount: number; readonly windowOffset: number } | null => {
  const logicalRowCount = strategy.logicalRowCount?.() ?? null;

  if (logicalRowCount === null) {
    return null;
  }

  if (!Number.isInteger(logicalRowCount) || logicalRowCount < 0) {
    warnOnce('logical-count', `unusable logicalRowCount ${logicalRowCount}; treating the loaded rows as the full extent.`);

    return null;
  }

  const rowCount = Math.max(logicalRowCount, loadedRowCount);
  const suppliedOffset = strategy.rowWindowOffset?.() ?? 0;
  const windowOffset = Number.isInteger(suppliedOffset) ? Math.min(Math.max(suppliedOffset, 0), rowCount - loadedRowCount) : 0;

  if (windowOffset !== suppliedOffset) {
    warnOnce('window-offset', `rowWindowOffset ${suppliedOffset} does not fit the logical extent; clamping to ${windowOffset}.`);
  }

  return { rowCount, windowOffset };
};

/**
 * Body plan for the table template. No strategy — the default — renders every
 * row with no spacers. A strategy declaring a remote `logicalRowCount` renders
 * a placeholder entry for every mounted logical index outside the loaded
 * window. See `NatTableRowRenderStrategy` for the contract.
 */
export const buildNatTableBodyRenderPlan = <TData extends RowData>(
  rows: readonly Row<TData>[],
  strategy: NatTableRowRenderStrategy | null
): NatTableBodyRenderPlan<TData> => {
  if (!strategy) {
    return renderAllRows(rows, 0);
  }

  const extent = resolveLogicalExtent(strategy, rows.length);
  const rowCount = extent?.rowCount ?? rows.length;
  const windowOffset = extent?.windowOffset ?? 0;
  const rowHeight = strategy.rowHeight();
  const totalSize = strategy.totalSize();

  if (!Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(totalSize) || totalSize < rowCount * rowHeight) {
    warnOnce(
      'metrics',
      `unusable metrics (rowHeight ${rowHeight}, totalSize ${totalSize}, rows ${rowCount}); rendering every loaded row.`
    );

    return renderAllRows(rows, windowOffset);
  }

  const supplied = strategy.items();
  const items = supplied
    .filter((item) => isUsableVirtualItem(item, rowCount, totalSize))
    .sort((left, right) => left.index - right.index);

  if (rowCount > 0 && items.length === 0) {
    warnOnce('empty', 'no usable items for a non-empty row model; rendering every loaded row.');

    return renderAllRows(rows, windowOffset);
  }

  const renderedRows: NatTableRenderedBodyRow<TData>[] = [];
  let previousEnd = 0;
  let previousIndex = -1;

  for (const item of items) {
    if (item.index === previousIndex || item.start < previousEnd) {
      continue;
    }

    const loadedIndex = item.index - windowOffset;
    const row = loadedIndex >= 0 && loadedIndex < rows.length ? rows[loadedIndex] : undefined;
    const beforeSize = Math.max(0, item.start - previousEnd);

    previousIndex = item.index;
    renderedRows.push(
      row === undefined
        ? { kind: 'placeholder', logicalIndex: item.index, beforeSize }
        : { kind: 'row', row, logicalIndex: item.index, beforeSize }
    );
    previousEnd = Math.max(previousEnd, item.end);
  }

  if (renderedRows.length < supplied.length) {
    // Covers both rejection paths: unusable shape, and duplicate/overlapping
    // extents dropped by the walk above.
    warnOnce(
      'items',
      `${supplied.length - renderedRows.length} of ${supplied.length} items discarded; indices must be unique in-range integers and extents finite and increasing.`
    );
  }

  return { rows: renderedRows, afterSize: Math.max(0, totalSize - previousEnd) };
};
