import { Component, computed, inject, input } from '@angular/core';

import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_RENDER_METRICS_INTL,
  RENDER_METRICS_FILTER_OPTIONS,
  formatNatTableRenderMetricsNumber,
  mergeRenderMetricsFilterIntl,
  resolveNatTableRenderMetricsIntl
} from 'ng-advanced-table/locale';
import type { NatTableRenderMetricsFilterIntl } from 'ng-advanced-table/locale';

import type { NatTableRenderMetricsController } from '../../common/contracts.type';
import { RENDER_METRIC_COLUMN_ID } from '../../common/type';
import type { RowRenderFilterValue } from '../../common/type';
import type { NatTableRenderMetricsStore } from '../../utils/store';
import { isRenderFilterValue } from '../../utils/tone';

/**
 * Filter chip group that drives the synthetic render-metrics column created by
 * {@link withRenderMetricsColumn}.
 */
@Component({
  selector: 'nat-render-metrics-filter',
  templateUrl: './filter.html',
  styleUrl: './filter.css'
})
export class NatRenderMetricsFilter<TData = unknown> {
  /** Shared store — used only so the panel/filter can react to measurement changes. */
  public readonly store = input.required<NatTableRenderMetricsStore>();
  /** Controlled table controller. Pass the `NatTable` instance or a structural controller. */
  public readonly controller = input<NatTableRenderMetricsController<TData> | null | undefined>(undefined);
  /** Column id to target when the metrics column uses a custom identifier. */
  public readonly columnId = input(RENDER_METRIC_COLUMN_ID);
  /** Locale id override for generated render-metrics labels. Defaults to the controlled table locale. */
  public readonly locale = input<string | undefined>(undefined);
  /** Per-instance label overrides. */
  public readonly labels = input<NatTableRenderMetricsFilterIntl | undefined>(undefined);

  private readonly utilsIntlConfig = inject(NAT_TABLE_RENDER_METRICS_INTL);
  private readonly localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID);

  private readonly utilsIntl = computed(() => resolveNatTableRenderMetricsIntl(this.utilsIntlConfig, this.localeId()));

  private readonly resolvedLabels = computed(() =>
    mergeRenderMetricsFilterIntl(this.utilsIntl().renderMetrics?.filter, this.labels())
  );

  protected readonly heading = computed(() => this.resolvedLabels().heading ?? '');
  protected readonly groupAriaLabel = computed(() => this.resolvedLabels().groupAriaLabel ?? '');
  protected readonly options = computed(() => this.resolvedLabels().options ?? RENDER_METRICS_FILTER_OPTIONS);

  protected readonly selected = computed<RowRenderFilterValue>(() => {
    const controller = this.controller();

    if (!controller) {
      return 'all';
    }
    const columnId = this.columnId();
    const filters = controller.columnFilters();
    const activeFilter = filters.find((entry) => entry.id === columnId);

    return isRenderFilterValue(activeFilter?.value) ? activeFilter.value : 'all';
  });

  protected readonly caption = computed(() => {
    const measurement = this.store().measurement();
    const labels = this.resolvedLabels();

    if (!measurement?.rowCount) {
      return labels.idleCaption ?? '';
    }

    const rowCountText = formatNatTableRenderMetricsNumber(this.utilsIntl(), measurement.rowCount, undefined, this.localeId());

    return (
      labels.rowSampleCaption?.({
        rowCountValue: measurement.rowCount,
        rowCountText
      }) ?? ''
    );
  });

  protected setFilter(value: RowRenderFilterValue): void {
    const controller = this.controller();

    if (!controller) {
      return;
    }
    const columnId = this.columnId();
    const nextValue: unknown = value === 'all' ? undefined : value;

    controller.setColumnFilter(columnId, nextValue);
  }
}
