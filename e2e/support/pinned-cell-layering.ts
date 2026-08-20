import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

type PinnedOverlapSnapshot = {
  readonly backgroundAlpha: number;
  readonly backgroundImage: string;
  readonly obscuredStackIndex: number;
  readonly overlapHeight: number;
  readonly overlapWidth: number;
  readonly pinnedStackIndex: number;
};

const readOverlapSnapshot = async (page: Page, pinnedSelector: string, obscuredSelector: string): Promise<PinnedOverlapSnapshot> =>
  page.evaluate(
    ({ obscuredSelector: targetSelector, pinnedSelector: stickySelector }) => {
      const pinned = document.querySelector<HTMLElement>(stickySelector);
      const obscured = document.querySelector<HTMLElement>(targetSelector);

      if (!pinned || !obscured) {
        throw new Error(`Missing overlap target: ${stickySelector} / ${targetSelector}`);
      }

      const pinnedRect = pinned.getBoundingClientRect();
      const obscuredRect = obscured.getBoundingClientRect();
      const left = Math.max(pinnedRect.left, obscuredRect.left);
      const right = Math.min(pinnedRect.right, obscuredRect.right);
      const top = Math.max(pinnedRect.top, obscuredRect.top);
      const bottom = Math.min(pinnedRect.bottom, obscuredRect.bottom);
      const x = left + (right - left) / 2;
      const y = top + (bottom - top) / 2;
      const stack = document.elementsFromPoint(x, y);
      const style = getComputedStyle(pinned);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = 1;
      canvas.height = 1;

      if (!context) {
        throw new Error('A 2D canvas context is required to inspect the pinned background alpha.');
      }

      context.clearRect(0, 0, 1, 1);
      context.fillStyle = style.backgroundColor;
      context.fillRect(0, 0, 1, 1);

      return {
        backgroundAlpha: context.getImageData(0, 0, 1, 1).data[3] / 255,
        backgroundImage: style.backgroundImage,
        obscuredStackIndex: stack.indexOf(obscured),
        overlapHeight: bottom - top,
        overlapWidth: right - left,
        pinnedStackIndex: stack.indexOf(pinned)
      };
    },
    { obscuredSelector, pinnedSelector }
  );

export const constrainPinnedTable = async (surface: Locator): Promise<void> => {
  await surface.evaluate((element) => {
    const host = element as HTMLElement;

    host.style.inlineSize = '410px';
    host.style.setProperty('--nat-table-row-background-focus-pinned', 'rgb(31 111 235 / 20%)');
    host.style.setProperty('--nat-table-row-background-hover-pinned', 'rgb(199 32 64 / 16%)');
  });
};

export const expectPinnedCellAbove = async (page: Page, pinnedSelector: string, obscuredSelector: string): Promise<void> => {
  const snapshot = await readOverlapSnapshot(page, pinnedSelector, obscuredSelector);

  expect(snapshot.overlapWidth).toBeGreaterThan(8);
  expect(snapshot.overlapHeight).toBeGreaterThan(8);
  expect(snapshot.pinnedStackIndex).toBeGreaterThanOrEqual(0);
  expect(snapshot.obscuredStackIndex).toBeGreaterThanOrEqual(0);
  expect(snapshot.pinnedStackIndex).toBeLessThan(snapshot.obscuredStackIndex);
};

export const expectPinnedSurfaceComposited = async (
  page: Page,
  pinnedSelector: string,
  obscuredSelector: string,
  expectedOverlayRgb: string
): Promise<void> => {
  const snapshot = await readOverlapSnapshot(page, pinnedSelector, obscuredSelector);

  expect(snapshot.backgroundImage).toContain(expectedOverlayRgb);
  expect(snapshot.backgroundAlpha).toBe(1);
};
