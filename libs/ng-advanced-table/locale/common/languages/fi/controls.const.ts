import { pinSideText, rows, side, sortAdverb } from './text.const';
import type { NatTableControlsIntl } from '../../controls.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

/** Built-in Finnish companion-control labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
  search: {
    label: 'Hae riveistä',
    placeholder: 'Hae riveistä'
  },
  columnVisibility: {
    label: 'Sarakkeet',
    groupAriaLabel: 'Sarakkeiden näkyvyys',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} näkyvissä`,
      toggleColumnAriaLabel: ({ columnLabel, visibilityState }) =>
        `${columnLabel}, ${visibilityState === 'visible' ? 'näkyvissä' : 'piilotettu'}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Näkyvissä' : 'Piilotettu')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rivejä sivulla',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`
    }
  },
  pager: {
    groupAriaLabel: 'Taulukon sivutus',
    accessibilityLabels: {
      previousPageAriaLabel: 'Edellinen sivu',
      nextPageAriaLabel: 'Seuraava sivu',
      pageIndicator: ({ pageText, pageCountText }) => `Sivu ${pageText} / ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Vaakavieritys',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Vieritä vasemmalle',
      scrollRightAriaLabel: 'Vieritä oikealle',
      scrollPositionAriaLabel: 'Vierityksen sijainti',
      scrollPositionText: ({ percentageText }) => `Vieritetty ${percentageText} %`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Lajittele sarakkeen ${label} mukaan`;
        }

        const sortDescription = `Lajittele sarakkeen ${label} mukaan, lajiteltu ${sortAdverb(sortState)}`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, lajittelu ${sortPriority} / ${sortCount}`
          : sortDescription;
      },
      menuButton: ({ label }) => `Sarakkeen ${label} toiminnot`,
      menuLabel: ({ label }) => `Sarakkeen ${label} toiminnot`,
      pinButton: ({ toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ direction }) => `Siirrä ${side(direction)}`,
      moveButtonText: ({ direction }) => `Siirrä ${side(direction)}`
    }
  },
  toolbar: {
    toolbarLabel: 'Taulukon työkalurivi'
  },
  selection: {
    columnLabel: 'Valinta',
    accessibilityLabels: {
      selectAllAriaLabel: 'Valitse kaikki rivit',
      selectRowAriaLabel: ({ rowId }) => `Valitse rivi ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
