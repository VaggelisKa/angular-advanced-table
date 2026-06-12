/**
 * ARIA grid cell-interaction keyboard model: Enter moves focus from a cell into
 * its first interactive control, Tab cycles between the grid's controls once
 * focus is inside them (plain Tab on a cell stays native so focus can leave the
 * grid), and Escape returns focus to the cell. The controls are rendered through
 * `flexRender` (separate views), so `@angular/aria`'s `GridCell` content query
 * never registers them; this supplies the keyboard path the grid pattern
 * otherwise cannot.
 */

export const ROW_ACTIVATE_INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, summary, [contenteditable="true"], ' +
  '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
  '[role="menuitemcheckbox"], [role="menuitemradio"], [role="tab"], [role="switch"], ' +
  '[role="combobox"], [role="textbox"], [role="searchbox"]';

const GRID_CELL_SELECTOR = '[role="gridcell"], [role="columnheader"], [role="rowheader"]';

/**
 * Routes a keydown on a grid cell (or a control inside one) through the
 * cell-interaction model. Returns `true` when it handled the event, so the
 * caller skips its own behavior (e.g. row activation).
 */
export const handleCellInteractionKeydown = (event: KeyboardEvent): boolean => {
  if (event.defaultPrevented) return false;

  const target = event.target;

  if (!(target instanceof HTMLElement)) return false;

  const cell = target.closest<HTMLElement>(GRID_CELL_SELECTOR);

  if (!cell) return false;

  switch (event.key) {
    case 'Enter':
      return enterFirstCellControl(event, cell, target);
    case 'Escape':
      return escapeBackToCell(event, cell, target);
    case 'Tab':
      return tabBetweenControls(event, cell, target);
    default:
      return false;
  }
};

/** Enter on a focused cell steps into the cell's first control. */
const enterFirstCellControl = (
  event: KeyboardEvent,
  cell: HTMLElement,
  target: HTMLElement,
): boolean => {
  // Enter on a control keeps its native behavior.
  if (target !== cell) return false;

  const [firstControl] = cellInteractiveControls(cell);

  // Let a control-less cell fall through to row activation.
  if (!firstControl) return false;

  return focusAndConsume(event, firstControl);
};

/** Escape inside a control returns focus to the owning cell. */
const escapeBackToCell = (
  event: KeyboardEvent,
  cell: HTMLElement,
  target: HTMLElement,
): boolean => {
  if (target === cell) return false;

  return focusAndConsume(event, cell);
};

/** Tab from a control walks the grid's controls; Tab on the cell itself stays native. */
const tabBetweenControls = (
  event: KeyboardEvent,
  cell: HTMLElement,
  target: HTMLElement,
): boolean => {
  // Tab on the cell itself is not intercepted so focus can leave the grid; Enter is the entry point.
  if (target === cell) return false;

  const grid = cell.closest('table');

  if (!grid) return false;

  const controls = gridInteractiveControls(grid);
  const forward = !event.shiftKey;

  // Tab from a control walks to the next/previous control across the whole grid.
  const index = controls.indexOf(target);

  if (index === -1) return false;

  const nextControl = controls[index + (forward ? 1 : -1)];

  // Past the first/last control: let Tab leave the grid.
  if (!nextControl) return false;

  return focusAndConsume(event, nextControl);
};

const focusAndConsume = (event: KeyboardEvent, control: HTMLElement): true => {
  event.preventDefault();
  event.stopPropagation();
  control.focus();

  return true;
};

/** Controls Enter steps into — the cell's action controls, not the resize handle. */
const cellInteractiveControls = (cell: HTMLElement): HTMLElement[] =>
  collectInteractiveControls(cell, ROW_ACTIVATE_INTERACTIVE_SELECTOR);

/**
 * Every focusable item in the grid in document order — the Tab walk order. Includes
 * the column resize handles so Tab iterates through them alongside the cell controls.
 */
const gridInteractiveControls = (grid: HTMLElement): HTMLElement[] =>
  collectInteractiveControls(grid, `${ROW_ACTIVATE_INTERACTIVE_SELECTOR}, .column-resize-handle`);

const collectInteractiveControls = (root: HTMLElement, selector: string): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(isTabbableControl);

/**
 * Only controls the browser itself would tab to: not disabled, not removed from
 * the tab order (`tabindex="-1"`), and not hidden on the element or an ancestor
 * (`hidden`, `inert`, `aria-hidden`). CSS-only visibility (display/clip) is not
 * checked: jsdom reports no layout, and hidden columns leave the DOM entirely.
 */
const isTabbableControl = (element: HTMLElement): boolean =>
  !element.hasAttribute('disabled') &&
  element.tabIndex >= 0 &&
  !element.closest('[hidden], [inert], [aria-hidden="true"]');
