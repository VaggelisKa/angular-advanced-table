import type { RowRenderFilterValue, RowRenderTone } from './types';
export { getRenderToneLabel } from 'ng-advanced-table-locales/utils';

/**
 * Maps a row render duration to the library's coarse health bands.
 *
 * @param durationMs Row render duration in milliseconds.
 */
export function getRowRenderTone(durationMs: number): RowRenderTone {
  if (durationMs < 4) {
    return 'fast';
  }

  if (durationMs <= 8) {
    return 'watch';
  }

  return 'slow';
}

/**
 * Type guard for values accepted by the render-metrics column filter.
 *
 * @param value Unknown filter payload.
 */
export function isRenderFilterValue(value: unknown): value is RowRenderFilterValue {
  return value === 'all' || value === 'fast' || value === 'watch' || value === 'slow';
}

/**
 * Rounds a number to one decimal place using standard `toFixed` semantics.
 *
 * @param value Number to round.
 */
export function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}
