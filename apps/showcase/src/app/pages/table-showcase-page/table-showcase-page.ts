import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import {
  flexRenderComponent,
  type ColumnDef,
  type FilterFn,
  type Row,
} from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import {
  NatTableColumnVisibility,
  NatTablePageSize,
  NatTablePager,
  NatTableSearch,
  NatTableSurface,
  type NatTableSortIndicatorContext,
  withNatTableHeaderActions,
} from 'ng-advanced-table-ui';
import {
  NatRenderMetricsFilter,
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  type NatTableRenderMetricsEvent,
  withRenderMetricsColumn,
} from 'ng-advanced-table-utils';

import { NatSparkline } from './nat-sparkline';
import { NatTickerMark } from './nat-ticker-mark';
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
import { NatRowActionsMenu } from './nat-row-actions-menu';

const STATUS_FILTER_ID = 'status';
const THEME_STORAGE_KEY = 'nat-showcase-theme';

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

@Component({
  selector: 'app-market-row-expand-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (row().getCanExpand()) {
      <button
        type="button"
        class="row-expand-trigger"
        [attr.aria-expanded]="row().getIsExpanded()"
        [attr.aria-label]="toggleLabel()"
        (click)="toggleRow()"
      >
        <span class="row-expand-trigger__chevron" aria-hidden="true"></span>
        <span class="row-expand-trigger__label">
          {{ row().getIsExpanded() ? 'Hide' : 'Brief' }}
        </span>
      </button>
    } @else {
      <span class="row-expand-empty" aria-hidden="true">-</span>
    }
  `,
})
class MarketRowExpandToggle {
  readonly row = input.required<Row<SimulationRow>>();

  protected toggleRow(): void {
    this.row().toggleExpanded();
  }

  protected toggleLabel(): string {
    return this.row().getIsExpanded()
      ? `Collapse trade brief for ${this.row().original.symbol}`
      : `Expand trade brief for ${this.row().original.symbol}`;
  }
}

const simulationColumns: ColumnDef<SimulationRow, unknown>[] = [
  {
    accessorKey: 'symbol',
    header: 'Symbol',
    size: 120,
    minSize: 100,
    meta: { label: 'Symbol', rowHeader: true },
    enablePinning: true,
    sortingFn: (left, right) =>
      compareSortKeys(left.original.symbolSortKey, right.original.symbolSortKey),
    cell: (info) =>
      flexRenderComponent(NatTickerMark, {
        inputs: { symbol: info.getValue<string>() },
      }),
  },
  {
    accessorKey: 'company',
    header: 'Company',
    size: 220,
    minSize: 180,
    meta: { label: 'Company' },
    enablePinning: true,
    sortingFn: (left, right) =>
      compareSortKeys(left.original.companySortKey, right.original.companySortKey),
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'exchange',
    header: 'Exchange',
    size: 120,
    minSize: 100,
    meta: { label: 'Exchange' },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'desk',
    header: 'Desk',
    size: 130,
    minSize: 100,
    meta: { label: 'Desk' },
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
    id: 'brief',
    header: 'Brief',
    size: 104,
    minSize: 92,
    meta: { label: 'Brief' },
    enableSorting: false,
    enableGlobalFilter: false,
    enablePinning: false,
    enableHiding: false,
    cell: (info) =>
      flexRenderComponent(MarketRowExpandToggle, {
        inputs: {
          row: info.row,
        },
      }),
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
    header: 'Chg $',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg $',
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
    header: 'Chg %',
    size: 110,
    minSize: 90,
    meta: {
      label: 'Chg %',
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
          trend: info.row.original.sparkTrend,
        },
      }),
  },
  {
    accessorKey: 'volume',
    header: 'Volume',
    size: 130,
    minSize: 100,
    meta: { label: 'Volume', align: 'end' },
    enablePinning: true,
    cell: (info) => compactFormatter.format(info.getValue<number>()),
  },
  {
    accessorKey: 'turnoverMillions',
    header: 'Turnover',
    size: 130,
    minSize: 100,
    meta: { label: 'Turnover', align: 'end' },
    cell: (info) => `${currencyFormatter.format(info.getValue<number>())}M`,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    size: 130,
    minSize: 100,
    meta: { label: 'Updated', align: 'end' },
    enablePinning: true,
    cell: (info) => timeFormatter.format(info.getValue<number>()),
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
          symbol: info.row.original.symbol,
        },
      }),
  },
];

type ShowcaseTheme = 'light' | 'dark';
type TableFeatureKey =
  | 'allowColumnPinning'
  | 'allowColumnReorder'
  | 'enablePagination'
  | 'enableGlobalFilter'
  | 'showColumnVisibility'
  | 'showRenderMetrics';

interface TableFeatureConfig {
  allowColumnPinning: boolean;
  allowColumnReorder: boolean;
  enablePagination: boolean;
  enableGlobalFilter: boolean;
  showColumnVisibility: boolean;
  showRenderMetrics: boolean;
}

const defaultTableFeatures: TableFeatureConfig = {
  allowColumnPinning: true,
  allowColumnReorder: true,
  enablePagination: true,
  enableGlobalFilter: true,
  showColumnVisibility: true,
  showRenderMetrics: true,
};

@Component({
  selector: 'app-market-sort-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    <span class="market-sort-indicator" [attr.data-sort-state]="context().sortState || 'none'">
      <svg class="sort-stack" viewBox="0 0 12 16" aria-hidden="true">
        <path class="sort-chevron sort-chevron--up" d="M6 2 10 6 H2z" />
        <path class="sort-chevron sort-chevron--down" d="M6 14 2 10 H10z" />
      </svg>
    </span>
  `,
})
class MarketSortIndicator {
  readonly context = input.required<NatTableSortIndicatorContext>();
}

