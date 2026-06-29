import type { NatTableControlsIntl, NatTableControlsLocalesMap, NatTableControlsNumberFormatter } from './controls.type';
import { NAT_EN_LOCALE_ID } from './locale-id.const';

const DEFAULT_NUMBER_FORMATTER: NatTableControlsNumberFormatter = (value, options, locale) =>
  new Intl.NumberFormat(locale, options).format(value);

const describeSortState = (sortState: 'ascending' | 'descending'): string =>
  sortState === 'ascending' ? 'in ascending order' : 'in descending order';

/** Built-in English labels shipped with `ng-advanced-table/locale`. */
export const NAT_EN_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
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

/**
 * Companion components locale registry shipped by `ng-advanced-table/locale`.
 *
 * Importing `provideNatTableControlsLocales()` registers every locale in this object.
 */
export const NAT_TABLE_BUILT_IN_CONTROLS_LOCALES: NatTableControlsLocalesMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_CONTROLS_LOCALE_LABELS
};
