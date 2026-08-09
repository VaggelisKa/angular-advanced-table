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

/**
 * Resolve the element a closing dialog should restore focus to. Prefers the
 * click-event target: Safari and Firefox on macOS do not focus buttons on
 * click, so `activeElement` stays `body` there. Keyboard paths have no event
 * and fall back to the focused element; `body` is never a restore target.
 */
export const resolveDialogOpener = (eventTarget: EventTarget | null | undefined, doc: Document): HTMLElement | null => {
  if (eventTarget instanceof HTMLElement) {
    return eventTarget;
  }

  const activeElement = doc.activeElement;

  return activeElement instanceof HTMLElement && activeElement !== doc.body ? activeElement : null;
};
