import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import {
  formatNatTableUtilsNumber,
  mergeRenderMetricsPanelIntl,
  NAT_TABLE_UTILS_INTL,
  NAT_TABLE_UTILS_ENGLISH_LOCALE,
  resolveNatTableUtilsIntl,
  type NatTableRenderMetricsPanelIntl,
} from './intl';
import type { NatTableRenderMetricsStore } from './store';
import { getRowRenderTone } from './tone';

type RenderHealthTone = 'idle' | 'fast' | 'watch' | 'slow';

interface RenderHealthState {
  label: string;
  tone: RenderHealthTone;
}

/**
 * Compact KPI panel that summarizes the latest render measurement collected by
 * {@link NatTableRenderMetricsStore}.
 */
@Component({
  selector: 'nat-render-metrics-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class NatRenderMetricsPanel {
  /** Shared store. */
  readonly store = input.required<NatTableRenderMetricsStore>();
  /** Locale id override for generated render-metrics labels. */
  readonly locale = input<string | undefined>(undefined);
  /** Per-instance label overrides. */
  readonly labels = input<NatTableRenderMetricsPanelIntl | undefined>(undefined);

  private readonly utilsIntlConfig = inject(NAT_TABLE_UTILS_INTL);
  private readonly localeId = computed(() => this.locale() ?? NAT_TABLE_UTILS_ENGLISH_LOCALE);
  private readonly utilsIntl = computed(() =>
    resolveNatTableUtilsIntl(this.utilsIntlConfig, this.localeId()),
  );
  private readonly resolvedLabels = computed(() =>
    mergeRenderMetricsPanelIntl(this.utilsIntl().renderMetrics?.panel, this.labels()),
  );

  protected readonly measurement = computed(() => this.store().measurement());
  protected readonly ariaLabel = computed(() => this.resolvedLabels().ariaLabel ?? '');

  protected readonly health = computed<RenderHealthState>(() => {
    const measurement = this.measurement();
    const labels = this.resolvedLabels();

    if (!measurement || !measurement.rowCount) {
      return { label: labels.toneLabel?.('idle') ?? '', tone: 'idle' };
    }

    const tone = getRowRenderTone(measurement.durationMs);

    return { label: labels.toneLabel?.(tone) ?? '', tone };
  });

  protected readonly compactSummary = computed(() => {
    const measurement = this.measurement();
    const labels = this.resolvedLabels();

    if (!measurement || !measurement.rowCount) {
      return labels.idleSummary ?? '';
    }

    const rowCountText = formatNatTableUtilsNumber(
      this.utilsIntl(),
      measurement.rowCount,
      undefined,
      this.localeId(),
    );

    return (
      labels.rowSampleSummary?.({
        rowCountValue: measurement.rowCount,
        rowCountText,
      }) ?? ''
    );
  });

  protected formatDurationMs(value: number): string {
    const labels = this.resolvedLabels();
    const durationMsText = formatNatTableUtilsNumber(
      this.utilsIntl(),
      value,
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      },
      this.localeId(),
    );

    return (
      labels.duration?.({
        durationMsValue: value,
        durationMsText,
      }) ?? ''
    );
  }
}
