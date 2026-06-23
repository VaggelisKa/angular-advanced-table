export type StickyMetrics = {
  supportsTimeline: boolean;
  stickyTop: number;
  scrollY: number;
  docTop: number;
  vvOffsetTop: number | undefined;
  vvHeight: number | undefined;
  innerHeight: number;
  rectTop: number;
  expected: number;
  actual: number;
  diff: number;
  rangeStart: string;
  rangeEnd: string;
  maxTranslate: string;
};

function timelineSupported(): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');
}

/** Picks the viewport-sticky table currently being pinned near the top. */
function activeStickyTable(): HTMLTableElement | null {
  const tables = Array.from(document.querySelectorAll<HTMLTableElement>('.table-stack table'));

  for (const table of tables) {
    const rect = table.getBoundingClientRect();

    if (rect.top <= 2 && rect.bottom > 2) {
      return table;
    }
  }

  return tables[0] ?? null;
}

function readStickyTop(table: HTMLTableElement | null): number {
  const region = table?.closest<HTMLElement>('.table-region') ?? table?.parentElement ?? null;

  if (!region) {
    return 0;
  }

  return parseFloat(window.getComputedStyle(region).getPropertyValue('--nat-table-sticky-top').trim()) || 0;
}

function translateY(el: Element | null | undefined): number {
  if (!el) {
    return NaN;
  }

  const transform = window.getComputedStyle(el).transform;

  if (!transform || transform === 'none') {
    return 0;
  }

  try {
    return new DOMMatrix(transform).m42;
  } catch {
    return NaN;
  }
}

function actualTranslate(table: HTMLTableElement | null): number {
  const thead = translateY(table?.querySelector('thead'));

  if (Number.isFinite(thead) && thead !== 0) {
    return thead;
  }

  return translateY(table?.querySelector<HTMLElement>('thead th'));
}

function orDash(value: string | undefined): string {
  if (value === undefined || value === '') {
    return '—';
  }

  return value;
}

function fmt(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return 'NaN';
  }

  return value.toFixed(1);
}

function readRangeProps(table: HTMLTableElement | null): Pick<StickyMetrics, 'rangeStart' | 'rangeEnd' | 'maxTranslate'> {
  return {
    rangeStart: orDash(table?.style.getPropertyValue('--nat-table-sticky-range-start')),
    rangeEnd: orDash(table?.style.getPropertyValue('--nat-table-sticky-range-end')),
    maxTranslate: orDash(table?.style.getPropertyValue('--nat-table-sticky-max-translate'))
  };
}

export function collectStickyMetrics(): StickyMetrics {
  const vv = window.visualViewport ?? undefined;
  const table = activeStickyTable();
  const rectTop = table ? table.getBoundingClientRect().top : NaN;
  const actual = actualTranslate(table);
  const expected = Number.isFinite(rectTop) ? Math.max(0, readStickyTop(table) - rectTop) : NaN;

  return {
    supportsTimeline: timelineSupported(),
    stickyTop: readStickyTop(table),
    scrollY: window.scrollY,
    docTop: document.scrollingElement?.scrollTop ?? NaN,
    vvOffsetTop: vv?.offsetTop,
    vvHeight: vv?.height,
    innerHeight: window.innerHeight,
    rectTop,
    expected,
    actual,
    diff: Number.isFinite(expected) ? actual - expected : NaN,
    ...readRangeProps(table)
  };
}

export function formatStickyMetrics(m: StickyMetrics, peak: number): string {
  return [
    `timeline=${m.supportsTimeline} stickyTop=${fmt(m.stickyTop)}`,
    `scrollY=${fmt(m.scrollY)} docTop=${fmt(m.docTop)}`,
    `vv.offTop=${fmt(m.vvOffsetTop)} vv.h=${fmt(m.vvHeight)} innerH=${fmt(m.innerHeight)}`,
    `rectTop=${fmt(m.rectTop)} expected=${fmt(m.expected)} actual=${fmt(m.actual)}`,
    `DIFF=${fmt(m.diff)}  PEAK=${fmt(peak)}`,
    `range=[${m.rangeStart} → ${m.rangeEnd}] max=${m.maxTranslate}`
  ].join('\n');
}
