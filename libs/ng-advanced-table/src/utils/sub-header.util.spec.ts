import type { Row, SortingState } from '@tanstack/angular-table';

import {
  buildSubHeaderRowGroups,
  buildSubHeaderRowOffsets,
  createSubHeaderOrderSortingFn,
  prependForcedSortingEntry,
  resolveSubHeaderValueText,
  stripNatTableSubHeaderSorting
} from './sub-header.util';

type TestRowData = { readonly status: unknown };

const fakeRow = (id: string, status: unknown): Row<TestRowData> =>
  ({
    id,
    getValue: (columnId: string) => (columnId === 'status' ? status : undefined)
  }) as unknown as Row<TestRowData>;

describe('FEATURE: sub-header utils', () => {
  describe('GIVEN: prependForcedSortingEntry', () => {
    describe('WHEN: no sub-header column is active', () => {
      it('THEN: it returns the user sorting reference unchanged', () => {
        const sorting: SortingState = [{ id: 'throughput', desc: true }];

        expect(prependForcedSortingEntry(sorting, null)).toBe(sorting);
      });
    });

    describe('WHEN: a sub-header column is active', () => {
      it('THEN: it prepends an ascending entry ahead of the user sorting', () => {
        const sorting: SortingState = [{ id: 'throughput', desc: true }];

        expect(prependForcedSortingEntry(sorting, 'status')).toStrictEqual([
          { id: 'status', desc: false },
          { id: 'throughput', desc: true }
        ]);
      });

      it('THEN: it drops a user entry for the same column so the forced entry stays primary', () => {
        const sorting: SortingState = [
          { id: 'status', desc: true },
          { id: 'throughput', desc: false }
        ];

        expect(prependForcedSortingEntry(sorting, 'status')).toStrictEqual([
          { id: 'status', desc: false },
          { id: 'throughput', desc: false }
        ]);
      });
    });
  });

  describe('GIVEN: stripNatTableSubHeaderSorting', () => {
    describe('WHEN: the forced entry is present', () => {
      it('THEN: it removes only that entry', () => {
        const sorting: SortingState = [
          { id: 'status', desc: false },
          { id: 'throughput', desc: true }
        ];

        expect(stripNatTableSubHeaderSorting(sorting, 'status')).toStrictEqual([{ id: 'throughput', desc: true }]);
      });
    });

    describe('WHEN: the forced entry is absent or no column is active', () => {
      it('THEN: it preserves the input reference', () => {
        const sorting: SortingState = [{ id: 'throughput', desc: true }];

        expect(stripNatTableSubHeaderSorting(sorting, 'status')).toBe(sorting);
        expect(stripNatTableSubHeaderSorting(sorting, null)).toBe(sorting);
      });
    });
  });

  describe('GIVEN: createSubHeaderOrderSortingFn', () => {
    const sortingFn = createSubHeaderOrderSortingFn<TestRowData>(['b', 'd', 'a']);
    const compare = (a: unknown, b: unknown): number => sortingFn(fakeRow('a', a), fakeRow('b', b), 'status');

    describe('WHEN: both values are listed', () => {
      it('THEN: it sorts by array position and treats equal ranks as ties', () => {
        expect(compare('b', 'd')).toBeLessThan(0);
        expect(compare('a', 'd')).toBeGreaterThan(0);
        expect(compare('d', 'd')).toBe(0);
      });
    });

    describe('WHEN: a value is not listed', () => {
      it('THEN: unlisted values sort after every listed value', () => {
        expect(compare('a', 'zzz')).toBeLessThan(0);
        expect(compare('zzz', 'b')).toBeGreaterThan(0);
      });

      it('THEN: unlisted values fall back to natural ascending order among themselves', () => {
        expect(compare('x', 'y')).toBeLessThan(0);
        expect(compare('Y', 'x')).toBeGreaterThan(0);
        expect(compare(2, 10)).toBeLessThan(0);
      });
    });

    describe('WHEN: a listed value is NaN', () => {
      it('THEN: it still matches its configured rank', () => {
        const nanFirst = createSubHeaderOrderSortingFn<TestRowData>([Number.NaN, 'b']);

        expect(nanFirst(fakeRow('a', Number.NaN), fakeRow('b', 'b'), 'status')).toBeLessThan(0);
      });
    });
  });

  describe('GIVEN: buildSubHeaderRowGroups', () => {
    describe('WHEN: page rows contain contiguous group segments', () => {
      it('THEN: it keys each segment by its starting row id with whole-group counts', () => {
        const allRows = [fakeRow('r1', 'a'), fakeRow('r2', 'a'), fakeRow('r3', 'b'), fakeRow('r4', 'b'), fakeRow('r5', 'b')];

        const groups = buildSubHeaderRowGroups(allRows, allRows, 'status');

        expect([...groups.keys()]).toStrictEqual(['r1', 'r3']);
        expect(groups.get('r1')).toMatchObject({ value: 'a', rowCountValue: 2 });
        expect(groups.get('r3')).toMatchObject({ value: 'b', rowCountValue: 3 });
      });
    });

    describe('WHEN: a group continues from the previous page', () => {
      it('THEN: the first page row opens a segment and reports the whole-group count', () => {
        const allRows = [fakeRow('r1', 'a'), fakeRow('r2', 'a'), fakeRow('r3', 'a'), fakeRow('r4', 'b')];
        const pageRows = [allRows[2], allRows[3]];

        const groups = buildSubHeaderRowGroups(pageRows, allRows, 'status');

        expect([...groups.keys()]).toStrictEqual(['r3', 'r4']);
        expect(groups.get('r3')).toMatchObject({ value: 'a', rowCountValue: 3 });
        expect(groups.get('r4')).toMatchObject({ value: 'b', rowCountValue: 1 });
      });
    });

    describe('WHEN: there are no page rows', () => {
      it('THEN: it returns an empty map', () => {
        expect(buildSubHeaderRowGroups([], [], 'status').size).toBe(0);
      });
    });
  });

  describe('GIVEN: buildSubHeaderRowOffsets', () => {
    describe('WHEN: no sub-header renders', () => {
      it('THEN: it returns an empty list so row numbering stays unshifted', () => {
        const rows = [fakeRow('r1', 'a'), fakeRow('r2', 'b')];

        expect(buildSubHeaderRowOffsets(rows, new Map())).toStrictEqual([]);
      });
    });

    describe('WHEN: groups open at several page rows', () => {
      it('THEN: each row reports the sub-headers rendered at or before it', () => {
        const rows = [fakeRow('r1', 'a'), fakeRow('r2', 'a'), fakeRow('r3', 'b'), fakeRow('r4', 'b'), fakeRow('r5', 'c')];
        const groups = buildSubHeaderRowGroups(rows, rows, 'status');

        expect(buildSubHeaderRowOffsets(rows, groups)).toStrictEqual([1, 1, 2, 2, 3]);
      });
    });

    describe('WHEN: every page row opens its own group', () => {
      it('THEN: the offsets increment on every row', () => {
        const rows = [fakeRow('r1', 'a'), fakeRow('r2', 'b'), fakeRow('r3', 'c')];
        const groups = buildSubHeaderRowGroups(rows, rows, 'status');

        expect(buildSubHeaderRowOffsets(rows, groups)).toStrictEqual([1, 2, 3]);
      });
    });
  });

  describe('GIVEN: resolveSubHeaderValueText', () => {
    describe('WHEN: values are formatted for announcements', () => {
      it('THEN: null and undefined become empty text and other values stringify', () => {
        expect(resolveSubHeaderValueText(null)).toBe('');
        expect(resolveSubHeaderValueText(undefined)).toBe('');
        expect(resolveSubHeaderValueText('active')).toBe('active');
        expect(resolveSubHeaderValueText(42)).toBe('42');
      });
    });
  });
});
