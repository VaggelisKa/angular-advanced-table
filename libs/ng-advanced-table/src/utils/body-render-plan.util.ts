import type { Row, RowData } from '@tanstack/angular-table';

import type { NatTableBodyRenderPlan, NatTableRowRenderStrategy, NatTableVirtualItem } from '../common/row-render-strategy.type';

const isUsableVirtualItem = (item: NatTableVirtualItem, rowCount: number): boolean =>
  Number.isInteger(item.index) &&
  item.index >= 0 &&
  item.index < rowCount &&
  Number.isFinite(item.start) &&
  item.start >= 0 &&
  Number.isFinite(item.end) &&
  item.end > item.start;

const renderAllRows = <TData extends RowData>(rows: readonly Row<TData>[]): NatTableBodyRenderPlan<TData> => ({
  rows: rows.map((row, logicalIndex) => ({ row, logicalIndex, beforeSize: 0 })),
  afterSize: 0,
  renderKey: 'all',
  rowHeight: null,
  virtualized: false
});

/**
 * Turns the logical row model plus an optional row-render strategy into the
 * body plan the table template renders. No registered strategy — the default —
 * renders every row with no spacers, so a non-virtualized table pays nothing
 * for this indirection.
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
    return renderAllRows(rows);
  }

  const items = strategy
    .items()
    .filter((item) => isUsableVirtualItem(item, rows.length))
    .sort((left, right) => left.index - right.index)
    .filter((item, index, sortedItems) => index === 0 || item.index !== sortedItems[index - 1]?.index);

  if ((rows.length > 0 && items.length === 0) || items.some((item) => item.end > totalSize)) {
    return renderAllRows(rows);
  }

  let previousEnd = 0;
  const renderedRows = items.map((item) => {
    const beforeSize = Math.max(0, item.start - previousEnd);

    previousEnd = Math.max(previousEnd, item.end);

    return {
      row: rows[item.index],
      logicalIndex: item.index,
      beforeSize
    };
  });

  return {
    rows: renderedRows,
    afterSize: Math.max(0, totalSize - previousEnd),
    renderKey: items.map((item) => `${item.index}:${item.start}:${item.end}`).join('|'),
    rowHeight,
    virtualized: true
  };
};
