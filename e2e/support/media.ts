import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

/**
 * Turns on forced-colors (Windows High Contrast) emulation and proves it took effect.
 *
 * `test.use({ forcedColors: 'active' })` does NOT apply in this project's Playwright
 * setup — `(forced-colors: active)` keeps reporting `false`, so every assertion inside
 * such a block silently runs in normal colours and passes for the wrong reason.
 * `page.emulateMedia()` does apply. The assertion here is the point: it turns a
 * vacuous pass back into a failure if the emulation ever stops working.
 */
export async function emulateForcedColors(page: Page): Promise<void> {
  await page.emulateMedia({ forcedColors: 'active' });

  await expect.poll(async () => page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true);
}

/**
 * Turns on reduced-motion emulation and proves it took effect.
 *
 * Same caveat as {@link emulateForcedColors}: the `test.use({ reducedMotion })` fixture
 * option does not apply here, so it is asserted rather than trusted.
 */
export async function emulateReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await expect.poll(async () => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
}

/**
 * Computed focus-indicator properties for the element `locator` resolves to.
 *
 * `getComputedStyle` reflects every rule currently matching, including
 * `:focus-visible` ones, so the element only needs to be focused first.
 */
export async function focusIndicatorOf(
  locator: Locator
): Promise<{ outlineStyle: string; outlineWidthPx: number; boxShadow: string }> {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      outlineStyle: style.outlineStyle,
      outlineWidthPx: Number.parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow
    };
  });
}

/**
 * Resolved text colour and the nearest painted background behind the element.
 *
 * Table cells are usually transparent, so the background is walked up the ancestor
 * chain until a non-transparent one is found — the colour a viewer actually sees the
 * text against.
 */
export async function paintedColorsOf(locator: Locator): Promise<{ color: string; background: string }> {
  return locator.evaluate((element) => {
    const isTransparent = (value: string): boolean => value === 'transparent' || value === 'rgba(0, 0, 0, 0)';

    let node: Element | null = element;
    let background = getComputedStyle(element).backgroundColor;

    while (node && isTransparent(background)) {
      node = node.parentElement;

      if (node) background = getComputedStyle(node).backgroundColor;
    }

    return { color: getComputedStyle(element).color, background };
  });
}
