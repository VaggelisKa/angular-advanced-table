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
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
        const state = visibilityState === 'visible' ? 'er synlig' : 'er skjult';
        const action = toggleAction === 'hide' ? 'Skjul' : 'Vis';

        return `${columnLabel} ${state}. ${action} kolonnen`;
      },
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rækker pr. side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} pr. side`
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
    groupAriaLabel: 'Vandret rulning i tabel',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rul tabellen til venstre',
      scrollRightAriaLabel: 'Rul tabellen til højre',
      scrollPositionAriaLabel: 'Vandret rulleposition',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sortér efter ${label}`;
        }

        const sortDescription = `${label} er sorteret i ${sortDirection(sortState)} rækkefølge`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sorteringsprioritet ${sortPriority} af ${sortCount}. Skift sortering`
          : `${sortDescription}. Skift sortering`;
      },
      menuButton: ({ label }) => `Åbn kolonnehandlinger for kolonnen ${label}`,
      menuLabel: ({ label }) => `Kolonnehandlinger for kolonnen ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';

        return `${action} kolonnen ${label} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ label, direction }) => `Flyt kolonnen ${label} ${side(direction)}`,
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
