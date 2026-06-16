import type { NatTableUiLocaleLabels, NatTableUiNumberFormatter } from './ui-types';

/** Locale id for the built-in English UI locale. */
export const NAT_EN_LOCALE_ID = 'en';

export const NAT_TABLE_UI_ENGLISH_LOCALE = NAT_EN_LOCALE_ID;

const DEFAULT_NUMBER_FORMATTER: NatTableUiNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

/** Built-in English labels shipped with `ng-advanced-table-locales`. */
export const NAT_EN_UI_LOCALE_LABELS: NatTableUiLocaleLabels = {
  search: {
    label: 'Search rows',
    placeholder: 'Search rows',
  },
  columnVisibility: {
    label: 'Columns',
    groupAriaLabel: 'Column visibility',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} visible`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction }) =>
        `${toggleAction === 'hide' ? 'Hide' : 'Show'} ${columnLabel} column`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden'),
    },
  },
  pageSize: {
    groupAriaLabel: 'Rows per page',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} / page`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `Show ${pageSizeText} rows per page`,
    },
  },
  pager: {
    groupAriaLabel: 'Table pagination',
    accessibilityLabels: {
      previousPageAriaLabel: 'Previous page',
      nextPageAriaLabel: 'Next page',
      pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} / ${pageCountText}`,
    },
  },
  scrollControl: {
    groupAriaLabel: 'Table horizontal scroll',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Scroll table left',
      scrollRightAriaLabel: 'Scroll table right',
      scrollPositionAriaLabel: 'Horizontal scroll position',
      scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`,
    },
  },
  headerActions: {
    accessibilityLabels: {
      // The visible priority badge is aria-hidden, so fold the ordinal into the
      // accessible name; otherwise AT cannot tell primary from secondary sort.
      sortButton: ({ label, sortState, sortPriority, sortCount }) =>
        sortPriority !== null && sortCount > 1
          ? `Change sorting for ${label}, sorted ${sortState}, ${sortPriority} of ${sortCount}`
          : `Change sorting for ${label}`,
      menuButton: ({ label }) => `Open column actions for ${label}`,
      menuLabel: ({ label }) => `Column pinning options for ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) =>
        `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${label} column ${
          toggleAction === 'unpin' ? 'from' : 'to'
        } the ${pinSide}`,
      pinButtonText: ({ pinSide }) => (pinSide === 'left' ? 'Pin left' : 'Pin right'),
    },
  },
  toolbar: {
    toolbarLabel: 'Table toolbar',
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER,
};

export const NAT_TABLE_UI_ENGLISH_INTL = NAT_EN_UI_LOCALE_LABELS;
