import type { NatTableControlsIntl, NatTableControlsLocalesMap } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { NAT_EN_LOCALE_ID } from './locale-id.const';

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
      toggleColumnAriaLabel: ({ columnLabel, visibilityState }) =>
        `${columnLabel}, ${visibilityState === 'visible' ? 'shown' : 'hidden'}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rows per page',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rows`,
      pageSizeOptionAriaLabel: ({ pageSizeText }) => `${pageSizeText} rows`
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
    groupAriaLabel: 'Horizontal scroll',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Scroll left',
      scrollRightAriaLabel: 'Scroll right',
      scrollPositionAriaLabel: 'Scroll position',
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

        // The sort state stays in the name even though the header carries
        // aria-sort: VoiceOver on macOS and TalkBack ignore aria-sort, so
        // dropping it here would leave those users without the current sort.
        const sortDescription = `Sort by ${label}, sorted ${sortState}`;

        return sortPriority !== null && sortCount > 1 ? `${sortDescription}, sort ${sortPriority} of ${sortCount}` : sortDescription;
      },
      menuButton: ({ label }) => `${label} column actions`,
      menuLabel: ({ label }) => `${label} column actions`,
      // The menu is already named for its column, so the item labels drop it.
      // They match their visible text exactly, which keeps SC 2.5.3 satisfied.
      pinButton: ({ toggleAction, pinSide }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}`,
      pinButtonText: ({ pinSide, toggleAction }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}`,
      moveButton: ({ direction }) => `Move ${direction}`,
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
 * English only. The translated dictionaries ship as individual exports that
 * `provideNatTableControlsLocales()` registers on request, so an app bundles just the
 * languages it uses.
 */
export const NAT_TABLE_BUILT_IN_CONTROLS_LOCALES: NatTableControlsLocalesMap = {
  [NAT_EN_LOCALE_ID]: NAT_EN_CONTROLS_LOCALE_LABELS
};
