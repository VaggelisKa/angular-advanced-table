import { vi } from 'vitest';

import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { describeAccessibilityChange, describeColumnVisibilityChange, describeSelectionChange } from './table-announcement.util';
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
  describe('GIVEN: describeColumnVisibilityChange', () => {
    describe('WHEN: a visible column is hidden', () => {
      it('THEN: it reports the column as hidden and lowers the visible count', () => {
        const next: TableColumnAccessibilityState[] = [
          { id: 'name', label: 'Name', visible: true },
          { id: 'status', label: 'Status', visible: false },
          { id: 'owner', label: 'Owner', visible: false }
        ];
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns, visibleColumnsText, totalColumnsText }) =>
            `${changedColumns.map((change) => `${change.label}:${change.visibilityState}`).join(',')} (${visibleColumnsText}/${totalColumnsText})`
        };

        expect(describeColumnVisibilityChange(columns, next, text, formatNumber)).toBe('Status:hidden (#1/#3)');
      });
    });

    describe('WHEN: a hidden column is shown', () => {
      it('THEN: it reports the column as visible and raises the visible count', () => {
        const next: TableColumnAccessibilityState[] = [
          { id: 'name', label: 'Name', visible: true },
          { id: 'status', label: 'Status', visible: true },
          { id: 'owner', label: 'Owner', visible: true }
        ];
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns, visibleColumnsText }) =>
            `${changedColumns.map((change) => `${change.label}:${change.visibilityState}`).join(',')} (${visibleColumnsText})`
        };

        expect(describeColumnVisibilityChange(columns, next, text, formatNumber)).toBe('Owner:visible (#3)');
      });
    });

    describe('WHEN: multiple columns change visibility in the same update', () => {
      it('THEN: it reports every changed column in next-column order', () => {
        const next: TableColumnAccessibilityState[] = [
          { id: 'name', label: 'Name', visible: false },
          { id: 'status', label: 'Status', visible: true },
          { id: 'owner', label: 'Owner', visible: true }
        ];
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns }) =>
            changedColumns.map((change) => `${change.id}:${change.visibilityState}`).join(',')
        };

        expect(describeColumnVisibilityChange(columns, next, text, formatNumber)).toBe('name:hidden,owner:visible');
      });
    });

    describe('WHEN: no column visibility changed', () => {
      it('THEN: it reports no changed columns', () => {
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns }) => String(changedColumns.length)
        };

        expect(describeColumnVisibilityChange(columns, columns, text, formatNumber)).toBe('0');
      });
    });

    describe('WHEN: a column exists in the next snapshot but not the previous one', () => {
      it('THEN: it reports the newly-added column with its arrival visibility state', () => {
        // A newly-added column has no `previousColumn` match, so it announces its
        // arrival using the `next` visibility state - the change that triggered the
        // diff is included instead of silently dropped.
        const next: TableColumnAccessibilityState[] = [...columns, { id: 'region', label: 'Region', visible: true }];
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns, totalColumnsText }) =>
            `${changedColumns.map((change) => `${change.id}:${change.visibilityState}`).join(',')} total=${totalColumnsText}`
        };

        expect(describeColumnVisibilityChange(columns, next, text, formatNumber)).toBe('region:visible total=#4');
      });
    });

    describe('WHEN: no columnVisibilityChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        expect(describeColumnVisibilityChange(columns, columns, {}, formatNumber)).toBe('');
      });
    });
  });

  describe('GIVEN: describeSelectionChange', () => {
    describe('WHEN: no rows are selected', () => {
      it('THEN: it reports a zero selected count', () => {
        const snapshot = baseSnapshot({ selectedRowCount: 0, totalRows: 20 });
        const text: NatTableAccessibilityText = {
          selectionChange: ({ selectedCountText, totalRowsText }) => `${selectedCountText} of ${totalRowsText} selected`
        };

        expect(describeSelectionChange(snapshot, text, formatNumber)).toBe('#0 of #20 selected');
      });
    });

    describe('WHEN: some rows are selected', () => {
      it('THEN: it interpolates the selected and total counts', () => {
        const snapshot = baseSnapshot({ selectedRowCount: 3, totalRows: 20 });
        const text: NatTableAccessibilityText = {
          selectionChange: ({ selectedCountText, totalRowsText }) => `${selectedCountText} of ${totalRowsText} selected`
        };

        expect(describeSelectionChange(snapshot, text, formatNumber)).toBe('#3 of #20 selected');
      });
    });

    describe('WHEN: every row is selected', () => {
      it('THEN: it reports the selected count equal to the total row count', () => {
        const snapshot = baseSnapshot({ selectedRowCount: 20, totalRows: 20 });
        const text: NatTableAccessibilityText = {
          selectionChange: ({ selectedCountValue, totalRowsValue }) => `${selectedCountValue}/${totalRowsValue}`
        };

        expect(describeSelectionChange(snapshot, text, formatNumber)).toBe('20/20');
      });
    });

    describe('WHEN: no selectionChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot({ selectedRowCount: 3 });

        expect(describeSelectionChange(snapshot, {}, formatNumber)).toBe('');
      });
    });
  });

  describe('GIVEN: describeAccessibilityChange', () => {
    describe('WHEN: nothing announceable changed between snapshots', () => {
      it('THEN: it returns null without resolving the accessibility text', () => {
        const previous = baseSnapshot();
        const next = baseSnapshot();
        const resolveText = vi.fn((): NatTableAccessibilityText => ({}));

        expect(describeAccessibilityChange(previous, next, resolveText, formatNumber)).toBeNull();
        expect(resolveText).not.toHaveBeenCalled();
      });
    });

    describe('WHEN: the data status changed', () => {
      it('THEN: it returns the data-status announcement', () => {
        const previous = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.success });
        const next = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.loading });
        const text: NatTableAccessibilityText = { loadingState: 'Loading…' };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('Loading…');
      });
    });

    describe('WHEN: the sorting key changed', () => {
      it('THEN: it returns the sorting announcement', () => {
        const previous = baseSnapshot({ sortingKey: '' });
        const next = baseSnapshot({ sortingKey: 'name:asc', sorting: [{ id: 'name', desc: false }] });
        const text: NatTableAccessibilityText = { sortingChange: ({ columnLabel, sortState }) => `${columnLabel}:${sortState}` };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('Name:ascending');
      });
    });

    describe('WHEN: the global filter changed', () => {
      it('THEN: it returns the filtering announcement', () => {
        const previous = baseSnapshot({ globalFilter: '' });
        const next = baseSnapshot({ globalFilter: 'ready' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('global');
      });
    });

    describe('WHEN: the column filters key changed', () => {
      it('THEN: it returns the filtering announcement', () => {
        const previous = baseSnapshot({ columnFiltersKey: '' });
        const next = baseSnapshot({ columnFiltersKey: 'status:ready' });
        const text: NatTableAccessibilityText = { filteringChange: ({ filterState }) => filterState };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('column');
      });
    });

    describe('WHEN: column visibility changed', () => {
      it('THEN: it returns the column-visibility announcement', () => {
        const previous = baseSnapshot({ columns });
        const next = baseSnapshot({
          columns: [
            { id: 'name', label: 'Name', visible: true },
            { id: 'status', label: 'Status', visible: false },
            { id: 'owner', label: 'Owner', visible: false }
          ]
        });
        const text: NatTableAccessibilityText = {
          columnVisibilityChange: ({ changedColumns }) => changedColumns.map((change) => change.id).join(',')
        };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('status');
      });
    });

    describe('WHEN: the row selection key changed', () => {
      it('THEN: it returns the selection announcement', () => {
        const previous = baseSnapshot({ rowSelectionKey: '' });
        const next = baseSnapshot({ rowSelectionKey: 'row-1', selectedRowCount: 1 });
        const text: NatTableAccessibilityText = { selectionChange: ({ selectedCountValue }) => String(selectedCountValue) };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('1');
      });
    });

    describe('WHEN: the page size changed', () => {
      it('THEN: it returns the page-size announcement', () => {
        const previous = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 10 } });
        const next = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 25 } });
        const text: NatTableAccessibilityText = { pageSizeChange: ({ pageSizeValue }) => String(pageSizeValue) };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('25');
      });
    });

    describe('WHEN: the page index changed', () => {
      it('THEN: it returns the page announcement', () => {
        const previous = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 10 } });
        const next = baseSnapshot({ pagination: { pageIndex: 1, pageSize: 10 } });
        const text: NatTableAccessibilityText = { pageChange: ({ pageValue }) => String(pageValue) };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('2');
      });
    });

    describe('WHEN: multiple dimensions change in the same update', () => {
      it('THEN: it returns only the highest-priority announcement', () => {
        const previous = baseSnapshot({ dataStatus: NAT_TABLE_DATA_STATUS.success, sortingKey: '' });
        const next = baseSnapshot({
          dataStatus: NAT_TABLE_DATA_STATUS.loading,
          sortingKey: 'name:asc',
          sorting: [{ id: 'name', desc: false }]
        });
        const text: NatTableAccessibilityText = {
          loadingState: 'Loading…',
          sortingChange: () => 'should not be used'
        };

        expect(describeAccessibilityChange(previous, next, () => text, formatNumber)).toBe('Loading…');
      });
    });
  });
});
