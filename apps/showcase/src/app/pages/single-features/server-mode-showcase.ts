import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  type CellContext,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/angular-table';
import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTablePageSize,
  NatTablePager,
  NatTableSurface,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';

interface DemoItem {
  id: string;
  name: string;
  category: string;
  status: string;
  value: number;
}

interface ServerRequest {
  sorting: SortingState;
  pagination: PaginationState;
}

interface ServerResponse {
  rows: DemoItem[];
  total: number;
}

const SERVER_LATENCY_MS = 400;
const CATEGORIES = ['Analytics', 'Infrastructure', 'Data Science', 'Security', 'Networking'];
const STATUSES = ['Active', 'Paused', 'Alert', 'Halted'];

/** The "database" living on the fake server: 87 generated rows. */
const SERVER_DATA: DemoItem[] = Array.from({ length: 87 }, (_, index) => ({
  id: `item-${String(index + 1).padStart(3, '0')}`,
  name: `Service ${String(index + 1).padStart(2, '0')}`,
  category: CATEGORIES[index % CATEGORIES.length],
  status: STATUSES[index % STATUSES.length],
  value: ((index * 137) % 9000) + 250,
}));

/** Simulated server endpoint: sorts and slices the dataset after ~400 ms. */
function fetchServerPage(request: ServerRequest): Promise<ServerResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = sortServerRows(SERVER_DATA, request.sorting);
      const start = request.pagination.pageIndex * request.pagination.pageSize;

      resolve({
        rows: sorted.slice(start, start + request.pagination.pageSize),
        total: SERVER_DATA.length,
      });
    }, SERVER_LATENCY_MS);
  });
}

function sortServerRows(rows: readonly DemoItem[], sorting: SortingState): DemoItem[] {
  const entry = sorting[0];

  if (!entry) {
    return [...rows];
  }

  const direction = entry.desc ? -1 : 1;
  const key = entry.id as keyof DemoItem;

  return [...rows].sort((left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

@Component({
  selector: 'app-server-mode-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatTableSurface, NatTablePageSize, NatTablePager],
  template: `
    <div class="showcase-page showcase-container">
      <header class="header-section">
        <h1 class="title">Server-Driven Data Mode</h1>
        <p class="description">
          Sorting and pagination are delegated to a simulated server with ~400 ms latency.
          Manual modes disable the client row models, rowCount reports the full server total, and
          loading marks the grid busy (aria-busy) while a request is in flight.
        </p>
      </header>

      <div class="grid-layout grid-layout-with-panel">
        <div class="card">
          <h2 class="card-title">Server-Paged Grid</h2>

          <nat-table-surface>
            <div class="table-toolbar">
              <nat-table-page-size [pageSizeOptions]="[5, 10, 20]" />
              <nat-table-pager />
            </div>

            <nat-table
              [data]="rows()"
              [columns]="columns"
              [state]="tableState()"
              [enablePagination]="true"
              [enableGlobalFilter]="false"
              [manualSorting]="true"
              [manualPagination]="true"
              [rowCount]="totalRows()"
              [loading]="loading()"
              [getRowId]="getRowId"
              accessibleName="Server-driven demo table"
              (sortingChange)="onSortingChange($event)"
              (paginationChange)="onPaginationChange($event)"
            />
          </nat-table-surface>
        </div>

        <div class="card">
          <h2 class="card-title">Server State</h2>

          <div class="actions-panel">
            <button type="button" class="btn btn-outline" (click)="sortBy('value', 'desc')">
              Sort by Value (Desc) on the server
            </button>
            <button type="button" class="btn btn-outline" (click)="sortBy('name', 'asc')">
              Sort by Name (Asc) on the server
            </button>
            <button type="button" class="btn btn-secondary" (click)="clearSort()">
              Clear sorting
            </button>
          </div>

          <div class="info-tag" aria-live="polite">{{ statusLabel() }}</div>
          <div class="info-tag">{{ pageLabel() }}</div>
          <div class="info-tag">Requests sent: {{ requestsSent() }} (latency ~400 ms)</div>

          <div class="instructions">
            <ol>
              <li>
                <strong>Tab</strong> to the grid, then move between cells with the
                <code>Arrow</code> keys.
              </li>
              <li>
                Press <code>Enter</code> on a header cell to reach its sort button,
                <code>Tab</code> / <code>Shift + Tab</code> to walk between controls, and
                <code>Escape</code> to return to the cell.
              </li>
              <li>
                Sorting or changing page sends a request to the fake server: the rows dim and the
                grid sets <code>aria-busy</code> until the response lands.
              </li>
              <li>
                <code>aria-rowindex</code> reflects each row's absolute position in the full
                87-row server dataset, not its position on the current page; with 5 rows per page,
                page 2 starts at row index 7 (1 header row + 5 offset rows + 1).
              </li>
              <li>
                <code>aria-rowcount</code> stays at 88 (1 header row + 87 server rows) regardless
                of the page size.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ServerModeShowcasePage {
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

  readonly getRowId = (row: DemoItem): string => row.id;

  readonly rows = signal<DemoItem[]>([]);
  readonly totalRows = signal(SERVER_DATA.length);
  readonly loading = signal(false);
  readonly requestsSent = signal(0);
  readonly tableState = signal<Partial<NatTableState>>({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 5 },
  });

  readonly statusLabel = computed(() =>
    this.loading() ? 'Fetching from server…' : 'Idle — showing the latest server response.',
  );
  readonly pageLabel = computed(() => {
    const pagination = this.tableState().pagination ?? { pageIndex: 0, pageSize: 5 };
    const pageCount = Math.max(Math.ceil(this.totalRows() / pagination.pageSize), 1);

    return `Page ${pagination.pageIndex + 1} of ${pageCount} — ${this.rows().length} of ${this.totalRows()} rows loaded.`;
  });

  private latestRequestId = 0;

  constructor() {
    this.load();
  }

  onSortingChange(sorting: SortingState): void {
    // Server-style behavior: a new sort restarts from the first page.
    this.tableState.update((current) => ({
      ...current,
      sorting,
      pagination: { ...(current.pagination ?? { pageIndex: 0, pageSize: 5 }), pageIndex: 0 },
    }));
    this.load();
  }

  onPaginationChange(pagination: PaginationState): void {
    this.tableState.update((current) => ({ ...current, pagination }));
    this.load();
  }

  sortBy(id: string, dir: 'asc' | 'desc'): void {
    this.onSortingChange([{ id, desc: dir === 'desc' }]);
  }

  clearSort(): void {
    this.onSortingChange([]);
  }

  private load(): void {
    const requestId = ++this.latestRequestId;
    const state = this.tableState();

    this.loading.set(true);
    this.requestsSent.update((count) => count + 1);

    fetchServerPage({
      sorting: state.sorting ?? [],
      pagination: state.pagination ?? { pageIndex: 0, pageSize: 5 },
    }).then((response) => {
      if (requestId !== this.latestRequestId) {
        return; // A newer request superseded this one.
      }

      this.rows.set(response.rows);
      this.totalRows.set(response.total);
      this.loading.set(false);
    });
  }
}
