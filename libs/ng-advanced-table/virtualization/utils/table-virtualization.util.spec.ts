import {
  NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT,
  createInitialVirtualRange,
  createVirtualItems,
  includeVirtualIndex,
  normalizeNatTableVirtualizationOptions,
  opensSubHeaderGroup,
  rangeToRowIndexes
} from './table-virtualization.util';

describe('FEATURE: NatTable virtualization options and ranges', () => {
  describe('GIVEN: fixed-row virtualization options', () => {
    describe('WHEN: options contain invalid runtime values', () => {
      it('THEN: it normalizes them to safe fixed-row defaults', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: Number.NaN, overscan: -2 })).toStrictEqual({
          rowHeight: 1,
          overscan: 5
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 0, overscan: Number.NaN })).toStrictEqual({
          rowHeight: 1,
          overscan: 5
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: Number.POSITIVE_INFINITY })).toStrictEqual({
          rowHeight: 1,
          overscan: 5
        });
      });
    });

    describe('WHEN: only the row height is provided', () => {
      it('THEN: it applies the default overscan', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 40 })).toStrictEqual({
          rowHeight: 40,
          overscan: 5
        });
      });
    });

    describe('WHEN: a valid custom overscan is provided', () => {
      it('THEN: it keeps it, including a zero-row overscan', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 32, overscan: 0 })).toStrictEqual({
          rowHeight: 32,
          overscan: 0
        });
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 32, overscan: 12 })).toStrictEqual({
          rowHeight: 32,
          overscan: 12
        });
      });
    });

    describe('WHEN: a fractional overscan is provided', () => {
      it('THEN: it floors the overscan to whole rows', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: 40, overscan: 7.9 })).toStrictEqual({
          rowHeight: 40,
          overscan: 7
        });
      });
    });
  });

  describe('GIVEN: a default range that omits the focused row', () => {
    describe('WHEN: the focus index is included', () => {
      it('THEN: it returns a sorted unique index list', () => {
        expect(includeVirtualIndex([4, 5, 6], 1, 10)).toStrictEqual([1, 4, 5, 6]);
        expect(includeVirtualIndex([4, 5, 6], 5, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex([4, 5, 6], 12, 10)).toStrictEqual([4, 5, 6]);
      });
    });

    describe('WHEN: there is no focus index to include', () => {
      it('THEN: it returns a copy of the mounted indexes', () => {
        const indexes = [4, 5, 6];

        expect(includeVirtualIndex(indexes, null, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex(indexes, -1, 10)).toStrictEqual([4, 5, 6]);
        expect(includeVirtualIndex(indexes, null, 10)).not.toBe(indexes);
      });
    });
  });

  describe('GIVEN: a mounted range projected onto the logical row count', () => {
    describe('WHEN: the range fits within the row count', () => {
      it('THEN: it lists every mounted row index', () => {
        expect(rangeToRowIndexes({ start: 2, end: 5 }, 10)).toStrictEqual([2, 3, 4]);
        expect(rangeToRowIndexes({ start: 0, end: 0 }, 10)).toStrictEqual([]);
      });
    });

    describe('WHEN: the range exceeds the row count', () => {
      it('THEN: it clamps the indexes to the logical rows', () => {
        expect(rangeToRowIndexes({ start: 8, end: 15 }, 10)).toStrictEqual([8, 9]);
        expect(rangeToRowIndexes({ start: 12, end: 15 }, 10)).toStrictEqual([]);
      });
    });

    describe('WHEN: the range is inverted', () => {
      it('THEN: it yields no row indexes', () => {
        expect(rangeToRowIndexes({ start: 5, end: 2 }, 10)).toStrictEqual([]);
      });
    });
  });

  describe('GIVEN: mounted row indexes on the fixed row grid', () => {
    describe('WHEN: virtual items are materialized without sub-headers', () => {
      it('THEN: it derives body-local extents from the row height', () => {
        expect(createVirtualItems([0, 3], 40, [])).toStrictEqual([
          { index: 0, start: 0, end: 40 },
          { index: 3, start: 120, end: 160 }
        ]);
      });
    });

    describe('WHEN: virtual items are materialized across sub-header groups', () => {
      it('THEN: it shifts extents by the sub-header slots and grows group-opening blocks upward', () => {
        // Rows 0 and 2 open groups: offsets [1, 1, 2]. Row 0's block spans its
        // sub-header (slot 0) plus itself (slot 1); row 1 sits alone at slot 2;
        // row 2's block spans slots 3 (sub-header) and 4.
        expect(createVirtualItems([0, 1, 2], 40, [1, 1, 2])).toStrictEqual([
          { index: 0, start: 0, end: 80 },
          { index: 1, start: 80, end: 120 },
          { index: 2, start: 120, end: 200 }
        ]);
      });
    });

    describe('WHEN: a group opens at an index beyond the offsets array', () => {
      it('THEN: it treats missing offsets as zero sub-header slots', () => {
        expect(createVirtualItems([5], 40, [])).toStrictEqual([{ index: 5, start: 200, end: 240 }]);
      });
    });

    describe('WHEN: group membership is resolved from the running offsets', () => {
      it('THEN: it marks exactly the rows whose offset steps up', () => {
        expect(opensSubHeaderGroup([1, 1, 2], 0)).toBe(true);
        expect(opensSubHeaderGroup([1, 1, 2], 1)).toBe(false);
        expect(opensSubHeaderGroup([1, 1, 2], 2)).toBe(true);
        expect(opensSubHeaderGroup([], 4)).toBe(false);
      });
    });
  });

  describe('GIVEN: a first paint before any layout measurement', () => {
    describe('WHEN: the row count exceeds the initial window', () => {
      it('THEN: it mounts the fixed initial row count', () => {
        expect(createInitialVirtualRange(1000)).toStrictEqual({ start: 0, end: NAT_TABLE_INITIAL_VIRTUAL_ROW_COUNT });
      });
    });

    describe('WHEN: the row count is below the initial window', () => {
      it('THEN: it mounts every logical row', () => {
        expect(createInitialVirtualRange(3)).toStrictEqual({ start: 0, end: 3 });
        expect(createInitialVirtualRange(0)).toStrictEqual({ start: 0, end: 0 });
      });
    });
  });
});
