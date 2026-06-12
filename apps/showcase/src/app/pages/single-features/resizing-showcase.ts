import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type ColumnSizingState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface } from 'ng-advanced-table-ui';

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
  selector: 'app-resizing-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Column Resizing Feature</h1>
        <p class="description">
          Demonstrates interactive column resizing with pointer drag and keyboard support. Every
          column declares a minimum and maximum size, and the table announces each new width to
          screen readers.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Interactive Resizing Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              enableColumnResizing
              accessibleName="Column resizing demo table"
              (columnSizingChange)="onColumnSizingChange($event)"
            />
          </nat-table-surface>
          <p class="info-tag">
            Drag: grab the thin handle on a header's edge and drag to resize the column.
          </p>
          <p class="info-tag">
            Keyboard: Tab to a column's resize handle, then press Left/Right Arrow to resize,
            Shift+Arrow for larger steps, and Home/End for the minimum or maximum width.
          </p>
        </div>

        <div class="card">
          <h2 class="card-title">Current Column Widths</h2>
          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="resetWidths()">
              Reset Widths
            </button>
          </div>

          @for (entry of widthEntries(); track entry.id) {
            <div class="info-tag">{{ entry.id }}: {{ entry.width }}</div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ResizingShowcasePage {
  readonly data = DEMO_DATA;

  readonly columns: ColumnDef<DemoItem, unknown>[] = [
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
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ];

  readonly tableState = signal<Partial<NatTableState>>({
    columnSizing: {},
  });

  readonly widthEntries = computed(() => {
    const sizing = this.tableState().columnSizing ?? {};

    return this.columns.map((column) => {
      const id = String((column as { accessorKey?: string }).accessorKey ?? column.id ?? '');
      const width = sizing[id];

      return { id, width: width !== undefined ? `${Math.round(width)}px` : 'default' };
    });
  });

  onColumnSizingChange(columnSizing: ColumnSizingState): void {
    this.tableState.update((current) => ({ ...current, columnSizing }));
  }

  resetWidths(): void {
    this.tableState.update((current) => ({ ...current, columnSizing: {} }));
  }
}
