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
 * reachable from consumer code — and both fail invisibly. Rejected geometry
 * mounts every row (a frozen page on a large dataset), and dropped items leave
 * a table that looks structurally correct, spacers and scrollbar included,
 * with rows simply missing. Neither is diagnosable without a signal, so warn
 * once per message and stay silent on the hot path afterwards.
 */
const warnedDiagnostics = new Set<string>();

const warnOnce = (message: string): void => {
  if (!isDevMode() || warnedDiagnostics.has(message)) {
    return;
  }

  warnedDiagnostics.add(message);
  console.warn(`[ng-advanced-table] ${message}`);
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
      `A row-render strategy reported unusable global metrics (rowHeight: ${rowHeight}, totalSize: ${totalSize}, rows: ${rows.length}); ` +
        'totalSize must be at least rows.length * rowHeight. Falling back to rendering every row.'
    );

    return renderAllRows(rows);
  }

  const supplied = strategy.items();
  const items = supplied
    .filter((item) => isUsableVirtualItem(item, rows.length, totalSize))
    .sort((left, right) => left.index - right.index);

  if (items.length < supplied.length) {
    warnOnce(
      `A row-render strategy supplied ${supplied.length - items.length} unusable virtual item(s) out of ${supplied.length}; ` +
        'each index must be a unique integer within the row count, and each extent finite, increasing, and within totalSize. ' +
        'They were discarded, so those rows are not rendered.'
    );
  }

  if (rows.length > 0 && items.length === 0) {
    warnOnce('A row-render strategy supplied no usable virtual items for a non-empty row model. Falling back to rendering every row.');

    return renderAllRows(rows);
  }

  const renderedRows: { row: Row<TData>; logicalIndex: number; beforeSize: number }[] = [];
  let previousEnd = 0;
  let previousIndex = -1;

  for (const item of items) {
    if (item.index === previousIndex || item.start < previousEnd) {
      warnOnce(
        `A row-render strategy supplied a duplicate or overlapping virtual item (index ${item.index}, start ${item.start}); ` +
          'indices must be unique and extents strictly increasing. It was discarded, so that row is not rendered.'
      );

      continue;
    }

    previousIndex = item.index;
    renderedRows.push({ row: rows[item.index], logicalIndex: item.index, beforeSize: Math.max(0, item.start - previousEnd) });
    previousEnd = Math.max(previousEnd, item.end);
  }

  return { rows: renderedRows, afterSize: Math.max(0, totalSize - previousEnd) };
};
