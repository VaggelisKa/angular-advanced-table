import type { ColumnFiltersState } from '@tanstack/angular-table';

import { serializeColumnFilters } from './table-utils';

describe('table-utils', () => {
  describe('serializeColumnFilters', () => {
    it('serializes JSON-compatible filter values deterministically', () => {
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

      expect(serializeColumnFilters(filters)).toBe('status:{"meta":{"active":true,"priority":2},"selected":["Pending","Healthy"]}');
    });

    it('does not throw for circular filter values', () => {
      const circular: Record<string, unknown> = {
        selected: 'Healthy'
      };

      circular['self'] = circular;

      expect(serializeColumnFilters([{ id: 'status', value: circular }])).toBe('status:{"selected":"Healthy","self":[Circular]}');
    });

    it('preserves type markers for non-JSON filter values', () => {
      const symbolFilter = Symbol('status');
      const callbackFilter = function statusFilter(): boolean {
        return true;
      };

      const filters: ColumnFiltersState = [
        { id: 'missing', value: undefined },
        { id: 'symbol', value: symbolFilter },
        { id: 'callback', value: callbackFilter },
        { id: 'count', value: 2n }
      ];

      expect(serializeColumnFilters(filters)).toBe(
        'missing:undefined|symbol:symbol:status|callback:function:statusFilter|count:bigint:2'
      );
    });
  });
});