@Component({
  selector: 'app-table-showcase-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NatTable,
    NatTableColumnVisibility,
    NatTablePageSize,
    NatTablePager,
    NatTableSearch,
    NatTableSurface,
    NatRenderMetricsFilter,
    NatRenderMetricsPanel,
  ],
  templateUrl: './table-showcase-page.html',
  styleUrl: './table-showcase-page.css',
})
export class TableShowcasePage {
  private readonly dialog = inject(Dialog);
  private readonly featureDialogTemplate =
    viewChild.required<TemplateRef<unknown>>('featureDialog');

  protected readonly simulation = inject(TableSimulation);
  protected readonly datasetOptions = DATASET_OPTIONS;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly statuses = SIMULATION_STATUSES;
  protected readonly metricsStore = new NatTableRenderMetricsStore();
  protected readonly columns = withNatTableHeaderActions(
    withRenderMetricsColumn(simulationColumns, this.metricsStore),
    {
      sortIndicator: (context) =>
        flexRenderComponent(MarketSortIndicator, {
          inputs: { context },
        }),
    },
  );
  protected readonly getRowId = (row: SimulationRow) => row.id;
  protected readonly canExpandRow = isTradeBriefRow;
  protected readonly theme = signal<ShowcaseTheme>(readInitialTheme());
  protected readonly tableFeatures = signal<TableFeatureConfig>(defaultTableFeatures);
  protected readonly hasTopTableControls = computed(() => {
    const features = this.tableFeatures();
    return features.enableGlobalFilter || features.showColumnVisibility;
  });
  protected readonly hasTablePaginationControls = computed(
    () => this.tableFeatures().enablePagination,
  );
  protected readonly tableState = signal<Partial<NatTableState>>({
    columnFilters: [],
  });
  protected readonly selectedStatuses = computed(() => {
    const activeFilter = this.tableState().columnFilters?.find(
      (entry) => entry.id === STATUS_FILTER_ID,
    );

    return Array.isArray(activeFilter?.value) ? (activeFilter.value as SimulationStatus[]) : [];
  });
  protected readonly activeStatuses = computed(() => new Set(this.selectedStatuses()));
  protected readonly profiles = Object.entries(SIMULATION_PROFILES).map(([value, config]) => ({
    value: value as SimulationProfile,
    ...config,
  }));
  protected readonly lastTickLabel = computed(() =>
    timeFormatter.format(this.simulation.lastTickAt()),
  );

