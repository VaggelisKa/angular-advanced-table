import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

type ButtonGeometry = {
  readonly box: { readonly width: number; readonly height: number };
  readonly target: { readonly width: number; readonly height: number };
};

const readGeometry = async (button: Locator): Promise<ButtonGeometry> =>
  button.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const pseudo = getComputedStyle(element, '::before');

    return {
      box: { width: rect.width, height: rect.height },
      target: { width: Number.parseFloat(pseudo.width), height: Number.parseFloat(pseudo.height) }
    };
  });

const scrollLeftOf = async (page: Page): Promise<number> =>
  page.locator('nat-table .table-region').evaluate((element) => element.scrollLeft);

test.describe('FEATURE: Scroll control pointer target', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test.describe('GIVEN: the fixed-width live market table is loaded', () => {
    test.describe('WHEN: the scroll buttons are measured and clicked just outside their visual box', () => {
      test('THEN: it draws a 36px box with a 24px arrow, extends the pointer target to 44px, and honors per-axis size overrides', async ({
        page
      }) => {
        const nextButton = page.getByRole('button', { name: 'Scroll table right' });
        const icon = nextButton.locator('.scroll-icon');

        await test.step('THEN: the stock box is 36px square with a 24px arrow and a 44px hit area', async () => {
          await expect(nextButton).toBeEnabled();
          await nextButton.scrollIntoViewIfNeeded();

          const geometry = await readGeometry(nextButton);
          const iconBox = await icon.boundingBox();

          expect(geometry.box).toEqual({ width: 36, height: 36 });
          expect(geometry.target).toEqual({ width: 44, height: 44 });
          expect(iconBox?.width).toBe(24);
          expect(iconBox?.height).toBe(24);
        });

        await test.step('THEN: a click 3px above the visual box still scrolls the table', async () => {
          const box = await nextButton.boundingBox();

          expect(box).not.toBeNull();
          expect(await scrollLeftOf(page)).toBe(0);

          await page.mouse.click((box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) - 3);

          await expect.poll(async () => scrollLeftOf(page)).toBeGreaterThan(0);
        });

        await test.step('THEN: independent axis overrides shrink or clamp the target per axis', async () => {
          await page.addStyleTag({
            content:
              'nat-table-scroll-control { --nat-table-scroll-button-min-inline-size: 60px; --nat-table-scroll-button-min-block-size: 30px; }'
          });

          const geometry = await readGeometry(nextButton);

          // Inline: the 60px box already exceeds the target, so the hit area clamps to the box.
          // Block: the 30px box grows to the 44px target.
          expect(geometry.box).toEqual({ width: 60, height: 30 });
          expect(geometry.target).toEqual({ width: 60, height: 44 });
        });
      });
    });
  });
});
