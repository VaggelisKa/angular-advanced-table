import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { CellContext, ColumnDef, SortingState } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Alpha Searcher', category: 'Analytics', status: 'Active', value: 4500 },
  { id: 'item-2', name: 'Beta Runner', category: 'Security', status: 'Active', value: 1200 },
  { id: 'item-3', name: 'Gamma Processor', category: 'Analytics', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Analytics', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-multi-sort-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  templateUrl: './multi-sort-showcase.html',
})
export class MultiSortShowcasePage {
  protected readonly data = DEMO_DATA;
  protected readonly getRowId = (row: DemoItem) => row.id;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
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
  ]);

  public readonly tableState = signal<Partial<NatTableState>>({
    sorting: [],
  });

  protected readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;

    if (!sorting?.length) return 'None';

    return sorting
      .map((entry, index) => `${index + 1}. ${entry.id} (${entry.desc ? 'desc' : 'asc'})`)
      .join(', ');
  });

  protected onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  protected applyPresetSort(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [
        { id: 'category', desc: false },
        { id: 'value', desc: true },
      ],
    }));
  }

  protected clearSort(): void {
    this.tableState.update((current) => ({ ...current, sorting: [] }));
  }
}
