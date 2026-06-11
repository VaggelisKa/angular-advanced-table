import { expect, test, type Page } from '@playwright/test';

const WIDE_WIDTH = 1400;
const NARROW_WIDTH = 360;

async function setHostWidth(page: Page, width: number): Promise<void> {
  await page.getByTestId('resize-host').evaluate((host, value) => {
    const el = host as HTMLElement;
    el.style.width = `${value}px`;
    el.style.maxWidth = 'none';
    el.style.minWidth = '0';
  }, width);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/toolbar');
});

test('renders the toolbar showcase page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Table Toolbar' })).toBeVisible();
  await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

  // nat-toolbar-button class is applied to projected buttons and resolves a non-zero border-radius.
  const exportButton = page.getByTestId('export-button');
  await expect(exportButton).toHaveClass(/nat-toolbar-button/);
  const radius = await exportButton.evaluate(
    (el) => getComputedStyle(el).borderRadius,
  );
  expect(radius).not.toBe('0px');
});

test('collapses end items into the More menu at narrow widths and restores them when wide', async ({
  page,
}) => {
  const exportButton = page.getByTestId('export-button');
  const densityPicker = page.getByTestId('density-picker');
  const moreButton = page.getByRole('button', { name: /More toolbar items/ });

  await expect(exportButton).toBeVisible();
  await expect(moreButton).toBeHidden();

  await setHostWidth(page, NARROW_WIDTH);

  await expect(moreButton).toBeVisible();
  await expect(moreButton).toHaveAttribute('aria-haspopup', 'true');
  await expect(exportButton).toBeHidden();
  await expect(densityPicker).toBeHidden();

  await setHostWidth(page, WIDE_WIDTH);

  await expect(moreButton).toBeHidden();
  await expect(exportButton).toBeVisible();
  await expect(densityPicker).toBeVisible();
});

test('fires the hidden original from the default mirror entry and closes the menu', async ({
  page,
}) => {
  await setHostWidth(page, NARROW_WIDTH);

  await page.getByRole('button', { name: /More toolbar items/ }).click();
  const menu = page.getByRole('menu', { name: 'More toolbar items' });
  await menu.getByRole('menuitem', { name: 'Export' }).click();

  await expect(page.getByTestId('last-action')).toHaveText('export-csv');
  await expect(menu).toBeHidden();
});

test('renders custom mirror template entries that update client state', async ({ page }) => {
  await setHostWidth(page, NARROW_WIDTH);

  await page.getByRole('button', { name: /More toolbar items/ }).click();
  const menu = page.getByRole('menu', { name: 'More toolbar items' });
  await menu.getByRole('menuitem', { name: 'compact' }).click();

  await expect(page.getByTestId('density-value')).toHaveText('compact');
});

test('mirrors the sort menu as a submenu and applies sorting (spike verification)', async ({
  page,
}) => {
  // Use a very narrow width to force Sort (and all other end items) into overflow.
  await setHostWidth(page, 200);

  await page.getByRole('button', { name: /More toolbar items/ }).click();
  const menu = page.getByRole('menu', { name: 'More toolbar items' });
  const sortEntry = menu.getByRole('menuitem', { name: 'Sort' });
  await expect(sortEntry).toBeVisible();
  await sortEntry.click();

  const sortValueDescending = page.getByRole('menuitemradio', { name: 'Sort Value descending' });
  await expect(sortValueDescending).toBeVisible();
  await sortValueDescending.click();

  await expect(page.locator('tbody tr').first()).toContainText('Epsilon Shield');
});

test('keeps the mirrored submenu inside the viewport near the screen edge', async ({ page }) => {
  // Narrow viewport puts the More button (toolbar end) close to the right
  // screen edge; the submenu's default beside-the-panel placement would
  // land off-screen and must flip/clamp inward instead. Width 200 forces
  // Sort into overflow (same as the spike test above).
  const viewportWidth = 360;
  await page.setViewportSize({ width: viewportWidth, height: 720 });
  await setHostWidth(page, 200);

  await page.getByRole('button', { name: /More toolbar items/ }).click();
  const menu = page.getByRole('menu', { name: 'More toolbar items' });
  await menu.getByRole('menuitem', { name: 'Sort' }).click();

  const submenu = page.getByRole('menu', { name: 'Sort' });
  await expect(submenu).toBeVisible();

  const box = await submenu.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth);
});

test('pins the focused item visible while other items collapse', async ({ page }) => {
  const exportButton = page.getByTestId('export-button');
  await exportButton.focus();

  await setHostWidth(page, NARROW_WIDTH);

  await expect(page.getByRole('button', { name: /More toolbar items/ })).toBeVisible();
  await expect(exportButton).toBeVisible();
  await expect(exportButton).toBeFocused();
  await expect(page.getByTestId('density-picker')).toBeHidden();

  // Release focus, then force one refit: the pin no longer applies.
  await page.locator('tbody tr').first().click();
  await setHostWidth(page, NARROW_WIDTH - 1);
  await expect(exportButton).toBeHidden();
});

test('returns focus to the More button after activating a mirror entry', async ({ page }) => {
  await setHostWidth(page, NARROW_WIDTH);

  const moreButton = page.getByRole('button', { name: /More toolbar items/ });
  await moreButton.click();
  await page
    .getByRole('menu', { name: 'More toolbar items' })
    .getByRole('menuitem', { name: 'Export' })
    .click();

  await expect(moreButton).toBeFocused();
});

