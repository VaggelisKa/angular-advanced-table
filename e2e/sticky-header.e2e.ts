import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/examples/sticky-header');
});

test('renders the sticky header showcase page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Sticky Header', exact: true })).toBeVisible();
  await expect(page.getByText('Configure Sticky State')).toBeVisible();
});

test('viewport sticky tables translate headers on page scroll', async ({ page }) => {
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

test('touch viewport sticky tables stay aligned farther down the page', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window);

    window.matchMedia = (query: string): MediaQueryList => {
      const result = nativeMatchMedia(query);

      if (query !== '(hover: none) and (pointer: coarse)') {
        return result;
      }

      return new Proxy(result, {
        get(target, property, receiver) {
          if (property === 'matches') {
            return true;
          }

          return Reflect.get(target, property, receiver);
        }
      });
    };
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/examples/sticky-header');

  const table5 = page.locator('table[aria-label="Viewport sticky table 5"]');

  await table5.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    window.scrollBy(0, 220);
  });
  await page.waitForTimeout(150);

  const metrics = await table5.evaluate((table) => {
    const thead = table.querySelector('thead');

    if (!thead) {
      throw new Error('Expected table header to be rendered.');
    }

    return {
      tableClass: table.className,
      headerTop: thead.getBoundingClientRect().top,
      stickyTop: getComputedStyle(table.closest('.table-region') ?? table)
        .getPropertyValue('--nat-table-sticky-top')
        .trim()
    };
  });

  expect(metrics.tableClass).not.toContain('supports-scroll-timeline');
  const stickyTop = Number.parseFloat(metrics.stickyTop);

  expect(stickyTop).toBeGreaterThan(0);
  expect(Math.abs(metrics.headerTop - stickyTop)).toBeLessThanOrEqual(2);
});

test('native viewport prototype avoids transform sync while sticky', async ({ page }) => {
  const table = page.locator('table[aria-label="Native viewport sticky table 2"]');

  await table.evaluate((tableElement) => {
    const tableTop = tableElement.getBoundingClientRect().top + window.scrollY;

    window.scrollTo(0, tableTop + 220);
  });
  await page.waitForTimeout(150);

  const metrics = await table.evaluate((tableElement) => {
    const thead = tableElement.querySelector('thead');
    const headerCell = tableElement.querySelector('thead th');

    if (!thead || !headerCell) {
      throw new Error('Expected table header to be rendered.');
    }

    const transform = window.getComputedStyle(thead).transform;

    return {
      headerTop: headerCell.getBoundingClientRect().top,
      stickyTop: getComputedStyle(tableElement.closest('.table-region') ?? tableElement)
        .getPropertyValue('--nat-table-sticky-top')
        .trim(),
      transform
    };
  });
  const stickyTop = Number.parseFloat(metrics.stickyTop || '0');

  expect(metrics.transform === 'none' || metrics.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  expect(Math.abs(metrics.headerTop - stickyTop)).toBeLessThanOrEqual(2);
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
