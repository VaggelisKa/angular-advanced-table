import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type VisibilityState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableSurface,
  NatTableColumnVisibility,
  withNatTableHeaderActions,
  NatTableService,
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
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
  selector: 'app-visibility-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableColumnVisibility],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Column Visibility</h1>
        <p class="description">
          Demonstrates how columns can be dynamically shown or hidden by the user.
        </p>
      </header>

      <div class="grid-layout">
        <div class="card">
          <h2 class="card-title">Visibility Grid Control</h2>

          <nat-table-surface [(state)]="tableState">
            <div class="visibility-panel">
              <nat-table-column-visibility />
            </div>

            <nat-table
              [data]="data"
              [columns]="columns"
              accessibleName="Visibility demo table"
            />
          </nat-table-surface>
        </div>
      </div>
    </div>
  `,
})
export class VisibilityShowcasePage {
  readonly data = DEMO_DATA;

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
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

  readonly tableState = signal<Partial<NatTableState>>({
    columnVisibility: {
      name: true,
      category: true,
      status: false,
      value: true,
    },
  });

  onColumnVisibilityChange(columnVisibility: VisibilityState): void {
    this.tableState.update((current) => ({ ...current, columnVisibility }));
  }
}
