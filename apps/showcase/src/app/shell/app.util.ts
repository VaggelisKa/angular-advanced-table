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
