import { afterNextRender } from '@angular/core';
import type { Injector } from '@angular/core';

/**
 * Reaching the first or last page disables the pager button that was just
 * activated, and a disabled button drops focus to `<body>`. When `source`
 * held focus, hand it to `sibling` once the new page has rendered, so
 * keyboard users stay in the pager. Shared by `NatTablePager` and
 * `NatTablePagination`.
 */
export const keepNatPagerFocusOnBoundary = (
  source: HTMLButtonElement | undefined,
  sibling: () => HTMLButtonElement | undefined,
  injector: Injector
): void => {
  if (!source?.isSameNode(source.ownerDocument.activeElement)) {
    return;
  }

  afterNextRender(
    {
      write: () => {
        const siblingButton = sibling();
        const activeElement = source.ownerDocument.activeElement;
        const focusLost = activeElement === source || activeElement === null || activeElement === source.ownerDocument.body;

        if (source.disabled && focusLost && siblingButton && !siblingButton.disabled) {
          siblingButton.focus();
        }
      }
    },
    { injector }
  );
};
