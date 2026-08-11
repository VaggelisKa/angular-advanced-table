import type { NatTableResolvedVirtualScrollOptions, NatTableVirtualScrollOptions } from '../common/virtual-scroll-options.type';
import {
  NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MAX_BUFFER_PX,
  NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MIN_BUFFER_PX,
  NAT_TABLE_VIRTUAL_SCROLL_FALLBACK_ROW_HEIGHT
} from '../common/virtual-scroll.const';

function isPositiveFinite(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isNonNegativeFinite(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Applies defaults and coerces invalid values to a working configuration:
 * a broken `rowHeight` falls back to a fixed default, negative or non-finite
 * buffers fall back to the CDK defaults, and `maxBufferPx` is raised to
 * `minBufferPx` when inverted (the CDK strategy throws on inverted buffers).
 * Reporting the coercion is the caller's dev-mode concern.
 */
export function normalizeVirtualScrollOptions(options: NatTableVirtualScrollOptions): NatTableResolvedVirtualScrollOptions {
  const rowHeight = isPositiveFinite(options.rowHeight) ? options.rowHeight : NAT_TABLE_VIRTUAL_SCROLL_FALLBACK_ROW_HEIGHT;
  const minBufferPx = isNonNegativeFinite(options.minBufferPx) ? options.minBufferPx : NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MIN_BUFFER_PX;
  const preferredMaxBufferPx = isNonNegativeFinite(options.maxBufferPx)
    ? options.maxBufferPx
    : NAT_TABLE_VIRTUAL_SCROLL_DEFAULT_MAX_BUFFER_PX;

  return { rowHeight, minBufferPx, maxBufferPx: Math.max(minBufferPx, preferredMaxBufferPx) };
}

/** Human-readable problems with the raw options, for dev-mode warnings. */
export function describeVirtualScrollOptionProblems(options: NatTableVirtualScrollOptions): readonly string[] {
  const problems: string[] = [];

  if (!isPositiveFinite(options.rowHeight)) {
    problems.push(`rowHeight must be a finite number greater than zero; received ${String(options.rowHeight)}.`);
  }

  if (options.minBufferPx !== undefined && !isNonNegativeFinite(options.minBufferPx)) {
    problems.push(`minBufferPx must be a finite number of at least zero; received ${String(options.minBufferPx)}.`);
  }

  if (options.maxBufferPx !== undefined && !isNonNegativeFinite(options.maxBufferPx)) {
    problems.push(`maxBufferPx must be a finite number of at least zero; received ${String(options.maxBufferPx)}.`);
  }

  if (
    isNonNegativeFinite(options.minBufferPx) &&
    isNonNegativeFinite(options.maxBufferPx) &&
    options.maxBufferPx < options.minBufferPx
  ) {
    problems.push('maxBufferPx must be at least minBufferPx; the larger of the two is used.');
  }

  return problems;
}
