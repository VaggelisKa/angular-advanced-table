import { includeVirtualIndex, normalizeNatTableVirtualizationOptions } from './table-virtualization.util';

describe('FEATURE: NatTable virtualization options and ranges', () => {
  describe('GIVEN: fixed-row virtualization options', () => {
    describe('WHEN: options contain invalid runtime values', () => {
      it('THEN: it normalizes them to safe fixed-row defaults', () => {
        expect(normalizeNatTableVirtualizationOptions({ rowHeight: Number.NaN, overscan: -2 })).toStrictEqual({
          rowHeight: 1,
          overscan: 6
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
  });
});
