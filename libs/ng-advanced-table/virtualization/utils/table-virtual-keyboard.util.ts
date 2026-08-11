import type { NatTableVirtualNavigationRequest } from '../common/table-virtualization.type';

const PAGE_DELTAS: Readonly<Record<string, -1 | 1 | undefined>> = {
  PageDown: 1,
  PageUp: -1
};

const ARROW_DELTAS: Readonly<Record<string, -1 | 1 | undefined>> = {
  ArrowDown: 1,
  ArrowUp: -1
};

const clampRowIndex = (index: number, rowCount: number): number => Math.min(Math.max(index, 0), Math.max(rowCount - 1, 0));

const hasAnyModifier = (event: KeyboardEvent): boolean => event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;

type PageNavigationContext = {
  readonly key: string;
  readonly currentRowIndex: number;
  readonly currentColumnId: string;
  readonly rowCount: number;
  readonly rowsPerPage: number;
  readonly subHeaderOffsets: readonly number[];
};

type ArrowNavigationContext = Omit<PageNavigationContext, 'rowsPerPage' | 'subHeaderOffsets'> & {
  readonly mountedRowIndexes: ReadonlySet<number>;
};

const resolveGridEnd = (
  event: KeyboardEvent,
  rowCount: number,
  lastColumnId: string | undefined
): NatTableVirtualNavigationRequest | null => {
  const isGridEnd = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === 'End';

  return isGridEnd && rowCount > 0 && lastColumnId ? { rowIndex: rowCount - 1, columnId: lastColumnId, align: 'end' } : null;
};

const resolveGridHome = (event: KeyboardEvent, firstColumnId: string | undefined): NatTableVirtualNavigationRequest | null => {
  const isGridHome = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key === 'Home';

  return isGridHome && firstColumnId ? { rowIndex: null, columnId: firstColumnId, align: 'start' } : null;
};

const resolvePageRowIndex = (context: {
  readonly currentRowIndex: number;
  readonly delta: -1 | 1;
  readonly rowsPerPage: number;
  readonly rowCount: number;
  readonly subHeaderOffsets: readonly number[];
}): number => {
  const { currentRowIndex, delta, rowsPerPage, rowCount, subHeaderOffsets } = context;
  const currentSlot = currentRowIndex + (subHeaderOffsets[currentRowIndex] ?? 0);
  const targetSlot = currentSlot + delta * rowsPerPage;
  let low = 0;
  let high = rowCount;

  while (low < high) {
    const middle = (low + high) >>> 1;
    const middleSlot = middle + (subHeaderOffsets[middle] ?? 0);

    if (middleSlot < targetSlot) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return clampRowIndex(low, rowCount);
};

const resolvePage = (context: PageNavigationContext): NatTableVirtualNavigationRequest | null => {
  const { key, currentRowIndex, currentColumnId, rowCount, rowsPerPage, subHeaderOffsets } = context;
  const delta = PAGE_DELTAS[key];

  return delta === undefined
    ? null
    : {
        rowIndex: resolvePageRowIndex({ currentRowIndex, delta, rowsPerPage, rowCount, subHeaderOffsets }),
        columnId: currentColumnId,
        align: 'start'
      };
};

const resolveArrow = (context: ArrowNavigationContext): NatTableVirtualNavigationRequest | null => {
  const { key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount } = context;
  const delta = ARROW_DELTAS[key];
  const target = delta === undefined ? currentRowIndex : currentRowIndex + delta;

  return delta === undefined || target < 0 || target >= rowCount || mountedRowIndexes.has(target)
    ? null
    : { rowIndex: target, columnId: currentColumnId, align: 'auto' };
};

export const resolveNatTableVirtualNavigation = (config: {
  readonly event: KeyboardEvent;
  readonly currentRowIndex: number | null;
  readonly currentColumnId: string;
  readonly firstColumnId: string | undefined;
  readonly lastColumnId: string | undefined;
  readonly mountedRowIndexes: ReadonlySet<number>;
  readonly rowCount: number;
  readonly rowsPerPage: number;
  readonly subHeaderOffsets?: readonly number[];
}): NatTableVirtualNavigationRequest | null => {
  const {
    event,
    currentRowIndex,
    currentColumnId,
    firstColumnId,
    lastColumnId,
    mountedRowIndexes,
    rowCount,
    rowsPerPage,
    subHeaderOffsets = []
  } = config;
  const gridEdge = resolveGridHome(event, firstColumnId) ?? resolveGridEnd(event, rowCount, lastColumnId);

  if (gridEdge) {
    return gridEdge;
  }

  if (currentRowIndex === null || hasAnyModifier(event)) {
    return null;
  }

  const page = resolvePage({ key: event.key, currentRowIndex, currentColumnId, rowCount, rowsPerPage, subHeaderOffsets });

  if (page) {
    return page;
  }

  return resolveArrow({ key: event.key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount });
};
