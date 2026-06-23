import { devices, expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/sticky-header');
});

test('renders the sticky header showcase page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sticky Header', exact: true })).toBeVisible();
  await expect(page.getByText('Configure Sticky State')).toBeVisible();
});

test('desktop viewport sticky tables translate headers on page scroll', async ({ page }) => {
  const table1 = page.locator('table[aria-label="Viewport sticky table 1"]');
  const thead = table1.locator('thead');
  const headerCell = table1.locator('thead th').first();

  // Initially, no translation since we are at the top
  const transformInit = await thead.evaluate((el) => {
    return el.style.transform || window.getComputedStyle(el).transform;
  });
  expect(transformInit === '' || transformInit === 'none' || transformInit.includes('matrix(1, 0, 0, 1, 0, 0)')).toBe(true);

  // Scroll Table 1 into view
  await table1.scrollIntoViewIfNeeded();

  // Scroll down past Table 1's top by 200px
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });

  // Give the scroll listener a moment to fire and requestAnimationFrame to execute
  await page.waitForTimeout(150);

  // The header row should now have translation applied (either via style.transform or computed matrix)
  const transform = await thead.evaluate((el) => {
    return el.style.transform || window.getComputedStyle(el).transform;
  });
  await expect(table1).toHaveClass(/uses-viewport-sticky/);
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
  expect(transform.includes('matrix(1, 0, 0, 1, 0, 0)')).toBe(false);

  // Individual cells stay untransformed so horizontal table scrolling remains synchronized.
  await expect
    .poll(async () =>
      headerCell.evaluate((el) => {
        const transformValue = window.getComputedStyle(el).transform;

        return transformValue === 'none' || transformValue === 'matrix(1, 0, 0, 1, 0, 0)';
      })
    )
    .toBe(true);

  await table1.evaluate((table) => {
    const region = table.closest('.table-region');

    if (region) {
      region.scrollLeft = 120;
    }
  });

  const horizontalDelta = await table1.evaluate((table) => {
    const header = table.querySelector('thead th');
    const body = table.querySelector('tbody tr:first-child th, tbody tr:first-child td');

    if (!header || !body) {
      throw new Error('Expected header and body cells to be rendered.');
    }

    return Math.round(header.getBoundingClientRect().left - body.getBoundingClientRect().left);
  });

  expect(horizontalDelta).toBe(0);
});

test('touch viewport sticky tables use native sticky without scroll-sync transforms', async ({ baseURL, browser }) => {
  const context = await browser.newContext({
    ...devices['iPhone 15'],
    baseURL
  });
  const page = await context.newPage();

  try {
    await page.goto('/examples/sticky-header');

    const table1 = page.locator('table[aria-label="Viewport sticky table 1"]');
    const thead = table1.locator('thead');
    const headerCell = table1.locator('thead th').first();

    await table1.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      window.scrollBy(0, 200);
    });
    await page.waitForTimeout(150);

    await expect(table1).toHaveClass(/has-sticky-header/);
    await expect(table1).not.toHaveClass(/uses-viewport-sticky/);
    await expect(table1).toHaveClass(/uses-native-viewport-sticky/);

    const transform = await thead.evaluate((el) => {
      return el.style.transform || window.getComputedStyle(el).transform;
    });
    const headerTop = await headerCell.evaluate((el) => Math.round(el.getBoundingClientRect().top));

    expect(transform === '' || transform === 'none' || transform.includes('matrix(1, 0, 0, 1, 0, 0)')).toBe(true);
    expect(Math.abs(headerTop)).toBeLessThanOrEqual(2);
  } finally {
    await context.close();
  }
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
  const thead = table1.locator('thead');

  // Scroll Table 1 into view
  await table1.scrollIntoViewIfNeeded();

  // Scroll down past Table 1's top by 200px
  await page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  await page.waitForTimeout(150);

  let transform = await thead.evaluate((el) => {
    return el.style.transform || window.getComputedStyle(el).transform;
  });
  expect(transform).not.toBe('');
  expect(transform).not.toBe('none');
  expect(transform.includes('matrix(1, 0, 0, 1, 0, 0)')).toBe(false);

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
  transform = await thead.evaluate((el) => {
    return el.style.transform || window.getComputedStyle(el).transform;
  });
  expect(transform === '' || transform === 'none' || transform.includes('matrix(1, 0, 0, 1, 0, 0)')).toBe(true);
});
