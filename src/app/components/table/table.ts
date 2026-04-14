import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Grid, GridCell, GridCellWidget, GridRow } from '@angular/aria/grid';
import {
  FlexRender,
  createAngularTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/angular-table';

import {
  PAGE_SIZE_OPTIONS,
  SIMULATION_STATUSES,
  type SimulationRow,
  type SimulationStatus,
  type SimulationStatusCounts,
} from '../../pages/table-showcase-page/table-simulation';

const integerFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const decimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});
const columnLabels: Record<string, string> = {
  workload: 'Workload',
  region: 'Region',
  owner: 'Owner',
  status: 'Status',
  latencyMs: 'Latency',
  throughput: 'Throughput',
  errorRate: 'Error Rate',
  saturation: 'Saturation',
  updatedAt: 'Updated',
};
const emptyStatusCounts: SimulationStatusCounts = {
  Healthy: 0,
  Pending: 0,
  Alert: 0,
  Offline: 0,
};

const globalSearchFilter: FilterFn<SimulationRow> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '').trim().toLowerCase();

  if (!query) {
    return true;
  }

  return (
    row.original.id.toLowerCase().includes(query) ||
    row.original.workload.toLowerCase().includes(query) ||
    row.original.region.toLowerCase().includes(query) ||
    row.original.owner.toLowerCase().includes(query) ||
    row.original.status.toLowerCase().includes(query)
  );
};

