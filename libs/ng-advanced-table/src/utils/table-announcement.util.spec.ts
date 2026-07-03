import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { describeDataStatusChange, describeFilteringChange, describeSortingChange } from './table-announcement.util';
import type { TableColumnAccessibilityState } from '../common/column-render.type';
import type { FormatAccessibilityNumber, TableAccessibilitySnapshot } from '../common/table-a11y.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';

const formatNumber: FormatAccessibilityNumber = (value) => `#${value}`;

const columns: TableColumnAccessibilityState[] = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'owner', label: 'Owner', visible: false }
];

const baseSnapshot = (overrides: Partial<TableAccessibilitySnapshot> = {}): TableAccessibilitySnapshot => ({
  dataStatus: NAT_TABLE_DATA_STATUS.success,
  sorting: [],
  sortingKey: '',
  globalFilter: '',
  columnFiltersKey: '',
  rowSelectionKey: '',
  selectedRowCount: 0,
  pagination: { pageIndex: 0, pageSize: 10 },
  pageCount: 3,
  visibleRows: 5,
  totalRows: 20,
  columns,
  ...overrides
});

describe('FEATURE: NatTable announcement utilities', () => {
  describe('GIVEN: describeDataStatusChange', () => {
    describe('WHEN: the data status is loading', () => {
      it('THEN: it returns the loading-state text', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.loading });
        const text: NatTableAccessibilityText = { loadingState: 'Loading rows…' };

        expect(describeDataStatusChange(snapshot, text)).toBe('Loading rows…');
      });
    });

    describe('WHEN: the data status is loading and no loading-state text is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.loading });

        expect(describeDataStatusChange(snapshot, {})).toBe('');
      });
    });

    describe('WHEN: the data status is error', () => {
      it('THEN: it returns the error-state text', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.error });
        const text: NatTableAccessibilityText = { errorState: 'Failed to load rows.' };

        expect(describeDataStatusChange(snapshot, text)).toBe('Failed to load rows.');
      });
    });

    describe('WHEN: the data status is error and no error-state text is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.error });

        expect(describeDataStatusChange(snapshot, {})).toBe('');
      });
    });

    describe('WHEN: the data status is success with zero visible rows', () => {
      it('THEN: it returns the empty-state text', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.success, visibleRows: 0 });
        const text: NatTableAccessibilityText = { emptyState: 'No rows match your filters.' };

        expect(describeDataStatusChange(snapshot, text)).toBe('No rows match your filters.');
      });
    });

    describe('WHEN: the data status is success with zero visible rows and no empty-state text is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.success, visibleRows: 0 });

        expect(describeDataStatusChange(snapshot, {})).toBe('');
      });
    });

    describe('WHEN: the data status is success with visible rows', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.success, visibleRows: 5 });
        const text: NatTableAccessibilityText = { emptyState: 'No rows match your filters.' };

        expect(describeDataStatusChange(snapshot, text)).toBe('');
      });
    });
  });

  describe('GIVEN: describeSortingChange', () => {
    describe('WHEN: sorting is cleared', () => {
      it('THEN: it reports a null column with sort state none', () => {
        const snapshot = baseSnapshot({ sorting: [] });
        const text: NatTableAccessibilityText = {
          sortingChange: ({ columnId, columnLabel, sortState, sortedColumns }) =>
            `col=${columnId ?? 'none'} label=${columnLabel ?? 'none'} state=${sortState} count=${sortedColumns.length}`
        };

        expect(describeSortingChange(snapshot, text)).toBe('col=none label=none state=none count=0');
      });
    });

    describe('WHEN: a single column is sorted ascending', () => {
      it('THEN: it resolves the column label and ascending state', () => {
        const snapshot = baseSnapshot({ sorting: [{ id: 'name', desc: false }] });
        const text: NatTableAccessibilityText = {
          sortingChange: ({ columnLabel, sortState }) => `${columnLabel} sorted ${sortState}`
        };

        expect(describeSortingChange(snapshot, text)).toBe('Name sorted ascending');
      });
    });

    describe('WHEN: a single column is sorted descending', () => {
      it('THEN: it resolves the descending state', () => {
        const snapshot = baseSnapshot({ sorting: [{ id: 'status', desc: true }] });
        const text: NatTableAccessibilityText = {
          sortingChange: ({ columnLabel, sortState }) => `${columnLabel} sorted ${sortState}`
        };

        expect(describeSortingChange(snapshot, text)).toBe('Status sorted descending');
      });
    });

    describe('WHEN: the sorted column id has no matching column definition', () => {
      it('THEN: it falls back to the raw column id as the label', () => {
        const snapshot = baseSnapshot({ sorting: [{ id: 'unknown-column', desc: false }] });
        const text: NatTableAccessibilityText = {
          sortingChange: ({ columnLabel }) => columnLabel ?? ''
        };

        expect(describeSortingChange(snapshot, text)).toBe('unknown-column');
      });
    });

    describe('WHEN: multiple columns are sorted', () => {
      it('THEN: it reports every sorted column while the primary fields reflect only the first entry', () => {
        const snapshot = baseSnapshot({
          sorting: [
            { id: 'name', desc: false },
            { id: 'status', desc: true }
          ]
        });
        const text: NatTableAccessibilityText = {
          sortingChange: ({ columnLabel, sortState, sortedColumns }) =>
            `primary=${columnLabel}:${sortState} all=${sortedColumns.map((entry) => `${entry.label}:${entry.sortState}`).join(',')}`
        };

        expect(describeSortingChange(snapshot, text)).toBe('primary=Name:ascending all=Name:ascending,Status:descending');
      });
    });

    describe('WHEN: no sortingChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ sorting: [{ id: 'name', desc: false }] });

        expect(describeSortingChange(snapshot, {})).toBe('');
      });
    });
  });

  describe('GIVEN: describeFilteringChange', () => {
    describe('WHEN: only the global filter is active', () => {
      it('THEN: it reports the global filter state', () => {
        const snapshot = baseSnapshot({ globalFilter: 'ready', columnFiltersKey: '' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeFilteringChange(snapshot, text, formatNumber)).toBe('global');
      });
    });

    describe('WHEN: only column filters are active', () => {
      it('THEN: it reports the column filter state', () => {
        const snapshot = baseSnapshot({ globalFilter: '', columnFiltersKey: 'status:ready' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeFilteringChange(snapshot, text, formatNumber)).toBe('column');
      });
    });

    describe('WHEN: both global and column filters are active', () => {
      it('THEN: it reports the combined filter state', () => {
        const snapshot = baseSnapshot({ globalFilter: 'ready', columnFiltersKey: 'status:ready' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeFilteringChange(snapshot, text, formatNumber)).toBe('global-and-column');
      });
    });

    describe('WHEN: no filters are active', () => {
      it('THEN: it reports no active filter state', () => {
        const snapshot = baseSnapshot({ globalFilter: '', columnFiltersKey: '' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeFilteringChange(snapshot, text, formatNumber)).toBe('none');
      });
    });

    describe('WHEN: no filteringChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ globalFilter: 'ready' });

        expect(describeFilteringChange(snapshot, {}, formatNumber)).toBe('');
      });
    });

    describe('WHEN: the formatter interpolates row counts into a template', () => {
      it('THEN: it substitutes the formatted visible and total row counts', () => {
        const snapshot = baseSnapshot({ globalFilter: 'ready', visibleRows: 3, totalRows: 20 });
        const text: NatTableAccessibilityText = {
          filteringChange: ({ query, visibleRowsText, totalRowsText }) => `"${query}" matched ${visibleRowsText} of ${totalRowsText}`
        };

        expect(describeFilteringChange(snapshot, text, formatNumber)).toBe('"ready" matched #3 of #20');
      });
    });
  });
});
