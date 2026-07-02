import type { RowRenderFilterValue, RowRenderTone } from '../common/type';

/**
 * Maps a row render duration to the library's coarse health bands.
 *
 * @param durationMs Row render duration in milliseconds.
 */
export const getRowRenderTone = (durationMs: number): RowRenderTone => {
  if (durationMs > 16.66) {
    return 'slow';
  }

  if (durationMs > 12) {
    return 'watch';
  }

  return 'fast';
};

/**
 * Type guard for values accepted by the render-metrics column filter.
 *
 * @param value Unknown filter payload.
 */
export const isRenderFilterValue = (value: unknown): value is RowRenderFilterValue => {
  return value === 'all' || value === 'fast' || value === 'watch' || value === 'slow';
};

/**
 * Rounds a number to one decimal place using standard `toFixed` semantics.
 *
 * @param value Number to round.
 */
export const roundToSingleDecimal = (value: number): number => {
  return Number(value.toFixed(1));
};
