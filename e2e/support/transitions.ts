import type { Locator } from '@playwright/test';

/**
 * Resolves once every CSS transition/animation running inside `root` has
 * finished.
 *
 * Theme switching transitions `background-color` over 120ms. An axe colour-contrast
 * scan taken mid-transition reads a blended background against the already-swapped
 * foreground and reports a violation that does not exist once the transition
 * settles. This waits on the real completion signal rather than sleeping.
 */
export async function waitForTransitions(root: Locator): Promise<void> {
  await root.evaluate(async (element) => {
    const animations = element.getAnimations({ subtree: true });

    await Promise.all(animations.map(async (animation) => animation.finished.catch(() => undefined)));
  });
}
