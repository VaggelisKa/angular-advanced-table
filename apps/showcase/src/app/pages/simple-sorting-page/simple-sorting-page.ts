import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { flexRenderComponent, type ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import { withNatTableHeaderActions } from 'ng-advanced-table-ui';

import { NatRowActionsMenu } from '../table-showcase-page/nat-row-actions-menu';

interface MockOrderRow {
  id: string;
  customer: string;
  owner: string;
  channel: 'Online' | 'Retail' | 'Wholesale';
  region: string;
  status: 'Ready' | 'Review' | 'Queued';
  items: number;
  updatedAt: number;
  total: number;
}

@Component({
  selector: 'app-order-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      min-height: 1.75rem;
      padding-inline: 0.62rem;
      border: 1px solid color-mix(in srgb, var(--showcase-page-text) 12%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--showcase-page-text) 4%, var(--showcase-page-surface));
      color: var(--showcase-page-text);
      font-family:
        'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, ui-monospace, monospace;
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1;
      letter-spacing: 0;
    }
  `,
  template: `{{ code().toUpperCase() }}`,
})
class OrderCode {
  readonly code = input.required<string>();
}

@Component({
  selector: 'app-order-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.42rem;
      min-height: 1.75rem;
      padding-inline: 0.62rem;
      border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, currentColor 9%, transparent);
      color: var(--showcase-page-text-soft);
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1;
    }

    :host::before {
      width: 0.45rem;
      height: 0.45rem;
      flex: 0 0 auto;
      border-radius: 999px;
      background: currentColor;
      content: '';
    }

    :host([data-status='Ready']) {
      color: var(--showcase-page-positive);
    }

    :host([data-status='Review']) {
      color: var(--showcase-page-warning);
    }
  `,
  template: `<span>{{ status() }}</span>`,
  host: {
    '[attr.data-status]': 'status()',
  },
})
class OrderStatusBadge {
  readonly status = input.required<MockOrderRow['status']>();
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const integerFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const mockOrderRows: readonly MockOrderRow[] = [
  {
    id: 'ord-1007',
    customer: 'Northstar Supply',
    owner: 'Mina Chen',
    channel: 'Wholesale',
    region: 'West',
    status: 'Ready',
    items: 18,
    updatedAt: Date.UTC(2026, 5, 6),
    total: 18400,
  },
  {
    id: 'ord-1002',
    customer: 'Juniper Foods',
    owner: 'Ari Patel',
    channel: 'Online',
    region: 'Midwest',
    status: 'Queued',
    items: 7,
    updatedAt: Date.UTC(2026, 5, 4),
    total: 9200,
  },
  {
    id: 'ord-1011',
    customer: 'Atlas Studio',
    owner: 'Nora Vale',
    channel: 'Retail',
    region: 'Northeast',
    status: 'Review',
    items: 12,
    updatedAt: Date.UTC(2026, 5, 7),
    total: 12750,
  },
  {
    id: 'ord-1004',
    customer: 'Harbor Retail',
    owner: 'Theo Grant',
    channel: 'Retail',
    region: 'South',
    status: 'Ready',
    items: 24,
    updatedAt: Date.UTC(2026, 5, 5),
    total: 22100,
  },
  {
    id: 'ord-1009',
    customer: 'Pioneer Labs',
    owner: 'Iris Stone',
    channel: 'Online',
    region: 'West',
    status: 'Review',
    items: 15,
    updatedAt: Date.UTC(2026, 5, 8),
    total: 14600,
  },
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
    },
    cell: (info) =>
      flexRenderComponent(OrderCode, {
        inputs: {
          code: info.getValue<string>(),
        },
      }),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    enablePinning: false,
    size: 220,
    minSize: 160,
    meta: {
      label: 'Customer',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    enablePinning: false,
    size: 150,
    minSize: 120,
    meta: {
      label: 'Owner',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'channel',
    header: 'Channel',
    enablePinning: false,
    size: 140,
    minSize: 116,
    meta: {
      label: 'Channel',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'region',
    header: 'Region',
    enablePinning: false,
    size: 140,
    minSize: 112,
    meta: {
      label: 'Region',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enablePinning: false,
    size: 132,
    minSize: 108,
    meta: {
      label: 'Status',
    },
    cell: (info) =>
      flexRenderComponent(OrderStatusBadge, {
        inputs: {
          status: info.getValue<MockOrderRow['status']>(),
        },
      }),
  },
  {
    accessorKey: 'items',
    header: 'Items',
    enablePinning: false,
    size: 104,
    minSize: 88,
    meta: {
      label: 'Items',
      align: 'end',
    },
    cell: (info) => integerFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    enablePinning: false,
    size: 128,
    minSize: 108,
    meta: {
      label: 'Updated',
    },
    cell: (info) => dateFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    enablePinning: false,
    size: 128,
    minSize: 104,
    meta: {
      label: 'Total',
      align: 'end',
    },
    cell: (info) => currencyFormatter.format(info.getValue<number>()),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enablePinning: false,
    size: 72,
    minSize: 64,
    maxSize: 72,
    meta: {
      hiddenHeaderLabel: 'Row actions',
      align: 'end',
      headerSize: 72,
    },
    cell: (info) =>
      flexRenderComponent(NatRowActionsMenu, {
        inputs: {
          symbol: info.row.original.id,
        },
      }),
  },
]);

const preconfiguredTableState: Partial<NatTableState> = {
  columnPinning: {
    left: ['owner'],
    right: ['actions'],
  },
};

@Component({
  selector: 'app-simple-sorting-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable],
  templateUrl: './simple-sorting-page.html',
  styleUrl: './simple-sorting-page.css',
})
export class SimpleSortingPage {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly tableState = preconfiguredTableState;
  protected readonly getRowId = (row: MockOrderRow) => row.id;
}
