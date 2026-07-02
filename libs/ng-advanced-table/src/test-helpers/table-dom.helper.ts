import { GridHarness } from '@angular/aria/grid/testing';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import type { ComponentFixture } from '@angular/core/testing';

export const query = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T | null =>
  (f.nativeElement as HTMLElement).querySelector<T>(sel);

export const queryRequired = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T => {
  const element = (f.nativeElement as HTMLElement).querySelector<T>(sel);

  if (!element) {
    throw new Error(`Expected to find an element matching "${sel}".`);
  }

  return element;
};

export const queryAll = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T[] =>
  Array.from((f.nativeElement as HTMLElement).querySelectorAll<T>(sel));

// Attaches the @angular/aria GridHarness to the rendered `ngGrid` table. Used
// only where the harness assertion is equivalent-or-stronger than the raw DOM
// query (e.g. aria-multiselectable); keyboard/selection/sizing tests stay DOM.
export const getGridHarness = async (f: ComponentFixture<unknown>): Promise<GridHarness> =>
  TestbedHarnessEnvironment.loader(f).getHarness(GridHarness);

export const createDropEvent = (columnId: string, previousIndex: number, currentIndex: number): CdkDragDrop<string[]> => {
  return {
    previousIndex,
    currentIndex,
    item: { data: columnId }
  } as unknown as CdkDragDrop<string[]>;
};

export const getHeaderColumnIds = (fixture: ComponentFixture<unknown>): string[] => {
  return queryAll(fixture, 'thead th[data-column-id]').map((header) => header.dataset['columnId'] ?? '');
};

// Derives the size of one axis from its start and (optional) end.
const resolveAxisSize = (start: number, size: number | undefined, end: number | undefined): number => {
  return size ?? (end ?? start) - start;
};

// Resolves one axis (start/size/end) from any subset of its three values.
const resolveAxis = (
  start: number | undefined,
  size: number | undefined,
  end: number | undefined
): { readonly start: number; readonly size: number; readonly end: number } => {
  const resolvedStart = start ?? 0;
  const resolvedSize = resolveAxisSize(resolvedStart, size, end);

  return { start: resolvedStart, size: resolvedSize, end: end ?? resolvedStart + resolvedSize };
};

export const mockClientRect = (element: HTMLElement, rect: Partial<DOMRectReadOnly>): void => {
  const horizontal = resolveAxis(rect.left, rect.width, rect.right);
  const vertical = resolveAxis(rect.top, rect.height, rect.bottom);

  element.getBoundingClientRect = (): DOMRect => {
    const domRect: DOMRect = {
      x: horizontal.start,
      y: vertical.start,
      left: horizontal.start,
      top: vertical.start,
      right: horizontal.end,
      bottom: vertical.end,
      width: horizontal.size,
      height: vertical.size,
      toJSON: () => ({})
    };

    return domRect;
  };
};

// Returns the last element of a recorded-events array, throwing if empty. Lets
// assertions read the latest event without optional chaining on `.at(-1)`.
export const requireLast = <T>(values: readonly T[]): T => {
  const last = values.at(-1);

  if (last === undefined) {
    throw new Error('Expected at least one recorded event.');
  }

  return last;
};

// Returns the element at an array index, throwing if absent. Lets assertions
// read element properties without optional chaining on each indexed access.
export const requireAt = <T>(values: readonly T[], index: number): T => {
  const value = values.at(index);

  if (value === undefined) {
    throw new Error(`Expected an element at index ${index}.`);
  }

  return value;
};

const idSelector = (id: string | undefined): string => `#${id ?? ''}`;

// `#`-prefixed id selectors for a table's first and last aria-describedby targets.
export const describedBySelectors = (table: HTMLElement): { readonly first: string; readonly last: string } => {
  const ids = table.getAttribute('aria-describedby')?.split(' ') ?? [];

  return { first: idSelector(ids[0]), last: idSelector(ids.at(-1)) };
};
