import { scrollNatTableCellHorizontallyIntoView } from './horizontal-scroll.util';

const rect = (left: number, right: number): DOMRect => ({
  x: left,
  y: 0,
  left,
  top: 0,
  right,
  bottom: 40,
  width: right - left,
  height: 40,
  toJSON: () => ({})
});

const mockRect = (element: Element, left: number, right: number): void => {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect(left, right));
};

// Mirrors the rendered shape — `nat-table > region > table` — because the
// reveal resolves the owning `nat-table` to scope its pinned-zone lookups.
const setupTable = (): { cell: HTMLTableCellElement; region: HTMLDivElement; table: HTMLTableElement } => {
  const host = document.createElement('nat-table');
  const region = document.createElement('div');
  const table = document.createElement('table');
  const body = table.createTBody();
  const row = body.insertRow();
  const cell = row.insertCell();

  region.append(table);
  host.append(region);
  mockRect(region, 0, 800);

  return { cell, region, table };
};

describe('FEATURE: virtual table horizontal focus visibility', () => {
  describe('GIVEN: pinned columns cover both physical viewport edges', () => {
    describe('WHEN: an unpinned target is hidden beneath the right pinned zone', () => {
      it('THEN: it scrolls by the nearest center-zone edge', () => {
        const { cell, region, table } = setupTable();
        const header = table.createTHead().insertRow();
        const pinnedLeft = document.createElement('th');
        const pinnedRight = document.createElement('th');

        pinnedLeft.className = 'has-pinned-edge-left';
        pinnedRight.className = 'has-pinned-edge-right';
        header.append(pinnedLeft, pinnedRight);
        mockRect(pinnedLeft, 0, 120);
        mockRect(pinnedRight, 700, 800);
        mockRect(cell, 650, 850);
        region.scrollLeft = 40;

        scrollNatTableCellHorizontallyIntoView(region, cell);

        expect(region.scrollLeft).toBe(190);
      });
    });
  });

  describe('GIVEN: an RTL cell is wider than the available viewport', () => {
    describe('WHEN: the cell is revealed', () => {
      it('THEN: it aligns the physical edge representing inline start', () => {
        const { cell, region, table } = setupTable();

        table.dir = 'rtl';
        mockRect(cell, -200, 1000);
        region.scrollLeft = -300;

        scrollNatTableCellHorizontallyIntoView(region, cell);

        expect(region.scrollLeft).toBe(-100);
      });
    });
  });

  describe('GIVEN: a cell is already visible or pinned', () => {
    describe('WHEN: horizontal visibility is checked', () => {
      it('THEN: it leaves the current scroll position unchanged', () => {
        const { cell, region } = setupTable();

        mockRect(cell, 200, 400);
        region.scrollLeft = 80;
        scrollNatTableCellHorizontallyIntoView(region, cell);
        expect(region.scrollLeft).toBe(80);

        cell.className = 'is-pinned-right';
        mockRect(cell, 900, 1100);
        scrollNatTableCellHorizontallyIntoView(region, cell);
        expect(region.scrollLeft).toBe(80);
      });
    });
  });

  describe('GIVEN: only a nested table inside a body cell has pinned columns', () => {
    describe('WHEN: an unpinned target of the outer table is revealed', () => {
      it('THEN: it ignores the nested pinned zone and uses the full region width', () => {
        const { cell, region } = setupTable();
        const nested = document.createElement('nat-table');
        const nestedHeader = document.createElement('table').createTHead().insertRow();
        const nestedPinnedLeft = document.createElement('th');

        nestedPinnedLeft.className = 'has-pinned-edge-left';
        nestedHeader.append(nestedPinnedLeft);
        nested.append(nestedHeader.closest('table') as HTMLTableElement);
        cell.append(nested);
        // Wide enough that an outer pinned zone would have shifted the bounds.
        mockRect(nestedPinnedLeft, 0, 400);
        mockRect(cell, 820, 900);
        region.scrollLeft = 0;

        scrollNatTableCellHorizontallyIntoView(region, cell);

        // Bounds stay the region's own 0..800, so the reveal is 900 - 800.
        expect(region.scrollLeft).toBe(100);
      });
    });
  });

  describe('GIVEN: an LTR cell is hidden past the left edge or wider than the viewport', () => {
    describe('WHEN: each is revealed', () => {
      it('THEN: it aligns the leading edge in both cases', () => {
        const { cell, region } = setupTable();

        mockRect(cell, -150, 50);
        region.scrollLeft = 300;
        scrollNatTableCellHorizontallyIntoView(region, cell);
        expect(region.scrollLeft).toBe(150);

        mockRect(cell, -60, 1200);
        region.scrollLeft = 400;
        scrollNatTableCellHorizontallyIntoView(region, cell);
        expect(region.scrollLeft).toBe(340);
      });
    });
  });

  describe('GIVEN: pinned zones span the whole region width', () => {
    describe('WHEN: an unpinned target is revealed', () => {
      it('THEN: it leaves the scroll position alone rather than jumping', () => {
        const { cell, region, table } = setupTable();
        const header = table.createTHead().insertRow();
        const pinnedLeft = document.createElement('th');
        const pinnedRight = document.createElement('th');

        pinnedLeft.className = 'has-pinned-edge-left';
        pinnedRight.className = 'has-pinned-edge-right';
        header.append(pinnedLeft, pinnedRight);
        mockRect(pinnedLeft, 0, 800);
        mockRect(pinnedRight, 0, 800);
        mockRect(cell, 900, 1000);
        region.scrollLeft = 55;

        scrollNatTableCellHorizontallyIntoView(region, cell);

        expect(region.scrollLeft).toBe(55);
      });
    });
  });

  describe('GIVEN: a candidate cell is detached from a table', () => {
    describe('WHEN: horizontal visibility is checked', () => {
      it('THEN: it leaves the region unchanged', () => {
        const region = document.createElement('div');
        const cell = document.createElement('td');

        region.scrollLeft = 25;
        scrollNatTableCellHorizontallyIntoView(region, cell);

        expect(region.scrollLeft).toBe(25);
      });
    });
  });
});
