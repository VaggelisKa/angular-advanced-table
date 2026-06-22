import type { Page } from '@playwright/test';

/**
 * Forces the document direction before the app bootstraps so Angular CDK's
 * `Directionality` — which reads `<html dir>` once, at construction — sees it.
 *
 * A plain `addInitScript(() => documentElement.setAttribute('dir', ...))` does
 * NOT survive here: Playwright runs init scripts at document-start, and the HTML
 * parser overwrites `<html>` attributes when it tokenizes the real opening tag,
 * dropping `dir` before bootstrap reads it. Re-applying on every parse mutation
 * keeps it set through to bootstrap.
 */
export const applyDocumentDirection = async (page: Page, direction: 'ltr' | 'rtl'): Promise<void> => {
  await page.addInitScript((dir) => {
    const apply = (): void => {
      document.documentElement.setAttribute('dir', dir);
    };

    // Don't call apply() synchronously: at document-start `documentElement` is
    // still null. The observer fires once the parser inserts it (and on every
    // subsequent mutation), keeping `dir` set through to bootstrap.
    new MutationObserver(apply).observe(document, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', apply);
  }, direction);
};