  protected setDatasetSize(size: number): void {
    this.simulation.setDatasetSize(size);
  }

  protected setProfile(profile: SimulationProfile): void {
    this.simulation.setProfile(profile);
  }

  protected setTheme(theme: ShowcaseTheme): void {
    this.theme.set(theme);
    persistTheme(theme);
  }

  protected toggleSimulation(): void {
    this.simulation.toggleRunning();
  }

  protected runManualPulse(): void {
    this.simulation.pulse();
  }

  private featureDialogRef: DialogRef<unknown, unknown> | null = null;

  protected openFeatureDialog(): void {
    if (this.featureDialogRef) {
      return;
    }

    this.featureDialogRef = this.dialog.open(this.featureDialogTemplate(), {
      ariaLabelledBy: 'feature-dialog-title',
      panelClass: ['feature-dialog-panel', `feature-dialog-panel--${this.theme()}`],
    });

    this.featureDialogRef.closed.subscribe(() => {
      this.featureDialogRef = null;
    });
  }

  protected closeFeatureDialog(): void {
    this.featureDialogRef?.close();
  }

  protected toggleFeature(key: TableFeatureKey, enabled: boolean): void {
    this.tableFeatures.update((current) => ({
      ...current,
      [key]: enabled,
    }));
  }

  protected readChecked(event: Event): boolean {
    const target = event.target;
    return target instanceof HTMLInputElement ? target.checked : false;
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
    const selectedStatuses = this.activeStatuses();

    return selectedStatuses.size === 0 || selectedStatuses.has(status);
  }

  protected onTableStateChange(state: NatTableState): void {
    this.tableState.update((currentState) => {
      const currentFilters = currentState.columnFilters ?? [];
      const nextFilters = state.columnFilters ?? [];

      if (areColumnFiltersEqual(currentFilters, nextFilters)) {
        return currentState;
      }

      return {
        columnFilters: nextFilters,
      };
    });
  }

  protected onRowRendered(event: NatTableRenderMetricsEvent): void {
    this.metricsStore.record(event);
  }

  protected formatInteger(value: number): string {
    return integerFormatter.format(value);
  }

  protected formatCompact(value: number): string {
    return compactFormatter.format(value);
  }

  protected formatCurrency(value: number): string {
    return currencyFormatter.format(value);
  }

  protected formatSignedPercent(value: number): string {
    return `${signedPercentFormatter.format(value)}%`;
  }

  protected formatTime(value: number): string {
    return timeFormatter.format(value);
  }

  protected describeTradeBrief(row: SimulationRow): SimulationTradeBrief {
    return buildTradeBrief(row);
  }

  private updateColumnFilter(columnId: string, value: unknown | null): void {
    this.tableState.update((currentState) => ({
      columnFilters: upsertColumnFilter(currentState.columnFilters ?? [], columnId, value),
    }));
  }
}

interface SimulationTradeBrief {
  label: string;
  tone: 'positive' | 'negative' | 'neutral' | 'warning';
  summary: string;
  catalyst: string;
  playbook: string;
  risk: string;
  tags: readonly string[];
}

function isTradeBriefRow(row: SimulationRow): boolean {
  if (row.status === 'Halted') {
    return true;
  }

  if (Math.abs(row.changePercent) < 4.5) {
    return false;
  }

  return row.desk === 'Momentum' || row.desk === 'Volatility';
}

