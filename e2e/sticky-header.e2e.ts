import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/sticky-header');
});

test('renders the sticky header showcase page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sticky Header', exact: true })).toBeVisible();
  await expect(page.getByText('Configure Sticky State')).toBeVisible();
});

test('viewport sticky tables translate headers on page scroll', async ({ page }) => {
  const table1 = page.locator('table[aria-label="Viewport sticky table 1"]');
  const headerCell = table1.locator('thead th').first();
  
  // Initially, no translation since we are at the top
  const transformInit = await headerCell.evaluate((el) => el.style.transform);
  expect(transformInit).toBe('');

  // Scroll Table 1 into view
  await table1.scrollIntoViewIfNeeded();

  // Scroll down past Table 1's top by 200px
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });

  // Give the scroll listener a moment to fire and requestAnimationFrame to execute
  await page.waitForTimeout(150);

  // The header cell should now have translate3d applied because it is sticky
  const transform = await headerCell.evaluate((el) => el.style.transform);
  expect(transform).toContain('translate3d(0px,');
});

test('simulating sticky topbar shifts the sticky offset', async ({ page }) => {
  // Toggle simulated topbar simulation
  const simulateToggle = page.locator('label').filter({ hasText: 'Simulate Sticky Topbar (60px)' }).locator('input');
  await simulateToggle.check();

  // Scroll to Table 1
  const table1 = page.locator('table[aria-label="Viewport sticky table 1"]');
  await table1.scrollIntoViewIfNeeded();

  // Scroll down past Table 1's top by 200px
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });

  await page.waitForTimeout(150);

  // Verify that the table header elements have sticky offset adjusted
  const stickyTop = await table1.evaluate((el) => {
    const region = el.closest('.table-region');
    return region ? getComputedStyle(region).getPropertyValue('--nat-table-sticky-top') : '';
  });
  expect(stickyTop.trim()).toBe('60px');
});

test('toggling off sticky header removes translations', async ({ page }) => {
  const table1 = page.locator('table[aria-label="Viewport sticky table 1"]');
  const headerCell = table1.locator('thead th').first();

  // Scroll Table 1 into view
  await table1.scrollIntoViewIfNeeded();

  // Scroll down past Table 1's top by 200px
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  await page.waitForTimeout(150);

  let transform = await headerCell.evaluate((el) => el.style.transform);
  expect(transform).toContain('translate3d(0px,');

  // Scroll up to ensure configuration card is in view
  const configHeader = page.getByText('Configure Sticky State');
  await configHeader.scrollIntoViewIfNeeded();

  // Toggle Enable Sticky Header off
  const enableToggle = page.locator('label').filter({ hasText: 'Enable Sticky Header' }).locator('input');
  await enableToggle.uncheck();

  // Scroll back down past Table 1's top by 200px
  await table1.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  await page.waitForTimeout(150);

  // The translation should be cleared / not applied
  transform = await headerCell.evaluate((el) => el.style.transform);
  expect(transform).toBe('');
});
