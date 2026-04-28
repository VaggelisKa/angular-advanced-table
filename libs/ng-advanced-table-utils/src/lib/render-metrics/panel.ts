import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { NatTableRenderMetricsStore } from './store';
import { getRenderToneLabel, getRowRenderTone } from './tone';

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

  protected readonly decimalFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  protected readonly integerFormatter = new Intl.NumberFormat('en-US');

  protected readonly measurement = computed(() => this.store().measurement());

  protected readonly health = computed<RenderHealthState>(() => {
    const measurement = this.measurement();

    if (!measurement || !measurement.rowCount) {
      return { label: 'Idle', tone: 'idle' };
    }

    const tone = getRowRenderTone(measurement.durationMs);

    return { label: getRenderToneLabel(tone), tone };
  });

  protected readonly compactSummary = computed(() => {
    const measurement = this.measurement();

    if (!measurement || !measurement.rowCount) {
      return 'idle';
    }

    const rowLabel = measurement.rowCount === 1 ? 'row' : 'rows';

    return `${this.integerFormatter.format(measurement.rowCount)} ${rowLabel} sampled`;
  });

  protected formatDurationMs(value: number): string {
    return `${this.decimalFormatter.format(value)} ms`;
  }
}
