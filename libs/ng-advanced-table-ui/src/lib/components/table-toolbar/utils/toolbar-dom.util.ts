/** TS 5.9 lib.dom has no moveBefore declaration yet — local structural type only. */
type NatMoveBeforeElement = Element & {
  moveBefore?: (node: Node, child: Node | null) => void;
};

/**
 * Moves `node` into `parent` before `ref` (or appends with `null`), preserving
 * element state where the platform allows it. Prefers the atomic
 * `Element.moveBefore()` (keeps focus, animations, iframe state; Chrome/Edge
 * 133+, Firefox 144+); falls back to `insertBefore()` and restores focus
 * manually when the moved subtree owned `document.activeElement` (Safari,
 * jsdom). Pure DOM — exported for unit testing.
 */
export const moveNatToolbarNodeBefore = (
  parent: HTMLElement,
  node: HTMLElement,
  ref: ChildNode | null,
): void => {
  const movable: NatMoveBeforeElement = parent;
  const canUseMoveBefore =
    typeof movable.moveBefore === 'function' &&
    node.parentNode !== null &&
    node.isConnected === parent.isConnected;

  // moveBefore throws unless this is a true move (node already has a parent)
  // and node and target parent agree on connectedness — guard and fall back.
  if (canUseMoveBefore) {
    try {
      movable.moveBefore(node, ref);
      return;
    } catch {
      // Fall through to the insertBefore fallback.
    }
  }

  const activeElement = document.activeElement;
  const restoreFocus =
    activeElement instanceof HTMLElement &&
    (activeElement === node || node.contains(activeElement));

  parent.insertBefore(node, ref);

  if (restoreFocus && document.activeElement !== activeElement) {
    activeElement.focus();
  }
};
