/* eslint-disable import-x/order */

import { UpperCasePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';

import type { ColumnDef } from '@tanstack/angular-table';
import { flexRenderComponent } from '@tanstack/angular-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

import { NatRowActionsMenu } from '../table-showcase-page/nat-row-actions-menu';
import type { MockOrderRow } from './sticky-no-overflow-x.utils';
import { generateMockOrderRows, getMockOrderRowId } from './sticky-no-overflow-x.utils';

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

// @Component({
//   selector: 'app-order-status-badge',
//   styles: `
//     :host {
//       display: inline-flex;
//       align-items: center;
//       gap: 0.42rem;
//       min-height: 1.75rem;
//       padding-inline: 0.62rem;
//       border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
//       border-radius: 999px;
//       background: color-mix(in srgb, currentColor 9%, transparent);
//       color: var(--showcase-page-text-soft);
//       font-size: 0.78rem;
//       font-weight: 650;
//       line-height: 1;
//     }

//     :host::before {
//       width: 0.45rem;
//       height: 0.45rem;
//       flex: 0 0 auto;
//       border-radius: 999px;
//       background: currentColor;
//       content: '';
//     }

//     :host([data-status='Ready']) {
//       color: var(--showcase-page-positive);
//     }

//     :host([data-status='Review']) {
//       color: var(--showcase-page-warning);
//     }
//   `,
//   template: `<span>{{ status() }}</span>`,
//   host: {
//     '[attr.data-status]': 'status()'
//   }
// })
// class OrderStatusBadge {
//   public readonly status = input.required<MockOrderRow['status']>();
// }

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
    id: 'actions',
    header: 'Actions',
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
  selector: 'app-sticky-no-overflow-x',
  imports: [NatTable, NatTableSurface],
  templateUrl: './sticky-no-overflow-x.html',
  styleUrl: './sticky-no-overflow-x.css'
})
export class StickyNoOverflowX {
  protected readonly rows = mockOrderRows;
  protected readonly columns = mockOrderColumns;
  protected readonly getRowId = getMockOrderRowId;

  public readonly tableState = signal<Partial<NatTableState>>({});
}
