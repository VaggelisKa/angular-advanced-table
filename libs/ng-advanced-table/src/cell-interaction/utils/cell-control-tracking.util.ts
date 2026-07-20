import { getNatTableCellsWithin } from './cell-control-preparation.util';
import { NAT_TABLE_HOST_SELECTOR } from '../cell-interaction.const';

/**
 * Forgets known cells that sit outside this table once removal records are
 * delivered, so a later reinsertion receives a fresh control-preparation scan.
 *
 * A removed node still owned by this table was moved rather than detached, so
 * its cells stay known and no subtree is rescanned. Mutations inside a detached
 * subtree are never observed, which bounds what this can recover: a cell
 * detached, mutated, and reinserted within a single observer delivery is
 * indistinguishable from a move and stays known, so controls added in that
 * window are only prepared when the reinsertion lands in a later delivery.
 */
export const forgetDetachedNatTableCells = (removedNodes: NodeList, knownCells: WeakSet<HTMLElement>, host: HTMLElement): void => {
  for (const removedNode of removedNodes) {
    if (!(removedNode instanceof HTMLElement)) continue;

    // Still owned: the node moved within this table, and every cell below it moved with it.
    if (removedNode.closest(NAT_TABLE_HOST_SELECTOR) === host) continue;

    for (const cell of getNatTableCellsWithin(removedNode)) {
      if (cell.closest(NAT_TABLE_HOST_SELECTOR) !== host) knownCells.delete(cell);
    }
  }
};
