import type { RowRenderFilterValue, RowRenderTone } from './types';

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
 * Human-readable label for a render tone.
 *
 * @param tone Render tone or idle sentinel.
 */
export function getRenderToneLabel(tone: RowRenderTone | 'idle'): string {
  switch (tone) {
    case 'fast':
      return 'Fast';
    case 'watch':
      return 'Watch';
    case 'slow':
      return 'Slow';
    case 'idle':
      return 'Idle';
  }
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
