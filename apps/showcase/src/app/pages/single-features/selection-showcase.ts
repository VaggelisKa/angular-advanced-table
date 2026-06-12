import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { CellContext, ColumnDef, RowSelectionState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableSelectionColumn } from 'ng-advanced-table-ui';

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
  selector: 'app-selection-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Row Selection</h1>
        <p class="description">
          Demonstrates single and multiple row selection with a generated checkbox column,
          <code>aria-selected</code> row states, and polite live announcements.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Selectable Services Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [enableRowSelection]="true"
              [selectionMode]="selectionMode()"
              [getRowId]="getRowId"
              [state]="tableState()"
              accessibleName="Row selection demo table"
              (rowSelectionChange)="onRowSelectionChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Selection Controls</h2>
          <div class="actions-panel">
            <button
              type="button"
              class="btn btn-outline"
              [attr.aria-pressed]="selectionMode() === 'multiple'"
              (click)="setMode('multiple')"
            >
              Multiple mode
            </button>
            <button
              type="button"
              class="btn btn-outline"
              [attr.aria-pressed]="selectionMode() === 'single'"
              (click)="setMode('single')"
            >
              Single mode
            </button>
            <button type="button" class="btn btn-secondary" (click)="clearSelection()">
              Clear selection
            </button>
          </div>

          <div class="info-tag">Mode: {{ selectionMode() }}</div>
          <div class="info-tag">
            Selected ({{ selectedNames().length }}): {{ selectedSummary() }}
          </div>

          <h2 class="card-title">How To Use The Keyboard</h2>
          <div class="instructions">
            <ol>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on a checkbox cell to move focus into its checkbox, then
                press <code>Space</code> to toggle the row.
              </li>
              <li>
                In multiple mode, the header checkbox selects or clears all rows and shows an
                indeterminate state for partial selections.
              </li>
              <li>Press <code>Escape</code> to return focus from the checkbox to the cell.</li>
              <li>Selection changes are announced through the table's polite live region.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SelectionShowcasePage {
  readonly data = DEMO_DATA;
  readonly selectionMode = signal<'single' | 'multiple'>('multiple');
  readonly tableState = signal<Partial<NatTableState>>({ rowSelection: {} });
  readonly getRowId = (row: DemoItem) => row.id;

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableSelectionColumn(
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

  readonly selectedNames = computed(() => {
    const selection = this.tableState().rowSelection ?? {};

    return this.data.filter((item) => selection[item.id]).map((item) => item.name);
  });

  readonly selectedSummary = computed(() => {
    const names = this.selectedNames();

    return names.length ? names.join(', ') : 'None';
  });

  onRowSelectionChange(rowSelection: RowSelectionState): void {
    this.tableState.update((current) => ({ ...current, rowSelection }));
  }

  setMode(mode: 'single' | 'multiple'): void {
    // Clearing keeps the controlled state consistent with the new cardinality.
    this.selectionMode.set(mode);
    this.clearSelection();
  }

  clearSelection(): void {
    this.tableState.update((current) => ({ ...current, rowSelection: {} }));
  }
}
