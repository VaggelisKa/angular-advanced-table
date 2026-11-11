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
          // The stretched activator covers the card, so the click targets the item.
          await list.getByTestId('nat-list-item').nth(2).click();
          await expect(opened).toHaveText('Opened ORD-203');
        });
      });
    });
  });
});
