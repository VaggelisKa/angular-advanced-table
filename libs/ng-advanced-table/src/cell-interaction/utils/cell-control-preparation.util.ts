import { NAT_TABLE_CELL_SELECTOR, NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from '../cell-interaction.const';

const elementDepth = (element: HTMLElement): number => {
  let value = 0;

  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    value += 1;
  }

  return value;
};

export const getNatTableCellsWithin = (root: HTMLElement): readonly HTMLElement[] => {
  const cells = Array.from(root.querySelectorAll<HTMLElement>(NAT_TABLE_CELL_SELECTOR));

  if (root.matches(NAT_TABLE_CELL_SELECTOR)) {
    cells.unshift(root);
  }

  return cells;
};

/** Returns shallowest candidate roots while excluding candidates nested below another selected root. */
export const getOutermostElementRoots = (roots: ReadonlySet<HTMLElement>): readonly HTMLElement[] => {
  const candidates = Array.from(roots).sort((left, right) => elementDepth(left) - elementDepth(right));
  const selectedRoots = new WeakSet<HTMLElement>();

  return candidates.filter((root) => {
    for (let parent = root.parentElement; parent; parent = parent.parentElement) {
      if (selectedRoots.has(parent)) return false;
    }

    selectedRoots.add(root);

    return true;
  });
};

/**
 * Prepares a single interactive control for the cell keyboard model.
 *
 * Exposed as a method on an object so unit tests can spy without redefining
 * the ESM export binding (which Angular/Vitest marks non-configurable).
 */
export const natTableCellControlPreparation = {
  prepare(control: HTMLElement): void {
    if (control.hasAttribute('ngGridCellWidget') || control.hasAttribute('disabled')) return;

    if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE) && control.tabIndex < 0) return;

    if (!control.hasAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)) {
      control.setAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE, '');
    }

    if (control.tabIndex !== -1) {
      control.tabIndex = -1;
    }
  }
};

export const prepareNatTableCellControl = (control: HTMLElement): void => natTableCellControlPreparation.prepare(control);
