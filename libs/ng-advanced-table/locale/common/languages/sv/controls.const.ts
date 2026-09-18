import { pinSideText, rows, side, sortDirection } from './text.const';
import type { NatTableControlsIntl } from '../../controls.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

/** Built-in Swedish companion-control labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
  search: {
    label: 'Sök rader',
    placeholder: 'Sök rader'
  },
  columnVisibility: {
    label: 'Kolumner',
    groupAriaLabel: 'Kolumnsynlighet',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} synliga`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
        const state = visibilityState === 'visible' ? 'är synlig' : 'är dold';
        const action = toggleAction === 'hide' ? 'Dölj' : 'Visa';

        return `${columnLabel} ${state}. ${action} kolumnen`;
      },
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Dold')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rader per sida',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} per sida`
    }
  },
  pager: {
    groupAriaLabel: 'Sidnavigering i tabell',
    accessibilityLabels: {
      previousPageAriaLabel: 'Föregående sida',
      nextPageAriaLabel: 'Nästa sida',
      pageIndicator: ({ pageText, pageCountText }) => `Sida ${pageText} av ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Vågrät rullning i tabell',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rulla tabellen åt vänster',
      scrollRightAriaLabel: 'Rulla tabellen åt höger',
      scrollPositionAriaLabel: 'Vågrätt rullningsläge',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullat`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sortera efter ${label}`;
        }

        const sortDescription = `${label} är sorterad i ${sortDirection(sortState)} ordning`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sorteringsprioritet ${sortPriority} av ${sortCount}. Ändra sortering`
          : `${sortDescription}. Ändra sortering`;
      },
      menuButton: ({ label }) => `Öppna kolumnåtgärder för kolumnen ${label}`,
      menuLabel: ({ label }) => `Kolumnåtgärder för kolumnen ${label}`,
      pinButton: ({ label, toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';

        return `${action} kolumnen ${label} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ label, direction }) => `Flytta kolumnen ${label} ${side(direction)}`,
      moveButtonText: ({ direction }) => `Flytta ${side(direction)}`
    }
  },
  toolbar: {
    toolbarLabel: 'Verktygsfält för tabell'
  },
  selection: {
    columnLabel: 'Markering',
    accessibilityLabels: {
      selectAllAriaLabel: 'Markera alla rader',
      selectRowAriaLabel: ({ rowId }) => `Markera rad ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
