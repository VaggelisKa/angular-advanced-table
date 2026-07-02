import type { NatTableAccessibilityPaginationAnnouncementContext, NatTableAccessibilityText } from 'ng-advanced-table/locale';

import type { FormatAccessibilityNumber, TableAccessibilitySnapshot } from '../common/table-a11y.type';

/** Pagination context object shared by the page-size and page-index announcements. */
export const getPaginationAnnouncementContext = (
  snapshot: TableAccessibilitySnapshot,
  formatNumber: FormatAccessibilityNumber
): NatTableAccessibilityPaginationAnnouncementContext => {
  const page = snapshot.pagination.pageIndex + 1;
  const pageCount = snapshot.pageCount;
  const pageSize = snapshot.pagination.pageSize;

  return {
    pageIndex: snapshot.pagination.pageIndex,
    pageValue: page,
    pageText: formatNumber(page),
    pageCountValue: pageCount,
    pageCountText: formatNumber(pageCount),
    pageSizeValue: pageSize,
    pageSizeText: formatNumber(pageSize),
    visibleRowsValue: snapshot.visibleRows,
    visibleRowsText: formatNumber(snapshot.visibleRows)
  };
};

/** Announcement text for a page-size change captured in the snapshot. */
export const describePageSizeChange = (
  snapshot: TableAccessibilitySnapshot,
  text: NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string => {
  const formatter = text.pageSizeChange;
  const context = getPaginationAnnouncementContext(snapshot, formatNumber);

  if (formatter) {
    return formatter(context);
  }

  return '';
};

/** Announcement text for a page-index change captured in the snapshot. */
export const describePageChange = (
  snapshot: TableAccessibilitySnapshot,
  text: NatTableAccessibilityText,
  formatNumber: FormatAccessibilityNumber
): string => {
  const formatter = text.pageChange;
  const context = getPaginationAnnouncementContext(snapshot, formatNumber);

  if (formatter) {
    return formatter(context);
  }

  return '';
};
