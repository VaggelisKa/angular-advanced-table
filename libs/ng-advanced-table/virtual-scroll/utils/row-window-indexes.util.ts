import type { ListRange } from '@angular/cdk/collections';

/**
 * Expands the CDK engine's half-open rendered range into the sorted row-index
 * list the table's row-window contract expects, keeping the focused row
 * mounted even when it has scrolled out of the range. The aria grid roves a
 * real DOM `tabindex`, so unmounting the focused row would silently re-anchor
 * focus to whichever row takes its collection position.
 */
export function buildRowWindowIndexes(range: ListRange, focusedRowIndex: number | null, rowCount: number): readonly number[] {
  const start = Math.max(0, Math.min(range.start, rowCount));
  const end = Math.max(start, Math.min(range.end, rowCount));
  const indexes: number[] = [];

  if (focusedRowIndex !== null && Number.isInteger(focusedRowIndex) && focusedRowIndex >= 0 && focusedRowIndex < start) {
    indexes.push(focusedRowIndex);
  }

  for (let index = start; index < end; index++) {
    indexes.push(index);
  }

  if (focusedRowIndex !== null && Number.isInteger(focusedRowIndex) && focusedRowIndex >= end && focusedRowIndex < rowCount) {
    indexes.push(focusedRowIndex);
  }

  return indexes;
}

/** Whether a body-row index is part of the given sorted index list. */
export function isRowIndexMounted(indexes: readonly number[], rowIndex: number): boolean {
  return indexes.includes(rowIndex);
}
