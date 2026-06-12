import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type SortingState } from '@tanstack/angular-table';
import {
  composeColumns,
  NatTable,
  type NatTableColumnTransform,
  type NatTableState,
} from 'ng-advanced-table';
import { NatTableSurface, withNatTableHeaderActions } from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

const DEMO_DATA: DemoItem[] = [
  { id: 'item-1', name: 'Aurora Lamp', category: 'Lighting', price: 89, quantity: 12 },
  { id: 'item-2', name: 'Birch Desk', category: 'Furniture', price: 420, quantity: 3 },
  { id: 'item-3', name: 'Cobalt Chair', category: 'Furniture', price: 150, quantity: 8 },
  { id: 'item-4', name: 'Dune Rug', category: 'Textiles', price: 240, quantity: 5 },
  { id: 'item-5', name: 'Ember Heater', category: 'Appliances', price: 199, quantity: 7 },
  { id: 'item-6', name: 'Frost Fan', category: 'Appliances', price: 75, quantity: 14 },
];

const BASE_COLUMNS: ColumnDef<DemoItem, unknown>[] = [
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
    accessorKey: 'price',
    header: 'Price',
    meta: { label: 'Price' },
    cell: (context: CellContext<DemoItem, unknown>) =>
      `$${Number(context.getValue()).toLocaleString()}`,
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    meta: { label: 'Quantity' },
  },
];

/** Appends a computed "Total" column (price x quantity). */
const withTotalColumn: NatTableColumnTransform<DemoItem> = (columns) => [
  ...columns,
  {
    id: 'total',
    header: 'Total',
    accessorFn: (row: DemoItem) => row.price * row.quantity,
    meta: { label: 'Total' },
    cell: (context: CellContext<DemoItem, unknown>) =>
      `$${Number(context.getValue()).toLocaleString()}`,
  },
];

/** Applies `align: 'end'` to the given numeric columns. */
const withEndAlignment =
  (...columnIds: readonly string[]): NatTableColumnTransform<DemoItem> =>
  (columns) =>
    columns.map((column) => {
      const id = column.id ?? ('accessorKey' in column ? String(column.accessorKey) : '');
      if (!columnIds.includes(id)) {
        return column;
      }
      return { ...column, meta: { ...column.meta, align: 'end' } };
    });

const CODE_EXAMPLE = `// Left to right with composeColumns - reads top to bottom:
const columns = composeColumns(
  BASE_COLUMNS,
  withTotalColumn,
  withEndAlignment('price', 'quantity', 'total'),
  withNatTableHeaderActions,
);

// The equivalent nested calls - read inside-out:
const columns = withNatTableHeaderActions(
  withEndAlignment('price', 'quantity', 'total')(
    withTotalColumn(BASE_COLUMNS),
  ),
);`;

@Component({
  selector: 'app-compose-columns-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Compose Columns</h1>
        <p class="description">
          Demonstrates composeColumns, which applies column transforms left to right so the
          pipeline reads top to bottom instead of inside-out. This grid appends a computed Total
          column, end-aligns the numeric columns, and adds sortable header actions - all as small
          composable transforms.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Composed Columns Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              accessibleName="Compose columns demo table"
              (sortingChange)="onSortingChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Programmatic Sort Actions</h2>
          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="sortBy('total', 'desc')">
              Sort by Total (Desc)
            </button>
            <button type="button" class="btn btn-outline" (click)="sortBy('name', 'asc')">
              Sort by Name (Asc)
            </button>
            <button type="button" class="btn btn-secondary" (click)="clearSort()">
              Clear Sorting
            </button>
          </div>

          <div class="info-tag" aria-live="polite">Current sort: {{ currentSortLabel() }}</div>

          <div class="instructions">
            <ol>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on a header cell to focus its sort button, then
                <code>Enter</code> again to toggle sorting.
              </li>
              <li>Press <code>Escape</code> to return focus to the cell.</li>
              <li>
                The Total column and the end-aligned numbers come from the transform pipeline, so
                they sort and behave like hand-written columns.
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div class="card code-card">
        <header class="code-card-header">
          <h2 class="card-title">Left-To-Right vs Nested Calls</h2>
        </header>
        <div class="code-editor">
          <pre class="code-content"><code>{{ codeExample }}</code></pre>
        </div>
      </div>
    </div>
  `,
})
export class ComposeColumnsShowcasePage {
  readonly data = DEMO_DATA;
  readonly codeExample = CODE_EXAMPLE;

  readonly columns: ColumnDef<DemoItem, unknown>[] = composeColumns(
    BASE_COLUMNS,
    withTotalColumn,
    withEndAlignment('price', 'quantity', 'total'),
    withNatTableHeaderActions,
  );

  readonly tableState = signal<Partial<NatTableState>>({
    sorting: [],
  });

  readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;
    if (!sorting?.length) {
      return 'None';
    }
    const entry = sorting[0]!;
    return `${entry.id} (${entry.desc ? 'desc' : 'asc'})`;
  });

  onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  sortBy(id: string, dir: 'asc' | 'desc'): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [{ id, desc: dir === 'desc' }],
    }));
  }

  clearSort(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [],
    }));
  }
}
