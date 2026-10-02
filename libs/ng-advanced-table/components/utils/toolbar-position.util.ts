import type { NatToolbarItemPosition } from '../common/toolbar.type';

/**
 * Describes a toolbar item whose requested position differs from the slot
 * `<nat-table-toolbar>` projected it into, or returns `null` when they match.
 *
 * The toolbar selects slots by the static `natToolbarItemPosition` attribute
 * at compile time, so a bound or later-changed value never moves the item.
 * Only direct toolbar children are checked: an item inside a
 * `natToolbarGroup` (or any other wrapper) is projected with its parent, so
 * its own position never applied.
 */
export const describeNatToolbarPositionMismatch = (host: HTMLElement, position: NatToolbarItemPosition): string | null => {
  if (host.parentElement?.tagName.toLowerCase() !== 'nat-table-toolbar') return null;

  const attribute = host.getAttribute('natToolbarItemPosition');
  const projectedPosition: NatToolbarItemPosition = attribute === 'center' || attribute === 'end' ? attribute : 'start';

  if (position === projectedPosition) return null;

  return (
    `[ng-advanced-table/components] natToolbarItemPosition="${position}" on <${host.tagName.toLowerCase()}>: ` +
    `<nat-table-toolbar> projects items by the static attribute, so this item renders in the ${projectedPosition} slot. ` +
    `Write the position as a static attribute (natToolbarItemPosition="${position}"), not a binding, ` +
    `or render one item per position with @if.`
  );
};
