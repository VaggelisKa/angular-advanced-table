import type { NatTableControlsIntl } from './controls.type';
import { pinSideText, rows, side, sortOrder } from './locale-fi-text.const';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';

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
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
        const state = visibilityState === 'visible' ? 'näkyvissä' : 'piilotettu';
        const action = toggleAction === 'hide' ? 'Piilota' : 'Näytä';

        return `${columnLabel} ${state}. ${action} sarake`;
      },
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Näkyvissä' : 'Piilotettu')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rivejä sivulla',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} sivua kohden`
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
    groupAriaLabel: 'Taulukon vaakavieritys',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Vieritä taulukkoa vasemmalle',
      scrollRightAriaLabel: 'Vieritä taulukkoa oikealle',
      scrollPositionAriaLabel: 'Vaakavierityksen sijainti',
      scrollPositionText: ({ percentageText }) => `Vieritetty ${percentageText} %`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Lajittele sarakkeen ${label} mukaan`;
        }

        const sortDescription = `${label} on lajiteltu ${sortOrder(sortState)} järjestykseen`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, lajittelujärjestys ${sortPriority} / ${sortCount}. Muuta lajittelua`
          : `${sortDescription}. Muuta lajittelua`;
      },
      menuButton: ({ label }) => `Avaa sarakkeen ${label} toiminnot`,
      menuLabel: ({ label }) => `Sarakkeen ${label} toiminnot`,
      pinButton: ({ label, toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}: sarake ${label}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ label, direction }) => `Siirrä saraketta ${label} ${side(direction)}`,
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
