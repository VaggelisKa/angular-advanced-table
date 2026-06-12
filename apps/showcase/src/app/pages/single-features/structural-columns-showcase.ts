import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { flexRenderComponent, type CellContext, type ColumnDef } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import {
  NatTableSearch,
  NatTableSurface,
  withActionsColumn,
  withRowNumberColumn,
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
  selector: 'app-structural-row-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn btn-outline"
      [attr.aria-label]="'View ' + name()"
      (click)="view.emit(name())"
    >
      View
    </button>
    <button
      type="button"
      class="btn btn-outline"
      [attr.aria-label]="'Delete ' + name()"
      (click)="remove.emit(name())"
    >
      Delete
    </button>
  `,
})
export class StructuralRowActionsCell {
  readonly name = input.required<string>();
  readonly view = output<string>();
  readonly remove = output<string>();
}

@Component({
  selector: 'app-structural-columns-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTableSearch],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Structural Columns</h1>
        <p class="description">
          Demonstrates the <code>withRowNumberColumn</code> and <code>withActionsColumn</code>
          helpers: row numbers follow the filtered position, and each row gets View and Delete
          actions.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Row Numbers & Actions Grid</h2>

          <div class="search-panel">
            <!-- Explicit [for] wiring: page-level NatTableService never sees the
                 controller because NatTableSurface scopes its own instance. -->
            <nat-table-search
              [for]="grid"
              label="Quick filter to renumber rows"
              placeholder="Filter e.g. Security, Active, Alpha..."
            />
          </div>

          <nat-table-surface>
            <nat-table
              #grid="natTable"
              [data]="rows()"
              [columns]="columns"
              accessibleName="Structural columns demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Activity Log</h2>

          <div class="actions-panel">
            <button
              type="button"
              class="btn btn-secondary"
              [disabled]="!hasDeletedRows()"
              (click)="restoreRows()"
            >
              Restore deleted rows
            </button>
          </div>

          <div class="info-tag" aria-live="polite">Last action: {{ lastAction() }}</div>

          @if (activityLog().length) {
            <div class="instructions">
              <ol>
                @for (entry of activityLog(); track $index) {
                  <li>{{ entry }}</li>
                }
              </ol>
            </div>
          }

          <h2 class="card-title">How To Use The Keyboard</h2>
          <div class="instructions">
            <ol>
              <li>
                Type in the quick filter — the <strong>#</strong> column renumbers to match the
                filtered order.
              </li>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on an Actions cell to focus its View button, then
                <code>Tab</code> to reach Delete.
              </li>
              <li>Press <code>Escape</code> to return focus to the cell.</li>
              <li>
                Press <code>Enter</code> or <code>Space</code> on a focused button to activate it.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StructuralColumnsShowcasePage {
  private readonly document = inject(DOCUMENT);
  private readonly grid = viewChild(NatTable);

  readonly rows = signal<DemoItem[]>(DEMO_DATA);
  readonly lastAction = signal('None yet');
  readonly activityLog = signal<string[]>([]);
  readonly hasDeletedRows = computed(() => this.rows().length < DEMO_DATA.length);

  readonly columns: ColumnDef<DemoItem, unknown>[] = withActionsColumn(
    withRowNumberColumn(
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
          cell: (context: CellContext<DemoItem, number>) =>
            `$${context.getValue().toLocaleString()}`,
        },
      ],
      { label: 'Row number' },
    ),
    (context) =>
      flexRenderComponent(StructuralRowActionsCell, {
        inputs: { name: context.row.original.name },
        outputs: {
          view: (name: string) => this.onView(name),
          remove: (name: string) => this.onDelete(name),
        },
      }),
    { header: 'Actions', size: 180 },
  );

  onView(name: string): void {
    this.logAction(`Viewed ${name}`);
  }

  onDelete(name: string): void {
    this.rows.update((rows) => rows.filter((row) => row.name !== name));
    this.logAction(`Deleted ${name}`);
    this.restoreGridFocus();
  }

  restoreRows(): void {
    this.rows.set(DEMO_DATA);
    this.logAction('Restored all rows');
  }

  private logAction(entry: string): void {
    this.lastAction.set(entry);
    this.activityLog.update((log) => [entry, ...log].slice(0, 6));
  }

  /**
   * Deleting a row removes the focused Delete button from the DOM, which would
   * silently drop keyboard focus to the body. Hand focus back to the grid's
   * roving-tabindex cell once the table has re-rendered.
   */
  private restoreGridFocus(): void {
    const tableId = this.grid()?.tableElementId();

    if (!tableId) {
      return;
    }

    setTimeout(() => {
      const table = this.document.getElementById(tableId);
      const activeCell = table?.querySelector<HTMLElement>('[tabindex="0"]');

      activeCell?.focus();
    });
  }
}
