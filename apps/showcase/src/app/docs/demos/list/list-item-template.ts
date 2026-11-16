import { Component, signal } from '@angular/core';

import { NatList, NatListItemLabel, NatListItemTemplate } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import type { ListDemoOrder } from './list-demo-data';
import { LIST_DEMO_COLUMNS, LIST_DEMO_ROWS, listDemoTotalFormatter } from './list-demo-data';
import { OrderStatusBadge } from '../../../ui/order-status-badge/order-status-badge';

/**
 * Docs demo: a projected `natListItem` template replaces the built-in fields
 * with a card laid out in the host template. The list still owns the item
 * element and row activation; `natListItemLabel` names the activator.
 */
@Component({
  selector: 'app-list-item-template',
  imports: [NatList, NatListItemLabel, NatListItemTemplate, NatTableSurface, OrderStatusBadge],
  templateUrl: './list-item-template.html',
  styleUrl: './list-item-template.css'
})
export class ListItemTemplate {
  protected readonly columns = LIST_DEMO_COLUMNS;

  protected readonly rows = signal<readonly ListDemoOrder[]>(LIST_DEMO_ROWS);
  protected readonly opened = signal<string | null>(null);

  protected readonly totalFormatter = listDemoTotalFormatter;

  protected markReady(order: ListDemoOrder): void {
    this.rows.update((rows) => rows.map((row) => (row.id === order.id ? { ...row, status: 'Ready' } : row)));
  }
}
