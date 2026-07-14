import { DestroyRef, ElementRef, Injectable, afterEveryRender, afterNextRender, inject } from '@angular/core';

import { NAT_TABLE_CELL_SELECTOR } from './cell-interaction.const';
import { getNatTableCellsWithin, getOutermostElementRoots, prepareNatTableCellControl } from './utils/cell-control-preparation.util';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';

type NatTableCellControlSnapshot = {
  readonly cells: readonly HTMLElement[];
  readonly controls: readonly HTMLElement[];
};

/**
 * Per-table manager for native controls rendered inside grid cells.
 *
 * It performs one initial table-level sweep, then observes only DOM mutations
 * that can add or change cell controls. Existing cells are tracked so Angular
 * DOM moves during sorting and reordering do not trigger subtree rescans.
 */
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in -- per-table manager, provided by NatTable rather than shared across tables.
@Injectable()
export class NatTableCellControlManager {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly knownCells = new WeakSet<HTMLElement>();
  private observer: MutationObserver | null = null;

  public constructor() {
    const mutationObserverCtor = globalThis.MutationObserver;

    if (typeof mutationObserverCtor === 'undefined') {
      afterEveryRender({
        earlyRead: () => this.readSnapshot(),
        write: (snapshot) => this.prepareSnapshot(snapshot)
      });

      return;
    }

    afterNextRender({
      earlyRead: () => this.readSnapshot(),
      write: (snapshot) => {
        this.prepareSnapshot(snapshot);
        this.observe(mutationObserverCtor);
      }
    });

    this.destroyRef.onDestroy(() => this.observer?.disconnect());
  }

  private readSnapshot(): NatTableCellControlSnapshot {
    const cells = Array.from(this.host.querySelectorAll<HTMLElement>(NAT_TABLE_CELL_SELECTOR)).filter((cell) =>
      this.isOwnedCell(cell)
    );
    const controls = Array.from(this.host.querySelectorAll<HTMLElement>(ROW_ACTIVATE_INTERACTIVE_SELECTOR)).filter((control) =>
      this.isOwnedControl(control)
    );

    return { cells, controls };
  }

  private prepareSnapshot(snapshot: NatTableCellControlSnapshot): void {
    for (const cell of snapshot.cells) {
      this.knownCells.add(cell);
    }

    for (const control of snapshot.controls) {
      prepareNatTableCellControl(control);
    }
  }

  private observe(mutationObserverCtor: typeof MutationObserver): void {
    this.observer = new mutationObserverCtor((mutations) => this.prepareMutations(mutations));
    this.observer.observe(this.host, {
      attributes: true,
      attributeFilter: ['contenteditable', 'disabled', 'href', 'nggridcellwidget', 'role', 'tabindex'],
      childList: true,
      subtree: true
    });
  }

  private prepareMutations(mutations: readonly MutationRecord[]): void {
    const newCells = new Set<HTMLElement>();
    const newCellRoots = new Set<HTMLElement>();
    const addedSubtrees = new Set<HTMLElement>();

    for (const mutation of mutations) {
      this.collectMutationWork(mutation, newCells, newCellRoots, addedSubtrees);
    }

    for (const root of getOutermostElementRoots(newCellRoots)) {
      this.prepareSubtree(root);
    }

    for (const cell of newCells) {
      this.knownCells.add(cell);
    }

    for (const subtree of getOutermostElementRoots(addedSubtrees)) {
      const owner = subtree.closest<HTMLElement>(NAT_TABLE_CELL_SELECTOR);

      if (owner && !newCells.has(owner) && this.knownCells.has(owner)) {
        this.prepareSubtree(subtree);
      }
    }
  }

  private collectMutationWork(
    mutation: MutationRecord,
    newCells: Set<HTMLElement>,
    newCellRoots: Set<HTMLElement>,
    addedSubtrees: Set<HTMLElement>
  ): void {
    if (mutation.type === 'attributes') {
      if (
        mutation.target instanceof HTMLElement &&
        mutation.target.matches(ROW_ACTIVATE_INTERACTIVE_SELECTOR) &&
        this.isOwnedControl(mutation.target)
      ) {
        prepareNatTableCellControl(mutation.target);
      }

      return;
    }

    for (const addedNode of mutation.addedNodes) {
      if (addedNode instanceof HTMLElement) {
        this.collectAddedSubtree(addedNode, newCells, newCellRoots, addedSubtrees);
      }
    }
  }

  private collectAddedSubtree(
    addedNode: HTMLElement,
    newCells: Set<HTMLElement>,
    newCellRoots: Set<HTMLElement>,
    addedSubtrees: Set<HTMLElement>
  ): void {
    const containedCells = getNatTableCellsWithin(addedNode).filter((cell) => this.isOwnedCell(cell));
    let containsNewCell = false;

    for (const cell of containedCells) {
      if (!this.knownCells.has(cell)) {
        newCells.add(cell);
        containsNewCell = true;
      }
    }

    if (containsNewCell) {
      newCellRoots.add(addedNode);

      return;
    }

    if (containedCells.length > 0) return;

    const owner = addedNode.closest<HTMLElement>(NAT_TABLE_CELL_SELECTOR);

    if (owner && this.isOwnedCell(owner)) {
      addedSubtrees.add(addedNode);
    }
  }

  private prepareSubtree(root: HTMLElement): void {
    if (root.matches(ROW_ACTIVATE_INTERACTIVE_SELECTOR) && this.isOwnedControl(root)) {
      prepareNatTableCellControl(root);
    }

    for (const control of root.querySelectorAll<HTMLElement>(ROW_ACTIVATE_INTERACTIVE_SELECTOR)) {
      if (this.isOwnedControl(control)) {
        prepareNatTableCellControl(control);
      }
    }
  }

  private isOwnedCell(cell: HTMLElement): boolean {
    return cell.closest('nat-table') === this.host;
  }

  private isOwnedControl(control: HTMLElement): boolean {
    const cell = control.closest<HTMLElement>(NAT_TABLE_CELL_SELECTOR);

    return cell !== null && this.isOwnedCell(cell);
  }
}
