import type {
  NatTableAccessibilityColumnReorderAnnouncementContext,
  NatTableAccessibilityColumnResizeAnnouncementContext,
  NatTableAccessibilitySummaryContext
} from 'ng-advanced-table/locale';

import type { ColumnReorderZone } from '../common/column-render.type';
import type { FormatAccessibilityNumber } from '../common/table-a11y.type';

/** Live signal reads captured by the service before building the table summary. */
type TableSummarySnapshot = {
  readonly visibleRows: number;
  readonly totalRows: number;
  readonly visibleColumns: number;
  readonly pageIndex: number;
  readonly pageCount: number;
  readonly isFiltered: boolean;
  readonly paginationEnabled: boolean;
};

/** Captured inputs for a column-reorder announcement context. */
type ColumnReorderContextInput = {
  readonly columnId: string;
  readonly label: string;
  readonly zone: ColumnReorderZone;
  readonly positionValue: number;
  readonly totalValue: number;
};

/** Captured inputs for a column-resize announcement context. */
type ColumnResizeContextInput = {
  readonly columnId: string;
  readonly label: string;
  readonly widthValue: number;
  readonly min: number;
  readonly max: number | null;
};

/** Builds the `aria-describedby` summary context from captured summary state. */
export const getSummaryContext = (
  snapshot: TableSummarySnapshot,
  formatNumber: FormatAccessibilityNumber
): NatTableAccessibilitySummaryContext => {
  const page = snapshot.pageIndex + 1;

  return {
    visibleRowsValue: snapshot.visibleRows,
    visibleRowsText: formatNumber(snapshot.visibleRows),
    totalRowsValue: snapshot.totalRows,
    totalRowsText: formatNumber(snapshot.totalRows),
    visibleColumnsValue: snapshot.visibleColumns,
    visibleColumnsText: formatNumber(snapshot.visibleColumns),
    pageIndex: snapshot.pageIndex,
    pageValue: page,
    pageText: formatNumber(page),
    pageCountValue: snapshot.pageCount,
    pageCountText: formatNumber(snapshot.pageCount),
    filterState: snapshot.isFiltered ? 'filtered' : 'unfiltered',
    paginationState: snapshot.paginationEnabled ? 'enabled' : 'disabled'
  };
};

/** Builds the column-reorder announcement context from captured reorder state. */
export const buildColumnReorderContext = (
  input: ColumnReorderContextInput,
  formatNumber: FormatAccessibilityNumber
): NatTableAccessibilityColumnReorderAnnouncementContext => ({
  columnId: input.columnId,
  label: input.label,
  zone: input.zone,
  positionValue: input.positionValue,
  positionText: formatNumber(input.positionValue),
  totalValue: input.totalValue,
  totalText: formatNumber(input.totalValue)
});

/** Builds the column-resize announcement context from captured resize state. */
export const buildColumnResizeContext = (
  input: ColumnResizeContextInput,
  formatNumber: FormatAccessibilityNumber
): NatTableAccessibilityColumnResizeAnnouncementContext => ({
  columnId: input.columnId,
  label: input.label,
  widthValue: input.widthValue,
  widthText: formatNumber(input.widthValue),
  atMinimum: input.widthValue <= input.min,
  atMaximum: input.max !== null && input.widthValue >= input.max
});
