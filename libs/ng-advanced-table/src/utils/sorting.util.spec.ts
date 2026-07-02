import type { SortingState } from '@tanstack/angular-table';

import { normalizeSortingState, resolveFilterState, serializeSorting, sortDirection } from './sorting.util';

describe('FEATURE: sorting utilities', () => {
  describe('GIVEN: normalizeSortingState', () => {
    describe('WHEN: multi-sort is enabled and no duplicate columns are sorted', () => {
      it('THEN: it preserves the original sorting reference', () => {
        const sorting: SortingState = [
          { id: 'name', desc: false },
          { id: 'status', desc: true }
        ];

        expect(normalizeSortingState(sorting, true)).toBe(sorting);
      });
    });

    describe('WHEN: multi-sort is enabled and duplicate column ids are sorted', () => {
      it('THEN: it dedupes by column id, keeping the first occurrence', () => {
        const sorting: SortingState = [
          { id: 'name', desc: false },
          { id: 'status', desc: true },
          { id: 'name', desc: true }
        ];

        expect(normalizeSortingState(sorting, true)).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'status', desc: true }
        ]);
      });
    });

    describe('WHEN: multi-sort is disabled and multiple columns are sorted', () => {
      it('THEN: it truncates the sorting state to the first entry', () => {
        const sorting: SortingState = [
          { id: 'name', desc: false },
          { id: 'status', desc: true }
        ];

        expect(normalizeSortingState(sorting, false)).toStrictEqual([{ id: 'name', desc: false }]);
      });
    });

    describe('WHEN: multi-sort is disabled and only one column is sorted', () => {
      it('THEN: it preserves the original sorting reference', () => {
        const sorting: SortingState = [{ id: 'name', desc: false }];

        expect(normalizeSortingState(sorting, false)).toBe(sorting);
      });
    });

    describe('WHEN: the sorting state is empty', () => {
      it('THEN: it returns the same empty array unchanged', () => {
        const sorting: SortingState = [];

        expect(normalizeSortingState(sorting, true)).toBe(sorting);
      });
    });
  });

  describe('GIVEN: serializeSorting', () => {
    describe('WHEN: sorting includes ascending and descending entries', () => {
      it('THEN: it joins entries with their direction suffix', () => {
        const sorting: SortingState = [
          { id: 'name', desc: false },
          { id: 'status', desc: true }
        ];

        expect(serializeSorting(sorting)).toBe('name:asc|status:desc');
      });
    });

    describe('WHEN: the sorting state is empty', () => {
      it('THEN: it returns an empty string', () => {
        expect(serializeSorting([])).toBe('');
      });
    });
  });

  describe('GIVEN: sortDirection', () => {
    describe('WHEN: the desc flag is true', () => {
      it('THEN: it returns the descending announcement value', () => {
        expect(sortDirection(true)).toBe('descending');
      });
    });

    describe('WHEN: the desc flag is false', () => {
      it('THEN: it returns the ascending announcement value', () => {
        expect(sortDirection(false)).toBe('ascending');
      });
    });
  });

  describe('GIVEN: resolveFilterState', () => {
    describe('WHEN: both a global filter and column filters are active', () => {
      it('THEN: it reports the combined filter state', () => {
        expect(resolveFilterState(true, true)).toBe('global-and-column');
      });
    });

    describe('WHEN: only a global filter is active', () => {
      it('THEN: it reports the global filter state', () => {
        expect(resolveFilterState(true, false)).toBe('global');
      });
    });

    describe('WHEN: only column filters are active', () => {
      it('THEN: it reports the column filter state', () => {
        expect(resolveFilterState(false, true)).toBe('column');
      });
    });

    describe('WHEN: no filters are active', () => {
      it('THEN: it reports no filter state', () => {
        expect(resolveFilterState(false, false)).toBe('none');
      });
    });
  });
});
