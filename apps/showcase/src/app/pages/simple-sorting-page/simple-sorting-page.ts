/* eslint-disable max-lines */
import { Component } from '@angular/core';

import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

import type { MockOrderRow } from '../mock-order-data';
import { OrderCode, OrderStatusBadge } from '../mock-order-data';
import { NatRowActionsMenu } from '../table-showcase-page/nat-row-actions-menu';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const integerFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric'
});

const mockOrderRows: readonly MockOrderRow[] = [
  {
    id: 'ord-1007',
    customer: 'Northstar Supply',
    owner: 'Northstar Global Distribution Cooperative',
    channel: 'Wholesale',
    region: 'West',
    status: 'Ready',
    items: 18,
    updatedAt: Date.UTC(2026, 5, 6),
    total: 18400
  },
  {
    id: 'ord-1002',
    customer: 'Juniper Foods',
    owner: 'Juniper Foods',
    channel: 'Online',
    region: 'Midwest',
    status: 'Queued',
    items: 7,
    updatedAt: Date.UTC(2026, 5, 4),
    total: 9200
  },
  {
    id: 'ord-1011',
    customer: 'Atlas Studio',
    owner: 'Atlas Studio International Design Group',
    channel: 'Retail',
    region: 'Northeast',
    status: 'Review',
    items: 12,
    updatedAt: Date.UTC(2026, 5, 7),
    total: 12750
  },
  {
    id: 'ord-1004',
    customer: 'Harbor Retail',
    owner: 'Harbor Retail',
    channel: 'Retail',
    region: 'South',
    status: 'Ready',
    items: 24,
    updatedAt: Date.UTC(2026, 5, 5),
    total: 22100
  },
  {
    id: 'ord-1009',
    customer: 'Pioneer Labs',
    owner: 'Pioneer Labs Advanced Fulfillment Partners',
    channel: 'Online',
    region: 'West',
    status: 'Review',
    items: 15,
    updatedAt: Date.UTC(2026, 5, 8),
    total: 14600
  }
];

const mockOrderColumns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions([
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

const preconfiguredTableState: Partial<NatTableState> = {
  columnPinning: {
    left: ['owner'],
    right: ['actions']
  }
};

@Component({
  selector: 'app-simple-sorting-page',
  imports: [NatTable, NatTableSurface],
  templateUrl: './simple-sorting-page.html',
  styleUrl: './simple-sorting-page.css'
})
export class SimpleSortingPage {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly tableState = preconfiguredTableState;
}
