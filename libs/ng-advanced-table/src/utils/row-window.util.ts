import type { Row, RowData } from '@tanstack/angular-table';

import type { NatTableBodyRenderItem } from '../common/row-window.type';

/** Clamps to `[0, rowCount)`, deduplicates, and sorts ascending. */
export function sanitizeRowIndexes(indexes: readonly number[], rowCount: number): readonly number[] {
  const inRange = indexes.filter((index) => Number.isInteger(index) && index >= 0 && index < rowCount);

  return [...new Set(inRange)].sort((left, right) => left - right);
}

/** Render plan for a table without a row window: every body row, no gaps. */
export function buildFullBodyRenderPlan<TData extends RowData>(rows: readonly Row<TData>[]): readonly NatTableBodyRenderItem<TData>[] {
  return rows.map((row, bodyIndex) => ({ kind: 'row', key: `row:${row.id}`, row, bodyIndex }));
}

function appendGap<TData extends RowData>(
  items: NatTableBodyRenderItem<TData>[],
  firstGapIndex: number,
  rowCount: number,
  rowHeight: number
): void {
  if (rowCount <= 0) {
    return;
  }

  items.push({ kind: 'gap', key: `gap:${firstGapIndex}`, rowCount, heightPx: rowCount * rowHeight });
}

/**
 * Render plan for a windowed table body: the requested rows in model order,
 * with every run of unmounted rows collapsed into one fixed-height gap item.
 *
 * Indexes are sanitized defensively — clamped to the row model, deduplicated,
 * and sorted — because the window owner updates asynchronously from scroll
 * events and may briefly reference a shrunken or reordered row model.
 */
export function buildWindowedBodyRenderPlan<TData extends RowData>(
  rows: readonly Row<TData>[],
  renderedRowIndexes: readonly number[],
  rowHeight: number
): readonly NatTableBodyRenderItem<TData>[] {
  const mountedIndexes = sanitizeRowIndexes(renderedRowIndexes, rows.length);
  const items: NatTableBodyRenderItem<TData>[] = [];
  let nextUnplannedIndex = 0;

  for (const bodyIndex of mountedIndexes) {
    appendGap(items, nextUnplannedIndex, bodyIndex - nextUnplannedIndex, rowHeight);

    const row = rows[bodyIndex];

    items.push({ kind: 'row', key: `row:${row.id}`, row, bodyIndex });
    nextUnplannedIndex = bodyIndex + 1;
  }

  appendGap(items, nextUnplannedIndex, rows.length - nextUnplannedIndex, rowHeight);

  return items;
}
