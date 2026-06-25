import type { ColumnFiltersState } from '@tanstack/angular-table';

import { resolveDefaultRowId, serializeColumnFilters } from './table-utils';

describe('FEATURE: table utilities', () => {
  describe('GIVEN: column filter serialization', () => {
    describe('WHEN: filter values are JSON-compatible', () => {
      it('THEN: it serializes the filter values', () => {
        const filters: ColumnFiltersState = [
          {
            id: 'status',
            value: {
              selected: ['Pending', 'Healthy'],
              meta: {
                priority: 2,
                active: true
              }
            }
          }
        ];

        expect(serializeColumnFilters(filters)).toBe('status:{"selected":["Pending","Healthy"],"meta":{"priority":2,"active":true}}');
      });
    });

    describe('WHEN: filter values cannot be serialized', () => {
      it('THEN: it marks the unsupported filter values without throwing', () => {
        const circular: Record<string, unknown> = {
          selected: 'Healthy'
        };

        circular['self'] = circular;

        const filters: ColumnFiltersState = [
          { id: 'status', value: circular },
          { id: 'count', value: 2n }
        ];

        expect(serializeColumnFilters(filters)).toBe('status:[unserializable]|count:[unserializable]');
      });
    });
  });

  describe('GIVEN: default row id resolution', () => {
    describe('WHEN: a row exposes a string id', () => {
      it('THEN: it uses the row id', () => {
        expect(resolveDefaultRowId({ id: 'svc-1' }, 4)).toBe('svc-1');
      });
    });

    describe('WHEN: a row exposes a numeric id', () => {
      it('THEN: it stringifies the row id', () => {
        expect(resolveDefaultRowId({ id: 42 }, 4)).toBe('42');
      });
    });

    describe('WHEN: a row does not expose a usable id', () => {
      it('THEN: it falls back to the row index', () => {
        expect(resolveDefaultRowId({ id: '' }, 4)).toBe('4');
      });
    });

    describe('WHEN: an index fallback belongs to a parent row', () => {
      it('THEN: it prefixes the fallback id with the parent id', () => {
        expect(resolveDefaultRowId({ name: 'Child' }, 2, { id: 'parent-1' })).toBe('parent-1.2');
      });
    });
  });
});