function buildTradeBrief(row: SimulationRow): SimulationTradeBrief {
  if (row.status === 'Halted') {
    return {
      label: 'Halt watch',
      tone: 'warning',
      summary: `${row.symbol} is paused after an abrupt move, so the desk is focused on the reopen auction and the first clean liquidity pocket.`,
      catalyst: `Trading paused at ${timeFormatter.format(row.updatedAt)} after ${signedPercentFormatter.format(row.changePercent)}% versus the prior close on ${row.exchange}.`,
      playbook: `Wait for the first resume print, then only engage if ${row.desk} flow re-establishes above ${currencyFormatter.format(row.previousClose)} with stable spreads.`,
      risk: 'Gap reopens, headline-driven reversals, and thin prints can invalidate the first directional move.',
      tags: ['Halt reopen', row.exchange, row.desk],
    };
  }

  if (row.changePercent > 0) {
    return {
      label: 'Momentum continuation',
      tone: 'positive',
      summary: `${row.symbol} is printing a clean upside tape with volume confirmation, making it a candidate for continuation rather than a passive watch-only name.`,
      catalyst: `${currencyFormatter.format(row.turnoverMillions)}M of turnover and ${compactFormatter.format(row.volume)} shares traded while the signal remains ${row.status.toLowerCase()}.`,
      playbook: `Favor pullback entries near ${currencyFormatter.format(row.previousClose)} or the last higher-low sequence if ${row.desk} flow stays constructive.`,
      risk: 'A failed push after a sharp extension can flip into fast profit-taking, especially around the next volume stall.',
      tags: ['Upside continuation', row.exchange, row.desk],
    };
  }

  return {
    label: 'Washout alert',
    tone: 'negative',
    summary: `${row.symbol} is leaning lower with enough urgency to justify a concise desk brief instead of a simple row-level quote check.`,
    catalyst: `${signedPercentFormatter.format(row.changePercent)}% on the session with ${compactFormatter.format(row.volume)} shares crossed and the tape still marked ${row.status.toLowerCase()}.`,
    playbook: `Use ${currencyFormatter.format(row.previousClose)} as the decision level: failed reclaim keeps the short pressure in play, while a reclaim shifts the setup toward mean reversion.`,
    risk: 'Oversold bounces can be violent when sell programs exhaust, so entries need tighter invalidation than normal.',
    tags: ['Downside pressure', row.exchange, row.desk],
  };
}

function readInitialTheme(): ShowcaseTheme {
  try {
    const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Storage access can throw in private/sandboxed contexts; fall through to the media query.
  }

  const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  return media?.matches ? 'dark' : 'light';
}

function persistTheme(theme: ShowcaseTheme): void {
  try {
    globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore quota / privacy-mode failures.
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

function areColumnFiltersEqual(
  currentFilters: NonNullable<Partial<NatTableState>['columnFilters']>,
  nextFilters: NonNullable<Partial<NatTableState>['columnFilters']>,
): boolean {
  if (currentFilters.length !== nextFilters.length) {
    return false;
  }

  for (let index = 0; index < currentFilters.length; index += 1) {
    const currentFilter = currentFilters[index];
    const nextFilter = nextFilters[index];

    if (currentFilter.id !== nextFilter.id) {
      return false;
    }

    if (!areFilterValuesEqual(currentFilter.value, nextFilter.value)) {
      return false;
    }
  }

  return true;
}

function areFilterValuesEqual(currentValue: unknown, nextValue: unknown): boolean {
  if (Array.isArray(currentValue) && Array.isArray(nextValue)) {
    if (currentValue.length !== nextValue.length) {
      return false;
    }

    for (let index = 0; index < currentValue.length; index += 1) {
      if (!Object.is(currentValue[index], nextValue[index])) {
        return false;
      }
    }

    return true;
  }

  return Object.is(currentValue, nextValue);
}

function compareSortKeys(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
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

function statusTone(status: SimulationStatus): 'positive' | 'negative' | 'neutral' | 'warning' {
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
