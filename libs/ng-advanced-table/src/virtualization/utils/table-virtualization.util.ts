import type { Row, RowData } from '@tanstack/angular-table';

import type {
  NatTableBodyRenderPlan,
  NatTableRowRenderStrategy,
  NatTableVirtualItem,
  NatTableVirtualizationOptions
} from '../common/table-virtualization.type';

export const NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN = 6;

export const NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT = 10;

export const normalizeNatTableVirtualizationOptions = (
  options: NatTableVirtualizationOptions
): Required<NatTableVirtualizationOptions> => ({
  rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : 1,
  overscan:
    Number.isFinite(options.overscan) && (options.overscan ?? -1) >= 0
      ? Math.floor(options.overscan ?? NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN)
      : NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN
});

export const includeVirtualIndex = (indexes: readonly number[], index: number | null, count: number): number[] => {
  if (index === null || index < 0 || index >= count || indexes.includes(index)) {
    return [...indexes];
  }

  return [...indexes, index].sort((left, right) => left - right);
};

export const createInitialVirtualItems = (
  rowCount: number,
  rowHeight: number,
  overscan: number,
  bodyOffset: number
): NatTableVirtualItem[] =>
  Array.from({ length: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT + overscan) }, (_, index) => ({
    index,
    start: bodyOffset + index * rowHeight,
    end: bodyOffset + (index + 1) * rowHeight
  }));

const isUsableVirtualItem = (item: NatTableVirtualItem, rowCount: number): boolean =>
  Number.isInteger(item.index) && item.index >= 0 && item.index < rowCount && Number.isFinite(item.start) && Number.isFinite(item.end);

const renderAllRows = <TData extends RowData>(rows: readonly Row<TData>[]): NatTableBodyRenderPlan<TData> => ({
  rows: rows.map((row, logicalIndex) => ({ row, logicalIndex, beforeSize: 0 })),
  afterSize: 0,
  renderKey: 'all',
  rowHeight: null,
  virtualized: false
});

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