test('rescues focus to the More button when the focused item is forced into the overflow', async ({
  page,
}) => {
  const exportButton = page.getByTestId('export-button');
  await exportButton.focus();
  await expect(exportButton).toBeFocused();

  // Synthetic click: flips Export to natToolbarOverflow='always' WITHOUT stealing focus.
  await page.getByTestId('force-collapse-export').evaluate((button) => {
    (button as HTMLButtonElement).click();
  });

  const moreButton = page.getByRole('button', { name: /More toolbar items/ });
  await expect(exportButton).toBeHidden();
  await expect(moreButton).toBeVisible();
  await expect(moreButton).toBeFocused();
});

test('collapses search to an icon below the threshold and expands on demand', async ({ page }) => {
  await setHostWidth(page, NARROW_WIDTH);

  const expandButton = page.getByRole('button', { name: 'Expand search' });
  await expect(expandButton).toBeVisible();

  await expandButton.click();
  const input = page.locator('nat-toolbar-search input');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  await input.press('Escape');
  await expect(input).toBeHidden();
  await expect(expandButton).toBeVisible();
});

test('moves the roving tab stop with arrow keys in visual order (LTR)', async ({ page }) => {
  const exportButton = page.getByTestId('export-button');
  const shareButton = page.getByTestId('share-button');

  await exportButton.focus();
  await exportButton.press('ArrowRight');
  await expect(shareButton).toBeFocused();

  await shareButton.press('ArrowLeft');
  await expect(exportButton).toBeFocused();
});

test('reverses arrow keys in RTL', async ({ page }) => {
  await page.addInitScript(() => {
    if (document.documentElement) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.addEventListener('DOMContentLoaded', () =>
        document.documentElement.setAttribute('dir', 'rtl'),
      );
    }
  });
  await page.goto('/toolbar');
  await expect(page.getByRole('toolbar', { name: 'Products toolbar' })).toBeVisible();

  const exportButton = page.getByTestId('export-button');
  const shareButton = page.getByTestId('share-button');

  await exportButton.focus();
  await exportButton.press('ArrowLeft');
  await expect(shareButton).toBeFocused();
});

test('collapses items when the viewport narrows and restores them when it widens', async ({
  page,
}) => {
  // Start wide — all end items should be visible, no More button.
  await page.setViewportSize({ width: 1400, height: 900 });

  // Which exact demo item collapses at a given width depends on demo content
  // widths — brittle to assert. The stable contract: the actions trigger is
  // ALWAYS the first drop (built-in priority -100), the More button appears,
  // and everything restores when the viewport widens again.
  const actionsTrigger = page.locator('nat-toolbar-actions');
  const moreButton = page.getByRole('button', { name: /More toolbar items/ });

  await expect(actionsTrigger).toBeVisible();
  await expect(moreButton).toBeHidden();

  // Narrow the viewport — the fluid container shrinks and triggers collapse.
  await page.setViewportSize({ width: 480, height: 900 });

  await expect(moreButton).toBeVisible();
  await expect(actionsTrigger).toBeHidden();

  // Widen back — items restore.
  await page.setViewportSize({ width: 1400, height: 900 });

  await expect(moreButton).toBeHidden();
  await expect(actionsTrigger).toBeVisible();
});

test('toggle-search-side flips the search host CSS order between start (0) and end (2)', async ({
  page,
}) => {
  const searchHost = page.locator('nat-toolbar-search');
  const toggleButton = page.getByTestId('toggle-search-side');

  // Initial state: start position → flex order 0.
  await expect(searchHost).toHaveCSS('order', '0');
  await expect(toggleButton).toHaveText('Search → right');

  // Toggle to end — wait for the inline style to settle.
  await toggleButton.click();
  await expect(searchHost).toHaveCSS('order', '2');
  await expect(toggleButton).toHaveText('Search → left');

  // Toggle back to start — wait for the inline style to settle.
  await toggleButton.click();
  await expect(searchHost).toHaveCSS('order', '0');
  await expect(toggleButton).toHaveText('Search → right');
});

test('does not oscillate at the collapse boundary', async ({ page }) => {
  const moreButton = page.getByRole('button', { name: /More toolbar items/ });

  let width = WIDE_WIDTH;
  await setHostWidth(page, width);
  await expect(moreButton).toBeHidden();

  // Walk down in 20px steps until the first item collapses — that is the boundary.
  while (width > NARROW_WIDTH && !(await moreButton.isVisible())) {
    width -= 20;
    await setHostWidth(page, width);
    await page.waitForTimeout(50);
  }

  await expect(moreButton).toBeVisible();

  // Let the fit settle, then require zero hide/show churn for 600ms.
  await page.waitForTimeout(200);
  const mutationCount = await page.evaluate(async () => {
    const toolbar = document.querySelector('nat-table-toolbar');
    if (!toolbar) {
      return -1;
    }
    let count = 0;
    const observer = new MutationObserver((records) => {
      count += records.length;
    });
    observer.observe(toolbar, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      subtree: true,
    });
    await new Promise((resolve) => setTimeout(resolve, 600));
    observer.disconnect();
    return count;
  });
  expect(mutationCount).toBe(0);
});
