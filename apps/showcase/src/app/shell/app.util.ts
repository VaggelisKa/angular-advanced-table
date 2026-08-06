/**
 * Detects Apple platforms for keyboard-shortcut hints (Cmd vs Ctrl). Only call
 * this in the browser (e.g. from `afterNextRender`); SSR must keep the
 * non-Apple default because `navigator` is unavailable there.
 */
export const isApplePlatform = (navigator: Navigator | undefined): boolean => {
  if (!navigator) {
    return false;
  }

  return /mac|iphone|ipad|ipod/iu.test(navigator.platform || navigator.userAgent);
};

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]')).filter(
    (element) => element.tabIndex >= 0 && !element.closest('[hidden]')
  );

/**
 * Resolve the element that should receive focus to keep a Tab cycle trapped
 * inside `panel`, or `null` when focus can stay where it is.
 */
export const resolveFocusTrapTarget = (panel: HTMLElement, activeElement: Element | null, shiftKey: boolean): HTMLElement | null => {
  const focusableElements = getFocusableElements(panel);
  const firstElement = focusableElements.at(0);
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    return null;
  }

  if (!(activeElement instanceof HTMLElement) || !panel.contains(activeElement)) {
    return firstElement;
  }

  if (shiftKey && activeElement === firstElement) {
    return lastElement;
  }

  if (!shiftKey && activeElement === lastElement) {
    return firstElement;
  }

  return null;
};
