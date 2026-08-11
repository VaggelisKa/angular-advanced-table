import {
  computeStickyOcclusionPx,
  focusMountedRowCell,
  measureStickyHeaderOverlayHeight,
  resolveBodyRowIndex,
  resolveCellPositionInRow,
  resolveVerticalNavigationTarget
} from './virtual-scroll-keyboard.util';

type KeyState = {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
};

const keyState = (key: string, modifiers: Partial<Omit<KeyState, 'key'>> = {}): KeyState => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...modifiers
});

const fakeDomRect = (overrides: Partial<Omit<DOMRect, 'toJSON'>>): DOMRect => ({
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON: () => ({}),
  ...overrides
});

/** Builds `<div region><table><thead>1 row</thead><tbody>rows…</tbody></table></div>` with absolute aria-rowindex. */
const buildRegion = (bodyAriaRowIndexes: readonly number[]): HTMLElement => {
  const region = document.createElement('div');
  const table = document.createElement('table');
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  headerRow.append(document.createElement('th'));

  const tbody = table.createTBody();

  for (const ariaRowIndex of bodyAriaRowIndexes) {
    const row = tbody.insertRow();

    row.setAttribute('aria-rowindex', String(ariaRowIndex));

    for (let cell = 0; cell < 3; cell++) {
      const cellElement = row.insertCell();

      cellElement.tabIndex = -1;
    }
  }

  region.append(table);
  document.body.append(region);

  return region;
};

describe('FEATURE: virtual-scroll keyboard utils', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('GIVEN: resolveVerticalNavigationTarget', () => {
    describe('WHEN: plain vertical arrows move within the row model', () => {
      it('THEN: it targets the adjacent row and stops at the edges', () => {
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown'), 3, 10)).toBe(4);
        expect(resolveVerticalNavigationTarget(keyState('ArrowUp'), 3, 10)).toBe(2);
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown'), 9, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('ArrowUp'), 0, 10)).toBeNull();
      });
    });

    describe('WHEN: Ctrl+End is pressed anywhere in the grid', () => {
      it('THEN: it targets the last logical row even without a current body row', () => {
        expect(resolveVerticalNavigationTarget(keyState('End', { ctrlKey: true }), null, 10)).toBe(9);
        expect(resolveVerticalNavigationTarget(keyState('End', { metaKey: true }), 4, 10)).toBe(9);
      });
    });

    describe('WHEN: PageUp or PageDown is pressed in the body', () => {
      it('THEN: it moves by the supplied visible page size and clamps at the model edges', () => {
        expect(resolveVerticalNavigationTarget(keyState('PageDown'), 3, 20, 8)).toBe(11);
        expect(resolveVerticalNavigationTarget(keyState('PageDown'), 18, 20, 8)).toBe(19);
        expect(resolveVerticalNavigationTarget(keyState('PageDown'), 19, 20, 8)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('PageUp'), 12, 20, 8)).toBe(4);
        expect(resolveVerticalNavigationTarget(keyState('PageUp'), 3, 20, 8)).toBe(0);
        expect(resolveVerticalNavigationTarget(keyState('PageUp'), 0, 20, 8)).toBeNull();
      });
    });

    describe('WHEN: the key is not a vertical navigation', () => {
      it('THEN: it returns null for modified arrows, plain End, and unrelated keys', () => {
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown', { shiftKey: true }), 3, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown', { altKey: true }), 3, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown', { ctrlKey: true }), 3, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('End'), 3, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('ArrowRight'), 3, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('ArrowDown'), null, 10)).toBeNull();
        expect(resolveVerticalNavigationTarget(keyState('End', { ctrlKey: true }), 3, 0)).toBeNull();
      });
    });
  });

  describe('GIVEN: resolveBodyRowIndex', () => {
    describe('WHEN: the element sits inside an indexed data row', () => {
      it('THEN: it converts the absolute aria-rowindex to a body index', () => {
        const region = buildRegion([12, 13]);
        const cell = region.querySelectorAll('tbody td')[4];

        expect(resolveBodyRowIndex(cell, 1)).toBe(11);
      });
    });

    describe('WHEN: the element sits outside the indexed body rows', () => {
      it('THEN: it returns null', () => {
        const region = buildRegion([2]);
        const headerCell = region.querySelector('thead th') as Element;

        expect(resolveBodyRowIndex(headerCell, 1)).toBeNull();
      });
    });
  });

  describe('GIVEN: resolveCellPositionInRow', () => {
    describe('WHEN: probing a middle cell', () => {
      it('THEN: it returns the cell position within its row', () => {
        const region = buildRegion([2]);
        const cells = region.querySelectorAll('tbody td');

        expect(resolveCellPositionInRow(cells[1])).toBe(1);
      });
    });
  });

  describe('GIVEN: focusMountedRowCell', () => {
    describe('WHEN: the target row is mounted', () => {
      it('THEN: it focuses the cell at the requested position, clamped to the row', () => {
        const region = buildRegion([5]);

        expect(focusMountedRowCell(region, 5, 1)).toBe(true);
        expect(document.activeElement).toBe(region.querySelectorAll('tbody td')[1]);
        expect(focusMountedRowCell(region, 5, 99)).toBe(true);
        expect(document.activeElement).toBe(region.querySelectorAll('tbody td')[2]);
      });
    });

    describe('WHEN: the target row is not mounted yet', () => {
      it('THEN: it reports failure without moving focus', () => {
        const region = buildRegion([5]);

        expect(focusMountedRowCell(region, 9, 0)).toBe(false);
      });
    });
  });

  describe('GIVEN: measureStickyHeaderOverlayHeight', () => {
    describe('WHEN: the header cells are not sticky', () => {
      it('THEN: it reports no overlay', () => {
        const region = buildRegion([2]);

        expect(measureStickyHeaderOverlayHeight(region)).toBe(0);
      });
    });

    describe('WHEN: there is no header at all', () => {
      it('THEN: it reports no overlay', () => {
        const region = document.createElement('div');

        expect(measureStickyHeaderOverlayHeight(region)).toBe(0);
      });
    });

    describe('WHEN: the header cells are sticky below a configured top inset', () => {
      it('THEN: it reports the inset plus the thead height', () => {
        const region = buildRegion([2]);
        const thead = region.querySelector('thead') as HTMLElement;
        const headerCell = region.querySelector('thead th') as HTMLElement;

        headerCell.style.position = 'sticky';
        thead.getBoundingClientRect = (): DOMRect => fakeDomRect({ height: 56 });

        expect(measureStickyHeaderOverlayHeight(region)).toBe(56);

        headerCell.style.top = '24px';

        expect(measureStickyHeaderOverlayHeight(region)).toBe(80);
      });
    });
  });

  describe('GIVEN: computeStickyOcclusionPx', () => {
    describe('WHEN: the element top sits above the overlay bottom', () => {
      it('THEN: it reports the number of hidden pixels', () => {
        const region = document.createElement('div');
        const element = document.createElement('tr');

        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ top: 100 });
        element.getBoundingClientRect = (): DOMRect => fakeDomRect({ top: 120 });

        expect(computeStickyOcclusionPx(element, region, 40)).toBe(20);
      });

      it('THEN: it reports zero or negative when the element is clear of the overlay', () => {
        const region = document.createElement('div');
        const element = document.createElement('tr');

        region.getBoundingClientRect = (): DOMRect => fakeDomRect({ top: 100 });
        element.getBoundingClientRect = (): DOMRect => fakeDomRect({ top: 160 });

        expect(computeStickyOcclusionPx(element, region, 40)).toBeLessThanOrEqual(0);
      });
    });
  });
});
