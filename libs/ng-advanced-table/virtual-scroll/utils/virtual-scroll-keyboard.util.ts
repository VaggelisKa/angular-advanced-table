/**
 * Keyboard support for a windowed grid body.
 *
 * The aria grid navigates positionally over rendered rows, which is correct
 * for a fully mounted table but wrong at the edges of a row window: the
 * neighbor of the focused row may not be in the DOM yet, and `Ctrl+End`
 * should land on the last *logical* row, not the last mounted one. These
 * helpers classify such vertical moves so the directive can pre-scroll and
 * hand focus over once the target row mounts.
 */

import type { NatTableVirtualScrollKeyState } from '../common/virtual-scroll-internals.type';

/**
 * Body-row index a vertical navigation key targets, or `null` when the key is
 * not a vertical move (or the move has nowhere to go). `currentBodyIndex` is
 * `null` when focus sits outside the data rows (e.g. in the header).
 */
export function resolveVerticalNavigationTarget(
  key: NatTableVirtualScrollKeyState,
  currentBodyIndex: number | null,
  rowCount: number,
  pageSize = 1
): number | null {
  if (rowCount <= 0 || key.altKey || key.shiftKey) {
    return null;
  }

  if ((key.ctrlKey || key.metaKey) && key.key === 'End') {
    return rowCount - 1;
  }

  if (key.ctrlKey || key.metaKey || currentBodyIndex === null) {
    return null;
  }

  if (key.key === 'ArrowDown') {
    return currentBodyIndex + 1 < rowCount ? currentBodyIndex + 1 : null;
  }

  if (key.key === 'ArrowUp') {
    return currentBodyIndex - 1 >= 0 ? currentBodyIndex - 1 : null;
  }

  if (key.key === 'PageDown') {
    const target = Math.min(rowCount - 1, currentBodyIndex + Math.max(1, pageSize));

    return target === currentBodyIndex ? null : target;
  }

  if (key.key === 'PageUp') {
    const target = Math.max(0, currentBodyIndex - Math.max(1, pageSize));

    return target === currentBodyIndex ? null : target;
  }

  return null;
}

/**
 * Body-row index of the data row containing `element`, derived from the
 * absolute `aria-rowindex` the table binds while a row window is attached.
 * `null` outside the data rows.
 */
export function resolveBodyRowIndex(element: Element, headerRowCount: number): number | null {
  const row = element.closest('tbody tr[aria-rowindex]');
  const ariaRowIndex = Number(row?.getAttribute('aria-rowindex'));

  if (!Number.isInteger(ariaRowIndex)) {
    return null;
  }

  const bodyIndex = ariaRowIndex - headerRowCount - 1;

  return bodyIndex >= 0 ? bodyIndex : null;
}

/** Position of a cell among its row's cells, for column-preserving focus handover. */
export function resolveCellPositionInRow(cell: Element): number {
  const row = cell.closest<HTMLTableRowElement>('tr');

  if (!row) {
    return 0;
  }

  return Math.max(0, Array.prototype.indexOf.call(row.cells, cell.closest('td, th')));
}

/**
 * Focuses the cell at `cellPosition` (clamped) of the mounted data row with
 * the given absolute `aria-rowindex`. Returns `false` while the row is not in
 * the DOM yet so the caller can retry after the next window update.
 */
export function focusMountedRowCell(region: HTMLElement, ariaRowIndex: number, cellPosition: number): boolean {
  const row = region.querySelector<HTMLTableRowElement>(`tbody tr[aria-rowindex="${ariaRowIndex}"]`);

  if (!row || row.cells.length === 0) {
    return false;
  }

  const cell = row.cells[Math.min(cellPosition, row.cells.length - 1)];

  // A just-mounted cell may not have received its roving tabindex yet; park it
  // at -1 (what the grid assigns to inactive cells anyway) so focus() takes.
  if (!cell.hasAttribute('tabindex')) {
    cell.tabIndex = -1;
  }

  cell.focus({ preventScroll: true });

  return true;
}

/**
 * Height of the sticky header overlay at the top of the scroll region: the
 * sticky top inset plus the `<thead>` height when header cells are sticky,
 * otherwise 0.
 */
export function measureStickyHeaderOverlayHeight(region: HTMLElement): number {
  const thead = region.querySelector('thead');
  const headerCell = thead?.querySelector('th');

  if (!thead || !headerCell) {
    return 0;
  }

  const style = getComputedStyle(headerCell);

  if (style.position !== 'sticky') {
    return 0;
  }

  const stickyTop = Number.parseFloat(style.top);

  return (Number.isFinite(stickyTop) ? Math.max(0, stickyTop) : 0) + thead.getBoundingClientRect().height;
}

/**
 * How many px of `element` are hidden under the sticky overlay at the top of
 * the region. Positive values mean the caller should scroll up by that much
 * to fully reveal it.
 */
export function computeStickyOcclusionPx(element: Element, region: HTMLElement, stickyOverlayHeight: number): number {
  const elementTop = element.getBoundingClientRect().top;
  const overlayBottom = region.getBoundingClientRect().top + stickyOverlayHeight;

  return overlayBottom - elementTop;
}
