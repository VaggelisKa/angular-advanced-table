import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { flexRenderComponent, type ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

import { ShowcaseThemeStore } from '../../showcase-theme';

interface MockOrderRow {
  id: string;
  customer: string;
  region: string;
  status: 'Ready' | 'Review' | 'Queued';
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
      border: 1px solid color-mix(in srgb, var(--page-text) 12%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--page-text) 4%, var(--page-surface));
      color: var(--page-text);
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
      color: var(--page-text-soft);
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
      color: var(--page-positive);
    }

    :host([data-status='Review']) {
      color: var(--page-warning);
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

const mockOrderRows: readonly MockOrderRow[] = [
  {
    id: 'ord-1007',
    customer: 'Northstar Supply',
    region: 'West',
    status: 'Ready',
    total: 18400,
  },
  {
    id: 'ord-1002',
    customer: 'Juniper Foods',
    region: 'Midwest',
    status: 'Queued',
    total: 9200,
  },
  {
    id: 'ord-1011',
    customer: 'Atlas Studio',
    region: 'Northeast',
    status: 'Review',
    total: 12750,
  },
  {
    id: 'ord-1004',
    customer: 'Harbor Retail',
    region: 'South',
    status: 'Ready',
    total: 22100,
  },
  {
    id: 'ord-1009',
    customer: 'Pioneer Labs',
    region: 'West',
    status: 'Review',
    total: 14600,
  },
];

const mockOrderColumns: ColumnDef<MockOrderRow, unknown>[] = withNatTableHeaderActions([
  {
    accessorKey: 'id',
    header: 'Order',
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
    size: 220,
    minSize: 160,
    meta: {
      label: 'Customer',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'region',
    header: 'Region',
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
    accessorKey: 'total',
    header: 'Total',
    size: 128,
    minSize: 104,
    meta: {
      label: 'Total',
      align: 'end',
    },
    cell: (info) => currencyFormatter.format(info.getValue<number>()),
  },
]);

@Component({
  selector: 'app-simple-sorting-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  templateUrl: './simple-sorting-page.html',
  styleUrl: './simple-sorting-page.css',
})
export class SimpleSortingPage {
  private readonly themeStore = inject(ShowcaseThemeStore);

  protected readonly theme = this.themeStore.theme;
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = (row: MockOrderRow) => row.id;
}
