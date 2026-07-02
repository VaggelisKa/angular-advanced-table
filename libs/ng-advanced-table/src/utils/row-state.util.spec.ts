import type { RowSelectionState } from '@tanstack/angular-table';

import {
  hasSameColumnVisibility,
  hasSameWidths,
  matchesFilterQuery,
  normalizeDataStatus,
  normalizeRowSelection,
  serializeRowSelection
} from './row-state.util';
import type { TableColumnAccessibilityState } from '../common/column-render.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';

describe('FEATURE: row-state utilities', () => {
  describe('GIVEN: normalizeRowSelection', () => {
    describe('WHEN: multi-select is enabled and multiple rows are selected', () => {
      it('THEN: it preserves the selection unchanged', () => {
        const selection: RowSelectionState = { a: true, b: true };

        expect(normalizeRowSelection(selection, true)).toBe(selection);
      });
    });

    describe('WHEN: multi-select is disabled and only one row is selected', () => {
      it('THEN: it preserves the selection unchanged', () => {
        const selection: RowSelectionState = { a: true };

        expect(normalizeRowSelection(selection, false)).toBe(selection);
      });
    });

    describe('WHEN: multi-select is disabled and multiple rows are selected', () => {
      it('THEN: it collapses the selection to the alphabetically first selected id', () => {
        const selection: RowSelectionState = { c: true, a: true, b: false };

        expect(normalizeRowSelection(selection, false)).toStrictEqual({ a: true });
      });
    });
  });

  describe('GIVEN: serializeRowSelection', () => {
    describe('WHEN: multiple rows are selected', () => {
      it('THEN: it joins the selected ids in sorted order', () => {
        const selection: RowSelectionState = { c: true, a: true, b: false };

        expect(serializeRowSelection(selection)).toBe('a|c');
      });
    });

    describe('WHEN: no rows are selected', () => {
      it('THEN: it returns an empty string', () => {
        expect(serializeRowSelection({})).toBe('');
      });
    });
  });

  describe('GIVEN: normalizeDataStatus', () => {
    describe('WHEN: the status is a recognized loading or error value', () => {
      it('THEN: it preserves the status unchanged', () => {
        expect(normalizeDataStatus(NAT_TABLE_DATA_STATUS.loading)).toBe(NAT_TABLE_DATA_STATUS.loading);
        expect(normalizeDataStatus(NAT_TABLE_DATA_STATUS.error)).toBe(NAT_TABLE_DATA_STATUS.error);
      });
    });

    describe('WHEN: the status is already success', () => {
      it('THEN: it preserves the success status', () => {
        expect(normalizeDataStatus(NAT_TABLE_DATA_STATUS.success)).toBe(NAT_TABLE_DATA_STATUS.success);
      });
    });

    describe('WHEN: the status is an unrecognized value', () => {
      it('THEN: it falls back to the success status', () => {
        expect(normalizeDataStatus('bogus' as NatTableDataStatus)).toBe(NAT_TABLE_DATA_STATUS.success);
      });
    });
  });

  describe('GIVEN: matchesFilterQuery', () => {
    describe('WHEN: a string value contains the query', () => {
      it('THEN: it reports a match', () => {
        expect(matchesFilterQuery('Pending Review', 'pending')).toBe(true);
      });
    });

    describe('WHEN: a string value does not contain the query', () => {
      it('THEN: it reports no match', () => {
        expect(matchesFilterQuery('Healthy', 'pending')).toBe(false);
      });
    });

    describe('WHEN: the value has different casing than the query', () => {
      it('THEN: it matches case-insensitively by lowercasing the value', () => {
        expect(matchesFilterQuery('ACTIVE', 'active')).toBe(true);
      });
    });

    describe('WHEN: the query itself contains uppercase letters', () => {
      it('THEN: it matches case-insensitively by lowercasing both the value and the query', () => {
        expect(matchesFilterQuery('active', 'ACTIVE')).toBe(true);
      });
    });

    describe('WHEN: the value is a number', () => {
      it('THEN: it coerces the number to a string and matches', () => {
        expect(matchesFilterQuery(42, '42')).toBe(true);
      });
    });

    describe('WHEN: the value is a boolean', () => {
      it('THEN: it coerces the boolean to a string and matches', () => {
        expect(matchesFilterQuery(true, 'true')).toBe(true);
      });
    });

    describe('WHEN: the value is null or undefined', () => {
      it('THEN: it reports no match for either nullish value', () => {
        expect(matchesFilterQuery(null, 'x')).toBe(false);
        expect(matchesFilterQuery(undefined, 'x')).toBe(false);
      });
    });

    describe('WHEN: the value is a Date', () => {
      it('THEN: it matches against the lowercased ISO timestamp', () => {
        expect(matchesFilterQuery(new Date('2026-01-15T00:00:00.000Z'), '2026-01-15')).toBe(true);
      });
    });

    describe('WHEN: the value is an array containing a matching item', () => {
      it('THEN: it reports a match', () => {
        expect(matchesFilterQuery(['Healthy', 'Pending'], 'pending')).toBe(true);
      });
    });

    describe('WHEN: the value is an array with no matching items', () => {
      it('THEN: it reports no match', () => {
        expect(matchesFilterQuery(['Healthy', 'Degraded'], 'pending')).toBe(false);
      });
    });

    describe('WHEN: the value is an unsupported type like a plain object', () => {
      it('THEN: it reports no match', () => {
        expect(matchesFilterQuery({ nested: 'pending' }, 'pending')).toBe(false);
      });
    });
  });

  describe('GIVEN: hasSameWidths', () => {
    describe('WHEN: both records have identical keys and values', () => {
      it('THEN: it reports equal widths', () => {
        expect(hasSameWidths({ name: 120, status: 80 }, { name: 120, status: 80 })).toBe(true);
      });
    });

    describe('WHEN: the records have a different number of keys', () => {
      it('THEN: it reports unequal widths', () => {
        expect(hasSameWidths({ name: 120 }, { name: 120, status: 80 })).toBe(false);
      });
    });

    describe('WHEN: the records have the same key count but different key names', () => {
      it('THEN: it reports unequal widths', () => {
        expect(hasSameWidths({ name: 120 }, { status: 120 })).toBe(false);
      });
    });

    describe('WHEN: a shared key has a different width value', () => {
      it('THEN: it reports unequal widths', () => {
        expect(hasSameWidths({ name: 120, status: 80 }, { name: 120, status: 90 })).toBe(false);
      });
    });
  });

  describe('GIVEN: hasSameColumnVisibility', () => {
    describe('WHEN: current and next have the same ids and visibility, but different labels', () => {
      it('THEN: it reports equal visibility, ignoring the label change', () => {
        const current: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Name', visible: true }];
        const next: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Nom', visible: true }];

        expect(hasSameColumnVisibility(current, next)).toBe(true);
      });
    });

    describe('WHEN: next has a different number of columns than current', () => {
      it('THEN: it reports unequal visibility', () => {
        const current: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Name', visible: true }];
        const next: TableColumnAccessibilityState[] = [
          { id: 'name', label: 'Name', visible: true },
          { id: 'status', label: 'Status', visible: true }
        ];

        expect(hasSameColumnVisibility(current, next)).toBe(false);
      });
    });

    describe('WHEN: a column id in current is missing from next', () => {
      it('THEN: it reports unequal visibility', () => {
        const current: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Name', visible: true }];
        const next: TableColumnAccessibilityState[] = [{ id: 'status', label: 'Status', visible: true }];

        expect(hasSameColumnVisibility(current, next)).toBe(false);
      });
    });

    describe('WHEN: a matching column id has a different visible flag', () => {
      it('THEN: it reports unequal visibility', () => {
        const current: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Name', visible: true }];
        const next: TableColumnAccessibilityState[] = [{ id: 'name', label: 'Name', visible: false }];

        expect(hasSameColumnVisibility(current, next)).toBe(false);
      });
    });
  });
});
