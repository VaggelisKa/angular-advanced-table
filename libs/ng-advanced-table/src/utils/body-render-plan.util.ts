import { isDevMode } from '@angular/core';

import type { Row, RowData } from '@tanstack/angular-table';

import type { NatTableBodyRenderPlan, NatTableRowRenderStrategy, NatTableVirtualItem } from '../common/row-render-strategy.type';

const isUsableVirtualItem = (item: NatTableVirtualItem, rowCount: number, totalSize: number): boolean =>
  Number.isInteger(item.index) &&
  item.index >= 0 &&
  item.index < rowCount &&
  Number.isFinite(item.start) &&
  item.start >= 0 &&
  Number.isFinite(item.end) &&
  item.end > item.start &&
  item.end <= totalSize;

const renderAllRows = <TData extends RowData>(rows: readonly Row<TData>[]): NatTableBodyRenderPlan<TData> => ({
  rows: rows.map((row, logicalIndex) => ({ row, logicalIndex, beforeSize: 0 })),
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
 * Body plan for the table template. No strategy — the default — renders every
 * row with no spacers. See `NatTableRowRenderStrategy` for the contract.
 */
export const buildNatTableBodyRenderPlan = <TData extends RowData>(
  rows: readonly Row<TData>[],
  strategy: NatTableRowRenderStrategy | null
): NatTableBodyRenderPlan<TData> => {
  if (!strategy) {
    return renderAllRows(rows);
  }

  const rowHeight = strategy.rowHeight();
  const totalSize = strategy.totalSize();

  if (!Number.isFinite(rowHeight) || rowHeight <= 0 || !Number.isFinite(totalSize) || totalSize < rows.length * rowHeight) {
    warnOnce(
      'metrics',
      `unusable metrics (rowHeight ${rowHeight}, totalSize ${totalSize}, rows ${rows.length}); rendering every row.`
    );

    return renderAllRows(rows);
  }

  const supplied = strategy.items();
  const items = supplied
    .filter((item) => isUsableVirtualItem(item, rows.length, totalSize))
    .sort((left, right) => left.index - right.index);

  if (rows.length > 0 && items.length === 0) {
    warnOnce('empty', 'no usable items for a non-empty row model; rendering every row.');

    return renderAllRows(rows);
  }

  const renderedRows: { row: Row<TData>; logicalIndex: number; beforeSize: number }[] = [];
  let previousEnd = 0;
  let previousIndex = -1;

  for (const item of items) {
    if (item.index === previousIndex || item.start < previousEnd) {
      continue;
    }

    previousIndex = item.index;
    renderedRows.push({ row: rows[item.index], logicalIndex: item.index, beforeSize: Math.max(0, item.start - previousEnd) });
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
