import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef } from '@tanstack/angular-table';
import { withNatTableHeaderActions } from 'ng-advanced-table/components';

import type { MockOrderRow } from '../../common';
import { currencyFormatter, dateFormatter, integerFormatter } from '../../utils';
import { NatRowActionsMenu } from '../nat-row-actions-menu/nat-row-actions-menu';
import { OrderCode } from '../order-code/order-code';
import { OrderStatusBadge } from '../order-status-badge/order-status-badge';

export const mockOrderColumns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions([
  {
    accessorKey: 'id',
    header: 'Order',
    enablePinning: false,
    size: 132,
    minSize: 112,
    meta: {
      label: 'Order',
      rowHeader: true,
      cellMaxLines: Infinity
    },
    cell: (info) =>
      flexRenderComponent(OrderCode, {
        inputs: {
          code: info.getValue<string>()
        }
      })
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    enablePinning: false,
    size: 220,
    minSize: 160,
    meta: {
      label: 'Customer'
    },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'owner',
    header: 'Company',
    enablePinning: false,
    size: 230,
    minSize: 190,
    meta: {
      label: 'Company',
      cellHeight: 72
    },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    enablePinning: false,
    size: 140,
    minSize: 116,
    meta: {
      label: 'Channel'
    },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'region',
    header: 'Region',
    enablePinning: false,
    size: 140,
    minSize: 112,
    meta: {
      label: 'Region'
    },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enablePinning: false,
    size: 132,
    minSize: 108,
    meta: {
      label: 'Status'
    },
    cell: (info) =>
      flexRenderComponent(OrderStatusBadge, {
        inputs: {
          status: info.getValue<MockOrderRow['status']>()
        }
      })
  },
  {
    accessorKey: 'items',
    header: 'Items',
    enablePinning: false,
    size: 104,
    minSize: 88,
    meta: {
      label: 'Items',
      align: 'end'
    },
    cell: (info) => integerFormatter.format(info.getValue<number>())
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    enablePinning: false,
    size: 128,
    minSize: 108,
    meta: {
      label: 'Updated'
    },
    cell: (info) => dateFormatter.format(info.getValue<number>())
  },
  {
    accessorKey: 'total',
    header: 'Total',
    enablePinning: false,
    size: 128,
    minSize: 104,
    meta: {
      label: 'Total',
      align: 'end'
    },
    cell: (info) => currencyFormatter.format(info.getValue<number>())
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enablePinning: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
    meta: {
      hiddenHeaderLabel: 'Row actions',
      align: 'end',
      headerSize: 50
    },
    cell: (info) =>
      flexRenderComponent(NatRowActionsMenu, {
        inputs: {
          symbol: info.row.original.id
        }
      })
  }
]);
