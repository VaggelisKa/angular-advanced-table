import { MenuHarness } from '@angular/aria/menu/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

export const root = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

export const queryByTestId = <TElement extends HTMLElement = HTMLElement>(
  testId: string,
  parent: ParentNode = document
): TElement | null => parent.querySelector<TElement>(`[data-testid="${testId}"]`);

export const getByTestId = <TElement extends HTMLElement = HTMLElement>(testId: string, parent: ParentNode = document): TElement => {
  const element = queryByTestId<TElement>(testId, parent);

  if (!element) {
    throw new Error(`Expected an element with data-testid="${testId}".`);
  }

  return element;
};

const requireElement = <TElement extends Element = Element>(element: TElement | null, description: string): TElement => {
  if (!element) {
    throw new Error(`Expected an element: ${description}.`);
  }

  return element;
};

const findIn = (parent: ParentNode, selector: string): Element => requireElement(parent.querySelector(selector), selector);

export const attrOf = (parent: ParentNode, selector: string, name: string): string | null =>
  findIn(parent, selector).getAttribute(name);

export const textOf = (parent: ParentNode, selector: string): string => findIn(parent, selector).textContent.trim();

export const lastChildHasClass = (parent: Element, className: string): boolean =>
  requireElement(parent.lastElementChild, `last child of ${parent.tagName}`).classList.contains(className);

export const getHeaderActionsMenuButton = (fixture: ComponentFixture<unknown>, columnId: string): HTMLButtonElement =>
  getByTestId(`nat-table-header-actions-menu-${columnId}`, fixture.nativeElement as ParentNode);

export const getHeaderColumnIds = (fixture: ComponentFixture<unknown>): string[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('thead th[data-column-id]')).map(
    (header) => header.dataset['columnId'] ?? ''
  );

// The open .column-menu panel renders in a cdkConnectedOverlay outside the
// fixture root, so harness lookups must go through the document-root loader.
export const getOpenMenuHarness = async (fixture: ComponentFixture<unknown>): Promise<MenuHarness> =>
  TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MenuHarness);

export const getOpenPinMenu = (): HTMLElement | null => {
  const menus = Array.from(document.querySelectorAll<HTMLElement>('.column-menu'));

  return menus.at(-1) ?? null;
};

export const requireOpenMenu = (): HTMLElement => {
  const menu = getOpenPinMenu();

  if (!menu) {
    throw new Error('Expected the column actions menu to be open.');
  }

  return menu;
};

const requireMenuItem = (item: HTMLButtonElement | null, missingDescription: string): HTMLButtonElement => {
  if (!item) {
    throw new Error(`Expected a menu item for ${missingDescription}.`);
  }

  return item;
};

export const getOpenMenuItem = (side: 'left' | 'right', columnId = 'name'): HTMLButtonElement => {
  const menu = requireOpenMenu();
  const item =
    queryByTestId<HTMLButtonElement>(`nat-table-header-pin-${side}-${columnId}`) ??
    menu.querySelector<HTMLButtonElement>(`.column-menu-item[data-pin-side="${side}"]`);

  return requireMenuItem(item, `pin side "${side}"`);
};

export const getOpenMoveMenuItem = (direction: 'left' | 'right', columnId = 'name'): HTMLButtonElement => {
  const menu = requireOpenMenu();
  const item =
    queryByTestId<HTMLButtonElement>(`nat-table-header-move-${direction}-${columnId}`) ??
    menu.querySelector<HTMLButtonElement>(`.column-menu-item[data-move-direction="${direction}"]`);

  return requireMenuItem(item, `move direction "${direction}"`);
};

export const setScrollMetrics = (
  element: HTMLElement,
  metrics: {
    readonly clientWidth: number;
    readonly scrollWidth: number;
  }
): void => {
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    value: metrics.clientWidth
  });
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    value: metrics.scrollWidth
  });
};
