import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type Row as TanStackRow,
} from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: 'Active' | 'Paused' | 'Halted';
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
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Active', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Data Science', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-row-styling-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Styles must reach the rows rendered inside `nat-table`, so encapsulation is
  // disabled and every selector stays namespaced under `.showcase-page`.
  encapsulation: ViewEncapsulation.None,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Row Styling</h1>
        <p class="description">
          Demonstrates the <code>rowClass</code> input: a callback that adds a CSS class per row,
          here highlighting halted services. The highlight is purely visual — the Status column
          always shows the same state as text, so color is never the only indicator (WCAG 1.4.1).
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">State-Driven Row Highlighting</h2>
          <nat-table-surface>
            <nat-table
              [data]="rows()"
              [columns]="columns"
              [rowClass]="rowClass"
              [getRowId]="getRowId"
              accessibleName="Row styling demo table"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Toggle Service Status</h2>
          <div class="actions-panel">
            @for (item of rows(); track item.id) {
              <button type="button" class="btn btn-outline" (click)="toggleHalt(item.id)">
                {{ item.status === 'Halted' ? 'Resume' : 'Halt' }} {{ item.name }}
              </button>
            }
          </div>

          <div class="info-tag" aria-live="polite">{{ haltedSummary() }}</div>

          <div class="instructions">
            <ol>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on a header cell to move focus into its sort control,
                and <code>Escape</code> to return focus to the cell.
              </li>
              <li>
                Halted rows keep their "Halted" text in the Status column, so the amber highlight
                is never the only state indicator.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* The table paints rows from this custom property, so the highlight is set
       through it instead of fighting the library rule's specificity.
       AA-contrast safe in both themes: page text stays #0f1419 on the light
       amber (≈15:1) and #e6eaef on the dark amber (≈11:1). */
    .showcase-page .row-status-halted {
      --nat-table-row-background: #f9e9c0;
    }

    .showcase-shell[data-theme='dark'] .showcase-page .row-status-halted {
      --nat-table-row-background: #3a2d08;
    }
  `,
})
export class RowStylingShowcasePage {
  readonly rows = signal<DemoItem[]>(DEMO_DATA);

  readonly getRowId = (row: DemoItem): string => row.id;

  readonly rowClass = (row: TanStackRow<DemoItem>): string | null =>
    row.original.status === 'Halted' ? 'row-status-halted' : null;

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

  readonly haltedSummary = computed(() => {
    const all = this.rows();
    const halted = all.filter((item) => item.status === 'Halted');

    return halted.length
      ? `Halted services: ${halted.map((item) => item.name).join(', ')}`
      : 'Halted services: none';
  });

  toggleHalt(id: string): void {
    this.rows.update((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Halted' ? 'Active' : 'Halted' }
          : item,
      ),
    );
  }
}
