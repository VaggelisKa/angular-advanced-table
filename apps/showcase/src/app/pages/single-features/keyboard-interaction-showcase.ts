import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { flexRenderComponent, type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
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
  selector: 'app-keyboard-demo-acknowledge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn btn-outline"
      [attr.aria-label]="'Acknowledge ' + name()"
      (click)="pressed.emit(name())"
    >
      Acknowledge
    </button>
  `,
})
export class KeyboardDemoAcknowledgeButton {
  readonly name = input.required<string>();
  readonly pressed = output<string>();
}

@Component({
  selector: 'app-keyboard-interaction-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Keyboard Interaction</h1>
        <p class="description">
          Demonstrates the ARIA grid cell-interaction model: Enter steps into a cell's controls, Tab
          moves between controls, and Escape returns focus to the cell.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Interactive Cells Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              accessibleName="Keyboard interaction demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">How To Use The Keyboard</h2>
          <div class="instructions">
            <ol>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on a header or an Actions cell to move focus into its
                control (sort button or Acknowledge button).
              </li>
              <li>
                Press <code>Tab</code> / <code>Shift + Tab</code> to walk between the controls
                across the grid.
              </li>
              <li>Press <code>Escape</code> to return focus to the cell.</li>
              <li>
                Press <code>Enter</code> or <code>Space</code> on a focused control to activate it.
              </li>
            </ol>
          </div>

          <div class="info-tag" aria-live="polite">Last action: {{ lastAction() }}</div>
        </div>
      </div>
    </div>
  `,
})
export class KeyboardInteractionShowcasePage {
  readonly data = DEMO_DATA;
  readonly lastAction = signal('None yet');

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
      accessorKey: 'value',
      header: 'Value',
      meta: { label: 'Value', align: 'end' },
      cell: (context: CellContext<DemoItem, number>) => `$${context.getValue().toLocaleString()}`,
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableGlobalFilter: false,
      meta: { label: 'Actions', headerActions: false },
      cell: (context: CellContext<DemoItem, unknown>) =>
        flexRenderComponent(KeyboardDemoAcknowledgeButton, {
          inputs: { name: context.row.original.name },
          outputs: { pressed: (name: string) => this.onAcknowledge(name) },
        }),
    },
  ]);

  onAcknowledge(name: string): void {
    this.lastAction.set(`Acknowledged ${name}`);
  }
}
