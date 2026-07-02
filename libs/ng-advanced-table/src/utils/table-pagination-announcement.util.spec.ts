import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { describePageChange, describePageSizeChange, getPaginationAnnouncementContext } from './table-pagination-announcement.util';
import type { FormatAccessibilityNumber, TableAccessibilitySnapshot } from '../common/table-a11y.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';

const formatNumber: FormatAccessibilityNumber = (value) => `#${value}`;

const baseSnapshot = (overrides: Partial<TableAccessibilitySnapshot> = {}): TableAccessibilitySnapshot => ({
  dataStatus: NAT_TABLE_DATA_STATUS.success,
  sorting: [],
  sortingKey: '',
  globalFilter: '',
  columnFiltersKey: '',
  rowSelectionKey: '',
  selectedRowCount: 0,
  pagination: { pageIndex: 0, pageSize: 10 },
  pageCount: 5,
  visibleRows: 10,
  totalRows: 42,
  columns: [],
  ...overrides
});

describe('FEATURE: NatTable pagination announcement utilities', () => {
  describe('GIVEN: getPaginationAnnouncementContext', () => {
    describe('WHEN: building the context for the first page', () => {
      it('THEN: it converts the zero-based page index to a one-based page value', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 10 }, pageCount: 5 });

        const context = getPaginationAnnouncementContext(snapshot, formatNumber);

        expect(context.pageIndex).toBe(0);
        expect(context.pageValue).toBe(1);
      });
    });

    describe('WHEN: building the context for a later page', () => {
      it('THEN: it offsets the page value by the zero-based index', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 4, pageSize: 10 }, pageCount: 5 });

        const context = getPaginationAnnouncementContext(snapshot, formatNumber);

        expect(context.pageIndex).toBe(4);
        expect(context.pageValue).toBe(5);
      });
    });

    describe('WHEN: building the context with a number formatter', () => {
      it('THEN: it formats every numeric field through the provided formatter', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 1, pageSize: 25 }, pageCount: 5, visibleRows: 25 });

        const context = getPaginationAnnouncementContext(snapshot, formatNumber);

        expect(context).toStrictEqual({
          pageIndex: 1,
          pageValue: 2,
          pageText: '#2',
          pageCountValue: 5,
          pageCountText: '#5',
          pageSizeValue: 25,
          pageSizeText: '#25',
          visibleRowsValue: 25,
          visibleRowsText: '#25'
        });
      });
    });
  });

  describe('GIVEN: describePageSizeChange', () => {
    describe('WHEN: a pageSizeChange formatter is configured', () => {
      it('THEN: it interpolates the page size into the announcement', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 25 } });
        const text: NatTableAccessibilityText = {
          pageSizeChange: ({ pageSizeText, visibleRowsText }) => `Showing ${pageSizeText} rows per page (${visibleRowsText} visible)`
        };

        expect(describePageSizeChange(snapshot, text, formatNumber)).toBe('Showing #25 rows per page (#10 visible)');
      });
    });

    describe('WHEN: no pageSizeChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot();

        expect(describePageSizeChange(snapshot, {}, formatNumber)).toBe('');
      });
    });
  });

  describe('GIVEN: describePageChange', () => {
    describe('WHEN: navigating to the first page', () => {
      it('THEN: it announces page one of the total page count', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 0, pageSize: 10 }, pageCount: 5 });
        const text: NatTableAccessibilityText = {
          pageChange: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
        };

        expect(describePageChange(snapshot, text, formatNumber)).toBe('Page #1 of #5');
      });
    });

    describe('WHEN: navigating to a middle page', () => {
      it('THEN: it announces the middle page of the total page count', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 2, pageSize: 10 }, pageCount: 5 });
        const text: NatTableAccessibilityText = {
          pageChange: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
        };

        expect(describePageChange(snapshot, text, formatNumber)).toBe('Page #3 of #5');
      });
    });

    describe('WHEN: navigating to the last page', () => {
      it('THEN: it announces the final page of the total page count', () => {
        const snapshot = baseSnapshot({ pagination: { pageIndex: 4, pageSize: 10 }, pageCount: 5 });
        const text: NatTableAccessibilityText = {
          pageChange: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
        };

        expect(describePageChange(snapshot, text, formatNumber)).toBe('Page #5 of #5');
      });
    });

    describe('WHEN: no pageChange formatter is configured', () => {
      it('THEN: it returns an empty string', () => {
        const snapshot = baseSnapshot();

        expect(describePageChange(snapshot, {}, formatNumber)).toBe('');
      });
    });
  });
});
