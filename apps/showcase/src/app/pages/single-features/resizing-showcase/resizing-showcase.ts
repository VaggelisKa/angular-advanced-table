import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

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
  selector: 'app-resizing-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  templateUrl: './resizing-showcase.html',
})
export class ResizingShowcasePage {
  protected readonly data = DEMO_DATA;

  protected readonly columns: ColumnDef<DemoItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 200,
      minSize: 120,
      maxSize: 320,
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 160,
      minSize: 100,
      maxSize: 260,
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      minSize: 90,
      maxSize: 200,
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      size: 140,
      minSize: 100,
      maxSize: 240,
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, unknown>) =>
        `$${(context.getValue() as number).toLocaleString()}`,
    },
  ];

  protected readonly tableState = signal<Partial<NatTableState>>({
    columnSizing: {},
  });

  protected resetWidths(): void {
    this.tableState.update((current) => ({ ...current, columnSizing: {} }));
  }
}
