import type { NatToolbarFocusStopItem } from '../common/toolbar-focus.type';
import type { NatToolbarItemRef } from '../common/toolbar-tokens.type';
import { NAT_TOOLBAR_MORE_BUTTON_ID } from '../common/toolbar-tokens.const';

/**
 * Roving-focus stops in VISUAL order: start group in registry (DOM) order,
 * then end group in registry order, then the More button when visible.
 * Hidden items are skipped. Pure — exported for unit testing only.
 */
export const buildNatToolbarFocusStops = (
  items: readonly NatToolbarFocusStopItem[],
  hiddenIds: ReadonlySet<string>,
  moreVisible: boolean,
): readonly string[] => {
  const visible = items.filter((item) => !hiddenIds.has(item.id));
  const stops = [
    ...visible.filter((item) => item.position === 'start').map((item) => item.id),
    ...visible.filter((item) => item.position === 'end').map((item) => item.id),
  ];

  if (moreVisible) {
    stops.push(NAT_TOOLBAR_MORE_BUTTON_ID);
  }

  return stops;
};

/**
 * Resolves the roving-focus target for a toolbar key press. Arrows wrap at
 * both ends and are direction-aware: in RTL the first stop renders
 * rightmost, so ArrowRight moves to the PREVIOUS stop. Returns `null` when
 * the key is not handled or there are no stops. Pure — exported for unit
 * testing only.
 */
export const resolveNatToolbarNavigationTarget = (
  stops: readonly string[],
  activeId: string | null,
  key: string,
  isRtl: boolean,
): string | null => {
  if (stops.length === 0) {
    return null;
  }

  if (key === 'Home') {
    return stops[0];
  }

  if (key === 'End') {
    return stops[stops.length - 1];
  }

  if (key !== 'ArrowLeft' && key !== 'ArrowRight') {
    return null;
  }

  const currentIndex = activeId === null ? -1 : stops.indexOf(activeId);

  if (currentIndex === -1) {
    return stops[0];
  }

  const forward = (key === 'ArrowRight') !== isRtl;
  const delta = forward ? 1 : -1;

  return stops[(currentIndex + delta + stops.length) % stops.length];
};

/**
 * First registered item that is hidden while still containing the active
 * element. Pure containment check — exported for unit testing only.
 */
export const findNatToolbarHiddenFocusedItem = (
  items: readonly Pick<NatToolbarItemRef, 'id' | 'element'>[],
  hiddenIds: ReadonlySet<string>,
  activeElement: Element | null,
): Pick<NatToolbarItemRef, 'id' | 'element'> | null => {
  if (activeElement === null) {
    return null;
  }

  return (
    items.find((item) => hiddenIds.has(item.id) && item.element.contains(activeElement)) ?? null
  );
};
