/* eslint-disable max-lines */
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';

import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef, FilterFn } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import {
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableToolbar,
  withNatTableHeaderActions
} from 'ng-advanced-table-ui';
import type { NatTableSortIndicatorContext } from 'ng-advanced-table-ui';
import {
  NatRenderMetricsFilter,
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  withRenderMetricsColumn
} from 'ng-advanced-table-utils';
import type { NatTableRenderMetricsController, NatTableRenderMetricsEvent } from 'ng-advanced-table-utils';

import { NatRowActionsMenu } from './nat-row-actions-menu';
import { NatSparkline } from './nat-sparkline';
import { NatTickerMark } from './nat-ticker-mark';
import {
  compareSortKeys,
  formatCompact,
  formatCurrency,
  formatInteger,
  formatSignedCurrency,
  formatSignedPercent,
  formatTime,
  getSimulationRowId,
  numberTone,
  statusTone,
  upsertColumnFilter
} from './table-showcase-page.util';
import { DATASET_OPTIONS, PAGE_SIZE_OPTIONS, SIMULATION_PROFILES, SIMULATION_STATUSES, TableSimulation } from './table-simulation';
import type { SimulationProfile, SimulationRow, SimulationStatus } from './table-simulation';
import { TableSearch } from '../../components/table-search/table-search';
import { ShowcaseThemeStore } from '../../showcase-theme';

const STATUS_FILTER_ID = 'status';

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
    meta: { label: 'Symbol', rowHeader: true },
    enablePinning: true,
    sortingFn: (left, right) => compareSortKeys(left.original.symbolSortKey, right.original.symbolSortKey),
    cell: (info) =>
      flexRenderComponent(NatTickerMark, {
        inputs: { symbol: info.getValue<string>() }
      })
  },
  {
    accessorKey: 'company',
    header: 'Company',
    size: 180,
    minSize: 160,
    meta: {
      label: 'Company',
      cellHeight: 72,
      cellMaxLines: 2
    },
    enablePinning: true,
    sortingFn: (left, right) => compareSortKeys(left.original.companySortKey, right.original.companySortKey),
    cell: (info) => `${info.getValue<string>()} liquidity review with multi-venue routing notes for ${info.row.original.symbol}`
  },
  {
    accessorKey: 'exchange',
    header: 'Exchange',
    size: 120,
    minSize: 100,
    meta: { label: 'Exchange' },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    size: 130,
    minSize: 100,
    meta: { label: 'Desk' },
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Signal',
    size: 120,
    minSize: 100,
    meta: {
      label: 'Signal',
      cellTone: (context) => statusTone(context.getValue<SimulationStatus>())
    },
    enablePinning: true,
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'price',
    header: 'Last',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Last',
      align: 'end',
      cellTone: (context) => numberTone(context.row.original.changePercent)
    },
    enablePinning: true,
    cell: (info) => formatCurrency(info.getValue<number>())
  },
  {
    accessorKey: 'change',
    header: 'Chg $',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg $',
      align: 'end',
      cellTone: (context) => (context.row.original.status === 'Halted' ? 'warning' : numberTone(context.getValue<number>()))
    },
    enablePinning: true,
    cell: (info) => formatSignedCurrency(info.getValue<number>())
  },
  {
    accessorKey: 'changePercent',
    header: 'Chg %',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg %',
      align: 'end',
      cellTone: (context) => (context.row.original.status === 'Halted' ? 'warning' : numberTone(context.getValue<number>()))
    },
    enablePinning: true,
    cell: (info) => formatSignedPercent(info.getValue<number>())
  },
  {
    id: 'spark',
    header: 'Trend',
    size: 104,
    minSize: 90,
    meta: { label: 'Trend' },
    enableSorting: false,
    enableGlobalFilter: false,
    enablePinning: false,
    cell: (info) =>
      flexRenderComponent(NatSparkline, {
        inputs: {
          points: info.row.original.priceHistory,
          trend: info.row.original.sparkTrend
        }
      })
  },
  {
    accessorKey: 'volume',
    header: 'Volume',
    size: 130,
    minSize: 100,
    meta: { label: 'Volume', align: 'end' },
    enablePinning: true,
    cell: (info) => formatCompact(info.getValue<number>())
  },
  {
    accessorKey: 'turnoverMillions',
    header: 'Turnover',
    size: 130,
    minSize: 100,
    meta: { label: 'Turnover', align: 'end' },
    cell: (info) => `${formatCurrency(info.getValue<number>())}M`
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    size: 130,
    minSize: 100,
    meta: { label: 'Updated', align: 'end' },
    enablePinning: true,
    cell: (info) => formatTime(info.getValue<number>())
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 92,
    minSize: 84,
    meta: { label: 'Actions', align: 'end' },
    enableSorting: false,
    enableGlobalFilter: false,
    enablePinning: false,
    enableHiding: false,
    cell: (info) =>
      flexRenderComponent(NatRowActionsMenu, {
        inputs: {
          symbol: info.row.original.symbol
        }
      })
  }
];

const showcaseAccessibilityText = {
  emptyState: 'No instruments match the current filters. Clear the search query or signal chips to repopulate the tape.'
};

