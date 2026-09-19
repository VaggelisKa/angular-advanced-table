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
      toggleColumnAriaLabel: ({ columnLabel, visibilityState }) =>
        `${columnLabel}, ${visibilityState === 'visible' ? 'synlig' : 'dold'}`,
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Dold')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rader per sida',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`
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
    groupAriaLabel: 'Vågrät rullning',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Rulla åt vänster',
      scrollRightAriaLabel: 'Rulla åt höger',
      scrollPositionAriaLabel: 'Rullningsläge',
      scrollPositionText: ({ percentageText }) => `${percentageText} % rullat`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Sortera efter ${label}`;
        }

        const sortDescription = `Sortera efter ${label}, ${sortDirection(sortState)} sortering`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, sortering ${sortPriority} av ${sortCount}`
          : sortDescription;
      },
      menuButton: ({ label }) => `Kolumnåtgärder för ${label}`,
      menuLabel: ({ label }) => `Kolumnåtgärder för ${label}`,
      pinButton: ({ toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ direction }) => `Flytta ${side(direction)}`,
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
