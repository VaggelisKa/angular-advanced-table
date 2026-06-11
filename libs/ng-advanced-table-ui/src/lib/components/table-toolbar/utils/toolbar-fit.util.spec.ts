import { compareNatToolbarDropOrder, fitNatToolbarItems } from './toolbar-fit.util';
import type { NatToolbarFitItem } from '../common/toolbar-fit.type';

function fitItem(
  overrides: Partial<NatToolbarFitItem> & Pick<NatToolbarFitItem, 'id'>,
): NatToolbarFitItem {
  return {
    width: 60,
    position: 'end',
    overflowMode: 'auto',
    priority: 0,
    domIndex: 0,
    focused: false,
    ...overrides,
  };
}

describe('compareNatToolbarDropOrder', () => {
  it('drops lower priority first', () => {
    const low = fitItem({ id: 'low', priority: -10 });
    const high = fitItem({ id: 'high', priority: 5 });

    expect(compareNatToolbarDropOrder(low, high)).toBeLessThan(0);
    expect(compareNatToolbarDropOrder(high, low)).toBeGreaterThan(0);
  });

  it('drops the end group before the start group on equal priority', () => {
    const start = fitItem({ id: 'start', position: 'start', domIndex: 0 });
    const end = fitItem({ id: 'end', position: 'end', domIndex: 1 });

    expect(compareNatToolbarDropOrder(end, start)).toBeLessThan(0);
    expect(compareNatToolbarDropOrder(start, end)).toBeGreaterThan(0);
  });

  it('drops the last DOM item first within the same group', () => {
    const first = fitItem({ id: 'first', domIndex: 0 });
    const last = fitItem({ id: 'last', domIndex: 3 });

    expect(compareNatToolbarDropOrder(last, first)).toBeLessThan(0);
  });

  it('sorts a mixed set into the full drop order', () => {
    const items = [
      fitItem({ id: 'start-0', position: 'start', domIndex: 0 }),
      fitItem({ id: 'start-1', position: 'start', domIndex: 1 }),
      fitItem({ id: 'end-2', position: 'end', domIndex: 2 }),
      fitItem({ id: 'end-3', position: 'end', domIndex: 3 }),
      fitItem({ id: 'prio-low', position: 'start', domIndex: 4, priority: -10 }),
    ];

    const order = [...items].sort(compareNatToolbarDropOrder).map((item) => item.id);

    expect(order).toEqual(['prio-low', 'end-3', 'end-2', 'start-1', 'start-0']);
  });
});

function runFit(containerWidth: number, items: NatToolbarFitItem[]) {
  return fitNatToolbarItems({ containerWidth, gap: 8, moreButtonWidth: 40, items });
}

describe('fitNatToolbarItems / phase 1: everything fits', () => {
  const items = [
    fitItem({ id: 'a', width: 100, position: 'start', domIndex: 0 }),
    fitItem({ id: 'b', width: 80, domIndex: 1 }),
  ];

  it('hides nothing when all items fit without the More button', () => {
    const result = runFit(500, items);

    expect(result.hiddenIds.size).toBe(0);
    expect(result.moreVisible).toBe(false);
  });

  it('fits at the exact boundary of the spacer gap formula — every item contributes one gap', () => {
    // required = (100 + 8) + (80 + 8) = 196, NOT 100 + 80 + gap * (count - 1).
    // The ::before spacer is an extra flex child, so each item pays one full gap.
    const result = runFit(196, items);

    expect(result.hiddenIds.size).toBe(0);
    expect(result.moreVisible).toBe(false);
  });
});

