/** True for hosts the overflow engine can mirror with a plain forwarding button. */
export const isNatToolbarButtonLikeElement = (element: HTMLElement): boolean =>
  element.tagName === 'BUTTON' ||
  (element.tagName === 'A' && element.hasAttribute('href')) ||
  element.getAttribute('role') === 'button';
