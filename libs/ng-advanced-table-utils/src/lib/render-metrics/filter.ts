import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { ColumnFiltersState } from '@tanstack/angular-table';

import type { NatTableRenderMetricsController } from './contracts';
import {
  formatNatTableUtilsNumber,
  mergeRenderMetricsFilterIntl,
  NAT_TABLE_UTILS_INTL,
  type NatTableRenderMetricsFilterIntl,
} from './intl';
import type { NatTableRenderMetricsStore } from './store';
import { isRenderFilterValue } from './tone';
import { RENDER_FILTER_OPTIONS, RENDER_METRIC_COLUMN_ID, type RowRenderFilterValue } from './types';

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
  readonly for = input.required<NatTableRenderMetricsController<TData>>();
  /** Shared store — used only so the panel/filter can react to measurement changes. */
  readonly store = input.required<NatTableRenderMetricsStore>();
  /** Column id to target when the metrics column uses a custom identifier. */
  readonly columnId = input(RENDER_METRIC_COLUMN_ID);
  /** Per-instance label overrides. */
  readonly labels = input<NatTableRenderMetricsFilterIntl | undefined>(undefined);

  private readonly utilsIntl = inject(NAT_TABLE_UTILS_INTL);
  private readonly resolvedLabels = computed(() =>
    mergeRenderMetricsFilterIntl(this.utilsIntl.renderMetrics?.filter, this.labels()),
  );

  protected readonly heading = computed(() => this.resolvedLabels().heading ?? 'Render speed');
  protected readonly groupAriaLabel = computed(
    () => this.resolvedLabels().groupAriaLabel ?? 'Row render speed',
  );
  protected readonly options = computed(
    () => this.resolvedLabels().options ?? RENDER_FILTER_OPTIONS,
  );

  protected readonly selected = computed<RowRenderFilterValue>(() => {
    const columnId = this.columnId();
    const filters = (this.for().table.getState().columnFilters ?? []) as ColumnFiltersState;
    const activeFilter = filters.find((entry) => entry.id === columnId);

    return isRenderFilterValue(activeFilter?.value) ? activeFilter.value : 'all';
  });

  protected readonly caption = computed(() => {
    const measurement = this.store().measurement();
    const labels = this.resolvedLabels();

    if (!measurement || !measurement.rowCount) {
      return labels.idleCaption ?? 'Captures the latest row paint time for the current page.';
    }

    const rowCountText = formatNatTableUtilsNumber(this.utilsIntl, measurement.rowCount);

    return (
      labels.rowSampleCaption?.({
        rowCountValue: measurement.rowCount,
        rowCountText,
      }) ?? `${rowCountText} visible ${measurement.rowCount === 1 ? 'row' : 'rows'} sampled`
    );
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
