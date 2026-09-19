import { pinSideText, rows, side, sortDirection } from './text.const';
import type { NatTableControlsIntl } from '../../controls.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

/** Built-in Danish companion-control labels shipped with `ng-advanced-table/locale`. */
export const NAT_DA_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
  search: {
    label: 'Søg i rækker',
    placeholder: 'Søg i rækker'
  },
  columnVisibility: {
    label: 'Kolonner',
    groupAriaLabel: 'Kolonnesynlighed',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
      toggleColumnAriaLabel: ({ columnLabel, visibilityState }) =>
        `${columnLabel}, ${visibilityState === 'visible' ? 'vist' : 'skjult'}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rækker pr. side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`
    }
  },
  pager: {
    groupAriaLabel: 'Sidenavigation i tabel',
    accessibilityLabels: {
      previousPageAriaLabel: 'Forrige side',
      nextPageAriaLabel: 'Næste side',
      pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} af ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Vandret rulning',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rul til venstre',
      scrollRightAriaLabel: 'Rul til højre',
      scrollPositionAriaLabel: 'Rulleposition',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sortér efter ${label}`;
        }

        const sortDescription = `Sortér efter ${label}, sorteret ${sortDirection(sortState)}`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sortering ${sortPriority} af ${sortCount}`
          : sortDescription;
      },
      menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
      menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
      pinButton: ({ toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ direction }) => `Flyt ${side(direction)}`,
      moveButtonText: ({ direction }) => `Flyt ${side(direction)}`
    }
  },
  toolbar: {
    toolbarLabel: 'Værktøjslinje til tabel'
  },
  selection: {
    columnLabel: 'Markering',
    accessibilityLabels: {
      selectAllAriaLabel: 'Vælg alle rækker',
      selectRowAriaLabel: ({ rowId }) => `Vælg række ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
