import type { NatTableUiLocaleLabels, NatTableUiNumberFormatter } from './ui-types';

/** Locale id for the built-in English UI locale. */
export const NAT_EN_LOCALE_ID = 'en';

export const NAT_TABLE_UI_ENGLISH_LOCALE = NAT_EN_LOCALE_ID;

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

const describeSortState = (sortState: 'ascending' | 'descending'): string =>
  sortState === 'ascending' ? 'in ascending order' : 'in descending order';

/** Built-in English labels shipped with `ng-advanced-table-locales`. */
export const NAT_EN_UI_LOCALE_LABELS: NatTableUiLocaleLabels = {
  search: {
    label: 'Search rows',
    placeholder: 'Search rows'
  },
  columnVisibility: {
    label: 'Columns',
    groupAriaLabel: 'Column visibility',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} visible`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) =>
        `${columnLabel} ${visibilityState === 'visible' ? 'shown' : 'hidden'}. ${toggleAction === 'hide' ? 'Hide' : 'Show'} column`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rows per page',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rows`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `${pageSizeText} rows per page`
    }
  },
  pager: {
    groupAriaLabel: 'Table pagination',
    accessibilityLabels: {
      previousPageAriaLabel: 'Previous page',
      nextPageAriaLabel: 'Next page',
      pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Table horizontal scroll',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Scroll table left',
      scrollRightAriaLabel: 'Scroll table right',
      scrollPositionAriaLabel: 'Horizontal scroll position',
      scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`
    }
  },
  headerActions: {
    accessibilityLabels: {
      // The visible priority badge is aria-hidden, so fold the ordinal into the
      // accessible name; otherwise AT cannot tell primary from secondary sort.
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sort by ${label}`;
        }

        const sortDescription = `${label} sorted ${describeSortState(sortState)}`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sort priority ${sortPriority} of ${sortCount}. Change sorting`
          : `${sortDescription}. Change sorting`;
      },
      menuButton: ({ label }) => `Open column actions for ${label} column`,
      menuLabel: ({ label }) => `Column actions for ${label} column`,
      pinButton: ({ label, toggleAction, pinSide }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}: ${label} column`,
      pinButtonText: ({ pinSide, toggleAction }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}`,
      moveButton: ({ label, direction }) => `Move ${label} column ${direction}`,
      moveButtonText: ({ direction }) => `Move ${direction}`
    }
  },
  toolbar: {
    toolbarLabel: 'Table toolbar'
  },
  selection: {
    columnLabel: 'Selection',
    accessibilityLabels: {
      selectAllAriaLabel: 'Select all rows',
      selectRowAriaLabel: ({ rowId }) => `Select row ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

export const NAT_TABLE_UI_ENGLISH_INTL = NAT_EN_UI_LOCALE_LABELS;