describe("fitNatToolbarItems / 'always' items", () => {
  it("pre-hides 'always' items even when everything would fit", () => {
    const result = runFit(1000, [
      fitItem({ id: 'pinned-menu', overflowMode: 'always', domIndex: 0 }),
      fitItem({ id: 'b', domIndex: 1 }),
    ]);

    expect(result.hiddenIds).toEqual(new Set(['pinned-menu']));
    expect(result.moreVisible).toBe(true);
  });

  it("hides a focused 'always' item too — the focus pin only protects row items", () => {
    const result = runFit(1000, [
      fitItem({ id: 'pinned-menu', overflowMode: 'always', focused: true, domIndex: 0 }),
      fitItem({ id: 'b', domIndex: 1 }),
    ]);

    expect(result.hiddenIds).toEqual(new Set(['pinned-menu']));
  });
});

describe('fitNatToolbarItems / greedy drop with More-button reservation', () => {
  const twoItems = [
    fitItem({ id: 'a', width: 100, position: 'start', domIndex: 0 }),
    fitItem({ id: 'b', width: 80, domIndex: 1 }),
  ];

  it('reserves the More button width up front: one px under the fit boundary drops an item', () => {
    // 196 fits (phase 1). At 195 the loop must satisfy
    // (100 + 8) + (40 + 8) = 156 <= 195 after dropping "b" — with the More
    // width counted BEFORE the first drop, so adding the button cannot
    // re-trigger overflow (no oscillation).
    const result = runFit(195, twoItems);

    expect(result.hiddenIds).toEqual(new Set(['b']));
    expect(result.moreVisible).toBe(true);
  });

  it('keeps dropping until the remaining row plus More button fits', () => {
    // At 150 even "a" + More (156) overflows, so both drop: More alone = 48.
    const result = runFit(150, twoItems);

    expect(result.hiddenIds).toEqual(new Set(['b', 'a']));
    expect(result.moreVisible).toBe(true);
  });

  it('drops lower natToolbarOverflowPriority first', () => {
    const items = [
      fitItem({ id: 'p', priority: -10, domIndex: 0 }),
      fitItem({ id: 'q', priority: 0, domIndex: 1 }),
      fitItem({ id: 'r', priority: 5, domIndex: 2 }),
    ];

    // 3 * 68 = 204 > 200 -> reserve More (252), drop "p" (184 fits).
    expect(runFit(200, items).hiddenIds).toEqual(new Set(['p']));
    // 120 needs two drops: "p" then "q" (116 fits).
    expect(runFit(120, items).hiddenIds).toEqual(new Set(['p', 'q']));
  });

  it('breaks priority ties by dropping the end group last-DOM-first, then the start group', () => {
    const items = [
      fitItem({ id: 's1', position: 'start', domIndex: 0 }),
      fitItem({ id: 's2', position: 'start', domIndex: 1 }),
      fitItem({ id: 'e1', position: 'end', domIndex: 2 }),
      fitItem({ id: 'e2', position: 'end', domIndex: 3 }),
    ];

    expect(runFit(200, items).hiddenIds).toEqual(new Set(['e2', 'e1']));
    expect(runFit(140, items).hiddenIds).toEqual(new Set(['e2', 'e1', 's2']));
  });

  it("never drops 'never' items even when the row keeps overflowing (content clips)", () => {
    const result = runFit(50, [
      fitItem({ id: 'search', overflowMode: 'never', width: 100, domIndex: 0 }),
      fitItem({ id: 'a', domIndex: 1 }),
    ]);

    expect(result.hiddenIds).toEqual(new Set(['a']));
    expect(result.moreVisible).toBe(true);
  });

  it("hides nothing and shows no More button when only 'never' items overflow", () => {
    const result = runFit(10, [
      fitItem({ id: 'n1', overflowMode: 'never', domIndex: 0 }),
      fitItem({ id: 'n2', overflowMode: 'never', domIndex: 1 }),
    ]);

    expect(result.hiddenIds.size).toBe(0);
    expect(result.moreVisible).toBe(false);
  });
});

