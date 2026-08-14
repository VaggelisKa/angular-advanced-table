import { findOwnedNatTableAncestor } from './table-ownership.util';

/**
 * Whether a focusout event means the reader left the table, so focus retention
 * clears. Chromium also fires focusout when the focused node is removed from
 * the DOM — exactly what a remote window fill does when it swaps the focused
 * cell's row — and there the retained position must survive so the recovery
 * effect can put focus back on the same logical slot. A reader genuinely
 * leaving the table always leaves a connected target behind.
 */
export const shouldClearNatTableFocusRetention = (event: FocusEvent, host: HTMLElement): boolean => {
  if (event.target instanceof Node && !event.target.isConnected) {
    return false;
  }

  const relatedTarget = event.relatedTarget;

  return !(relatedTarget instanceof Node) || !host.contains(relatedTarget);
};

type NatTableActiveBodyFocus = {
  readonly rowId: string | null;
  readonly columnId: string;
};

const readDataRowFocus = (host: HTMLElement, target: Element): NatTableActiveBodyFocus | null => {
  const cell = findOwnedNatTableAncestor<HTMLElement>(host, target, 'tbody [ngGridCell]');
  const row = cell ? findOwnedNatTableAncestor<HTMLTableRowElement>(host, cell, 'tr.data-row[data-row-id]') : null;
  const rowId = row?.dataset['rowId'];
  const columnId = cell?.dataset['columnId'];

  if (rowId !== undefined && columnId !== undefined) {
    return { rowId, columnId };
  }

  return null;
};

export const readNatTableActiveBodyFocus = (host: HTMLElement, firstColumnId: string | undefined): NatTableActiveBodyFocus | null => {
  const target = host.ownerDocument.activeElement;

  if (!target || !host.contains(target)) {
    return null;
  }

  const dataRowFocus = readDataRowFocus(host, target);

  if (dataRowFocus) {
    return dataRowFocus;
  }

  const stateCell = findOwnedNatTableAncestor<HTMLElement>(host, target, 'tbody [ngGridCell].table-state');

  return stateCell && firstColumnId ? { rowId: null, columnId: firstColumnId } : null;
};
