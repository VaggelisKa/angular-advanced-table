import { pinSideText, rows, side, sortDirection } from './text.const';
import type { NatTableControlsIntl } from '../../controls.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

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
      toggleColumnAriaLabel: ({ columnLabel, visibilityState }) =>
        `${columnLabel}, ${visibilityState === 'visible' ? 'vist' : 'skjult'}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rader per side',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`
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
    groupAriaLabel: 'Vannrett rulling',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rull til venstre',
      scrollRightAriaLabel: 'Rull til høyre',
      scrollPositionAriaLabel: 'Rulleposisjon',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullet`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sorter etter ${label}`;
        }

        const sortDescription = `Sorter etter ${label}, sortert ${sortDirection(sortState)}`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sortering ${sortPriority} av ${sortCount}`
          : sortDescription;
      },
      menuButton: ({ label }) => `Kolonnehandlinger for ${label}`,
      menuLabel: ({ label }) => `Kolonnehandlinger for ${label}`,
      pinButton: ({ toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ direction }) => `Flytt ${side(direction)}`,
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
