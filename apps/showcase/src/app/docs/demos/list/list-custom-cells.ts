import { CurrencyPipe } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { Component, computed, viewChild } from '@angular/core';

import type { ColumnDef, FlexRenderComponent } from 'ng-advanced-table';
import { NatList, flexRenderComponent } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { LIST_DEMO_ROWS } from './list-demo-data';
import type { ListDemoOrder } from './list-demo-data';
import { OrderStatusBadge } from '../../../ui/order-status-badge/order-status-badge';

/**
 * Docs demo: three cell flavors in one list — plain text, a component via
 * `flexRenderComponent`, and an `ng-template` ref — all through the same
 * flexRender pipeline the table uses.
 */
@Component({
  selector: 'app-list-custom-cells',
  imports: [CurrencyPipe, NatList, NatTableSurface],
  templateUrl: './list-custom-cells.html',
  styleUrl: './list-custom-cells.css'
})
export class ListCustomCells {
  protected readonly rows = LIST_DEMO_ROWS;

  private readonly totalTemplate = viewChild<TemplateRef<unknown>>('totalTemplate');

  protected readonly columns = computed<ColumnDef<ListDemoOrder, unknown>[]>(() => [
    // 1. Text: return a string from the cell def.
    { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' }, cell: (info): string => info.getValue<string>() },

    // 2. Component: flexRenderComponent with typed inputs.
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' },
      cell: (info): FlexRenderComponent<OrderStatusBadge> =>
        flexRenderComponent(OrderStatusBadge, { inputs: { status: info.getValue<ListDemoOrder['status']>() } })
    },

    // 3. Template: return a TemplateRef; the cell context is the template's $implicit.
    {
      accessorKey: 'total',
      header: 'Total',
      meta: { label: 'Total' },
      cell: (): TemplateRef<unknown> | string => this.totalTemplate() ?? ''
    }
  ]);
}
