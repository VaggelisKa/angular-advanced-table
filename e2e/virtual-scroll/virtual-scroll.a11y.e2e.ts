import { expect, test } from '@playwright/test';

import { expectNoAxeViolations } from '../support/axe';
import { loadDocsExamplePreview } from '../support/docs-example';
import { waitForTransitions } from '../support/transitions';

const TOTAL_ROWS = 10_000;

test.describe('FEATURE: Virtual scrolling', () => {
  test.describe('GIVEN: the virtual scrolling demo page is loaded', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/docs/virtual-scroll');
      await loadDocsExamplePreview(page, 'virtual-scroll', 'Ten thousand rows, eight columns, one small DOM');
    });

    test.describe('WHEN: navigating the windowed grid with the keyboard', () => {
      test('THEN: it exposes absolute row positions and hands focus across unmounted targets', async ({ page }) => {
        const preview = page.getByTestId('docs-example-virtual-scroll-preview-panel');
        const grid = preview.getByRole('grid');
        const firstBodyCell = preview.locator('tbody tr.data-row').first().locator('td, th').first();

        await test.step('THEN: the grid reports the full row set while mounting a subset', async () => {
          await expect(grid).toHaveAttribute('aria-rowcount', String(TOTAL_ROWS + 1));
          await expect(preview.locator('tbody tr.data-row').first()).toHaveAttribute('aria-rowindex', '2');
        });

        await test.step('THEN: Ctrl+End pre-scrolls and focuses a cell in the last logical row', async () => {
          await grid.evaluate((table) => {
            (table as HTMLElement).style.minWidth = '1600px';

            for (const column of table.querySelectorAll('col')) {
              (column as HTMLElement).style.width = '400px';
            }
          });
          await firstBodyCell.click();
          await page.keyboard.press('ControlOrMeta+End');

          await expect(async () => {
            const focusedTarget = await page.evaluate(() => {
              const active = document.activeElement as HTMLElement | null;
              const cell = active?.closest<HTMLElement>('[data-column-id]');
              const region = active?.closest<HTMLElement>('[data-testid="nat-table-region"]');
              const cellRect = cell?.getBoundingClientRect();
              const regionRect = region?.getBoundingClientRect();

              return {
                rowIndex: active?.closest('tr')?.getAttribute('aria-rowindex'),
                columnId: cell?.dataset['columnId'],
                intersectsScrollport:
                  cellRect !== undefined &&
                  regionRect !== undefined &&
                  cellRect.left >= regionRect.left &&
                  cellRect.right <= regionRect.right
              };
            });

            expect(focusedTarget).toStrictEqual({
              rowIndex: String(TOTAL_ROWS + 1),
              columnId: 'total',
              intersectsScrollport: true
            });
          }).toPass();
        });

        await test.step('THEN: ArrowUp from the last row keeps sequential navigation working', async () => {
          await page.keyboard.press('ArrowUp');

          await expect(async () => {
            const focusedRowIndex = await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'));

            expect(focusedRowIndex).toBe(String(TOTAL_ROWS));
          }).toPass();
        });

        await test.step('THEN: PageUp and PageDown move focus by the visible row-page size', async () => {
          await page.keyboard.press('PageUp');

          await expect(async () => {
            const focusedRowIndex = Number(
              await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'))
            );

            expect(focusedRowIndex).toBeLessThan(TOTAL_ROWS - 1);
          }).toPass();

          await page.keyboard.press('PageDown');

          await expect(async () => {
            const focusedRowIndex = await page.evaluate(() => document.activeElement?.closest('tr')?.getAttribute('aria-rowindex'));

            expect(focusedRowIndex).toBe(String(TOTAL_ROWS));
          }).toPass();
        });
      });
    });

    test.describe('WHEN: a keyboard-focused center cell scrolls beneath both pinned zones', () => {
      test('THEN: the pinned cells paint above it on an opaque composed focus surface', async ({ page }) => {
        const preview = page.getByTestId('docs-example-virtual-scroll-preview-panel');
        const grid = preview.getByRole('grid');
        const region = preview.getByTestId('nat-table-region');
        const firstRow = preview.locator('tbody tr.data-row').first();
        const customerCell = firstRow.locator('[data-column-id="customer"]');
        const ownerCell = firstRow.locator('[data-column-id="owner"]');

        await test.step('GIVEN: translucent state tokens and a narrow horizontally overflowing region', async () => {
          await grid.evaluate((table) => {
            const host = table.closest('nat-table') as HTMLElement;
            const scrollRegion = host.querySelector<HTMLElement>('[data-testid="nat-table-region"]');

            if (!scrollRegion) {
              throw new Error('Expected the table scroll region.');
            }

            scrollRegion.style.inlineSize = '410px';
            scrollRegion.style.maxInlineSize = '410px';
            host.style.setProperty('--nat-table-pinned-background', 'rgb(17 34 51)');
            host.style.setProperty('--nat-table-row-background-focus-pinned', 'rgb(255 0 0 / 16%)');
            host.style.setProperty('--nat-table-row-background-hover-pinned', 'rgb(0 255 0 / 12%)');
          });

          await expect(region).toHaveJSProperty('clientWidth', 410);
        });

        await test.step('GIVEN: the browser stylesheet keeps the documented pin stacking order', async () => {
          const stackingRules = await page.evaluate(() => {
            const flatten = (rules: CSSRuleList): CSSStyleRule[] =>
              Array.from(rules).flatMap((rule) => {
                if (rule instanceof CSSStyleRule) {
                  return [rule];
                }

                return rule instanceof CSSGroupingRule ? flatten(rule.cssRules) : [];
              });
            const rules = Array.from(document.styleSheets).flatMap((sheet) => flatten(sheet.cssRules));
            const requireRule = (...selectorParts: readonly string[]): CSSStyleRule => {
              const rule = rules.find((candidate) => {
                const selector = candidate.selectorText.toLowerCase();

                return selectorParts.every((part) => selector.includes(part.toLowerCase()));
              });

              if (!rule) {
                throw new Error(`Expected stylesheet rule containing ${selectorParts.join(', ')}.`);
              }

              return rule;
            };
            const requireStackingRule = (...selectorParts: readonly string[]): CSSStyleRule => {
              const rule = rules.find((candidate) => {
                const selector = candidate.selectorText.toLowerCase();

                return selectorParts.every((part) => selector.includes(part.toLowerCase())) && candidate.style.zIndex !== '';
              });

              if (!rule) {
                throw new Error(`Expected stacking rule containing ${selectorParts.join(', ')}.`);
              }

              return rule;
            };
            const ordinaryFocus = rules.find((rule) => {
              const selector = rule.selectorText.toLowerCase();

              return selector.includes('[nggridcell]') && selector.includes(':focus-visible') && !selector.includes(':is(');
            });

            if (!ordinaryFocus) {
              throw new Error('Expected the ordinary focused-cell stylesheet rule.');
            }

            return {
              ordinaryFocusZIndex: ordinaryFocus.style.zIndex,
              pinnedFocusZIndex: requireRule('[nggridcell]', ':focus-visible', ':is(', 'is-pinned-left').style.zIndex,
              focusOverlayBackgroundColor: requireRule('.data-row', ':has(:focus-visible)', 'is-pinned-left').style.backgroundColor,
              focusOverlayBackgroundImage: requireRule('.data-row', ':has(:focus-visible)', 'is-pinned-left').style.backgroundImage,
              hoverOverlayBackgroundColor: requireRule('.data-row', ':hover', 'is-pinned-left').style.backgroundColor,
              hoverOverlayBackgroundImage: requireRule('.data-row', ':hover', 'is-pinned-left').style.backgroundImage,
              pinnedCellZIndex: requireStackingRule('.is-pinned-left').style.zIndex,
              pinnedHeaderZIndex: requireStackingRule('.header-cell', '.is-pinned-left').style.zIndex,
              resizeHandleZIndex: requireStackingRule('.column-resize-handle').style.zIndex,
              resizeGuideZIndex: requireStackingRule('.column-resize-guide').style.zIndex,
              dragPreviewZIndex: requireStackingRule('.header-cell', '.cdk-drag-preview').style.zIndex
            };
          });

          expect(stackingRules.ordinaryFocusZIndex).toBe('');
          expect(stackingRules.pinnedFocusZIndex).toContain('--nat-table-z-index-focus-cell');
          expect(stackingRules.focusOverlayBackgroundColor).toContain('--nat-table-pinned-background');
          expect(stackingRules.focusOverlayBackgroundImage).toContain('--nat-table-row-background-focus-pinned');
          expect(stackingRules.hoverOverlayBackgroundColor).toContain('--nat-table-pinned-background');
          expect(stackingRules.hoverOverlayBackgroundImage).toContain('--nat-table-row-background-hover-pinned');
          expect(stackingRules.pinnedCellZIndex).toContain('--nat-table-z-index-pinned-cell');
          expect(stackingRules.pinnedHeaderZIndex).toContain('--nat-table-z-index-pinned-header');
          expect(stackingRules.resizeHandleZIndex).toContain('--nat-table-z-index-resize-handle');
          expect(stackingRules.resizeGuideZIndex).toContain('--nat-table-z-index-resize-guide');
          expect(stackingRules.dragPreviewZIndex).toContain('--nat-table-z-index-drag-preview');
        });

        await test.step('WHEN: keyboard navigation focuses the center cell before it scrolls under both pins', async () => {
          await customerCell.focus();
          await page.keyboard.press('ArrowRight');
          await expect(ownerCell).toBeFocused();
          await expect(ownerCell).toHaveCSS('position', 'relative');

          await region.evaluate((scrollRegion) => {
            const activeCell = document.activeElement?.closest<HTMLElement>('[data-column-id]');
            const row = activeCell?.closest('tr');
            const leftPinned = row?.querySelector<HTMLElement>('.is-pinned-left');

            if (!activeCell || !leftPinned) {
              throw new Error('Expected a focused center cell and a left-pinned peer.');
            }

            const maxScroll = scrollRegion.scrollWidth - scrollRegion.clientWidth;
            let bestScrollLeft = 0;
            let bestDistance = Number.POSITIVE_INFINITY;

            for (let scrollLeft = 0; scrollLeft <= maxScroll; scrollLeft += 1) {
              scrollRegion.scrollLeft = scrollLeft;
              const distance = Math.abs(activeCell.getBoundingClientRect().left - (leftPinned.getBoundingClientRect().right - 40));

              if (distance < bestDistance) {
                bestDistance = distance;
                bestScrollLeft = scrollLeft;
              }
            }

            scrollRegion.scrollLeft = bestScrollLeft;
          });
          await waitForTransitions(firstRow);
        });

        await test.step('THEN: each pinned cell wins hit testing and composites focus over its opaque base', async () => {
          const paint = await firstRow.evaluate((row) => {
            const center = row.querySelector<HTMLElement>('[data-column-id="owner"]');
            const left = row.querySelector<HTMLElement>('.is-pinned-left');
            const right = row.querySelector<HTMLElement>('.is-pinned-right');

            if (!center || !left || !right) {
              throw new Error('Expected center, left-pinned, and right-pinned cells.');
            }

            const centerRect = center.getBoundingClientRect();
            const pointStack = (pinned: HTMLElement): string[] => {
              const pinnedRect = pinned.getBoundingClientRect();
              const overlapLeft = Math.max(centerRect.left, pinnedRect.left);
              const overlapRight = Math.min(centerRect.right, pinnedRect.right);

              if (overlapRight <= overlapLeft) {
                throw new Error('Expected the focused center cell to overlap the pinned cell.');
              }

              return document
                .elementsFromPoint((overlapLeft + overlapRight) / 2, centerRect.top + centerRect.height / 2)
                .map((element) => element.closest<HTMLElement>('[data-column-id]')?.dataset['columnId'])
                .filter((columnId): columnId is string => columnId !== undefined);
            };
            const leftStyle = getComputedStyle(left);
            const rightStyle = getComputedStyle(right);
            const centerStyle = getComputedStyle(center);
            const tableHost = center.closest('nat-table') as HTMLElement;

            return {
              hostPinnedBackground: tableHost.style.getPropertyValue('--nat-table-pinned-background'),
              resolvedPinnedBackground: leftStyle.getPropertyValue('--nat-table-pinned-background'),
              centerFocusVisible: center.matches(':focus-visible'),
              centerFocusIndicator: centerStyle.boxShadow,
              leftStack: pointStack(left),
              rightStack: pointStack(right),
              leftBackgroundColor: leftStyle.backgroundColor,
              leftBackgroundImage: leftStyle.backgroundImage,
              rightBackgroundColor: rightStyle.backgroundColor,
              rightBackgroundImage: rightStyle.backgroundImage
            };
          });

          expect(paint.centerFocusVisible).toBe(true);
          expect(paint.hostPinnedBackground).toBe('rgb(17 34 51)');
          expect(paint.resolvedPinnedBackground).toBe('rgb(17 34 51)');
          expect(paint.centerFocusIndicator).not.toBe('none');
          expect(paint.leftStack.indexOf('customer')).toBeLessThan(paint.leftStack.indexOf('owner'));
          expect(paint.rightStack.indexOf('total')).toBeLessThan(paint.rightStack.indexOf('owner'));
          expect(paint.leftBackgroundColor).toBe('rgb(17, 34, 51)');
          expect(paint.rightBackgroundColor).toBe('rgb(17, 34, 51)');
          expect(paint.leftBackgroundImage).toContain('linear-gradient');
          expect(paint.rightBackgroundImage).toContain('linear-gradient');
        });

        await test.step('THEN: a focused pinned cell keeps the top focus layer and its inset indicator', async () => {
          await page.keyboard.press('ArrowLeft');
          await expect(customerCell).toBeFocused();
          await waitForTransitions(firstRow);

          const pinnedFocus = await customerCell.evaluate((cell) => {
            const style = getComputedStyle(cell);

            return {
              focusVisible: cell.matches(':focus-visible'),
              boxShadow: style.boxShadow,
              position: style.position,
              zIndex: style.zIndex
            };
          });

          expect(pinnedFocus.focusVisible).toBe(true);
          expect(pinnedFocus.boxShadow).toContain('inset');
          expect(pinnedFocus.position).toBe('sticky');
          expect(pinnedFocus.zIndex).toBe('7');
        });

        await test.step('THEN: hover also composites its translucent state over both opaque pinned bases', async () => {
          await ownerCell.hover({ position: { x: 70, y: 20 } });
          await waitForTransitions(firstRow);

          const hoverPaint = await firstRow.evaluate((row) =>
            ['customer', 'total'].map((columnId) => {
              const cell = row.querySelector<HTMLElement>(`[data-column-id="${columnId}"]`);

              if (!cell) {
                throw new Error(`Expected ${columnId} cell.`);
              }

              const style = getComputedStyle(cell);

              return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage };
            })
          );

          expect(hoverPaint).toStrictEqual([
            { backgroundColor: 'rgb(17, 34, 51)', backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.12), rgba(0, 255, 0, 0.12))' },
            { backgroundColor: 'rgb(17, 34, 51)', backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.12), rgba(0, 255, 0, 0.12))' }
          ]);
        });
      });
    });

    test.describe('WHEN: the virtual scrolling example is scanned with axe-core', () => {
      test('THEN: it has no WCAG A/AA violations', async ({ page }) => {
        await expectNoAxeViolations(page, '[data-testid="docs-example-virtual-scroll-preview-panel"]');
      });
    });
  });
});
