import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type CellContext, type ColumnDef, type SortingState } from '@tanstack/angular-table';
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
  { id: 'item-2', name: 'Beta Runner', category: 'Security', status: 'Active', value: 1200 },
  { id: 'item-3', name: 'Gamma Processor', category: 'Analytics', status: 'Paused', value: 7800 },
  { id: 'item-4', name: 'Delta Watcher', category: 'Security', status: 'Alert', value: 3100 },
  { id: 'item-5', name: 'Epsilon Shield', category: 'Security', status: 'Active', value: 9200 },
  { id: 'item-6', name: 'Zeta Pipeline', category: 'Analytics', status: 'Halted', value: 500 },
];

@Component({
  selector: 'app-multi-sort-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Multi-Column Sorting</h1>
        <p class="description">
          Demonstrates multi-column sorting: hold Shift to add a column to the active sort. Each
          sorted header shows a priority badge, and screen readers hear the combined sort order.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Multi-Sort Grid</h2>
          <nat-table-surface>
            <nat-table
              [data]="data"
              [columns]="columns"
              [state]="tableState()"
              [enableMultiSort]="true"
              [getRowId]="getRowId"
              accessibleName="Multi-column sorting demo table"
              (sortingChange)="onSortingChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Sort Priority</h2>
          <div class="instructions">
            <ol>
              <li>Click a header's sort button to sort by that column.</li>
              <li>
                <strong>Shift + click</strong> (or <strong>Shift + Enter</strong> on a focused sort
                button) adds another column to the sort.
              </li>
              <li>
                Keyboard path: <code>Tab</code> to the grid, move to a header with the
                <code>Arrow</code> keys, press <code>Enter</code> to focus the sort button, then
                press <code>Enter</code> or <code>Shift + Enter</code>.
              </li>
              <li>A numbered badge on each sorted header shows its priority.</li>
            </ol>
          </div>

          <div class="info-tag">Current sorting (priority order): {{ currentSortLabel() }}</div>

          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="applyPresetSort()">
              Sort by Category, then Value
            </button>
            <button type="button" class="btn btn-outline" (click)="clearSort()">
              Clear Sorting
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MultiSortShowcasePage {
  readonly data = DEMO_DATA;
  readonly getRowId = (row: DemoItem) => row.id;

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
    sorting: [],
  });

  readonly currentSortLabel = computed(() => {
    const sorting = this.tableState().sorting;

    if (!sorting?.length) {
      return 'None';
    }

    return sorting
      .map((entry, index) => `${index + 1}. ${entry.id} (${entry.desc ? 'desc' : 'asc'})`)
      .join(', ');
  });

  onSortingChange(sorting: SortingState): void {
    this.tableState.update((current) => ({ ...current, sorting }));
  }

  applyPresetSort(): void {
    this.tableState.update((current) => ({
      ...current,
      sorting: [
        { id: 'category', desc: false },
        { id: 'value', desc: true },
      ],
    }));
  }

  clearSort(): void {
    this.tableState.update((current) => ({ ...current, sorting: [] }));
  }
}
