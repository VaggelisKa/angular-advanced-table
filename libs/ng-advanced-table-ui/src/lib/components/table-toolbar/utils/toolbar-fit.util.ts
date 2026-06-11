import type {
  NatToolbarFitInput,
  NatToolbarFitItem,
  NatToolbarFitResult,
} from '../common/toolbar-fit.type';

/**
 * Pure, deterministic two-phase greedy fit. No DOM access — safe inside a
 * `computed`.
 *
 * Phase 1: with no `'always'` items, if everything fits without the More
 * button, nothing hides.
 * Phase 2: reserve the More button width up front (prevents add-the-button
 * oscillation), then drop `'auto'` items by priority ascending; ties drop the
 * end group last-DOM-first, then the start group. `'never'` items never drop,
 * `'always'` items are pre-hidden, the focused item is pinned visible. If only
 * undroppable items remain and the row still overflows, content clips
 * (accepted).
 */
export const fitNatToolbarItems = (input: NatToolbarFitInput): NatToolbarFitResult => {
  const { containerWidth, gap, moreButtonWidth, items } = input;

  const alwaysHidden = items.filter((item) => item.overflowMode === 'always');
  const rowItems = items.filter((item) => item.overflowMode !== 'always');
  const fitsWithoutMore = requiredWidth(rowItems, gap, null) <= containerWidth;

  if (alwaysHidden.length === 0 && fitsWithoutMore) {
    const natToolbarFitResult: NatToolbarFitResult = {
      hiddenIds: new Set<string>(),
      moreVisible: false,
    };

    return natToolbarFitResult;
  }

  const hiddenIds = new Set<string>(alwaysHidden.map((item) => item.id));
  const visible = [...rowItems];

  while (requiredWidth(visible, gap, moreButtonWidth) > containerWidth) {
    const candidate = pickNextDrop(visible);

    if (candidate === null) break;

    hiddenIds.add(candidate.id);
    visible.splice(visible.indexOf(candidate), 1);
  }

  const natToolbarFitResult: NatToolbarFitResult = { hiddenIds, moreVisible: hiddenIds.size > 0 };

  return natToolbarFitResult;
};

const pickNextDrop = (visible: NatToolbarFitItem[]): NatToolbarFitItem | null => {
  const candidates = visible.filter((item) => item.overflowMode === 'auto' && !item.focused);

  if (candidates.length === 0) return null;

  const [sortedCandidate] = [...candidates].sort(compareNatToolbarDropOrder);

  return sortedCandidate;
};

/**
 * Width needed by `visible` items plus, when not `null`, the reserved More
 * button. The toolbar's `::before` spacer is always present as an extra flex
 * child with zero base width, so EVERY visible item and the More button each
 * contribute one `gap` (not `count - 1`).
 */
const requiredWidth = (
  visible: NatToolbarFitItem[],
  gap: number,
  moreButtonWidth: number | null,
): number => {
  const itemsWidth = visible.reduce((total, item) => total + item.width + gap, 0);

  return itemsWidth + (moreButtonWidth === null ? 0 : moreButtonWidth + gap);
};

/**
 * Drop order: lower priority first; ties drop the end group before the start
 * group, and within a group the last DOM item first.
 * Exported for direct unit testing.
 */
export const compareNatToolbarDropOrder = (
  referenceToolbarItem: NatToolbarFitItem,
  targetToolbarItem: NatToolbarFitItem,
): number => {
  if (referenceToolbarItem.priority !== targetToolbarItem.priority) {
    return referenceToolbarItem.priority - targetToolbarItem.priority;
  }

  if (referenceToolbarItem.position !== targetToolbarItem.position) {
    return referenceToolbarItem.position === 'end' ? -1 : 1;
  }

  return targetToolbarItem.domIndex - referenceToolbarItem.domIndex;
};
