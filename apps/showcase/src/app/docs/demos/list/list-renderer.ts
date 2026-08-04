import { Component, signal } from '@angular/core';

import { NatList, NatTable } from 'ng-advanced-table';
import type { ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/components';

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
  { id: 'ORD-204', customer: 'Dune Retail', status: 'Ready', total: 3095 }
];

const DEMO_COLUMNS: ColumnDef<DemoOrder, unknown>[] = [
  { accessorKey: 'id', header: 'Order', meta: { label: 'Order' } },
  { accessorKey: 'customer', header: 'Customer', meta: { label: 'Customer' } },
  { accessorKey: 'status', header: 'Status', meta: { label: 'Status' } },
  { accessorKey: 'total', header: 'Total', meta: { label: 'Total', align: 'end' } }
];

type DemoView = 'table' | 'list';

/**
 * Docs demo: one `nat-table-surface` driving either renderer. Sorting state is
 * written through the surface signal, so it survives swapping the renderer.
 */
@Component({
  selector: 'app-list-renderer',
  imports: [NatList, NatTable, NatTableSurface],
  templateUrl: './list-renderer.html',
  styleUrl: './list-renderer.css'
})
export class ListRenderer {
  protected readonly rows = DEMO_ROWS;
  protected readonly columns = DEMO_COLUMNS;

  protected readonly view = signal<DemoView>('list');
  protected readonly state = signal<Partial<NatTableUserState>>({});

  protected isSortedByTotal(): boolean {
    return (this.state().sorting ?? []).some((sort) => sort.id === 'total' && sort.desc);
  }

  protected toggleSortByTotal(): void {
    const sorting = this.isSortedByTotal() ? [] : [{ id: 'total', desc: true }];

    this.state.update((current) => ({ ...current, sorting }));
  }
}
