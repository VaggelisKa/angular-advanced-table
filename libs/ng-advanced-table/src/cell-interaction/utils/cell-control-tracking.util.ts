import { getNatTableCellsWithin } from './cell-control-preparation.util';

/**
 * Forgets known cells that remain outside this table when removal records are
 * delivered. Cells moved synchronously are already owned again and stay known,
 * while a cell reinserted later receives a fresh control-preparation scan.
 */
export const forgetDetachedNatTableCells = (removedNodes: NodeList, knownCells: WeakSet<HTMLElement>, host: HTMLElement): void => {
  for (const removedNode of removedNodes) {
    if (!(removedNode instanceof HTMLElement)) continue;

    for (const cell of getNatTableCellsWithin(removedNode)) {
      if (cell.closest('nat-table') !== host) knownCells.delete(cell);
    }
  }
};
