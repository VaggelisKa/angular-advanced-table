import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ColumnFiltersState } from '@tanstack/angular-table';
import { NatTable } from 'ng-advanced-table';

import type { NatTableRenderMetricsStore } from './store';
import { isRenderFilterValue } from './tone';
import {
  RENDER_FILTER_OPTIONS,
  RENDER_METRIC_COLUMN_ID,
  type RowRenderFilterValue,
} from './types';

/**
 * Filter chip group that drives the synthetic render-metrics column created by
 * {@link withRenderMetricsColumn}.
 */
@Component({
  selector: 'nat-render-metrics-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter.html',
  styleUrl: './filter.css',
})
export class NatRenderMetricsFilter<TData = unknown> {
  /** The `<nat-table>` instance this filter drives. */
  readonly for = input.required<NatTable<TData>>();
  /** Shared store — used only so the panel/filter can react to measurement changes. */
  readonly store = input.required<NatTableRenderMetricsStore>();
  /** Column id to target when the metrics column uses a custom identifier. */
  readonly columnId = input(RENDER_METRIC_COLUMN_ID);

  protected readonly options = RENDER_FILTER_OPTIONS;

  protected readonly selected = computed<RowRenderFilterValue>(() => {
    const columnId = this.columnId();
    const filters = (this.for().table.getState().columnFilters ?? []) as ColumnFiltersState;
    const activeFilter = filters.find((entry) => entry.id === columnId);

    return isRenderFilterValue(activeFilter?.value) ? activeFilter.value : 'all';
  });

  protected readonly caption = computed(() => {
    const measurement = this.store().measurement();

    if (!measurement || !measurement.rowCount) {
      return 'Captures the latest row paint time for the current page.';
    }

    const rowLabel = measurement.rowCount === 1 ? 'row' : 'rows';

    return `${Intl.NumberFormat('en-US').format(measurement.rowCount)} visible ${rowLabel} sampled`;
  });

  protected setFilter(value: RowRenderFilterValue): void {
    const columnId = this.columnId();
    const nextValue: unknown = value === 'all' ? null : value;

    this.for().patchState({
      columnFilters: (currentFilters) => upsertColumnFilter(currentFilters, columnId, nextValue),
      pagination: (currentPagination) => ({ ...currentPagination, pageIndex: 0 }),
    });
  }
}

function upsertColumnFilter(
  currentFilters: ColumnFiltersState,
  columnId: string,
  value: unknown | null,
): ColumnFiltersState {
  const nextFilters = currentFilters.filter((filter) => filter.id !== columnId);

  if (value === null) {
    return nextFilters;
  }

  return [...nextFilters, { id: columnId, value }];
}
