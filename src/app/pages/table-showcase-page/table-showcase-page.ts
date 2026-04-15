import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import {
  AdvancedTableComponent,
  type AdvancedTableState,
} from 'advanced-table';
import {
  DATASET_OPTIONS,
  PAGE_SIZE_OPTIONS,
  SIMULATION_PROFILES,
  SIMULATION_STATUSES,
  TableSimulation,
  type SimulationProfile,
  type SimulationRow,
  type SimulationStatus,
} from './table-simulation';

const integerFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
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
const statusFilter: FilterFn<SimulationRow> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as SimulationStatus[];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as SimulationStatus);
};
const simulationColumns: ColumnDef<SimulationRow, unknown>[] = [
  {
    accessorKey: 'workload',
    header: 'Workload',
    size: 320,
    meta: {
      label: 'Workload',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 220,
    meta: {
      label: 'Region',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    size: 260,
    meta: {
      label: 'Owner',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 160,
    meta: {
      label: 'Status',
    },
    enablePinning: true,
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'latencyMs',
    header: 'Latency',
    size: 160,
    meta: {
      label: 'Latency',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => `${integerFormatter.format(info.getValue<number>())} ms`,
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 180,
    meta: {
      label: 'Throughput',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => `${compactFormatter.format(info.getValue<number>())} req/s`,
  },
  {
    accessorKey: 'errorRate',
    header: 'Error Rate',
    size: 160,
    meta: {
      label: 'Error Rate',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => percentFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'saturation',
    header: 'Saturation',
    size: 160,
    meta: {
      label: 'Saturation',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => `${integerFormatter.format(info.getValue<number>())}%`,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    size: 180,
    meta: {
      label: 'Updated',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => timeFormatter.format(info.getValue<number>()),
  },
];
const defaultTableState: Partial<AdvancedTableState> = {
  sorting: [{ id: 'throughput', desc: true }],
  columnPinning: {
    left: ['workload'],
    right: [],
  },
  pagination: {
    pageIndex: 0,
    pageSize: 24,
  },
};

@Component({
  selector: 'app-table-showcase-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdvancedTableComponent],
  templateUrl: './table-showcase-page.html',
  styleUrl: './table-showcase-page.css',
})
export class TableShowcasePage {
  protected readonly simulation = inject(TableSimulation);
  protected readonly datasetOptions = DATASET_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly statuses = SIMULATION_STATUSES;
  protected readonly columns = simulationColumns;
  protected readonly initialTableState = defaultTableState;
  protected readonly tableState = signal<Partial<AdvancedTableState>>({
    columnFilters: [],
  });
  protected readonly selectedStatuses = computed(() => {
    const activeFilter = this.tableState()
      .columnFilters
      ?.find((entry) => entry.id === 'status');

    return Array.isArray(activeFilter?.value)
      ? (activeFilter.value as SimulationStatus[])
      : [];
  });
  protected readonly profiles = Object.entries(SIMULATION_PROFILES).map(
    ([value, config]) => ({
      value: value as SimulationProfile,
      ...config,
    }),
  );

  protected setDatasetSize(size: number): void {
    this.simulation.setDatasetSize(size);
  }

  protected setProfile(profile: SimulationProfile): void {
    this.simulation.setProfile(profile);
  }

  protected toggleSimulation(): void {
    this.simulation.toggleRunning();
  }

  protected runManualPulse(): void {
    this.simulation.pulse();
  }

  protected toggleStatus(status: SimulationStatus): void {
    const currentStatuses = new Set(this.selectedStatuses());

    if (currentStatuses.has(status)) {
      currentStatuses.delete(status);
    } else {
      currentStatuses.add(status);
    }

    const nextStatuses = this.statuses.filter((value) => currentStatuses.has(value));

    this.tableState.set({
      columnFilters:
        nextStatuses.length === this.statuses.length
          ? []
          : [
              {
                id: 'status',
                value: [...nextStatuses],
              },
            ],
    });
  }

  protected isStatusActive(status: SimulationStatus): boolean {
    const selectedStatuses = this.selectedStatuses();

    return selectedStatuses.length === 0 || selectedStatuses.includes(status);
  }

  protected onTableStateChange(state: AdvancedTableState): void {
    this.tableState.set({
      columnFilters: state.columnFilters,
    });
  }

  protected formatInteger(value: number): string {
    return integerFormatter.format(value);
  }

  protected formatCompact(value: number): string {
    return compactFormatter.format(value);
  }
}
