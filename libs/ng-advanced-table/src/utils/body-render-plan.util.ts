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
  afterSize: 0,
  renderKey: 'all'
});

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
    return renderAllRows(rows);
  }

  const items = strategy
    .items()
    .filter((item) => isUsableVirtualItem(item, rows.length, totalSize))
    .sort((left, right) => left.index - right.index);

  if (rows.length > 0 && items.length === 0) {
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

  return {
    rows: renderedRows,
    afterSize: Math.max(0, totalSize - previousEnd),
    renderKey: `${renderedRows.length}:${renderedRows[0]?.logicalIndex ?? -1}:${previousEnd}`
  };
};
