import type { Row, RowData } from '@tanstack/angular-table';

import type { NatTableBodyRenderPlan, NatTableRowRenderStrategy, NatTableVirtualItem } from '../common/row-render-strategy.type';

const isUsableVirtualItem = (item: NatTableVirtualItem, rowCount: number): boolean =>
  Number.isInteger(item.index) && item.index >= 0 && item.index < rowCount && Number.isFinite(item.start) && Number.isFinite(item.end);

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

  const items = strategy
    .items()
    .filter((item) => isUsableVirtualItem(item, rows.length))
    .sort((left, right) => left.index - right.index);

  if (rows.length > 0 && items.length === 0) {
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
    afterSize: Math.max(0, strategy.totalSize() - previousEnd),
    renderKey: items.map((item) => `${item.index}:${item.start}:${item.end}`).join('|'),
    rowHeight: strategy.rowHeight(),
    virtualized: true
  };
};