describe('fitNatToolbarItems / focused item pin', () => {
  function items(focused: boolean): NatToolbarFitItem[] {
    return [fitItem({ id: 'a', domIndex: 0 }), fitItem({ id: 'b', domIndex: 1, focused })];
  }

  it('never drops the item containing focus — the next candidate drops instead', () => {
    expect(runFit(130, items(true)).hiddenIds).toEqual(new Set(['a']));
    // Contrast: without focus, the end-group last-DOM-first tie-break drops "b".
    expect(runFit(130, items(false)).hiddenIds).toEqual(new Set(['b']));
  });

  it('clips when the focused item alone is wider than the container (degenerate case)', () => {
    const result = runFit(100, [
      fitItem({ id: 'search', width: 500, focused: true, domIndex: 0 }),
      fitItem({ id: 'a', domIndex: 1 }),
    ]);

    expect(result.hiddenIds).toEqual(new Set(['a']));
    expect(result.moreVisible).toBe(true);
  });
});

describe('fitNatToolbarItems / stability properties across adjacent widths', () => {
  const GAP = 8;
  const MORE_WIDTH = 44;
  const MAX_WIDTH = 600;
  const sweepItems: NatToolbarFitItem[] = [
    fitItem({ id: 's1', position: 'start', width: 90, domIndex: 0 }),
    fitItem({ id: 'e1', width: 120, priority: -5, domIndex: 1 }),
    fitItem({ id: 'e2', width: 70, domIndex: 2 }),
    fitItem({ id: 'n', overflowMode: 'never', width: 100, domIndex: 3 }),
  ];

  function sweepFit(containerWidth: number) {
    return fitNatToolbarItems({
      containerWidth,
      gap: GAP,
      moreButtonWidth: MORE_WIDTH,
      items: sweepItems,
    });
  }

  /** Mirrors the documented spacer formula: every visible flex child pays one gap. */
  function requiredWidthOf(hiddenIds: ReadonlySet<string>, moreVisible: boolean): number {
    const visible = sweepItems.filter((item) => !hiddenIds.has(item.id));
    const itemsWidth = visible.reduce((total, item) => total + item.width + GAP, 0);

    return itemsWidth + (moreVisible ? MORE_WIDTH + GAP : 0);
  }

  it('is deterministic: identical input produces identical output', () => {
    for (let width = 1; width <= MAX_WIDTH; width++) {
      const first = sweepFit(width);
      const second = sweepFit(width);

      expect(second.hiddenIds, `width ${width}`).toEqual(first.hiddenIds);
      expect(second.moreVisible, `width ${width}`).toBe(first.moreVisible);
    }
  });

  it('never flip-flops: shrinking one px at a time only ever hides MORE items', () => {
    let previousHidden: ReadonlySet<string> = sweepFit(MAX_WIDTH).hiddenIds;

    for (let width = MAX_WIDTH - 1; width >= 1; width--) {
      const { hiddenIds } = sweepFit(width);

      for (const id of previousHidden) {
        expect(hiddenIds.has(id), `width ${width} re-showed "${id}" while shrinking`).toBe(true);
      }

      previousHidden = hiddenIds;
    }
  });

  it('converges: every result fits with the More button reserved, or has no droppable candidates left', () => {
    for (let width = 1; width <= MAX_WIDTH; width++) {
      const { hiddenIds, moreVisible } = sweepFit(width);
      const visible = sweepItems.filter((item) => !hiddenIds.has(item.id));
      const fits = requiredWidthOf(hiddenIds, moreVisible) <= width;
      const hasDroppableLeft = visible.some(
        (item) => item.overflowMode === 'auto' && !item.focused,
      );

      expect(fits || !hasDroppableLeft, `width ${width} neither fits nor is exhausted`).toBe(true);
    }
  });

  it('shows the More button exactly when at least one item is hidden', () => {
    for (let width = 1; width <= MAX_WIDTH; width++) {
      const { hiddenIds, moreVisible } = sweepFit(width);

      expect(moreVisible, `width ${width}`).toBe(hiddenIds.size > 0);
    }
  });
});
