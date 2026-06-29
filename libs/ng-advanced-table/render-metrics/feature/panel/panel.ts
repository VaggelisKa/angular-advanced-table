import { Component, computed, inject, input } from '@angular/core';

import {
  NAT_EN_LOCALE_ID,
  NAT_TABLE_RENDER_METRICS_INTL,
  formatNatTableRenderMetricsNumber,
  mergeRenderMetricsPanelIntl,
  resolveNatTableRenderMetricsIntl
} from 'ng-advanced-table/locale';
import type { NatTableRenderMetricsPanelIntl } from 'ng-advanced-table/locale';

import type { NatTableRenderMetricsController } from '../../common/contracts.type';
import type { NatTableRenderMetricsStore } from '../../utils/store';
import { getRowRenderTone } from '../../utils/tone';

type RenderHealthTone = 'idle' | 'fast' | 'watch' | 'slow';

type RenderHealthState = {
  readonly label: string;
  readonly tone: RenderHealthTone;
};

/**
 * Compact KPI panel that summarizes the latest render measurement collected by
 * {@link NatTableRenderMetricsStore}.
 */
@Component({
  selector: 'nat-render-metrics-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class NatRenderMetricsPanel<TData = unknown> {
  /** Shared store. */
  public readonly store = input.required<NatTableRenderMetricsStore>();
  /** Controlled table controller. Used to inherit the table locale when provided. */
  public readonly controller = input<NatTableRenderMetricsController<TData> | null | undefined>(undefined);
  /** Locale id override for generated render-metrics labels. */
  public readonly locale = input<string | undefined>(undefined);
  /** Per-instance label overrides. */
  public readonly labels = input<NatTableRenderMetricsPanelIntl | undefined>(undefined);

  private readonly utilsIntlConfig = inject(NAT_TABLE_RENDER_METRICS_INTL);
  private readonly tableLocaleId = computed(() => this.controller()?.localeId?.());
  private readonly localeId = computed(() => this.locale() ?? this.tableLocaleId() ?? NAT_EN_LOCALE_ID);
  private readonly utilsIntl = computed(() => resolveNatTableRenderMetricsIntl(this.utilsIntlConfig, this.localeId()));

  private readonly resolvedLabels = computed(() => mergeRenderMetricsPanelIntl(this.utilsIntl().renderMetrics?.panel, this.labels()));

  protected readonly measurement = computed(() => this.store().measurement());
  protected readonly ariaLabel = computed(() => this.resolvedLabels().ariaLabel ?? '');

  protected readonly health = computed<RenderHealthState>(() => {
    const measurement = this.measurement();
    const labels = this.resolvedLabels();

    if (!measurement?.rowCount) {
      return { label: labels.toneLabel?.('idle') ?? '', tone: 'idle' };
    }

    const tone = getRowRenderTone(measurement.durationMs);

    return { label: labels.toneLabel?.(tone) ?? '', tone };
  });

  protected readonly compactSummary = computed(() => {
    const measurement = this.measurement();
    const labels = this.resolvedLabels();

    if (!measurement?.rowCount) {
      return labels.idleSummary ?? '';
    }

    const rowCountText = formatNatTableRenderMetricsNumber(this.utilsIntl(), measurement.rowCount, undefined, this.localeId());

    return (
      labels.rowSampleSummary?.({
        rowCountValue: measurement.rowCount,
        rowCountText
      }) ?? ''
    );
  });

  protected formatDurationMs(value: number): string {
    const labels = this.resolvedLabels();
    const durationMsText = formatNatTableRenderMetricsNumber(
      this.utilsIntl(),
      value,
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      },
      this.localeId()
    );

    return (
      labels.duration?.({
        durationMsValue: value,
        durationMsText
      }) ?? ''
    );
  }
}
