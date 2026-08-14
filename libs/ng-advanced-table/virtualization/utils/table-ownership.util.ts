/** Whether an element belongs to `host` rather than a nested NatTable. */
export const isOwnedNatTableElement = (host: HTMLElement, element: Element): boolean => element.closest('nat-table') === host;

/** Finds the nearest matching ancestor owned by `host`, skipping nested NatTable matches. */
export const findOwnedNatTableAncestor = <TElement extends HTMLElement>(
  host: HTMLElement,
  element: EventTarget | null,
  selector: string
): TElement | null => {
  if (!(element instanceof Element)) {
    return null;
  }

  let candidate = element.closest<TElement>(selector);

  while (candidate && host.contains(candidate)) {
    if (isOwnedNatTableElement(host, candidate)) {
      return candidate;
    }

    candidate = candidate.parentElement?.closest<TElement>(selector) ?? null;
  }

  return null;
};

/** Finds the grid cell owned by `host` for a keyboard event target. */
export const findOwnedNatTableCell = (host: HTMLElement, target: EventTarget | null): HTMLElement | null =>
  target instanceof Element && isOwnedNatTableElement(host, target)
    ? findOwnedNatTableAncestor(host, target, '[ngGridCell][data-column-id]')
    : null;

/** Finds the placeholder row (an unfetched remote-windowing slot) owned by `host` around a target. */
export const findOwnedNatTablePlaceholderRow = (host: HTMLElement, target: EventTarget | null): HTMLTableRowElement | null =>
  findOwnedNatTableAncestor(host, target, 'tr.placeholder-row[data-row-index]');

/**
 * Finds any body row — loaded or placeholder — owned by `host` around a
 * target. Both carry the logical `data-row-index`, which header rows never do,
 * so a keydown or focusin in the header still resolves to `null`.
 */
export const findOwnedNatTableBodyRow = (host: HTMLElement, target: EventTarget | null): HTMLTableRowElement | null =>
  findOwnedNatTableAncestor(host, target, 'tr.data-row[data-row-index]');

/** Queries only matches owned by `host`, excluding descendants of nested NatTables. */
export const queryOwnedNatTableElements = <TElement extends HTMLElement>(host: HTMLElement, selector: string): TElement[] =>
  [...host.querySelectorAll<TElement>(selector)].filter((candidate) => isOwnedNatTableElement(host, candidate));
