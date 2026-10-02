import type { NatToolbarItemPosition } from '../common/toolbar.type';

/**
 * Reads the slot an item was actually projected into from where it sits
 * relative to the toolbar's two spacers, not from its current attribute: an
 * `[attr.natToolbarItemPosition]` binding can set the attribute after
 * projection already placed the item.
 */
const resolveProjectedNatToolbarPosition = (host: HTMLElement): NatToolbarItemPosition => {
  const spacers = Array.from(host.parentElement?.children ?? []).filter((child) => child.classList.contains('nat-toolbar-spacer'));
  const spacersBefore = spacers.filter((spacer) => spacer.compareDocumentPosition(host) === Node.DOCUMENT_POSITION_FOLLOWING).length;

  return (['start', 'center', 'end'] as const)[Math.min(spacersBefore, 2)];
};

/**
 * Describes a toolbar item whose requested position differs from the slot
 * `<nat-table-toolbar>` projected it into, or returns `null` when they match.
 *
 * The toolbar selects slots by the static `natToolbarItemPosition` attribute
 * at compile time, so a bound or later-changed value never moves the item;
 * the projected slot is read from the item's place between the spacers.
 * Only direct toolbar children are checked: an item inside a
 * `natToolbarGroup` (or any other wrapper) is projected with its parent, so
 * its own position never applied.
 */
export const describeNatToolbarPositionMismatch = (host: HTMLElement, position: NatToolbarItemPosition): string | null => {
  if (host.parentElement?.tagName.toLowerCase() !== 'nat-table-toolbar') return null;

  const projectedPosition = resolveProjectedNatToolbarPosition(host);

  if (position === projectedPosition) return null;

  return (
    `[ng-advanced-table/components] natToolbarItemPosition="${position}" on <${host.tagName.toLowerCase()}>: ` +
    `<nat-table-toolbar> projects items by the static attribute, so this item renders in the ${projectedPosition} slot. ` +
    `Write the position as a static attribute (natToolbarItemPosition="${position}"), not a binding, ` +
    `or render one item per position with @if.`
  );
};
