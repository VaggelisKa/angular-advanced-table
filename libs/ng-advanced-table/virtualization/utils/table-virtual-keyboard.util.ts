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
};

type ArrowNavigationContext = Omit<PageNavigationContext, 'rowsPerPage'> & {
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

const resolvePage = (context: PageNavigationContext): NatTableVirtualNavigationRequest | null => {
  const { key, currentRowIndex, currentColumnId, rowCount, rowsPerPage } = context;
  const delta = PAGE_DELTAS[key];

  return delta === undefined
    ? null
    : {
        rowIndex: clampRowIndex(currentRowIndex + delta * rowsPerPage, rowCount),
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
  readonly lastColumnId: string | undefined;
  readonly mountedRowIndexes: ReadonlySet<number>;
  readonly rowCount: number;
  readonly rowsPerPage: number;
}): NatTableVirtualNavigationRequest | null => {
  const { event, currentRowIndex, currentColumnId, lastColumnId, mountedRowIndexes, rowCount, rowsPerPage } = config;
  const gridEnd = resolveGridEnd(event, rowCount, lastColumnId);

  if (gridEnd) {
    return gridEnd;
  }

  if (currentRowIndex === null || hasAnyModifier(event)) {
    return null;
  }

  const page = resolvePage({ key: event.key, currentRowIndex, currentColumnId, rowCount, rowsPerPage });

  if (page) {
    return page;
  }

  return resolveArrow({ key: event.key, currentRowIndex, currentColumnId, mountedRowIndexes, rowCount });
};
