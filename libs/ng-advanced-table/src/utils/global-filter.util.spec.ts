import type { Row, RowData } from '@tanstack/angular-table';

import { genericGlobalFilter } from './global-filter.util';

const buildRow = (id: string, values: Record<string, unknown>): Row<RowData> =>
  ({
    id,
    getValue: (columnId: string) => values[columnId]
  }) as unknown as Row<RowData>;

/** genericGlobalFilter's 4th parameter (FilterMeta reporting) is unused by its implementation. */
const ignoreMeta = (): void => undefined;

describe('FEATURE: NatTable global filter utility', () => {
  describe('GIVEN: genericGlobalFilter', () => {
    describe('WHEN: the filter value is blank or whitespace-only', () => {
      it('THEN: it matches every row regardless of content', () => {
        const row = buildRow('row-1', { name: 'Anything' });

        expect(genericGlobalFilter(row, 'name', '   ', ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: the filter value is null or undefined', () => {
      it('THEN: it treats both as an empty query and matches every row', () => {
        const row = buildRow('row-1', { name: 'Anything' });

        expect(genericGlobalFilter(row, 'name', null, ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(row, 'name', undefined, ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: the filter value is the number 0', () => {
      it('THEN: it treats it as a real query instead of an empty one', () => {
        const matching = buildRow('row-1', { count: 10 });
        const nonMatching = buildRow('row-2', { count: 42 });

        expect(genericGlobalFilter(matching, 'count', 0, ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(nonMatching, 'count', 0, ignoreMeta)).toBe(false);
      });
    });

    describe('WHEN: the column value contains the query as a case-insensitive substring', () => {
      it('THEN: it matches', () => {
        const row = buildRow('row-1', { name: 'Active Users' });

        expect(genericGlobalFilter(row, 'name', 'USER', ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: neither the column value nor the row id contain the query', () => {
      it('THEN: it does not match, even when the column value is null', () => {
        const row = buildRow('row-1', { name: null });

        expect(genericGlobalFilter(row, 'name', 'zzz', ignoreMeta)).toBe(false);
      });
    });

    describe('WHEN: the column value does not match but the row id does', () => {
      it('THEN: it falls back to matching the row id', () => {
        const row = buildRow('service-42', { name: 'Unrelated' });

        expect(genericGlobalFilter(row, 'name', 'service-42', ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: the column value is a number', () => {
      it('THEN: it matches against its stringified form', () => {
        const row = buildRow('row-1', { count: 42 });

        expect(genericGlobalFilter(row, 'count', '4', ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: the column value is a boolean', () => {
      it('THEN: it matches against its stringified form', () => {
        const row = buildRow('row-1', { active: true });

        expect(genericGlobalFilter(row, 'active', 'tru', ignoreMeta)).toBe(true);
      });
    });
    describe('WHEN: the same row is filtered across columns and changing queries', () => {
      it('THEN: it answers each call for its own query and row id, never a stale one', () => {
        const row = buildRow('service-42', { name: 'Alpha', region: 'North' });
        const other = buildRow('service-7', { name: 'Beta', region: 'South' });

        expect(genericGlobalFilter(row, 'name', 'service-42', ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(row, 'region', 'service-42', ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(other, 'name', 'service-42', ignoreMeta)).toBe(false);
        expect(genericGlobalFilter(other, 'name', 'SERVICE-7', ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(row, 'region', 'north', ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(row, 'region', 'south', ignoreMeta)).toBe(false);
        expect(genericGlobalFilter(row, 'region', '', ignoreMeta)).toBe(true);
      });
    });

    describe('WHEN: the column value is an array', () => {
      it('THEN: it still matches nested items', () => {
        const row = buildRow('row-1', { tags: ['red', ['deep blue']] });

        expect(genericGlobalFilter(row, 'tags', 'blue', ignoreMeta)).toBe(true);
        expect(genericGlobalFilter(row, 'tags', 'green', ignoreMeta)).toBe(false);
      });
    });
  });
});
