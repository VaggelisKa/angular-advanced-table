import {
  listColumnVisibilityChange,
  listKeyboardInstructions,
  listPageChange,
  listPageSizeChange,
  listSubHeaderRow,
  listSummary
} from './accessibility-list.const';
import type { NatTableIntl, NatTableLocalesMap } from './accessibility.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { NAT_EN_LOCALE_ID } from './locale-id.const';
import { pluralize } from './pluralize.const';

const describeColumnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'left pinned';
  }

  if (zone === 'right') {
    return 'right pinned';
  }

  return 'unpinned';
};

const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (minimum)';
  }

  if (atMaximum) {
    return ' (maximum)';
  }

  return '';
};

/** Built-in English labels shipped with the table locale package. */
export const NAT_EN_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    listSubHeaderRow,
    listKeyboardInstructions,
    listSummary,
    listColumnVisibilityChange,
    listPageSizeChange,
    listPageChange,
    keyboardInstructions:
      'Use arrow keys to move between cells. Press Enter to use the controls in a cell, ' +
      'Tab and Shift+Tab to move between them, and Escape to return to the cell.',
    emptyState: 'No rows match the current view.',
    loadingState: 'Loading rows.',
    errorState: 'Rows could not be loaded.',
    reorderKeyboardInstructions:
      'Press Control+Shift with Left or Right Arrow to reorder a column within its pinned region. Use Command on macOS.',
    resizeKeyboardInstructions:
      'Press Alt with Left or Right Arrow to resize a column, or Alt with Home or End for its minimum or maximum width.',
    tableSummary: ({
      pageCountText,
      pageText,
      paginationState,
      totalRowsValue,
      totalRowsText,
      visibleColumnsValue,
      visibleColumnsText,
      visibleRowsValue,
      visibleRowsText
    }) => {
      let summary: string;

      // The subset phrasing fires whenever the shown rows are fewer than the
      // represented total — filtered views, paginated pages, and remote
      // windows alike — so the summary can never contradict aria-rowcount.
      if (visibleRowsValue === 0) {
        summary = `No rows shown. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize(
          'row',
          totalRowsValue
        )}, ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      } else {
        summary = `Showing ${visibleRowsText} ${pluralize(
          'row',
          visibleRowsValue
        )}, ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Page ${pageText} of ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel || sortState === 'none') return 'Sorting cleared.';

      if (sortedColumns.length > 1) {
        const parts = sortedColumns.map((column) => `${column.label} ${column.sortState}`);

        return `Sorted by ${parts.slice(0, -1).join(', ')}, then ${parts.at(-1)}.`;
      }

      return `Sorted by ${columnLabel} ${sortState}.`;
    },
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `No rows match "${query}".` : 'No rows match the current filters.';
      }

      if (query) {
        return `${visibleRowsText} ${pluralize('row', visibleRowsValue)} match "${query}".`;
      }

      if (filterState === 'column') {
        return `${visibleRowsText} filtered ${pluralize('row', visibleRowsValue)}.`;
      }

      return `All ${visibleRowsText} ${pluralize('row', visibleRowsValue)}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `${column.label} column ${
          column.visibilityState === 'visible' ? 'shown' : 'hidden'
        }. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      }

      return `${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `${pageSizeText} ${pluralize('row', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('row', visibleRowsValue)} shown.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `${label} column moved to position ${positionText} of ${totalText}, ${describeColumnZone(zone)}.`,
    columnResize: ({ label, widthText, atMinimum, atMaximum }) =>
      `${label} column width ${widthText} pixels${resizeBoundSuffix(atMinimum, atMaximum)}.`,
    selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
      if (selectedCountValue === 0) {
        return 'Selection cleared.';
      }

      if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
        return `All ${totalRowsText} ${pluralize('row', totalRowsValue)} selected.`;
      }

      return `${selectedCountText} ${pluralize('row', selectedCountValue)} selected.`;
    },
    subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `${valueText} group` : 'Group';

      return `${groupLabel}, ${rowCountText} ${pluralize('row', rowCountValue)}.`;
    },
    // Deliberately position-free: the grid already announces the row's
    // position through aria-rowindex/aria-rowcount, and those are counted in
    // grid coordinates (header row included) — restating the position here
    // would read out a second, off-by-one number for the same row. The context
    // still carries position and total for consumers who override this.
    placeholderRow: () => 'Loading.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

/**
 * Table locale registry shipped by `ng-advanced-table/locale`.
 *
 * English only. The translated dictionaries ship as individual exports that
 * `provideNatTableLocales()` registers on request, so an app bundles just the
 * languages it uses.
 */
export const NAT_TABLE_BUILT_IN_LOCALES: NatTableLocalesMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_LOCALE_LABELS
};
