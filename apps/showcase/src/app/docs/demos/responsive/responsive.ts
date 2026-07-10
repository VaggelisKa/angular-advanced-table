import { Component, computed, signal } from '@angular/core';

import { NatTable } from 'ng-advanced-table';
import type { CellContext, ColumnDef, NatTableUserState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table/components';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 }
];

@Component({
  selector: 'app-responsive',
  imports: [NatTable, NatTableSurface],
  templateUrl: './responsive.html',
  styles: `
    :host {
      display: grid;
      gap: 24px;
    }
  `
})
export class Responsive {
  protected readonly data = DEMO_DATA;

  // Simulated so the pattern is demonstrable on desktop. A real app wires this to a
  // reactive viewport source instead, e.g.:
  //   isMobile = toSignal(
  //     inject(BreakpointObserver).observe('(max-width: 767px)').pipe(map((r) => r.matches)),
  //     { initialValue: false }
  //   );
  protected readonly isMobile = signal(false);

  private readonly baseColumns: ColumnDef<DemoItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`
    }
  ];

  // The opt-out is column composition: rebuild columns inside a computed() keyed on
  // the viewport signal. Sort and pin header UI drop out on mobile (resizing is
  // toggled at the surface via [enableColumnResizing]="!isMobile()") while TanStack
  // sorting itself — driven programmatically below — stays live.
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() => {
    const mobile = this.isMobile();

    return withNatTableHeaderActions(this.baseColumns, {
      enableSortActions: !mobile,
      enableColumnPinActions: !mobile
    });
  });

  protected readonly tableState = signal<Partial<NatTableUserState>>({
    sorting: [{ id: 'name', desc: false }]
  });

  protected readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;

    if (!sorting?.length) return 'None';

    const entry = sorting[0];

    return `${entry.id} (${entry.desc ? 'desc' : 'asc'})`;
  });

  protected toggleMobile(): void {
    this.isMobile.update((value) => !value);
  }

  // Proves the sort sheet path: this updates the same state slice the (now hidden)
  // header sort button would have written, so sorting keeps working on mobile.
  protected sortByValue(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [{ id: 'value', desc: true }]
    }));
  }
}
