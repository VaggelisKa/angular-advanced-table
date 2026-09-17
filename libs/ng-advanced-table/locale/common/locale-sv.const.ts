import type { NatTableIntl } from './accessibility.type';
import type { NatTableControlsIntl } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption, RowRenderTone } from './render-metrics.type';

/* Swedish (`sv`) copy for all three locale domains. */

const rows = (count: number): string => (count === 1 ? 'rad' : 'rader');

const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolumn' : 'synliga kolumner');

const visibleFields = (count: number): string => (count === 1 ? 'synligt fält' : 'synliga fält');

const filteredRows = (count: number): string => (count === 1 ? 'filtrerad rad' : 'filtrerade rader');

const selectedRows = (count: number): string => (count === 1 ? 'rad är markerad' : 'rader är markerade');

const measuredRows = (count: number): string => (count === 1 ? 'rad mätt' : 'rader mätta');

const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig rad mätt' : 'synliga rader mätta');

const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigande' : 'fallande');

const side = (target: 'left' | 'right'): string => (target === 'left' ? 'till vänster' : 'till höger');

const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'från' : 'till'} ${pinSide === 'left' ? 'vänster' : 'höger'}`;

const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'visas' : 'döljs');

const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'bland kolumner som är fästa till vänster';
  }

  if (zone === 'right') {
    return 'bland kolumner som är fästa till höger';
  }

  return 'bland kolumner som inte är fästa';
};

const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (minimum)';
  }

  if (atMaximum) {
    return ' (maximum)';
  }

  return '';
};

const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Snabb';
    case 'watch':
      return 'Bevaka';
    case 'slow':
      return 'Långsam';
    case 'idle':
      return 'Inaktiv';
  }
};

const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alla rader', description: 'Visa alla mätta rader' },
  { value: 'fast', label: 'Snabb', description: 'Rader som renderades snabbt' },
  { value: 'watch', label: 'Bevaka', description: 'Rader som är värda att bevaka' },
  { value: 'slow', label: 'Långsam', description: 'Rader som renderades långsamt' }
];

/** Built-in Swedish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    keyboardInstructions:
      'Använd piltangenterna för att flytta mellan celler. En cell vars enda innehåll är en knapp eller en länk får ' +
      'fokus direkt. I celler med flera kontroller trycker du på Retur för att använda dem, Tabb för att flytta ' +
      'framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till cellen.',
    listKeyboardInstructions:
      'Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett ' +
      'objekt, Tabb för att flytta framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till ' +
      'objektet.',
    emptyState: 'Inga rader matchar den aktuella vyn.',
    loadingState: 'Läser in rader.',
    errorState: 'Raderna kunde inte läsas in.',
    reorderKeyboardInstructions:
      'Tryck på Ctrl+Skift+Vänsterpil eller Ctrl+Skift+Högerpil för att ordna om kolumner inom det område de är ' +
      'fästa i. På macOS trycker du på Kommando+Skift+Vänsterpil eller Kommando+Skift+Högerpil.',
    resizeKeyboardInstructions:
      'På en kolumnrubrik som går att ändra storlek på trycker du på Alt tillsammans med Vänsterpil eller Högerpil ' +
      'för att ändra kolumnens bredd, och Alt tillsammans med Home eller End för att hoppa till dess minsta eller ' +
      'största bredd.',
    tableSummary: ({
      pageCountText,
      pageText,
      paginationState,
      totalRowsValue,
      totalRowsText,
      visibleColumnsValue,
      visibleColumnsText,
      visibleRowsValue,
      visibleRowsText
    }) => {
      const columns = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}`;
      let summary: string;

      if (visibleRowsValue === 0) {
        summary = `Inga rader visas just nu. ${columns}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Visar ${visibleRowsText} av ${totalRowsText} ${rows(totalRowsValue)} i ${columns}.`;
      } else {
        summary = `Visar ${visibleRowsText} ${rows(visibleRowsValue)} i ${columns}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Sida ${pageText} av ${pageCountText}.`;
      }

      return summary;
    },
    listSummary: ({
      pageCountText,
      pageText,
      paginationState,
      totalRowsValue,
      totalRowsText,
      visibleColumnsValue,
      visibleColumnsText,
      visibleRowsValue,
      visibleRowsText
    }) => {
      const fields = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}`;
      let summary: string;

      if (visibleRowsValue === 0) {
        summary = `Inga objekt visas just nu. ${fields}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Visar ${visibleRowsText} av ${totalRowsText} objekt i ${fields}.`;
      } else {
        summary = `Visar ${visibleRowsText} objekt i ${fields}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Sida ${pageText} av ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel || sortState === 'none') return 'Sorteringen är rensad.';

      if (sortedColumns.length > 1) {
        const parts = sortedColumns.map((column) => `${column.label} ${sortDirection(column.sortState)}`);

        return `Sorterat efter ${parts.slice(0, -1).join(', ')} och därefter ${parts.at(-1)}.`;
      }

      return `Sorterat efter ${columnLabel} ${sortDirection(sortState)}.`;
    },
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `Inga rader matchar "${query}".` : 'Inga rader matchar de aktuella filtren.';
      }

      if (query) {
        return `Visar ${visibleRowsText} matchande ${rows(visibleRowsValue)} för "${query}".`;
      }

      if (filterState === 'column') {
        return `Visar ${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Visar alla ${visibleRowsText} ${rows(visibleRowsValue)}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Kolumnen ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Fältet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Visar ${pageSizeText} ${rows(pageSizeValue)} per sida. Sida ${pageText} av ${pageCountText}.`,
    listPageSizeChange: ({ pageCountText, pageSizeText, pageText }) =>
      `Visar ${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} visas.`,
    listPageChange: ({ pageCountText, pageText, visibleRowsText }) =>
      `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Kolumnen ${label} har flyttats till position ${positionText} av ${totalText} ${columnZone(zone)}.`,
    columnResize: ({ label, widthText, atMinimum, atMaximum }) =>
      `Kolumnen ${label} har bredden ${widthText} pixlar${resizeBoundSuffix(atMinimum, atMaximum)}.`,
    selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
      if (selectedCountValue === 0) {
        return 'Markeringen är rensad.';
      }

      if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
        return `Alla ${totalRowsText} ${selectedRows(totalRowsValue)}.`;
      }

      return `${selectedCountText} ${selectedRows(selectedCountValue)}.`;
    },
    subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';

      return `${groupLabel}, ${rowCountText} ${rows(rowCountValue)}.`;
    },
    listSubHeaderRow: ({ valueText, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';

      return `${groupLabel}, ${rowCountText} objekt.`;
    },
    placeholderRow: () => 'Läser in.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

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

        return `${columnLabel} ${state}. ${action} kolumn`;
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

        return `${action} ${pinSideText(pinSide, toggleAction)}: kolumnen ${label}`;
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

/** Built-in Swedish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderingshastighet',
      groupAriaLabel: 'Radernas renderingshastighet',
      idleCaption: 'Visar den senaste uppritningstiden för rader på den aktuella sidan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Mätning av radrendering',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Rendering',
      pendingLabel: 'Väntar',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
