import { buildColumnReorderContext, buildColumnResizeContext, getSummaryContext } from './table-summary.util';
import type { FormatAccessibilityNumber } from '../common/table-a11y.type';

const formatNumber: FormatAccessibilityNumber = (value) => `#${value}`;

describe('FEATURE: NatTable summary utilities', () => {
  describe('GIVEN: getSummaryContext', () => {
    describe('WHEN: the table is filtered with pagination enabled', () => {
      it('THEN: it reports filtered and enabled states', () => {
        const context = getSummaryContext(
          { visibleRows: 5, totalRows: 20, visibleColumns: 4, pageIndex: 0, pageCount: 4, isFiltered: true, paginationEnabled: true },
          formatNumber
        );

        expect(context.filterState).toBe('filtered');
        expect(context.paginationState).toBe('enabled');
      });
    });

    describe('WHEN: the table is unfiltered with pagination disabled', () => {
      it('THEN: it reports unfiltered and disabled states', () => {
        const context = getSummaryContext(
          {
            visibleRows: 20,
            totalRows: 20,
            visibleColumns: 4,
            pageIndex: 0,
            pageCount: 1,
            isFiltered: false,
            paginationEnabled: false
          },
          formatNumber
        );

        expect(context.filterState).toBe('unfiltered');
        expect(context.paginationState).toBe('disabled');
      });
    });

    describe('WHEN: building the context for the third page', () => {
      it('THEN: it converts the zero-based page index to a one-based page value', () => {
        const context = getSummaryContext(
          { visibleRows: 5, totalRows: 20, visibleColumns: 4, pageIndex: 2, pageCount: 4, isFiltered: false, paginationEnabled: true },
          formatNumber
        );

        expect(context.pageIndex).toBe(2);
        expect(context.pageValue).toBe(3);
      });
    });

    describe('WHEN: a number formatter is supplied', () => {
      it('THEN: it formats every numeric field through the provided formatter', () => {
        const context = getSummaryContext(
          { visibleRows: 5, totalRows: 20, visibleColumns: 4, pageIndex: 0, pageCount: 4, isFiltered: true, paginationEnabled: true },
          formatNumber
        );

        expect(context).toStrictEqual({
          visibleRowsValue: 5,
          visibleRowsText: '#5',
          totalRowsValue: 20,
          totalRowsText: '#20',
          visibleColumnsValue: 4,
          visibleColumnsText: '#4',
          pageIndex: 0,
          pageValue: 1,
          pageText: '#1',
          pageCountValue: 4,
          pageCountText: '#4',
          filterState: 'filtered',
          paginationState: 'enabled'
        });
      });
    });
  });

  describe('GIVEN: buildColumnReorderContext', () => {
    describe('WHEN: a column moves within the left zone', () => {
      it('THEN: it reports the zone with formatted position and total text', () => {
        const context = buildColumnReorderContext(
          { columnId: 'name', label: 'Name', zone: 'left', positionValue: 1, totalValue: 3 },
          formatNumber
        );

        expect(context).toStrictEqual({
          columnId: 'name',
          label: 'Name',
          zone: 'left',
          positionValue: 1,
          positionText: '#1',
          totalValue: 3,
          totalText: '#3'
        });
      });
    });

    describe('WHEN: a column moves within the right zone', () => {
      it('THEN: it reports the right zone', () => {
        const context = buildColumnReorderContext(
          { columnId: 'actions', label: 'Actions', zone: 'right', positionValue: 2, totalValue: 2 },
          formatNumber
        );

        expect(context.zone).toBe('right');
      });
    });
  });

  describe('GIVEN: buildColumnResizeContext', () => {
    describe('WHEN: the width sits between the minimum and maximum bounds', () => {
      it('THEN: it reports neither bound as reached', () => {
        const context = buildColumnResizeContext(
          { columnId: 'name', label: 'Name', widthValue: 150, min: 80, max: 400 },
          formatNumber
        );

        expect(context.atMinimum).toBe(false);
        expect(context.atMaximum).toBe(false);
      });
    });

    describe('WHEN: the width equals the minimum bound', () => {
      it('THEN: it reports the minimum bound as reached', () => {
        const context = buildColumnResizeContext({ columnId: 'name', label: 'Name', widthValue: 80, min: 80, max: 400 }, formatNumber);

        expect(context.atMinimum).toBe(true);
      });
    });

    describe('WHEN: the width falls below the minimum bound', () => {
      it('THEN: it still reports the minimum bound as reached', () => {
        const context = buildColumnResizeContext({ columnId: 'name', label: 'Name', widthValue: 60, min: 80, max: 400 }, formatNumber);

        expect(context.atMinimum).toBe(true);
      });
    });

    describe('WHEN: the width equals the maximum bound', () => {
      it('THEN: it reports the maximum bound as reached', () => {
        const context = buildColumnResizeContext(
          { columnId: 'name', label: 'Name', widthValue: 400, min: 80, max: 400 },
          formatNumber
        );

        expect(context.atMaximum).toBe(true);
      });
    });

    describe('WHEN: the width exceeds the maximum bound', () => {
      it('THEN: it still reports the maximum bound as reached', () => {
        const context = buildColumnResizeContext(
          { columnId: 'name', label: 'Name', widthValue: 500, min: 80, max: 400 },
          formatNumber
        );

        expect(context.atMaximum).toBe(true);
      });
    });

    describe('WHEN: the column has no maximum width', () => {
      it('THEN: it never reports the maximum bound as reached', () => {
        const context = buildColumnResizeContext(
          { columnId: 'name', label: 'Name', widthValue: 5000, min: 80, max: null },
          formatNumber
        );

        expect(context.atMaximum).toBe(false);
      });
    });
  });
});
