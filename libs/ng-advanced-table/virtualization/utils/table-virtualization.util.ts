import type { NatTableVirtualItem } from 'ng-advanced-table';

import type { NatTableVirtualizationOptions } from '../common/table-virtualization.type';

export const NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN = 6;

export const NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT = 10;

export const normalizeNatTableVirtualizationOptions = (
  options: NatTableVirtualizationOptions
): Required<NatTableVirtualizationOptions> => ({
  rowHeight: Number.isFinite(options.rowHeight) && options.rowHeight > 0 ? options.rowHeight : 1,
  overscan:
    Number.isFinite(options.overscan) && (options.overscan ?? -1) >= 0
      ? Math.floor(options.overscan ?? NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN)
      : NAT_TABLE_DEFAULT_VIRTUAL_OVERSCAN
});

export const includeVirtualIndex = (indexes: readonly number[], index: number | null, count: number): number[] => {
  if (index === null || index < 0 || index >= count || indexes.includes(index)) {
    return [...indexes];
  }

  return [...indexes, index].sort((left, right) => left - right);
};

export const createInitialVirtualItems = (
  rowCount: number,
  rowHeight: number,
  overscan: number,
  bodyOffset: number
): NatTableVirtualItem[] =>
  Array.from({ length: Math.min(rowCount, NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT + overscan) }, (_, index) => ({
    index,
    start: bodyOffset + index * rowHeight,
    end: bodyOffset + (index + 1) * rowHeight
  }));
