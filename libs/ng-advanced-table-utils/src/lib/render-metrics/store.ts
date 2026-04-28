import { computed, signal, type Signal } from '@angular/core';

import type { NatTableRenderMetricsEvent } from './contracts';
import { getRowRenderTone, roundToSingleDecimal } from './tone';
import type { RowRenderMeasurement, RowRenderMetric } from './types';

interface StoreState {
  currentToken: number;
  cycleMetrics: Record<string, RowRenderMetric>;
  rowMetrics: Record<string, RowRenderMetric>;
}

const INITIAL_STATE: StoreState = {
  currentToken: 0,
  cycleMetrics: {},
  rowMetrics: {},
};

/**
 * Holds per-row render timings plus a rolling aggregate for the most recent
 * render cycle. A single store instance is shared between
 * `<nat-table>` (which feeds it via `(rowRendered)`), the metrics column
 * factory, and the panel / filter companion components.
 */
export class NatTableRenderMetricsStore {
  private readonly state = signal<StoreState>(INITIAL_STATE);

  /** Latest known metric for each row keyed by row id. */
  readonly rowMetrics: Signal<Record<string, RowRenderMetric>> = computed(
    () => this.state().rowMetrics,
  );

  /**
   * Aggregate measurement for the latest completed render cycle on the current
   * page, or `null` when no samples have been recorded yet.
   */
  readonly measurement: Signal<RowRenderMeasurement | null> = computed(() => {
    const cycleMetrics = this.state().cycleMetrics;
    const durations = Object.values(cycleMetrics)
      .map((metric) => metric.durationMs)
      .filter((duration) => duration > 0);

    if (!durations.length) {
      return null;
    }

    const totalDurationMs = Math.max(...durations);
    const averageRowDurationMs = roundToSingleDecimal(
      durations.reduce((total, duration) => total + duration, 0) / durations.length,
    );
    const rowCount = durations.length;

    return {
      durationMs: roundToSingleDecimal(totalDurationMs),
      averageRowDurationMs,
      rowCount,
      rowsPerSecond:
        totalDurationMs > 0 ? Math.round((rowCount * 1000) / totalDurationMs) : 0,
    };
  });

  /**
   * Records a row render timing emitted by `<nat-table>`.
   *
   * @param event Row-level render event payload from the table.
   */
  record(event: NatTableRenderMetricsEvent): void {
    const metric: RowRenderMetric = {
      durationMs: event.durationMs,
      measuredAt: Date.now(),
      tone: getRowRenderTone(event.durationMs),
    };

    this.state.update((current) => {
      const nextRowMetrics: Record<string, RowRenderMetric> = {
        ...current.rowMetrics,
        [event.rowId]: metric,
      };

      if (event.renderToken !== current.currentToken) {
        return {
          currentToken: event.renderToken,
          cycleMetrics: { [event.rowId]: metric },
          rowMetrics: nextRowMetrics,
        };
      }

      return {
        currentToken: current.currentToken,
        cycleMetrics: { ...current.cycleMetrics, [event.rowId]: metric },
        rowMetrics: nextRowMetrics,
      };
    });
  }

  /**
   * Returns the latest metric captured for a specific row.
   *
   * @param rowId Stable row identifier.
   */
  rowMetric(rowId: string): RowRenderMetric | undefined {
    return this.state().rowMetrics[rowId];
  }

  /** Clears all recorded row and cycle measurements. */
  reset(): void {
    this.state.set(INITIAL_STATE);
  }
}
