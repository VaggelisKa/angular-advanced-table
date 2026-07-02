import type { Column, ColumnPinningState } from '@tanstack/angular-table';

import {
  accumulatePinnedOffsets,
  getColumnMoveTargetIndex,
  getColumnZone,
  hasSameStringOrder,
  moveItemInArrayCopy,
  normalizeColumnOrder,
  normalizeColumnPinning,
  replaceIdsInSlots,
  resolvePinnedZoneColumns
} from './column-order.util';

type FixtureRow = { readonly id: string };

/** Minimal Column stub: only `.id` and `.getIsPinned()` are read by this file's functions. */
const createColumn = (id: string, pinned: false | 'left' | 'right' = false): Column<FixtureRow, unknown> =>
  ({
    id,
    getIsPinned: () => pinned
  }) as unknown as Column<FixtureRow, unknown>;

describe('FEATURE: Column order utilities', () => {
  describe('GIVEN: normalizeColumnOrder', () => {
    it('THEN: it keeps the order unchanged when every id is already present and valid', () => {
      expect(normalizeColumnOrder(['b', 'a', 'c'], ['a', 'b', 'c'])).toStrictEqual(['b', 'a', 'c']);
    });

    it('THEN: it drops ids that are not part of the leaf column ids', () => {
      expect(normalizeColumnOrder(['a', 'ghost', 'b'], ['a', 'b'])).toStrictEqual(['a', 'b']);
    });

    it('THEN: it appends missing leaf ids in their leaf-list order when the order omits them', () => {
      expect(normalizeColumnOrder(['b'], ['a', 'b', 'c'])).toStrictEqual(['b', 'a', 'c']);
    });

    it('THEN: it deduplicates repeated ids keeping the first occurrence', () => {
      expect(normalizeColumnOrder(['a', 'a', 'b'], ['a', 'b'])).toStrictEqual(['a', 'b']);
    });

    it('THEN: it returns the leaf ids as-is when the requested order is empty', () => {
      expect(normalizeColumnOrder([], ['a', 'b'])).toStrictEqual(['a', 'b']);
    });

    it('THEN: it returns an empty array when there are no leaf column ids', () => {
      expect(normalizeColumnOrder(['a', 'b'], [])).toStrictEqual([]);
    });
  });

  describe('GIVEN: normalizeColumnPinning', () => {
    it('THEN: it keeps left and right ids unchanged when all are valid leaf ids', () => {
      const pinning: ColumnPinningState = { left: ['a'], right: ['c'] };

      expect(normalizeColumnPinning(pinning, ['a', 'b', 'c'])).toStrictEqual({ left: ['a'], right: ['c'] });
    });

    it('THEN: it filters out ids that are not part of the leaf column ids', () => {
      const pinning: ColumnPinningState = { left: ['a', 'ghost'], right: ['ghost'] };

      expect(normalizeColumnPinning(pinning, ['a', 'b'])).toStrictEqual({ left: ['a'], right: [] });
    });

    it('THEN: it deduplicates repeated ids within each zone', () => {
      const pinning: ColumnPinningState = { left: ['a', 'a'], right: ['b', 'b'] };

      expect(normalizeColumnPinning(pinning, ['a', 'b'])).toStrictEqual({ left: ['a'], right: ['b'] });
    });

    it('THEN: it defaults to empty arrays when left and right are omitted', () => {
      expect(normalizeColumnPinning({}, ['a', 'b'])).toStrictEqual({ left: [], right: [] });
    });

    it('THEN: it keeps a shared id in both zones without cross-zone deduplication', () => {
      // Locks current behavior: left/right are validated independently, no mutual-exclusion check.
      const pinning: ColumnPinningState = { left: ['a'], right: ['a'] };

      expect(normalizeColumnPinning(pinning, ['a'])).toStrictEqual({ left: ['a'], right: ['a'] });
    });
  });

  describe('GIVEN: moveItemInArrayCopy', () => {
    it('THEN: it relocates the item earlier when moving to a lower index', () => {
      expect(moveItemInArrayCopy(['a', 'b', 'c', 'd'], 2, 0)).toStrictEqual(['c', 'a', 'b', 'd']);
    });

    it('THEN: it relocates the item later when moving to a higher index', () => {
      expect(moveItemInArrayCopy(['a', 'b', 'c', 'd'], 0, 2)).toStrictEqual(['b', 'c', 'a', 'd']);
    });

    it('THEN: it returns an unchanged copy when fromIndex is beyond the array bounds', () => {
      expect(moveItemInArrayCopy(['a', 'b', 'c'], 10, 0)).toStrictEqual(['a', 'b', 'c']);
    });

    it('THEN: it treats a negative fromIndex as counting from the end of the array', () => {
      // Locks native Array#splice semantics: -1 removes the last element, it is not "out of range".
      expect(moveItemInArrayCopy(['a', 'b', 'c'], -1, 0)).toStrictEqual(['c', 'a', 'b']);
    });

    it('THEN: it keeps the order unchanged when fromIndex equals toIndex', () => {
      expect(moveItemInArrayCopy(['a', 'b', 'c'], 1, 1)).toStrictEqual(['a', 'b', 'c']);
    });

    it('THEN: it appends the item at the end when toIndex exceeds the array bounds', () => {
      expect(moveItemInArrayCopy(['a', 'b', 'c'], 0, 99)).toStrictEqual(['b', 'c', 'a']);
    });

    it('THEN: it does not mutate the input array', () => {
      const original = ['a', 'b', 'c'];

      moveItemInArrayCopy(original, 0, 2);

      expect(original).toStrictEqual(['a', 'b', 'c']);
    });
  });

  describe('GIVEN: getColumnMoveTargetIndex', () => {
    it('THEN: it returns the previous index when moving left from a middle position', () => {
      expect(getColumnMoveTargetIndex(['a', 'b', 'c'], 'b', -1)).toBe(0);
    });

    it('THEN: it returns the next index when moving right from a middle position', () => {
      expect(getColumnMoveTargetIndex(['a', 'b', 'c'], 'b', 1)).toBe(2);
    });

    it('THEN: it returns null when moving left from the first position', () => {
      expect(getColumnMoveTargetIndex(['a', 'b', 'c'], 'a', -1)).toBeNull();
    });

    it('THEN: it returns null when moving right from the last position', () => {
      expect(getColumnMoveTargetIndex(['a', 'b', 'c'], 'c', 1)).toBeNull();
    });

    it('THEN: it returns null when the column id is not present in the list', () => {
      expect(getColumnMoveTargetIndex(['a', 'b', 'c'], 'ghost', 1)).toBeNull();
    });
  });

  describe('GIVEN: replaceIdsInSlots', () => {
    it('THEN: it replaces every id with the next visible order when all ids are movable', () => {
      const result = replaceIdsInSlots(['a', 'b', 'c'], ['c', 'a', 'b'], new Set(['a', 'b', 'c']));

      expect(result).toStrictEqual(['c', 'a', 'b']);
    });

    it('THEN: it keeps non-movable ids in place while filling movable slots sequentially', () => {
      const result = replaceIdsInSlots(['pinL', 'a', 'b', 'pinR'], ['b', 'a'], new Set(['a', 'b']));

      expect(result).toStrictEqual(['pinL', 'b', 'a', 'pinR']);
    });

    it('THEN: it keeps the original slot id when the next visible order runs out for remaining movable slots', () => {
      const result = replaceIdsInSlots(['a', 'b', 'c'], ['x'], new Set(['a', 'b', 'c']));

      expect(result).toStrictEqual(['x', 'b', 'c']);
    });

    it('THEN: it ignores extra ids when the next visible order is longer than the movable slot count', () => {
      const result = replaceIdsInSlots(['a', 'pin', 'b'], ['x', 'y', 'z'], new Set(['a', 'b']));

      expect(result).toStrictEqual(['x', 'pin', 'y']);
    });

    it('THEN: it returns the current order unchanged when no ids are movable', () => {
      const result = replaceIdsInSlots(['a', 'b'], ['x', 'y'], new Set());

      expect(result).toStrictEqual(['a', 'b']);
    });
  });

  describe('GIVEN: hasSameStringOrder', () => {
    it('THEN: it returns true when both arrays contain the same values in the same order', () => {
      expect(hasSameStringOrder(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    });

    it('THEN: it returns false when the arrays contain the same values in a different order', () => {
      expect(hasSameStringOrder(['a', 'b', 'c'], ['a', 'c', 'b'])).toBe(false);
    });

    it('THEN: it returns false when the arrays differ in length', () => {
      expect(hasSameStringOrder(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
    });

    it('THEN: it returns true when both arrays are empty', () => {
      expect(hasSameStringOrder([], [])).toBe(true);
    });
  });

  describe('GIVEN: accumulatePinnedOffsets', () => {
    it('THEN: it accumulates the running width sum in iteration order', () => {
      const columns = [createColumn('a'), createColumn('b'), createColumn('c')];

      expect(accumulatePinnedOffsets(columns, { a: 100, b: 50, c: 20 })).toStrictEqual({ a: 0, b: 100, c: 150 });
    });

    it('THEN: it treats a column missing from the widths record as zero width', () => {
      const columns = [createColumn('a'), createColumn('b')];

      expect(accumulatePinnedOffsets(columns, { a: 100 })).toStrictEqual({ a: 0, b: 100 });
    });

    it('THEN: it returns an empty offsets record when there are no columns', () => {
      expect(accumulatePinnedOffsets([], {})).toStrictEqual({});
    });
  });

  describe('GIVEN: resolvePinnedZoneColumns', () => {
    it('THEN: it resolves zone ids to their visible columns preserving zone order', () => {
      const columnA = createColumn('a');
      const columnB = createColumn('b');
      const visibleColumnsById = new Map([
        ['a', columnA],
        ['b', columnB]
      ]);

      expect(resolvePinnedZoneColumns(['b', 'a'], visibleColumnsById)).toStrictEqual([columnB, columnA]);
    });

    it('THEN: it filters out zone ids that are not present in the visible columns map', () => {
      const columnA = createColumn('a');
      const visibleColumnsById = new Map([['a', columnA]]);

      expect(resolvePinnedZoneColumns(['a', 'ghost'], visibleColumnsById)).toStrictEqual([columnA]);
    });

    it('THEN: it returns an empty array when zoneColumnIds is undefined', () => {
      expect(resolvePinnedZoneColumns(undefined, new Map())).toStrictEqual([]);
    });
  });

  describe('GIVEN: getColumnZone', () => {
    it('THEN: it returns left for a column pinned left', () => {
      expect(getColumnZone(createColumn('a', 'left'))).toBe('left');
    });

    it('THEN: it returns right for a column pinned right', () => {
      expect(getColumnZone(createColumn('a', 'right'))).toBe('right');
    });

    it('THEN: it returns center for a column that is not pinned', () => {
      expect(getColumnZone(createColumn('a', false))).toBe('center');
    });
  });
});