@Component({
  selector: 'app-market-sort-indicator',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      --msi-accent: var(--accent, currentColor);
      --msi-idle: color-mix(in srgb, currentColor 55%, transparent);
      --msi-muted: color-mix(in srgb, currentColor 22%, transparent);
      --msi-hover: color-mix(in srgb, currentColor 85%, transparent);
      --msi-rail-bg: transparent;
      --msi-rail-bg-hover: color-mix(in srgb, currentColor 10%, transparent);
      --msi-rail-bg-active: color-mix(in srgb, var(--msi-accent) 16%, transparent);
      --msi-rail-ring-active: color-mix(in srgb, var(--msi-accent) 34%, transparent);
    }

    .market-sort-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.1rem;
      block-size: 1.1rem;
      padding: 2px;
      border-radius: 6px;
      background: var(--msi-rail-bg);
      transition:
        background-color 140ms ease,
        box-shadow 140ms ease;
    }

    .sort-stack {
      display: block;
      inline-size: 0.65rem;
      block-size: 0.85rem;
      overflow: visible;
    }

    .sort-chevron {
      transform-origin: center;
      transition:
        fill 140ms ease,
        opacity 140ms ease,
        transform 160ms ease;
    }

    .sort-chevron--up,
    .sort-chevron--down {
      fill: var(--msi-idle);
    }

    :host-context(.sort-button:hover) .market-sort-indicator {
      background: var(--msi-rail-bg-hover);
    }

    :host-context(.sort-button:hover) .market-sort-indicator[data-sort-state='none'] .sort-chevron {
      fill: var(--msi-hover);
    }

    .market-sort-indicator[data-sort-state='asc'],
    .market-sort-indicator[data-sort-state='desc'] {
      background: var(--msi-rail-bg-active);
      box-shadow: inset 0 0 0 1px var(--msi-rail-ring-active);
    }

    .market-sort-indicator[data-sort-state='asc'] .sort-chevron--up,
    .market-sort-indicator[data-sort-state='desc'] .sort-chevron--down {
      fill: var(--msi-accent);
      transform: scale(1.08);
    }

    .market-sort-indicator[data-sort-state='asc'] .sort-chevron--down,
    .market-sort-indicator[data-sort-state='desc'] .sort-chevron--up {
      fill: var(--msi-muted);
      opacity: 0.65;
    }
  `,
  template: `
    <span [attr.data-sort-state]="context().sortState || 'none'" class="market-sort-indicator">
      <svg aria-hidden="true" class="sort-stack" viewBox="0 0 12 16">
        <path class="sort-chevron sort-chevron--up" d="M6 2 10 6 H2z" />
        <path class="sort-chevron sort-chevron--down" d="M6 14 2 10 H10z" />
      </svg>
    </span>
  `
})
class MarketSortIndicator {
  public readonly context = input.required<NatTableSortIndicatorContext>();
}

@Component({
  selector: 'app-table-showcase-page',
  imports: [
    NatTable,
    NatTablePagination,
    NatTableScrollControl,
    TableSearch,
    NatTableSurface,
    NatTableToolbar,
    NatRenderMetricsFilter,
    NatRenderMetricsPanel
  ],
  templateUrl: './table-showcase-page.html',
  styleUrl: './table-showcase-page.css'
})
export class TableShowcasePage {
  private readonly themeStore = inject(ShowcaseThemeStore);

  protected readonly simulation = inject(TableSimulation);
  protected readonly datasetOptions = DATASET_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly statuses = SIMULATION_STATUSES;
  protected readonly metricsStore = new NatTableRenderMetricsStore();
  private readonly renderMetricsTable = viewChild<NatTable<SimulationRow>>('renderMetricsTable');
  protected readonly renderMetricsController = computed<NatTableRenderMetricsController<SimulationRow> | undefined>(() =>
    this.renderMetricsTable()
  );

  protected readonly columns = withNatTableHeaderActions(withRenderMetricsColumn(simulationColumns, this.metricsStore), {
    enableColumnReorderActions: true,
    sortIndicator: (context) =>
      flexRenderComponent(MarketSortIndicator, {
        inputs: { context }
      })
  });

  protected readonly getRowId = getSimulationRowId;
  protected readonly accessibilityText = showcaseAccessibilityText;
  protected readonly theme = this.themeStore.theme;
  public readonly tableState = signal<Partial<NatTableState>>({
    columnFilters: []
  });

  protected readonly selectedStatuses = computed(() => {
    const activeFilter = this.tableState().columnFilters?.find((entry) => entry.id === STATUS_FILTER_ID);

    return Array.isArray(activeFilter?.value) ? (activeFilter.value as SimulationStatus[]) : [];
  });

  protected readonly activeStatuses = computed(() => new Set(this.selectedStatuses()));
  protected readonly profiles = Object.entries(SIMULATION_PROFILES).map(([value, config]) => ({
    value: value as SimulationProfile,
    ...config
  }));

  protected readonly lastTickLabel = computed(() => formatTime(this.simulation.lastTickAt()));

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

    this.updateColumnFilter(STATUS_FILTER_ID, nextStatuses.length === this.statuses.length ? null : [...nextStatuses]);
  }

  protected isStatusActive(status: SimulationStatus): boolean {
    const selectedStatuses = this.activeStatuses();

    return selectedStatuses.size === 0 || selectedStatuses.has(status);
  }

  protected onRowRendered(event: NatTableRenderMetricsEvent): void {
    this.metricsStore.record(event);
  }

  protected readonly formatInteger = formatInteger;
  protected readonly formatCompact = formatCompact;
  protected readonly formatCurrency = formatCurrency;
  protected readonly formatSignedPercent = formatSignedPercent;
  protected readonly formatTime = formatTime;

  private updateColumnFilter(columnId: string, value: unknown | null): void {
    this.tableState.update((currentState) => ({
      columnFilters: upsertColumnFilter(currentState.columnFilters ?? [], columnId, value)
    }));
  }
}