const statusFilter: FilterFn<SimulationRow> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as SimulationStatus[];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as SimulationStatus);
};

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Grid, GridCell, GridCellWidget, GridRow, FlexRender],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  readonly rows = input<SimulationRow[]>([]);
  readonly statusCounts = input<SimulationStatusCounts>(emptyStatusCounts);
  readonly lastCycleDurationMs = input(0);
  readonly lastTickAt = input(Date.now());
  readonly pageSizeOptions = input<readonly number[]>(PAGE_SIZE_OPTIONS);

  protected readonly statuses = SIMULATION_STATUSES;
  protected readonly sorting = signal<SortingState>([{ id: 'throughput', desc: true }]);
  protected readonly globalFilter = signal('');
  protected readonly columnFilters = signal<ColumnFiltersState>([]);
  protected readonly pagination = signal<PaginationState>({
    pageIndex: 0,
    pageSize: 24,
  });
  private readonly metricColumnIds = new Set([
    'latencyMs',
    'throughput',
    'errorRate',
    'saturation',
    'updatedAt',
  ]);
  protected readonly columns: ColumnDef<SimulationRow>[] = [
    {
      accessorKey: 'workload',
      header: 'Workload',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'region',
      header: 'Region',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: statusFilter,
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'latencyMs',
      header: 'Latency',
      cell: (info) => `${integerFormatter.format(info.getValue<number>())} ms`,
    },
    {
      accessorKey: 'throughput',
      header: 'Throughput',
      cell: (info) => `${compactFormatter.format(info.getValue<number>())} req/s`,
    },
    {
      accessorKey: 'errorRate',
      header: 'Error Rate',
      cell: (info) => percentFormatter.format(info.getValue<number>()),
    },
    {
      accessorKey: 'saturation',
      header: 'Saturation',
      cell: (info) => `${integerFormatter.format(info.getValue<number>())}%`,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: (info) => timeFormatter.format(info.getValue<number>()),
    },
  ];
  protected readonly table = createAngularTable<SimulationRow>(() => ({
    data: this.rows(),
    columns: this.columns,
    state: {
      sorting: this.sorting(),
      globalFilter: this.globalFilter(),
      columnFilters: this.columnFilters(),
      pagination: this.pagination(),
    },
    enableMultiSort: false,
    autoResetPageIndex: false,
    globalFilterFn: globalSearchFilter,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => this.applyUpdater(this.sorting, updater),
    onGlobalFilterChange: (updater) => this.applyUpdater(this.globalFilter, updater),
    onColumnFiltersChange: (updater) => this.applyUpdater(this.columnFilters, updater),
    onPaginationChange: (updater) => this.applyUpdater(this.pagination, updater),
  }));
  protected readonly selectedStatuses = computed(() => {
    const activeFilter = this.columnFilters().find((entry) => entry.id === 'status');

    return Array.isArray(activeFilter?.value)
      ? (activeFilter.value as SimulationStatus[])
      : [];
  });
  protected readonly filteredRowCount = computed(
    () => this.table.getFilteredRowModel().rows.length,
  );
  protected readonly renderedRowCount = computed(() => this.table.getRowModel().rows.length);
  protected readonly pageLabel = computed(() => {
    const total = this.filteredRowCount();

    if (!total) {
      return 'No matching rows';
    }

    const { pageIndex, pageSize } = this.pagination();
    const start = pageIndex * pageSize + 1;
    const end = Math.min(total, start + this.renderedRowCount() - 1);

    return `Showing ${integerFormatter.format(start)}-${integerFormatter.format(end)} of ${integerFormatter.format(total)} rows`;
  });
  protected readonly activeSortLabel = computed(() => {
    const currentSort = this.sorting()[0];

    if (!currentSort) {
      return 'Manual';
    }

    return `${this.getColumnLabel(currentSort.id)} ${currentSort.desc ? 'descending' : 'ascending'}`;
  });

  protected onSearchInput(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.setGlobalFilter(target.value);
  }

  protected setGlobalFilter(value: string): void {
    this.globalFilter.set(value);
    this.resetToFirstPage();
  }

  protected clearFilters(): void {
    this.globalFilter.set('');
    this.columnFilters.set([]);
    this.resetToFirstPage();
  }

  protected toggleStatus(status: SimulationStatus): void {
    const currentStatuses = new Set(this.selectedStatuses());

    if (currentStatuses.has(status)) {
      currentStatuses.delete(status);
    } else {
      currentStatuses.add(status);
    }

    const nextStatuses = this.statuses.filter((value) => currentStatuses.has(value));
    this.setStatusFilter(
      nextStatuses.length === this.statuses.length ? [] : [...nextStatuses],
    );
  }

  protected isStatusActive(status: SimulationStatus): boolean {
    const selectedStatuses = this.selectedStatuses();

    return selectedStatuses.length === 0 || selectedStatuses.includes(status);
  }

  protected setPageSize(pageSize: number): void {
    this.pagination.update((state) => ({
      ...state,
      pageIndex: 0,
      pageSize,
    }));
  }

  protected isMetricColumn(columnId: string): boolean {
    return this.metricColumnIds.has(columnId);
  }

  protected getSortIcon(column: Column<SimulationRow, unknown>): string {
    const sortState = column.getIsSorted();

    if (sortState === 'asc') {
      return '↑';
    }

    if (sortState === 'desc') {
      return '↓';
    }

    return '↕';
  }

  protected getAriaSort(column: Column<SimulationRow, unknown>): string {
    const sortState = column.getIsSorted();

    if (sortState === 'asc') {
      return 'ascending';
    }

    if (sortState === 'desc') {
      return 'descending';
    }

    return 'none';
  }

  protected formatInteger(value: number): string {
    return integerFormatter.format(value);
  }

  protected formatDecimal(value: number): string {
    return decimalFormatter.format(value);
  }

  protected formatTime(value: number): string {
    return timeFormatter.format(value);
  }

  private setStatusFilter(statuses: SimulationStatus[]): void {
    this.columnFilters.update((filters) => {
      const nextFilters = filters.filter((filter) => filter.id !== 'status');

      if (!statuses.length) {
        return nextFilters;
      }

      return [...nextFilters, { id: 'status', value: statuses }];
    });

    this.resetToFirstPage();
  }

  private resetToFirstPage(): void {
    this.pagination.update((state) => ({
      ...state,
      pageIndex: 0,
    }));
  }

  private applyUpdater<T>(target: WritableSignal<T>, updater: Updater<T>): void {
    target.update((currentValue) =>
      updater instanceof Function ? updater(currentValue) : updater,
    );
  }

  private getColumnLabel(columnId: string): string {
    return columnLabels[columnId] ?? columnId;
  }
}
