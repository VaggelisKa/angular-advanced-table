import { expect, test } from '@playwright/test';

test.describe('Multiple features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/multiple-features');
  });

  test('renders the live market tape showcase page', async ({ page }) => {
    await expect(page.locator('.brand-name')).toHaveText('Advanced Table');
    await expect(page.locator('.brand-context')).toHaveText('Live market tape');
    await expect(page.getByRole('heading', { name: 'Live movers' })).toBeVisible();

    // telemetry cards
    await expect(page.locator('.kpis')).toBeVisible();
    await expect(page.locator('.kpi', { hasText: 'Instruments' })).toContainText('Instruments');
  });

  test('can pause and resume live feed simulation', async ({ page }) => {
    const sessionLabel = page.locator('.session-label');
    const toggleBtn = page.getByRole('button', { name: /(Pause feed|Resume feed)/ });

    // Pause feed
    await toggleBtn.click();
    await expect(sessionLabel).toContainText('Feed paused');

    // Resume feed
    await toggleBtn.click();
    await expect(sessionLabel).toContainText('Feed live');
  });

  test('can tick manually when feed is paused', async ({ page }) => {
    // Feed starts live; pause it so the tick count only changes on manual ticks.
    await page.getByRole('button', { name: 'Pause feed' }).click();
    await expect(page.locator('.session-label')).toContainText('Feed paused');

    const tickBtn = page.getByRole('button', { name: 'Tick once' });
    const totalTicksValue = page.locator('.kpi', { hasText: 'Total ticks' }).locator('.kpi-value');
    const totalTicksBefore = await totalTicksValue.textContent();

    await tickBtn.click();

    // The total ticks count should increment or update
    await expect(totalTicksValue).not.toHaveText(totalTicksBefore ?? '');
  });

  test('filters table using signal chips', async ({ page }) => {
    // Pause simulation to prevent rows from mutating dynamically (feed starts live)
    await page.getByRole('button', { name: 'Pause feed' }).click();
    await expect(page.locator('.session-label')).toContainText('Feed paused');

    // Select Advancing signal chip
    const advancingChip = page.locator('.status-chip[data-status="Advancing"]');

    await advancingChip.click();

    // Verify only Advancing status is visible
    const advancingRows = page.locator('td[data-column-id="status"]').filter({ hasText: 'Advancing' });
    const totalRows = await page.locator('tbody tr').count();

    expect(totalRows).toBeGreaterThan(0);
    await expect(advancingRows).toHaveCount(totalRows);
  });

  test('searches rows using global fuzzy search input', async ({ page }) => {
    // Pause simulation to prevent rows from mutating dynamically (feed starts live)
    await page.getByRole('button', { name: 'Pause feed' }).click();
    await expect(page.locator('.session-label')).toContainText('Feed paused');

    // Wait for table rows to render to ensure table is fully initialized
    await expect(page.locator('tbody tr')).not.toHaveCount(0);

    const searchInput = page.locator('app-table-search input');

    await expect(searchInput).toBeVisible();

    await searchInput.fill('NASDAQ');
    await searchInput.press('Enter');

    // Check that the leading visible row's exchange is indeed NASDAQ
    await expect(page.locator('td[data-column-id="exchange"]')).toContainText(['NASDAQ']);

    // Check that no non-NASDAQ exchange cells are displayed
    const nasdaqCells = page.locator('td[data-column-id="exchange"]').filter({ hasText: 'NASDAQ' });
    const totalRows = await page.locator('tbody tr').count();

    await expect(nasdaqCells).toHaveCount(totalRows);
  });

  test('navigates pagination page sizes and indices', async ({ page }) => {
    const pager = page.getByRole('toolbar', { name: 'Live movers table toolbar' });
    const nextBtn = pager.getByRole('button', { name: 'Next page' });
    const prevBtn = pager.getByRole('button', { name: 'Previous page' });

    // Initially on page 1
    await expect(prevBtn).toBeDisabled();

    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    await expect(prevBtn).toBeEnabled();
  });
});
