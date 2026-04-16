export type RowRenderTone = 'fast' | 'watch' | 'slow';
export type RowRenderFilterValue = RowRenderTone | 'all';

export interface RowRenderMetric {
  durationMs: number;
  measuredAt: number;
  tone: RowRenderTone;
}

export interface RowRenderMeasurement {
  durationMs: number;
  averageRowDurationMs: number;
  rowCount: number;
  rowsPerSecond: number;
}

export interface RowRenderFilterOption {
  value: RowRenderFilterValue;
  label: string;
  description: string;
}

export const RENDER_METRIC_COLUMN_ID = '__rowRenderMetric';

export const RENDER_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  {
    value: 'all',
    label: 'All rows',
    description: 'Latest sample',
  },
  {
    value: 'fast',
    label: 'Fast',
    description: 'Under 4 ms',
  },
  {
    value: 'watch',
    label: 'Watch',
    description: '4 to 8 ms',
  },
  {
    value: 'slow',
    label: 'Slow',
    description: 'Over 8 ms',
  },
] as const;
