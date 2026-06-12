import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type ColumnPinningState } from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

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
  selector: 'app-rtl-direction-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Text Direction (LTR / RTL)</h1>
        <p class="description">
          The table mirrors itself for right-to-left languages. The direction resolves in this
          order: the explicit "direction" input, then the inherited CDK direction (Directionality
          from a surrounding dir attribute), then "ltr" as the final fallback. The Name column is
          pinned and the Value column is end-aligned, so flipping the direction visibly mirrors
          both.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Direction-aware Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              [direction]="direction()"
              [enableColumnPinning]="true"
              accessibleName="Text direction demo table"
              (columnPinningChange)="onColumnPinningChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Toggle Direction</h2>
          <div class="actions-panel">
            <div class="btn-group">
              <button
                type="button"
                class="btn-sm"
                [class.active]="direction() === 'ltr'"
                [attr.aria-pressed]="direction() === 'ltr'"
                (click)="setDirection('ltr')"
              >
                Left to right (LTR)
              </button>
              <button
                type="button"
                class="btn-sm"
                [class.active]="direction() === 'rtl'"
                [attr.aria-pressed]="direction() === 'rtl'"
                (click)="setDirection('rtl')"
              >
                Right to left (RTL)
              </button>
            </div>
          </div>

          <div class="info-tag">Current direction: {{ direction().toUpperCase() }}</div>

          <p class="description">
            Keyboard: Tab moves focus into the grid, then use the arrow keys to move between cells.
            Arrow keys keep their logical meaning in RTL — the grid handles the mirroring for you.
            Press Enter to move into controls inside a cell and Escape to return to the cell.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RtlDirectionShowcasePage {
  readonly data = DEMO_DATA;

  readonly columns: ColumnDef<DemoItem, unknown>[] = withNatTableHeaderActions([
    {
      accessorKey: 'name',
      header: 'Name',
      size: 150,
      enablePinning: true,
      meta: { label: 'Name', rowHeader: true },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      meta: { label: 'Category' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'value',
      header: 'Value',
      size: 150,
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
  ]);

  readonly direction = signal<'ltr' | 'rtl'>('ltr');

  readonly tableState = signal<Partial<NatTableState>>({
    columnPinning: {
      left: ['name'],
      right: [],
    },
  });

  setDirection(direction: 'ltr' | 'rtl'): void {
    this.direction.set(direction);
  }

  onColumnPinningChange(columnPinning: ColumnPinningState): void {
    this.tableState.update((current) => ({ ...current, columnPinning }));
  }
}
