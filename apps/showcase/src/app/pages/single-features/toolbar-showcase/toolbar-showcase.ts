import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableToolbar,
  NatToolbarGroup,
  NatToolbarItem,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

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
    value: 7800,
  },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-toolbar-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NatTable,
    NatTableSurface,
    NatTableToolbar,
    NatToolbarGroup,
    NatToolbarItem,
  ],
  templateUrl: './toolbar-showcase.html',
  styleUrl: './toolbar-showcase.css',
})
export class ToolbarShowcasePage {
  protected readonly lastAction = signal('none');

  protected readonly data = DEMO_DATA;

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

  protected readonly tableState = signal<Partial<NatTableState>>({
    sorting: [],
  });

  protected recordAction(action: string): void {
    this.lastAction.set(action);
  }

  protected onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  protected onColumnVisibilityChange(columnVisibility: VisibilityState): void {
    this.tableState.update((current) => ({ ...current, columnVisibility }));
  }
}
