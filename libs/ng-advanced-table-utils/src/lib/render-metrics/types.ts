/** Tone assigned to a row based on its latest measured render duration. */
export type RowRenderTone = 'fast' | 'watch' | 'slow';
/** Filter values understood by the render-metrics column and filter component. */
export type RowRenderFilterValue = RowRenderTone | 'all';

/** Latest render metric captured for a single row. */
export interface RowRenderMetric {
  /** Render duration in milliseconds. */
  durationMs: number;
  /** Epoch timestamp for when the metric was recorded. */
  measuredAt: number;
  /** Derived health band for `durationMs`. */
  tone: RowRenderTone;
}

/** Aggregate view of the latest render cycle across the current page. */
export interface RowRenderMeasurement {
  /** Total visible render duration in milliseconds. */
  durationMs: number;
  /** Mean row duration for the latest sampled cycle. */
  averageRowDurationMs: number;
  /** Number of visible rows represented in the sample. */
  rowCount: number;
  /** Approximate rows rendered per second for the sample. */
  rowsPerSecond: number;
}

/** Metadata used to render the filter chip options in the metrics companion UI. */
export type { RowRenderFilterOption } from 'ng-advanced-table-locales/utils';

/** Default id used by the synthetic render-metrics column. */
export const RENDER_METRIC_COLUMN_ID = '__rowRenderMetric';

export { RENDER_FILTER_OPTIONS } from 'ng-advanced-table-locales/utils';
