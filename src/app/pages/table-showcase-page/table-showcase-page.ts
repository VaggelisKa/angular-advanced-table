import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import {
  NatTable,
  type NatTableRowRenderedEvent,
  type NatTableState,
} from 'ng-advanced-table';
import {
  NatRenderMetricsFilter,
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  withRenderMetricsColumn,
} from 'ng-advanced-table-utils';
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

const STATUS_FILTER_ID = 'status';
const integerFormatter = new Intl.NumberFormat('en-US');
const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const signedCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const signedPercentFormatter = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
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
    accessorKey: 'symbol',
    header: 'Symbol',
    size: 120,
    minSize: 100,
    meta: {
      label: 'Symbol',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'company',
    header: 'Company',
    size: 220,
    minSize: 180,
    meta: {
      label: 'Company',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'exchange',
    header: 'Exchange',
    size: 120,
    minSize: 100,
    meta: {
      label: 'Exchange',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    size: 130,
    minSize: 100,
    meta: {
      label: 'Desk',
    },
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Signal',
    size: 120,
    minSize: 100,
    meta: {
      label: 'Signal',
      cellTone: (context) => statusTone(context.getValue<SimulationStatus>()),
    },
    enablePinning: true,
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'price',
    header: 'Last',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Last',
      align: 'end',
      cellTone: (context) => numberTone(context.row.original.changePercent),
    },
    enablePinning: true,
    cell: (info) => currencyFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'change',
    header: '24h $',
    size: 110,
    minSize: 90,
    meta: {
      label: '24h $',
      align: 'end',
      cellTone: (context) =>
        context.row.original.status === 'Halted'
          ? 'warning'
          : numberTone(context.getValue<number>()),
    },
    enablePinning: true,
    cell: (info) => signedCurrencyFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'changePercent',
    header: '24h %',
    size: 110,
    minSize: 90,
    meta: {
      label: '24h %',
      align: 'end',
      cellTone: (context) =>
        context.row.original.status === 'Halted'
          ? 'warning'
          : numberTone(context.getValue<number>()),
    },
    enablePinning: true,
    cell: (info) => `${signedPercentFormatter.format(info.getValue<number>())}%`,
  },
  {
    accessorKey: 'volume',
    header: 'Volume',
    size: 130,
    minSize: 100,
    meta: {
      label: 'Volume',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => compactFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'turnoverMillions',
    header: 'Turnover',
    size: 130,
    minSize: 100,
    meta: {
      label: 'Turnover',
      align: 'end',
    },
    cell: (info) => `${currencyFormatter.format(info.getValue<number>())}M`,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    size: 130,
    minSize: 100,
    meta: {
      label: 'Updated',
      align: 'end',
    },
    enablePinning: true,
    cell: (info) => timeFormatter.format(info.getValue<number>()),
  },
];

const defaultTableState: Partial<NatTableState> = {
  sorting: [{ id: 'changePercent', desc: true }],
  columnPinning: {
    left: [],
    right: [],
  },
  pagination: {
    pageIndex: 0,
    pageSize: 24,
  },
};

type ShowcaseTheme =
  | 'market-tape'
  | 'sandstone-ledger'
  | 'terminal-mint'
  | 'sunset-signal';

interface ShowcaseThemeOption {
  readonly value: ShowcaseTheme;
  readonly label: string;
  readonly description: string;
}

const SHOWCASE_THEMES = [
  {
    value: 'market-tape',
    label: 'Market Tape',
    description: 'Glassmorphism blues with strong gain/loss contrast.',
  },
  {
    value: 'sandstone-ledger',
    label: 'Sandstone Ledger',
    description: 'A warm editorial look with lighter cards and softer separators.',
  },
  {
    value: 'terminal-mint',
    label: 'Terminal Mint',
    description: 'Monospace trading-console styling with neon green accents.',
  },
  {
    value: 'sunset-signal',
    label: 'Sunset Signal',
    description: 'Warm dusk gradients with punchier accent and warning tones.',
  },
] as const satisfies readonly ShowcaseThemeOption[];

@Component({
  selector: 'app-table-showcase-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NatTable, NatRenderMetricsFilter, NatRenderMetricsPanel],
  templateUrl: './table-showcase-page.html',
  styleUrl: './table-showcase-page.css',
})
export class TableShowcasePage {
  protected readonly simulation = inject(TableSimulation);
  protected readonly datasetOptions = DATASET_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly statuses = SIMULATION_STATUSES;
  protected readonly themes = SHOWCASE_THEMES;
  protected readonly metricsStore = new NatTableRenderMetricsStore();
  protected readonly columns = withRenderMetricsColumn(simulationColumns, this.metricsStore);
  protected readonly getRowId = (row: SimulationRow) => row.id;
  protected readonly initialTableState = defaultTableState;
  protected readonly selectedTheme = signal<ShowcaseTheme>(SHOWCASE_THEMES[0].value);
  protected readonly tableState = signal<Partial<NatTableState>>({
    columnFilters: [],
  });
  protected readonly activeTheme = computed(
    () =>
      SHOWCASE_THEMES.find((theme) => theme.value === this.selectedTheme()) ?? SHOWCASE_THEMES[0],
  );
  protected readonly selectedStatuses = computed(() => {
    const activeFilter = this.tableState().columnFilters?.find(
      (entry) => entry.id === STATUS_FILTER_ID,
    );

    return Array.isArray(activeFilter?.value) ? (activeFilter.value as SimulationStatus[]) : [];
  });
  protected readonly profiles = Object.entries(SIMULATION_PROFILES).map(([value, config]) => ({
    value: value as SimulationProfile,
    ...config,
  }));

  protected setDatasetSize(size: number): void {
    this.simulation.setDatasetSize(size);
  }

  protected setProfile(profile: SimulationProfile): void {
    this.simulation.setProfile(profile);
  }

  protected setTheme(theme: ShowcaseTheme): void {
    this.selectedTheme.set(theme);
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

    this.updateColumnFilter(
      STATUS_FILTER_ID,
      nextStatuses.length === this.statuses.length ? null : [...nextStatuses],
    );
  }

  protected isStatusActive(status: SimulationStatus): boolean {
    const selectedStatuses = this.selectedStatuses();

    return selectedStatuses.length === 0 || selectedStatuses.includes(status);
  }

  protected onTableStateChange(state: NatTableState): void {
    this.tableState.set({
      columnFilters: state.columnFilters,
    });
  }

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.metricsStore.record(event);
  }

  protected formatInteger(value: number): string {
    return integerFormatter.format(value);
  }

  protected formatCompact(value: number): string {
    return compactFormatter.format(value);
  }

  private updateColumnFilter(columnId: string, value: unknown | null): void {
    this.tableState.update((currentState) => ({
      columnFilters: upsertColumnFilter(currentState.columnFilters ?? [], columnId, value),
    }));
  }
}

function upsertColumnFilter(
  currentFilters: NonNullable<Partial<NatTableState>['columnFilters']>,
  columnId: string,
  value: unknown | null,
) {
  const nextFilters = currentFilters.filter((filter) => filter.id !== columnId);

  if (value === null) {
    return nextFilters;
  }

  return [
    ...nextFilters,
    {
      id: columnId,
      value,
    },
  ];
}

function numberTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
}

function statusTone(
  status: SimulationStatus,
): 'positive' | 'negative' | 'neutral' | 'warning' {
  switch (status) {
    case 'Advancing':
      return 'positive';
    case 'Declining':
      return 'negative';
    case 'Halted':
      return 'warning';
    case 'Watching':
      return 'neutral';
  }
}
