import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { CellContext, ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table/ui';

type DemoItem = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly status: string;
  readonly value: number;
};

type ColumnToggle = {
  readonly id: string;
  readonly label: string;
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
  selector: 'app-resizing-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  templateUrl: './resizing-showcase.html',
  styleUrl: './resizing-showcase.css'
})
export class ResizingShowcasePage {
  protected readonly data = DEMO_DATA;

  // Base definitions never set enableResizing: resizing is opt-in per column, driven
  // by the toggle list below — not switched on for the whole table.
  private readonly baseColumns: ColumnDef<DemoItem, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      meta: { label: 'Name', rowHeader: true }
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      meta: { label: 'Category' }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      meta: { label: 'Status' }
    },
    {
      id: 'value',
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, unknown>) => `$${context.getValue<number>().toLocaleString()}`
    }
  ];

  protected readonly columnToggles: readonly ColumnToggle[] = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'status', label: 'Status' },
    { id: 'value', label: 'Value' }
  ];

  // Which columns expose a resize handle. Starts as a subset so the "some columns
  // resize, some don't" per-column behaviour is visible immediately. Mutated at
  // runtime as the user toggles columns, so a Set (not a static Record) fits.
  protected readonly resizableColumnIds = signal<ReadonlySet<string>>(new Set(['name', 'category', 'status']));

  // enableResizing is derived per column from the toggle set, never set table-wide.
  protected readonly columns = computed<ColumnDef<DemoItem, unknown>[]>(() => {
    const resizable = this.resizableColumnIds();

    return this.baseColumns.map((column) => ({
      ...column,
      enableResizing: resizable.has(column.id as string)
    }));
  });

  protected readonly tableState = signal<Partial<NatTableState>>({
    columnSizing: {}
  });

  // Both modes resize pixel-exact. Fill reflows the other columns so the table stays
  // filled; fixed keeps widths authoritative and scrolls the region. Default to fill
  // (the library default) to demonstrate the reflow behaviour.
  protected readonly columnSizingMode = signal<'fill' | 'fixed'>('fill');

  // Reset only the width slice — spread the rest so any other controlled state
  // (sorting/filtering/etc.) survives. The button label promises widths only.
  protected resetWidths(): void {
    this.tableState.update((state) => ({ ...state, columnSizing: {} }));
  }

  protected toggleResizable(id: string, enabled: boolean): void {
    this.resizableColumnIds.update((current) => {
      const next = new Set(current);

      if (enabled) {
        next.add(id);
      } else {
        next.delete(id);
      }

      return next;
    });
  }
}
