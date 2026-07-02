import type { Column, ColumnOrderState, ColumnPinningState, RowData } from '@tanstack/angular-table';

import type { ColumnReorderKeyboardDirection, ColumnReorderZone } from '../common/column-render.type';

const uniqueStringValues = (values: readonly string[]): string[] => {
  const seen = new Set<string>();

  return values.filter((value) => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);

    return true;
  });
};

export const normalizeColumnOrder = (columnOrder: readonly string[], allLeafColumnIds: readonly string[]): ColumnOrderState => {
  const validColumnIds = new Set(allLeafColumnIds);
  const nextOrder = uniqueStringValues(columnOrder.filter((columnId) => validColumnIds.has(columnId)));

  for (const columnId of allLeafColumnIds) {
    if (!nextOrder.includes(columnId)) {
      nextOrder.push(columnId);
    }
  }

  return nextOrder;
};

export const normalizeColumnPinning = (columnPinning: ColumnPinningState, allLeafColumnIds: readonly string[]): ColumnPinningState => {
  const validColumnIds = new Set(allLeafColumnIds);
  const leftColumnIds = columnPinning.left ?? [];
  const rightColumnIds = columnPinning.right ?? [];

  return {
    left: uniqueStringValues(leftColumnIds.filter((columnId) => validColumnIds.has(columnId))),
    right: uniqueStringValues(rightColumnIds.filter((columnId) => validColumnIds.has(columnId)))
  };
};

export const moveItemInArrayCopy = (values: readonly string[], fromIndex: number, toIndex: number): string[] => {
  const nextValues = [...values];
  // `.at(0)` on the removed-elements array is honestly typed `string | undefined`:
  // an out-of-range fromIndex makes splice return [], so movedValue is undefined.
  const movedValue = nextValues.splice(fromIndex, 1).at(0);

  if (movedValue === undefined) return nextValues;

  nextValues.splice(toIndex, 0, movedValue);

  return nextValues;
};

export const getColumnMoveTargetIndex = (
  columnIds: readonly string[],
  columnId: string,
  directionDelta: ColumnReorderKeyboardDirection
): number | null => {
  const currentIndex = columnIds.indexOf(columnId);
  const nextIndex = currentIndex + directionDelta;

  return currentIndex !== -1 && nextIndex >= 0 && nextIndex < columnIds.length ? nextIndex : null;
};

export const replaceIdsInSlots = (
  currentOrder: readonly string[],
  nextVisibleOrder: readonly string[],
  movableIds: ReadonlySet<string>
): string[] => {
  const nextValues = [...nextVisibleOrder];

  return currentOrder.map((columnId) => {
    if (!movableIds.has(columnId)) {
      return columnId;
    }

    return nextValues.shift() ?? columnId;
  });
};

export const hasSameStringOrder = (left: readonly string[], right: readonly string[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

/** Accumulates sticky pinned offsets in iteration order: each column's offset is the running width sum before it. */
export const accumulatePinnedOffsets = <TData extends RowData>(
  columns: readonly Column<TData, unknown>[],
  widths: Record<string, number>
): Record<string, number> => {
  const offsets: Record<string, number> = {};
  let offset = 0;

  for (const column of columns) {
    offsets[column.id] = offset;
    offset += widths[column.id] ?? 0;
  }

  return offsets;
};

/** Resolves a pinning zone's column ids to their visible Column objects, preserving order. */
export const resolvePinnedZoneColumns = <TData extends RowData>(
  zoneColumnIds: readonly string[] | undefined,
  visibleColumnsById: ReadonlyMap<string, Column<TData, unknown>>
): Column<TData, unknown>[] =>
  (zoneColumnIds ?? [])
    .map((columnId) => visibleColumnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => !!column);

/** Maps a column's pin state to its reorder zone. */
export const getColumnZone = <TData extends RowData>(column: Column<TData, unknown>): ColumnReorderZone => {
  const pinnedState = column.getIsPinned();

  if (pinnedState === 'left') {
    return 'left';
  }

  if (pinnedState === 'right') {
    return 'right';
  }

  return 'center';
};
