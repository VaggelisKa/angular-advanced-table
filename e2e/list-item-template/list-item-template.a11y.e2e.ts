import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: List item template accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/list-renderer');
    await loadDocsExamplePreview(page, 'list-item-template', 'Item template');
  });

  test.describe('GIVEN: the list item template example is loaded', () => {
    test.describe('WHEN: an item is activated with the keyboard', () => {
      test('THEN: it names the activator by the labelled element and activates on Enter', async ({ page }) => {
        const preview = page.getByTestId('docs-example-list-item-template-preview-panel');
        const activator = preview.getByRole('button', { name: 'Aster Logistics', exact: true });

        await test.step('THEN: the activator is named by the natListItemLabel element', async () => {
          await expect(activator).toHaveCount(1);
        });

        await test.step('THEN: Enter on the activator opens the item', async () => {
          await activator.focus();
          await page.keyboard.press('Enter');
          await expect(preview.getByTestId('list-item-template-opened')).toHaveText('Opened ORD-201');
        });
      });
    });

    test.describe('WHEN: the example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-list-item-template-preview-panel"]');
      });
    });
  });
});
