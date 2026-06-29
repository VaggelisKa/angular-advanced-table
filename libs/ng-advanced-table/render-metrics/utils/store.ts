import { computed, signal } from '@angular/core';
import type { Signal } from '@angular/core';

import { getRowRenderTone, roundToSingleDecimal } from './tone';
import type { NatTableRenderMetricsEvent } from '../common/contracts.type';
import type { RowRenderMeasurement, RowRenderMetric, RowRenderMetrics } from '../common/type';

const DEFAULT_MAX_RETAINED_ROW_METRICS = 1000;
const EMPTY_ROW_METRIC_ORDER = Object.freeze([]) as readonly string[];

type StoreState = Readonly<{
  readonly currentToken: number;
  readonly cycleMetrics: RowRenderMetrics;
  readonly rowMetrics: RowRenderMetrics;
  readonly rowMetricOrder: readonly string[];
}>;

type RetainedRowMetrics = Readonly<{
  readonly rowMetrics: RowRenderMetrics;
  readonly rowMetricOrder: readonly string[];
}>;

/** Retention policy for row-level render metrics. */
type NatTableRenderMetricsStoreOptions = Readonly<{
  /**
   * Maximum row metrics retained across render cycles. Defaults to 1000.
   * Set to `Infinity` only when the table's row ids are known to be bounded.
   * Non-positive and non-finite values fall back to the default.
   */
  readonly maxRetainedRowMetrics?: number;
}>;

const freezeMetrics = (metrics: Record<string, RowRenderMetric>): RowRenderMetrics => Object.freeze(metrics);
const freezeMetric = (metric: RowRenderMetric): RowRenderMetric => Object.freeze(metric);
const freezeMeasurement = (measurement: RowRenderMeasurement): RowRenderMeasurement => Object.freeze(measurement);
const freezeOrder = (rowMetricOrder: string[]): readonly string[] => Object.freeze(rowMetricOrder);
const freezeState = (state: StoreState): StoreState => Object.freeze(state);

const EMPTY_ROW_METRICS = freezeMetrics({});

const INITIAL_STATE: StoreState = freezeState({
  currentToken: 0,
  cycleMetrics: EMPTY_ROW_METRICS,
  rowMetrics: EMPTY_ROW_METRICS,
  rowMetricOrder: EMPTY_ROW_METRIC_ORDER
});

const normalizeMaxRetainedRowMetrics = (value: number | undefined): number => {
  if (value === undefined) {
    return DEFAULT_MAX_RETAINED_ROW_METRICS;
  }

  if (value === Number.POSITIVE_INFINITY) {
    return Number.POSITIVE_INFINITY;
  }

  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_RETAINED_ROW_METRICS;
  }

  const normalizedValue = Math.floor(value);

  return normalizedValue > 0 ? normalizedValue : DEFAULT_MAX_RETAINED_ROW_METRICS;
};

/**
 * Holds per-row render timings plus a rolling aggregate for the most recent
 * render cycle. A single store instance is shared between
 * `<nat-table>` (which feeds it via `(rowRendered)`), the metrics column
 * factory, and the panel / filter companion components.
 */
export class NatTableRenderMetricsStore {
  private readonly state = signal<StoreState>(INITIAL_STATE);
  private readonly maxRetainedRowMetrics: number;

  public constructor(options: NatTableRenderMetricsStoreOptions = {}) {
    this.maxRetainedRowMetrics = normalizeMaxRetainedRowMetrics(options.maxRetainedRowMetrics);
  }

  /** Latest retained metric for each row keyed by row id. */
  public readonly rowMetrics: Signal<RowRenderMetrics> = computed(() => this.state().rowMetrics);

  /**
   * Aggregate measurement for the latest completed render cycle on the current
   * page, or `null` when no samples have been recorded yet.
   */
  public readonly measurement: Signal<RowRenderMeasurement | null> = computed(() => {
    const cycleMetrics = this.state().cycleMetrics;
    const durations = Object.values(cycleMetrics)
      .map((metric) => metric.durationMs)
      .filter((duration) => duration > 0);

    if (!durations.length) {
      return null;
    }

    const totalDurationMs = Math.max(...durations);
    const averageRowDurationMs = roundToSingleDecimal(durations.reduce((total, duration) => total + duration, 0) / durations.length);
    const rowCount = durations.length;

    return freezeMeasurement({
      durationMs: roundToSingleDecimal(totalDurationMs),
      averageRowDurationMs,
      rowCount,
      rowsPerSecond: totalDurationMs > 0 ? Math.round((rowCount * 1000) / totalDurationMs) : 0
    });
  });

  /**
   * Records a row render timing emitted by `<nat-table>`.
   *
   * @param event Row-level render event payload from the table.
   */
  public record(event: NatTableRenderMetricsEvent): void {
    const metric = freezeMetric({
      durationMs: event.durationMs,
      measuredAt: Date.now(),
      tone: getRowRenderTone(event.durationMs)
    });

    this.state.update((current) => {
      const retainedMetrics = this.retainRowMetric(current, event.rowId, metric);

      if (event.renderToken !== current.currentToken) {
        return freezeState({
          currentToken: event.renderToken,
          cycleMetrics: freezeMetrics({ [event.rowId]: metric }),
          rowMetrics: retainedMetrics.rowMetrics,
          rowMetricOrder: retainedMetrics.rowMetricOrder
        });
      }

      return freezeState({
        currentToken: current.currentToken,
        cycleMetrics: freezeMetrics({ ...current.cycleMetrics, [event.rowId]: metric }),
        rowMetrics: retainedMetrics.rowMetrics,
        rowMetricOrder: retainedMetrics.rowMetricOrder
      });
    });
  }

  /**
   * Returns the latest metric captured for a specific row.
   *
   * @param rowId Stable row identifier.
   */
  public rowMetric(rowId: string): RowRenderMetric | undefined {
    return this.state().rowMetrics[rowId];
  }

  /** Clears all recorded row and cycle measurements. */
  public reset(): void {
    this.state.set(INITIAL_STATE);
  }

  private retainRowMetric(current: StoreState, rowId: string, metric: RowRenderMetric): RetainedRowMetrics {
    const nextOrder = [...current.rowMetricOrder.filter((orderedRowId) => orderedRowId !== rowId), rowId];
    const retainedOrder =
      this.maxRetainedRowMetrics === Number.POSITIVE_INFINITY ? nextOrder : nextOrder.slice(-this.maxRetainedRowMetrics);

    const retainedRowMetrics: Record<string, RowRenderMetric> = {};

    for (const retainedRowId of retainedOrder) {
      retainedRowMetrics[retainedRowId] = retainedRowId === rowId ? metric : current.rowMetrics[retainedRowId];
    }

    return {
      rowMetrics: freezeMetrics(retainedRowMetrics),
      rowMetricOrder: freezeOrder(retainedOrder)
    };
  }
}
