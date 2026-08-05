import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction/cell-interaction.const';

/** Resolves on the first matching MutationObserver notification for `target`. */
export const waitForMutation = async (target: Node, options: MutationObserverInit): Promise<void> =>
  new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve();
    });

    observer.observe(target, options);
  });

/** Resolves once the control has the managed marker and `tabIndex === -1`. */
export const waitForControlPrepared = async (control: HTMLElement): Promise<void> => {
  if (control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex === -1) {
    return;
  }

  await new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex === -1) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(control, {
      attributes: true,
      attributeFilter: [NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, 'tabindex']
    });
  });
};

/**
 * Injects a managed button into every body cell and waits until each is prepared.
 * Used by load/reorder performance specs that need a dense interactive grid.
 */
export const prepareButtonsInBodyCells = async (fixture: { nativeElement: HTMLElement }): Promise<HTMLButtonElement[]> => {
  const cells = Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('tbody th, tbody td'));
  const contentAdded = Promise.all(cells.map(async (cell) => waitForMutation(cell, { childList: true, subtree: true })));

  for (const cell of cells) {
    cell.innerHTML = '<button type="button">Edit</button>';
  }

  await contentAdded;

  const buttons = Array.from(fixture.nativeElement.querySelectorAll<HTMLButtonElement>('tbody button'));

  await Promise.all(buttons.map(async (button) => waitForControlPrepared(button)));

  return buttons;
};
