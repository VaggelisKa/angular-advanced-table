import { expect, test } from '@playwright/test';

import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: List item template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/list-renderer');
    await loadDocsExamplePreview(page, 'list-item-template', 'Item template');
  });

  test.describe('GIVEN: the list item template example is loaded', () => {
    test.describe('WHEN: a card action and then an item are clicked', () => {
      test('THEN: it runs the action without activating and activates the clicked item', async ({ page }) => {
        const preview = page.getByTestId('docs-example-list-item-template-preview-panel');
        const list = preview.getByTestId('nat-list');
        const opened = preview.getByTestId('list-item-template-opened');

        await test.step('THEN: every item renders the projected card instead of fields', async () => {
          await expect(list.getByTestId('nat-list-item').getByTestId('list-item-template-card')).toHaveCount(6);
          await expect(list.getByTestId('nat-list-field')).toHaveCount(0);
        });

        await test.step('THEN: a control inside the card runs without activating the item', async () => {
          await list.getByRole('button', { name: 'Mark ORD-202 ready' }).click();
          await expect(list.getByRole('button', { name: 'Mark ORD-202 ready' })).toHaveCount(0);
          await expect(opened).toHaveText('Select an order to open it');
        });

        await test.step('THEN: clicking the item activates it', async () => {
          // Clicking the item padding hits the stretched activator.
          await list.getByTestId('nat-list-item').nth(2).click();
          await expect(opened).toHaveText('Opened ORD-203');
        });

        await test.step('THEN: clicking a card that forms its own layer activates its item', async () => {
          await list
            .getByTestId('list-item-template-card')
            .nth(3)
            .click({ position: { x: 4, y: 4 } });
          await expect(opened).toHaveText('Opened ORD-204');
        });
      });
    });

    test.describe('WHEN: a control inside the card positions itself with its own styles', () => {
      test('THEN: it raises unpositioned controls and leaves self-positioned ones alone', async ({ page }) => {
        const preview = page.getByTestId('docs-example-list-item-template-preview-panel');
        const action = preview.getByTestId('list-item-template-action').first();
        const computed = async (): Promise<{ position: string; zIndex: string }> =>
          action.evaluate((element) => {
            const style = getComputedStyle(element);

            return { position: style.position, zIndex: style.zIndex };
          });

        await test.step('THEN: a control without its own positioning is raised above the activator', async () => {
          expect(await computed()).toEqual({ position: 'relative', zIndex: '1' });
        });

        await test.step('THEN: a low-specificity consumer rule keeps its own position and z-index', async () => {
          // One attribute selector: far below the guard rule's specificity, so
          // this only wins because the guard lives in a cascade layer.
          await page.addStyleTag({
            content: '[data-testid="list-item-template-action"] { position: absolute; z-index: 5; }'
          });

          expect(await computed()).toEqual({ position: 'absolute', zIndex: '5' });
        });
      });
    });
  });
});
