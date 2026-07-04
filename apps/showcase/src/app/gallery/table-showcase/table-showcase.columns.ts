/* eslint-disable max-lines -- single cohesive column schema for the market simulation table */
import { flexRenderComponent } from 'ng-advanced-table';
import type { ColumnDef, FilterFn } from 'ng-advanced-table';

import type { SimulationRow, SimulationStatus } from './common';
import { NatSparkline, NatTickerMark } from './ui';
import {
  compareSortKeys,
  formatCompact,
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
  formatTime,
  numberTone,
  statusTone
} from './utils';
import { NatRowActionsMenu } from '../../ui/nat-row-actions-menu/nat-row-actions-menu';

export const STATUS_FILTER_ID = 'status';

const statusFilter: FilterFn<SimulationRow> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as SimulationStatus[];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as SimulationStatus);
};

export const simulationColumns: ColumnDef<SimulationRow, unknown>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    size: 120,
    minSize: 100,
    meta: { label: 'Symbol', rowHeader: true },
    enablePinning: true,
    sortingFn: (left, right) => compareSortKeys(left.original.symbolSortKey, right.original.symbolSortKey),
    cell: (info) =>
      flexRenderComponent(NatTickerMark, {
        inputs: { symbol: info.getValue<string>() }
      })
  },
  {
    accessorKey: 'company',
    header: 'Company',
    size: 180,
    minSize: 160,
    meta: {
      label: 'Company',
      cellHeight: 72,
      cellMaxLines: 2
    },
    enablePinning: true,
    sortingFn: (left, right) => compareSortKeys(left.original.companySortKey, right.original.companySortKey),
    cell: (info) => `${info.getValue<string>()} liquidity review with multi-venue routing notes for ${info.row.original.symbol}`
  },
  {
    accessorKey: 'exchange',
    header: 'Exchange',
    size: 120,
    minSize: 100,
    meta: { label: 'Exchange' },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    size: 130,
    minSize: 100,
    meta: { label: 'Desk' },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Signal',
    size: 120,
    minSize: 100,
    meta: {
      label: 'Signal',
      cellTone: (context) => statusTone(context.getValue<SimulationStatus>())
    },
    enablePinning: true,
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'price',
    header: 'Last',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Last',
      align: 'end',
      cellTone: (context) => numberTone(context.row.original.changePercent)
    },
    enablePinning: true,
    cell: (info) => formatCurrency(info.getValue<number>())
  },
  {
    accessorKey: 'change',
    header: 'Chg $',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg $',
      align: 'end',
      cellTone: (context) => (context.row.original.status === 'Halted' ? 'warning' : numberTone(context.getValue<number>()))
    },
    enablePinning: true,
    cell: (info) => formatSignedCurrency(info.getValue<number>())
  },
  {
    accessorKey: 'changePercent',
    header: 'Chg %',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg %',
      align: 'end',
      cellTone: (context) => (context.row.original.status === 'Halted' ? 'warning' : numberTone(context.getValue<number>()))
    },
    enablePinning: true,
    cell: (info) => formatSignedPercent(info.getValue<number>())
  },
  {
    id: 'spark',
    header: 'Trend',
    size: 104,
    minSize: 90,
    meta: { label: 'Trend' },
    enableSorting: false,
    enableGlobalFilter: false,
    enablePinning: false,
    cell: (info) =>
      flexRenderComponent(NatSparkline, {
        inputs: {
          points: info.row.original.priceHistory,
          trend: info.row.original.sparkTrend
        }
      })
  },
  {
    accessorKey: 'volume',
    header: 'Volume',
    size: 130,
    minSize: 100,
    meta: { label: 'Volume', align: 'end' },
    enablePinning: true,
    cell: (info) => formatCompact(info.getValue<number>())
  },
  {
    accessorKey: 'turnoverMillions',
    header: 'Turnover',
    size: 130,
    minSize: 100,
    meta: { label: 'Turnover', align: 'end' },
    cell: (info) => `${formatCurrency(info.getValue<number>())}M`
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    size: 130,
    minSize: 100,
    meta: { label: 'Updated', align: 'end' },
    enablePinning: true,
    cell: (info) => formatTime(info.getValue<number>())
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 92,
    minSize: 84,
    meta: { label: 'Actions', align: 'end' },
    enableSorting: false,
    enableGlobalFilter: false,
    enablePinning: false,
    enableHiding: false,
    cell: (info) =>
      flexRenderComponent(NatRowActionsMenu, {
        inputs: {
          symbol: info.row.original.symbol
        }
      })
  }
];

export const showcaseAccessibilityText = {
  emptyState: 'No instruments match the current filters. Clear the search query or signal chips to repopulate the tape.'
};
