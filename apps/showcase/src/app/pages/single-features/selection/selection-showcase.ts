import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { CellContext, ColumnDef, RowSelectionState } from '@tanstack/angular-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, NatTableToolbar, NatToolbarItem, withNatTableSelectionColumn } from 'ng-advanced-table-ui';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Infrastructure', status: 'Active', value: 1200 },
  {
    id: 'item-3',
    name: 'Gamma Processor',
    category: 'Data Science',
    status: 'Paused',
    value: 7800,
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-selection-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableToolbar, NatToolbarItem],
  templateUrl: './selection-showcase.html',
})
export class SelectionShowcasePage {
  protected readonly data = signal<DemoItem[]>(DEMO_DATA);
  protected readonly selectionMode = signal<'single' | 'multiple'>('multiple');
  protected readonly tableState = signal<Partial<NatTableState>>({ rowSelection: {} });
  protected readonly getRowId = (row: DemoItem) => row.id;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableSelectionColumn(
    [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { label: 'Name', rowHeader: true },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        meta: { label: 'Category' },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: { label: 'Status' },
      },
      {
        accessorKey: 'value',
        header: 'Value',
        meta: { label: 'Value', align: 'end' },
        cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
      },
    ],
    {
      label: 'Selection',
      selectAllAriaLabel: 'Select all services',
      selectRowAriaLabel: (row) => `Select ${row.original.name}`,
    },
  );

  protected readonly selectedNames = computed(() => {
    const selection = this.tableState().rowSelection ?? {};

    return this.data().filter((item) => selection[item.id]).map((item) => item.name);
  });

  protected readonly selectedSummary = computed(() => {
    const names = this.selectedNames();

    return names.length ? names.join(', ') : 'None';
  });

  protected onRowSelectionChange(rowSelection: RowSelectionState): void {
    this.tableState.update((current) => ({ ...current, rowSelection }));
  }

  protected setMode(mode: 'single' | 'multiple'): void {
    // Clearing keeps the controlled state consistent with the new cardinality.
    this.selectionMode.set(mode);
    this.clearSelection();
  }

  protected clearSelection(): void {
    this.tableState.update((current) => ({ ...current, rowSelection: {} }));
  }

  protected deleteSelected(): void {
    const selectedIds = new Set(Object.keys(this.tableState().rowSelection ?? {}));

    if (selectedIds.size === 0) {
      return;
    }

    this.data.update((items) => items.filter((item) => !selectedIds.has(item.id)));
    this.tableState.update((current) => ({ ...current, rowSelection: {} }));
  }

  protected restoreData(): void {
    this.data.set(DEMO_DATA);
    this.tableState.update((current) => ({ ...current, rowSelection: {} }));
  }
}
