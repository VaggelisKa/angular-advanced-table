import type { NatToolbarItemPosition } from '../common/toolbar-tokens.type';
import type {
  NatToolbarFocusStopItem,
  NatToolbarNavigationContext,
} from '../common/toolbar-focus.type';

const idsAtPosition = (
  items: NatToolbarFocusStopItem[],
  position: NatToolbarItemPosition,
): string[] => items.filter((item) => item.position === position).map((item) => item.id);

/**
 * Roving-focus stops in VISUAL order: start group, then center group, then
 * end group — each in registry order. The toolbar reorders the DOM from the
 * same inputs, so focus order and DOM order agree by construction. Pure —
 * exported for unit testing only.
 */
export const buildNatToolbarFocusStops = (items: NatToolbarFocusStopItem[]): string[] => {
  const startIds = idsAtPosition(items, 'start');
  const centerIds = idsAtPosition(items, 'center');
  const endIds = idsAtPosition(items, 'end');

  return [...startIds, ...centerIds, ...endIds];
};

/**
 * Resolves the roving-focus target for a toolbar key press. Arrows wrap at
 * both ends and are direction-aware: in RTL the first stop renders
 * rightmost, so ArrowRight moves to the PREVIOUS stop. Returns `null` when
 * the key is not handled or there are no stops. Pure — exported for unit
 * testing only.
 */
export const resolveNatToolbarNavigationTarget = (
  toolbarNavigationContext: NatToolbarNavigationContext,
): string | null => {
  const { key, activeId, stops, isRtl = false } = toolbarNavigationContext;

  if (stops.length === 0) return null;
  if (key === 'Home') return stops[0];
  if (key === 'End') return stops.at(-1)!;
  if (key !== 'ArrowLeft' && key !== 'ArrowRight') return null;

  const currentIndex = activeId === null ? -1 : stops.indexOf(activeId);

  if (currentIndex === -1) return stops[0];

  const forward = (key === 'ArrowRight') !== isRtl;
  const delta = forward ? 1 : -1;
  const nextIndex = (currentIndex + delta + stops.length) % stops.length;

  return stops[nextIndex];
};
