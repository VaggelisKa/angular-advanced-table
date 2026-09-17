import type { NatTableControlsIntl } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { pinSideText, rows, side, sortDirection } from './locale-nb-text.const';

/** Built-in Norwegian Bokmål companion-control labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
  search: {
    label: 'Søk i rader',
    placeholder: 'Søk i rader'
  },
  columnVisibility: {
    label: 'Kolonner',
    groupAriaLabel: 'Kolonnesynlighet',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
        const state = visibilityState === 'visible' ? 'vist' : 'skjult';
        const action = toggleAction === 'hide' ? 'Skjul' : 'Vis';

        return `${columnLabel} ${state}. ${action} kolonne`;
      },
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rader per side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} per side`
    }
  },
  pager: {
    groupAriaLabel: 'Sidenavigasjon i tabell',
    accessibilityLabels: {
      previousPageAriaLabel: 'Forrige side',
      nextPageAriaLabel: 'Neste side',
      pageIndicator: ({ pageText, pageCountText }) => `Side ${pageText} av ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Vannrett rulling i tabell',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rull tabellen til venstre',
      scrollRightAriaLabel: 'Rull tabellen til høyre',
      scrollPositionAriaLabel: 'Vannrett rulleposisjon',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sorter etter ${label}`;
        }

        const sortDescription = `${label} er sortert i ${sortDirection(sortState)} rekkefølge`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sorteringsprioritet ${sortPriority} av ${sortCount}. Endre sortering`
          : `${sortDescription}. Endre sortering`;
      },
      menuButton: ({ label }) => `Åpne kolonnehandlinger for kolonnen ${label}`,
      menuLabel: ({ label }) => `Kolonnehandlinger for kolonnen ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';

        return `${action} ${pinSideText(pinSide, toggleAction)}: kolonnen ${label}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ label, direction }) => `Flytt kolonnen ${label} ${side(direction)}`,
      moveButtonText: ({ direction }) => `Flytt ${side(direction)}`
    }
  },
  toolbar: {
    toolbarLabel: 'Verktøylinje for tabell'
  },
  selection: {
    columnLabel: 'Merking',
    accessibilityLabels: {
      selectAllAriaLabel: 'Velg alle rader',
      selectRowAriaLabel: ({ rowId }) => `Velg rad ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
