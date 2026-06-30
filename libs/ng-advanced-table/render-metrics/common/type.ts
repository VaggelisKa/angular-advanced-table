/** Tone assigned to a row based on its latest measured render duration. */
export type RowRenderTone = 'fast' | 'watch' | 'slow';

/** Filter values understood by the render-metrics column and filter component. */
export type RowRenderFilterValue = RowRenderTone | 'all';

/** Latest render metric captured for a single row. */
export type RowRenderMetric = Readonly<{
  /** Render duration in milliseconds. */
  readonly durationMs: number;
  /** Epoch timestamp for when the metric was recorded. */
  readonly measuredAt: number;
  /** Derived health band for `durationMs`. */
  readonly tone: RowRenderTone;
}>;

/** Latest render metrics keyed by table row id. */
export type RowRenderMetrics = Readonly<Record<string, RowRenderMetric>>;

/** Aggregate view of the latest render cycle across the current page. */
export type RowRenderMeasurement = Readonly<{
  /** Total visible render duration in milliseconds. */
  readonly durationMs: number;
  /** Mean row duration for the latest sampled cycle. */
  readonly averageRowDurationMs: number;
  /** Number of visible rows represented in the sample. */
  readonly rowCount: number;
  /** Approximate rows rendered per second for the sample. */
  readonly rowsPerSecond: number;
}>;

/** Default id used by the synthetic render-metrics column. */
export const RENDER_METRIC_COLUMN_ID = '__rowRenderMetric';
