/* eslint-disable max-lines */
/* eslint-disable import-x/order */

import { UpperCasePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';

import type { ColumnDef } from '@tanstack/angular-table';
import { flexRenderComponent } from '@tanstack/angular-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTablePagination, NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/ui';

import { NatRowActionsMenu } from '../table-showcase-page/nat-row-actions-menu';
import type { MockOrderRow } from './pagination-sticky-alt.utils';
import { generateMockOrderRows, getMockOrderRowId } from './pagination-sticky-alt.utils';

@Component({
  selector: 'app-order-code',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      max-inline-size: 100%;
      min-height: 1.75rem;
      padding-inline: 0.62rem;
      border: 1px solid color-mix(in srgb, var(--showcase-page-text) 12%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--showcase-page-text) 4%, var(--showcase-page-surface));
      color: var(--showcase-page-text);
      font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, ui-monospace, monospace;
      font-size: 0.78rem;
      font-weight: 650;
      line-height: 1;
      letter-spacing: 0;
      overflow: hidden;
      overflow-wrap: normal;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: normal;
    }
  `,
  imports: [UpperCasePipe],
  template: `{{ code() | uppercase }}`
})
class OrderCode {
  public readonly code = input.required<string>();
}

@Component({
  selector: 'app-order-status-badge',
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
    '[attr.data-status]': 'status()'
  }
})
class OrderStatusBadge {
  public readonly status = input.required<MockOrderRow['status']>();
}

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

const mockOrderRows = generateMockOrderRows(50);

@Component({
  selector: 'app-pagination-sticky-alt',
  imports: [NatTable, NatTableSurface, NatTablePagination],
  templateUrl: './pagination-sticky-alt.html',
  styleUrl: './pagination-sticky-alt.css'
})
export class PaginationStickyAlt {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = getMockOrderRowId;

  public readonly tableState = signal<Partial<NatTableState>>({
    pagination: {
      pageIndex: 0,
      pageSize: 5
    },
    columnPinning: {
      left: ['id'],
      right: ['actions']
    }
  });
}
