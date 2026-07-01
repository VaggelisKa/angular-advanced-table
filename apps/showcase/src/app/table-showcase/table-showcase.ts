import { Component, computed, inject, signal, viewChild } from '@angular/core';

import { flexRenderComponent } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';
import type { NatTableUserState } from 'ng-advanced-table';
import {
  NatTablePagination,
  NatTableScrollControl,
  NatTableSurface,
  NatTableToolbar,
  withNatTableHeaderActions
} from 'ng-advanced-table/components';
import {
  NatRenderMetricsFilter,
  NatRenderMetricsPanel,
  NatTableRenderMetricsStore,
  withRenderMetricsColumn
} from 'ng-advanced-table/render-metrics';
import type { NatTableRenderMetricsController, NatTableRenderMetricsEvent } from 'ng-advanced-table/render-metrics';

import { DATASET_OPTIONS, PAGE_SIZE_OPTIONS, SIMULATION_PROFILES, SIMULATION_STATUSES } from './common';
import type { SimulationProfile, SimulationRow, SimulationStatus } from './common';
import { TableSimulation } from './data-access';
import { STATUS_FILTER_ID, showcaseAccessibilityText, simulationColumns } from './table-showcase.columns';
import { MarketSortIndicator } from './ui';
import { formatCompact, formatCurrency, formatInteger, formatSignedPercent, formatTime, upsertColumnFilter } from './utils';
import { TableSearch } from '../ui/table-search/table-search';

@Component({
  selector: 'app-table-showcase',
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
  templateUrl: './table-showcase.html',
  styleUrl: './table-showcase.css'
})
export class TableShowcase {
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

  protected readonly accessibilityText = showcaseAccessibilityText;
  public readonly tableState = signal<Partial<NatTableUserState>>({
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
