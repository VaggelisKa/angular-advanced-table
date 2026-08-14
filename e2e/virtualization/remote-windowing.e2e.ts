import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

const ROW_HEIGHT = 44;
const REMOTE_TOTAL = 250_000;

type PlaceholderSighting = {
  readonly ariaBusy: string | null;
  readonly ariaRowIndex: string | null;
  readonly cellCount: number;
  readonly text: string;
};

const scrollToRow = async (region: Locator, rowIndex: number): Promise<void> => {
  await region.evaluate((element, target) => {
    element.scrollTop = target;
    element.dispatchEvent(new Event('scroll'));
  }, rowIndex * ROW_HEIGHT);
};

/**
 * Placeholder rows exist only until the demo's window fetch lands, so they are
 * observed with a MutationObserver armed before the jump instead of a polled
 * locator that could miss the fill window.
 */
const armPlaceholderObserver = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const table = document.querySelector('[data-testid="virtualization-remote-table"]');

    (window as unknown as { placeholderSighting: Promise<unknown> }).placeholderSighting = new Promise((resolve) => {
      const read = (): boolean => {
        const placeholder = table?.querySelector('[data-testid="nat-table-row-placeholder"]');

        if (!placeholder) {
          return false;
        }

        resolve({
          ariaBusy: placeholder.getAttribute('aria-busy'),
          ariaRowIndex: placeholder.getAttribute('aria-rowindex'),
          cellCount: placeholder.querySelectorAll('td').length,
          text: placeholder.textContent
        });

        return true;
      };

      const observer = new MutationObserver(() => {
        if (read()) {
          observer.disconnect();
        }
      });

      if (table && !read()) {
        observer.observe(table, { childList: true, subtree: true });
      }
    });
  });
};

const capturedPlaceholder = async (page: Page): Promise<PlaceholderSighting> =>
  page.evaluate(
    async () => (window as unknown as { placeholderSighting: Promise<unknown> }).placeholderSighting
  ) as Promise<PlaceholderSighting>;

test.describe('FEATURE: Remote windowing', () => {
  test.describe('GIVEN: the remote windowing example is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtualization');
      await loadDocsExamplePreview(page, 'virtualization-remote-window', 'Remote windowing');
    });

    test('THEN: it spans the remote dataset, fills jumps in place, and never accumulates windows', async ({ page }) => {
      const demo = page.getByTestId('virtualization-remote-demo');
      const tableHost = demo.getByTestId('virtualization-remote-table');
      const table = tableHost.getByRole('grid', { name: 'Remotely windowed orders' });
      const region = tableHost.getByTestId('nat-table-region');
      const rows = table.getByTestId('nat-table-row');
      const offset = demo.getByTestId('remote-offset');
      const loaded = demo.getByTestId('remote-loaded');
      const fetches = demo.getByTestId('remote-fetches');
      let scrollTopAtJump = 0;

      await test.step('THEN: the scroll extent spans the remote total while only the loaded window mounts', async () => {
        await expect(table).toHaveAttribute('aria-rowcount', String(REMOTE_TOTAL + 1));
        await expect(loaded).toHaveText('200');
        await expect(offset).toHaveText('0');
        await expect(fetches).toHaveText('0');
        await expect.poll(async () => rows.count()).toBeGreaterThan(0);
        await expect.poll(async () => rows.count()).toBeLessThan(40);
      });

      await test.step('WHEN: the reader drags to the middle THEN: placeholder slots render until the window arrives', async () => {
        await armPlaceholderObserver(page);
        await scrollToRow(region, REMOTE_TOTAL / 2);

        const placeholder = await capturedPlaceholder(page);

        expect(placeholder.ariaBusy).toBe('true');
        expect(placeholder.cellCount).toBe(5);
        expect(Number(placeholder.ariaRowIndex)).toBeGreaterThan(200);
        expect(placeholder.text).toContain('Loading');

        scrollTopAtJump = await region.evaluate((element) => element.scrollTop);
      });

      await test.step('THEN: the fetched window fills the placeholders without moving the scroll position', async () => {
        await expect(fetches).toHaveText('1');
        await expect(offset).not.toHaveText('0');
        await expect(tableHost.getByTestId('nat-table-row-placeholder')).toHaveCount(0);

        const mountedIndexes = await rows.evaluateAll((elements) => elements.map((row) => Number(row.getAttribute('data-row-index'))));

        expect(await region.evaluate((element) => element.scrollTop)).toBe(scrollTopAtJump);
        expect(Math.min(...mountedIndexes)).toBeGreaterThan(200);
        // Mounted DOM stays a bounded window regardless of the remote total.
        expect(mountedIndexes.length).toBeLessThan(40);
      });

      await test.step('WHEN: the reader jumps again THEN: the window is replaced, not accumulated', async () => {
        await scrollToRow(region, REMOTE_TOTAL - 200);

        await expect(fetches).toHaveText('2');
        await expect(loaded).toHaveText('200');
        await expect.poll(async () => Number(((await offset.textContent()) ?? '0').replace(/,/g, ''))).toBeGreaterThan(200_000);
      });
    });
  });
});
