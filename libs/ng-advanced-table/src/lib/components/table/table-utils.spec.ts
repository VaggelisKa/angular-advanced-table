import type { ColumnFiltersState } from '@tanstack/angular-table';

import { serializeColumnFilters } from './table-utils';

describe('table-utils', () => {
  describe('serializeColumnFilters', () => {
    it('serializes JSON-compatible filter values', () => {
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

    it('does not throw when a consumer passes unsupported filter values', () => {
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
