import { expect, test } from '@playwright/test';

test.describe('FEATURE: Scroll control accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test.describe('GIVEN: the fixed-width live market table is loaded', () => {
    test.describe('WHEN: the native scroll range is operated with a keyboard', () => {
      test('THEN: it keeps slider semantics and synchronizes horizontal table scrolling', async ({ page }) => {
        const range = page.getByRole('slider', { name: 'Horizontal scroll position' });
        const tableRegion = page.locator('nat-table .table-region');

        await test.step('GIVEN: the range is enabled for the overflowing table', async () => {
          await expect(range).toHaveAttribute('type', 'range');
          await expect(range).toBeEnabled();
          await expect(range).toHaveValue('0');
        });

        await test.step('THEN: Shift plus ArrowRight moves by ten percent of the available distance', async () => {
          const { clientWidth, maxScrollLeft } = await tableRegion.evaluate((element) => ({
            clientWidth: element.clientWidth,
            maxScrollLeft: element.scrollWidth - element.clientWidth
          }));
          const expectedScrollLeft = Math.min(Math.max(Math.round(maxScrollLeft * 0.1), 1), maxScrollLeft);

          await range.focus();
          await page.keyboard.press('Shift+ArrowRight');

          await expect(range).toHaveValue(String(expectedScrollLeft));
          await expect(range).toHaveAttribute('aria-valuetext', `${Math.round((expectedScrollLeft / maxScrollLeft) * 100)}% scrolled`);
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBe(expectedScrollLeft);
          expect(clientWidth).toBeGreaterThan(0);
        });

        await test.step('THEN: End and Home synchronize both ends of the scroll range', async () => {
          const maxScrollLeft = await tableRegion.evaluate((element) => element.scrollWidth - element.clientWidth);

          await page.keyboard.press('End');
          await expect(range).toHaveValue(String(maxScrollLeft));
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBe(maxScrollLeft);

          await page.keyboard.press('Home');
          await expect(range).toHaveValue('0');
          await expect.poll(async () => tableRegion.evaluate((element) => element.scrollLeft)).toBe(0);
        });
      });
    });
  });
});
