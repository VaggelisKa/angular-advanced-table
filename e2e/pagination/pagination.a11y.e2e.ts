import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';

test.describe('FEATURE: Pagination accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/pagination');
    await loadDocsExamplePreview(page, 'pagination', 'Client and manual pagination');
  });

  test.describe('GIVEN: the pagination example is loaded', () => {
    test.describe('WHEN: Tab traverses the pagination row', () => {
      // Pagination is deliberately not a toolbar: a roving tabindex would put
      // the select and both pager buttons behind a single Tab stop, leaving
      // Previous/Next unreachable for anyone who does not guess at arrow keys.
      test('THEN: it reaches the page-size select and both pager buttons as separate tab stops', async ({ page }) => {
        const clientCard = page.getByTestId('pagination-client');
        const rowsPerPageSelect = clientCard.getByRole('combobox');
        const nextBtn = clientCard.getByRole('button', { name: 'Next page' });
        const prevBtn = clientCard.getByRole('button', { name: 'Previous page' });

        await test.step('GIVEN: the pagination row exposes no toolbar role', async () => {
          await expect(clientCard.getByRole('toolbar')).toHaveCount(0);
        });

        await test.step('THEN: on the first page Previous is disabled, so Tab goes select → Next', async () => {
          await expect(prevBtn).toBeDisabled();

          await rowsPerPageSelect.focus();
          await page.keyboard.press('Tab');

          await expect(nextBtn).toBeFocused();
        });

        await test.step('THEN: on the last page Previous is enabled and Tab reaches it after the select', async () => {
          await page.keyboard.press('Enter');
          await expect(prevBtn).toBeEnabled();
          // Two pages of demo data: page 2 is the last, so Next is disabled
          // and drops out of the tab order.
          await expect(nextBtn).toBeDisabled();

          await rowsPerPageSelect.focus();
          await page.keyboard.press('Tab');
          await expect(prevBtn).toBeFocused();

          await page.keyboard.press('Tab');
          await expect(nextBtn).not.toBeFocused();
        });

        await test.step('THEN: Shift+Tab walks back through Previous to the select', async () => {
          await prevBtn.focus();
          await page.keyboard.press('Shift+Tab');
          await expect(rowsPerPageSelect).toBeFocused();
        });
      });
    });

    test.describe('WHEN: keyboard activates page-size select and navigation buttons', () => {
      test('THEN: it navigates client-side pagination using keyboard only', async ({ page }) => {
        const clientCard = page.getByTestId('pagination-client');
        const clientTable = clientCard.locator('table');
        const rowsPerPageSelect = clientCard.getByRole('combobox');
        const nextBtn = clientCard.getByRole('button', { name: 'Next page' });
        const prevBtn = clientCard.getByRole('button', { name: 'Previous page' });

        await test.step('THEN: the client-side grid starts with the default page size', async () => {
          // Initial page size is 3
          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: five rows are shown after selecting page size 5 via keyboard', async () => {
          await rowsPerPageSelect.focus();
          await rowsPerPageSelect.selectOption('5');

          await expect(clientTable.locator('tbody tr')).toHaveCount(5);
        });

        await test.step('THEN: three rows are shown after selecting page size 3 via keyboard', async () => {
          await rowsPerPageSelect.focus();
          await rowsPerPageSelect.selectOption('3');

          await expect(clientTable.locator('tbody tr')).toHaveCount(3);
        });

        await test.step('THEN: the first page disables Previous', async () => {
          await expect(prevBtn).toBeDisabled();
        });

        await test.step('THEN: Previous is enabled after focusing Next and pressing Enter', async () => {
          await nextBtn.focus();
          await page.keyboard.press('Enter');

          await expect(prevBtn).toBeEnabled();
        });
      });
    });

    test.describe('WHEN: the pagination example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-pagination-preview-panel"]');
      });
    });
  });
});
