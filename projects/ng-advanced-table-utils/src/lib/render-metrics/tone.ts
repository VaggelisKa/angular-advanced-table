import type { RowRenderFilterValue, RowRenderTone } from './types';

export function getRowRenderTone(durationMs: number): RowRenderTone {
  if (durationMs < 4) {
    return 'fast';
  }

  if (durationMs <= 8) {
    return 'watch';
  }

  return 'slow';
}

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

export function isRenderFilterValue(value: unknown): value is RowRenderFilterValue {
  return value === 'all' || value === 'fast' || value === 'watch' || value === 'slow';
}

export function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}
