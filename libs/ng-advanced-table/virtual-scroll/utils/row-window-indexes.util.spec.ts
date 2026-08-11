import { buildRowWindowIndexes, isRowIndexMounted } from './row-window-indexes.util';

describe('FEATURE: virtual-scroll row-window indexes', () => {
  describe('GIVEN: buildRowWindowIndexes', () => {
    describe('WHEN: no row is focused', () => {
      it('THEN: it expands the half-open range into ascending indexes', () => {
        expect(buildRowWindowIndexes({ start: 3, end: 6 }, null, 10)).toStrictEqual([3, 4, 5]);
      });

      it('THEN: it clamps the range to a shrunken row model', () => {
        expect(buildRowWindowIndexes({ start: 8, end: 12 }, null, 10)).toStrictEqual([8, 9]);
        expect(buildRowWindowIndexes({ start: 20, end: 25 }, null, 10)).toStrictEqual([]);
      });
    });

    describe('WHEN: the focused row sits outside the range', () => {
      it('THEN: it keeps a focused row above the range mounted, in order', () => {
        expect(buildRowWindowIndexes({ start: 5, end: 8 }, 1, 10)).toStrictEqual([1, 5, 6, 7]);
      });

      it('THEN: it keeps a focused row below the range mounted, in order', () => {
        expect(buildRowWindowIndexes({ start: 0, end: 3 }, 8, 10)).toStrictEqual([0, 1, 2, 8]);
      });

      it('THEN: it drops a focused row that no longer exists in the row model', () => {
        expect(buildRowWindowIndexes({ start: 0, end: 3 }, 42, 10)).toStrictEqual([0, 1, 2]);
      });
    });

    describe('WHEN: the focused row sits inside the range', () => {
      it('THEN: it does not duplicate the focused index', () => {
        expect(buildRowWindowIndexes({ start: 4, end: 7 }, 5, 10)).toStrictEqual([4, 5, 6]);
      });
    });
  });

  describe('GIVEN: isRowIndexMounted', () => {
    describe('WHEN: probing mounted and unmounted indexes', () => {
      it('THEN: it reports membership in the index list', () => {
        expect(isRowIndexMounted([1, 4, 5], 4)).toBe(true);
        expect(isRowIndexMounted([1, 4, 5], 3)).toBe(false);
      });
    });
  });
});
