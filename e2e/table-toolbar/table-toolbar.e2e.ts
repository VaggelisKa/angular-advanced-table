import { expect, test, type Locator, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/toolbar');
});

/**
 * Asserts `first` precedes `second` in REAL DOM order (what screen readers
 * read). The toolbar places items with static ng-content slots, so DOM order
 * is fixed at render time.
 */
const expectPrecedes = async (first: Locator, second: Locator) =>
  expect
    .poll(async () =>
      first.evaluate(
        (element, other) =>
          other !== null &&
          Boolean(element.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING),
        await second.elementHandle(),
      ),
    )
    .toBe(true);

const buttons = (page: Page) => ({
  exportButton: page.getByTestId('export-button'),
  refreshButton: page.getByTestId('refresh-button'),
  compactButton: page.getByTestId('density-compact-button'),
  comfortableButton: page.getByTestId('density-comfortable-button'),
  shareButton: page.getByTestId('share-button'),
});

async function gotoToolbarPageWithHtmlDirection(
  page: Page,
  direction: 'ltr' | 'rtl',
): Promise<void> {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() !== 'document') {
      await route.continue();
      return;
    }

    const response = await route.fetch();
    const body = await response.text();
    const html = body.replace(/<html([^>]*)>/i, `<html$1 dir="${direction}">`);

    await route.fulfill({ response, body: html });
  });

  await page.goto('/examples/toolbar');
  await page.unroute('**/*');
}

test('renders the toolbar showcase page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Table Toolbar' })).toBeVisible();
  await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

  // Projected toolbar items keep their authored button styling.
  const exportButton = page.getByTestId('export-button');
  await expect(exportButton).toHaveClass(/toolbar-button/);
  const radius = await exportButton.evaluate((el) => getComputedStyle(el).borderRadius);
  expect(radius).not.toBe('0px');
});

test('activates items and reports the action', async ({ page }) => {
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('last-action')).toHaveText('export');

  await page.getByTestId('refresh-button').click();
  await expect(page.getByTestId('last-action')).toHaveText('refresh');

  await page.getByTestId('share-button').click();
  await expect(page.getByTestId('last-action')).toHaveText('share');

  await page.getByTestId('density-compact-button').click();
  await expect(page.getByTestId('last-action')).toHaveText('density-compact');
});

test('slots lay items out as start | center | end in DOM and on screen', async ({ page }) => {
  const { exportButton, refreshButton, compactButton, shareButton } = buttons(page);

  // Export (start) < Refresh (center) < density group < Share (end) —
  // visually AND in the DOM.
  await expectPrecedes(exportButton, refreshButton);
  await expectPrecedes(refreshButton, compactButton);
  await expectPrecedes(compactButton, shareButton);

  // The flex spacers sit between the slots: start | spacer | center | spacer | end.
  // Scope to the Products toolbar — the page now has several toolbars.
  const spacers = page
    .getByRole('toolbar', { name: 'Products toolbar' })
    .locator('.nat-toolbar-spacer');
  await expectPrecedes(exportButton, spacers.first());
  await expectPrecedes(spacers.first(), refreshButton);
  await expectPrecedes(refreshButton, spacers.last());
  await expectPrecedes(spacers.last(), compactButton);

  const exportBox = await exportButton.boundingBox();
  const refreshBox = await refreshButton.boundingBox();
  const shareBox = await shareButton.boundingBox();
  expect(exportBox!.x).toBeLessThan(refreshBox!.x);
  expect(refreshBox!.x).toBeLessThan(shareBox!.x);
});

test('accessibility tree exposes the labelled widget group in slot order', async ({ page }) => {
  const toolbar = page.getByRole('toolbar', { name: 'Products toolbar' });

  await expect(toolbar).toMatchAriaSnapshot(`
    - button "Export"
    - button "Refresh"
    - group "View density":
      - button "Compact"
      - button "Comfortable"
    - button "Share"
  `);
});

test('moves the roving tab stop with arrow keys across all three slots (LTR)', async ({ page }) => {
  const { exportButton, refreshButton, compactButton, comfortableButton, shareButton } =
    buttons(page);

  await exportButton.focus();
  await exportButton.press('ArrowRight');
  await expect(refreshButton).toBeFocused();

  // Left/Right traverse group members linearly, like any other item.
  await refreshButton.press('ArrowRight');
  await expect(compactButton).toBeFocused();

  await compactButton.press('ArrowRight');
  await expect(comfortableButton).toBeFocused();

  await comfortableButton.press('ArrowRight');
  await expect(shareButton).toBeFocused();

  await shareButton.press('ArrowLeft');
  await expect(comfortableButton).toBeFocused();

  await comfortableButton.press('Home');
  await expect(exportButton).toBeFocused();

  await exportButton.press('End');
  await expect(shareButton).toBeFocused();
});

test('Up/Down cycle inside the widget group without leaving it', async ({ page }) => {
  const { compactButton, comfortableButton } = buttons(page);

  await compactButton.focus();
  await compactButton.press('ArrowDown');
  await expect(comfortableButton).toBeFocused();

  // Next widget (Share) is outside the group — Down wraps to its first member.
  await comfortableButton.press('ArrowDown');
  await expect(compactButton).toBeFocused();

  await compactButton.press('ArrowUp');
  await expect(comfortableButton).toBeFocused();
});

test('reverses arrow keys in RTL', async ({ page }) => {
  await gotoToolbarPageWithHtmlDirection(page, 'rtl');

  await expect.poll(() => page.evaluate(() => document.documentElement.dir)).toBe('rtl');
  await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

  const { exportButton, refreshButton } = buttons(page);

  await exportButton.focus();
  await exportButton.press('ArrowLeft');
  await expect(refreshButton).toBeFocused();
});
