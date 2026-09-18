import type { NatTableAccessibilitySummaryContext } from '../common/accessibility.type';

/* Empty, subset, and complete views at both singular and plural counts. */
export const SUMMARY_CONTEXTS: readonly NatTableAccessibilitySummaryContext[] = [
  {
    visibleRowsValue: 0,
    visibleRowsText: '0',
    totalRowsValue: 20,
    totalRowsText: '20',
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 2,
    pageCountText: '2',
    filterState: 'filtered',
    paginationState: 'enabled'
  },
  {
    visibleRowsValue: 10,
    visibleRowsText: '10',
    totalRowsValue: 20,
    totalRowsText: '20',
    visibleColumnsValue: 4,
    visibleColumnsText: '4',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 2,
    pageCountText: '2',
    filterState: 'unfiltered',
    paginationState: 'enabled'
  },
  {
    visibleRowsValue: 1,
    visibleRowsText: '1',
    totalRowsValue: 1,
    totalRowsText: '1',
    visibleColumnsValue: 1,
    visibleColumnsText: '1',
    pageIndex: 0,
    pageValue: 1,
    pageText: '1',
    pageCountValue: 1,
    pageCountText: '1',
    filterState: 'unfiltered',
    paginationState: 'disabled'
  }
];
