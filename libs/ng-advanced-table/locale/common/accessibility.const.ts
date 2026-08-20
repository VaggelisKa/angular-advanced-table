import { NAT_EN_LIST_ACCESSIBILITY_TEXT } from './accessibility-list.const';
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
    ...NAT_EN_LIST_ACCESSIBILITY_TEXT,
    keyboardInstructions:
      'Use arrow keys to move between cells. A cell whose only content is a single button or link ' +
      'focuses it directly. In cells with several controls, press Enter to interact with them, ' +
      'Tab to move forward between them, Shift+Tab to move backward, and Escape to return to the cell.',
    emptyState: 'No rows match the current view.',
    loadingState: 'Loading rows.',
    errorState: 'Rows could not be loaded.',
    reorderKeyboardInstructions:
      'Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.',
    resizeKeyboardInstructions:
      'On a resizable column header, press Alt with Left or Right Arrow to resize the column, ' +
      'and Alt with Home or End to jump to its minimum or maximum width.',
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
        summary = `No rows are currently shown. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize(
          'row',
          totalRowsValue
        )} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      } else {
        summary = `Showing ${visibleRowsText} ${pluralize(
          'row',
          visibleRowsValue
        )} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Page ${pageText} of ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel) return 'Sorting cleared.';

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
        return `Showing ${visibleRowsText} matching ${pluralize('row', visibleRowsValue)} for "${query}".`;
      }

      if (filterState === 'column') {
        return `Showing ${visibleRowsText} filtered ${pluralize('row', visibleRowsValue)}.`;
      }

      return `Showing all ${visibleRowsText} ${pluralize('row', visibleRowsValue)}.`;
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
      `Showing ${pageSizeText} ${pluralize('row', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('row', visibleRowsValue)} shown.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Moved ${label} column to position ${positionText} of ${totalText} in the ${describeColumnZone(zone)} region.`,
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
 * Importing `provideNatTableLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_LOCALES: NatTableLocalesMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_LOCALE_LABELS
};
