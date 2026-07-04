type PrismGlobal = typeof globalThis & {
  Prism?: {
    highlightElement?(element: Element): void;
    highlightAllUnder?(element: Element | Document): void;
  };
};

export const getPrism = (): PrismGlobal['Prism'] => (globalThis as PrismGlobal).Prism;

/**
 * Highlight a single <code> element. Prefers Prism.highlightElement and falls back to
 * Prism.highlightAllUnder on the element's parent when highlightElement is unavailable.
 * No-op when Prism is not loaded.
 */
export const highlightElement = (element: HTMLElement): void => {
  const prism = getPrism();

  if (typeof prism?.highlightElement === 'function') {
    prism.highlightElement(element);
  } else if (typeof prism?.highlightAllUnder === 'function') {
    prism.highlightAllUnder(element.parentElement ?? element);
  }
};

/** Highlight every language-tagged <code> within a root. No-op when Prism is unavailable. */
export const highlightWithin = (root: Element | Document): void => {
  const prism = getPrism();

  if (typeof prism?.highlightAllUnder === 'function') {
    prism.highlightAllUnder(root);
  }
};
