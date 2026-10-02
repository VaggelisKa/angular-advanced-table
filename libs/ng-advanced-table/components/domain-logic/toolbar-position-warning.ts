import { afterRenderEffect, assertInInjectionContext, isDevMode } from '@angular/core';
import type { Signal } from '@angular/core';

import type { NatToolbarItemRef } from '../common/toolbar.type';
import { describeNatToolbarPositionMismatch } from '../utils/toolbar-position.util';

/**
 * Dev-mode warning, once per item, for a directly projected toolbar item whose
 * `natToolbarItemPosition` value names a slot other than the one the toolbar
 * projected it into — a bound (`[natToolbarItemPosition]="expr"`) or later
 * changed value, since slots are selected by the static attribute at compile
 * time. Runs after render, so every item already sits in its slot. Must be
 * called from an injection context.
 */
export const warnOnUnprojectedToolbarItemPositions = (items: Signal<readonly NatToolbarItemRef[]>): void => {
  assertInInjectionContext(warnOnUnprojectedToolbarItemPositions);

  if (!isDevMode()) return;

  const warnedItems = new WeakSet<NatToolbarItemRef>();

  afterRenderEffect(() => {
    for (const item of items()) {
      const warning = warnedItems.has(item) ? null : describeNatToolbarPositionMismatch(item.element, item.position());

      if (warning !== null) {
        warnedItems.add(item);
        console.warn(warning);
      }
    }
  });
};
