import { Component, signal } from '@angular/core';

import { NatList, NatTable, NatTableSubHeaderTemplate, flexRenderComponent } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

import { OrderStatusBadge } from '../../../ui/order-status-badge/order-status-badge';

type DemoOrder = {
  id: string;
  customer: string;
  status: 'Ready' | 'Review' | 'Queued';
  total: number;
};

const DEMO_ROWS: DemoOrder[] = [
  { id: 'ORD-201', customer: 'Aster Logistics', status: 'Ready', total: 4820 },
  { id: 'ORD-202', customer: 'Briar Supply Co', status: 'Review', total: 1260 },
  { id: 'ORD-203', customer: 'Cobalt Freight', status: 'Queued', total: 7410 },
  { id: 'ORD-204', customer: 'Dune Retail', status: 'Ready', total: 3095 },
  { id: 'ORD-205', customer: 'Ember Works', status: 'Queued', total: 980 },
  { id: 'ORD-206', customer: 'Fjord Trading', status: 'Review', total: 5150 }
];

const DEMO_COLUMNS: ColumnDef<DemoOrder, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order' } },
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status' },
    // Same status badge the list-renderer docs use — cells render through
    // flexRender in both renderers, so the component works in table and list.
    cell: (info) => flexRenderComponent(OrderStatusBadge, { inputs: { status: info.getValue<DemoOrder['status']>() } })
  },
  { accessorKey: 'total', header: 'Total', meta: { label: 'Total', align: 'end' } }
];

const STATUS_ORDER: readonly DemoOrder['status'][] = ['Ready', 'Review', 'Queued'];

type DemoView = 'table' | 'list';

/**
 * Docs demo: rows grouped under sub-header rows by status. The forced group
 * sort is hidden, so the user's "Sort by total" stays the visible sort and
 * applies within each group. Both renderers share the same inputs.
 */
@Component({
  selector: 'app-sub-header-rows',
  imports: [NatList, NatTable, NatTableSubHeaderTemplate, NatTableSurface],
  templateUrl: './sub-header-rows.html',
  styleUrl: './sub-header-rows.css'
})
export class SubHeaderRows {
  protected readonly rows = DEMO_ROWS;
  protected readonly columns = DEMO_COLUMNS;
  protected readonly statusOrder = STATUS_ORDER;

  protected readonly view = signal<DemoView>('table');
  protected readonly useStatusOrder = signal(false);
  protected readonly state = signal<Partial<NatTableUserState>>({});

  protected sortDirection(): 'asc' | 'desc' | null {
    const entry = (this.state().sorting ?? []).find((sort) => sort.id === 'total');

    if (!entry) {
      return null;
    }

    return entry.desc ? 'desc' : 'asc';
  }

  protected sortArrow(): string {
    const direction = this.sortDirection();

    if (direction === null) {
      return '↕';
    }

    return direction === 'asc' ? '↑' : '↓';
  }

  protected sortByTotalLabel(): string {
    const direction = this.sortDirection();

    if (direction === null) {
      return 'Sort by total, not sorted';
    }

    return direction === 'asc' ? 'Sort by total, sorted ascending' : 'Sort by total, sorted descending';
  }

  /** Cycle: not sorted → descending → ascending → not sorted. */
  protected cycleSortByTotal(): void {
    const direction = this.sortDirection();
    let sorting: NatTableUserState['sorting'] = [];

    if (direction === null) {
      sorting = [{ id: 'total', desc: true }];
    } else if (direction === 'desc') {
      sorting = [{ id: 'total', desc: false }];
    }

    this.state.update((current) => ({ ...current, sorting }));
  }
}
