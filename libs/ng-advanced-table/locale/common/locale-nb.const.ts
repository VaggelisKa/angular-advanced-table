import type { NatTableIntl } from './accessibility.type';
import type { NatTableControlsIntl } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption, RowRenderTone } from './render-metrics.type';

/* Norwegian Bokmål (`nb`) copy for all three locale domains. */

const rows = (count: number): string => (count === 1 ? 'rad' : 'rader');

const items = (count: number): string => (count === 1 ? 'element' : 'elementer');

const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');

const visibleFields = (count: number): string => (count === 1 ? 'synlig felt' : 'synlige felter');

const filteredRows = (count: number): string => (count === 1 ? 'filtrert rad' : 'filtrerte rader');

const selectedRows = (count: number): string => (count === 1 ? 'rad er valgt' : 'rader er valgt');

const measuredRows = (count: number): string => (count === 1 ? 'rad målt' : 'rader målt');

const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig rad målt' : 'synlige rader målt');

const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigende' : 'synkende');

const side = (target: 'left' | 'right'): string => (target === 'left' ? 'til venstre' : 'til høyre');

const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'høyre'}`;

const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'vises' : 'skjules');

const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'blant kolonner som er festet til venstre';
  }

  if (zone === 'right') {
    return 'blant kolonner som er festet til høyre';
  }

  return 'blant kolonner som ikke er festet';
};

const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (minimum)';
  }

  if (atMaximum) {
    return ' (maksimum)';
  }

  return '';
};

const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Rask';
    case 'watch':
      return 'Følg med';
    case 'slow':
      return 'Treg';
    case 'idle':
      return 'Inaktiv';
  }
};

const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alle rader', description: 'Vis alle målte rader' },
  { value: 'fast', label: 'Rask', description: 'Rader som ble gjengitt raskt' },
  { value: 'watch', label: 'Følg med', description: 'Rader som er verdt å følge med på' },
  { value: 'slow', label: 'Treg', description: 'Rader som ble gjengitt tregt' }
];

/** Built-in Norwegian Bokmål table labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    keyboardInstructions:
      'Bruk piltastene for å flytte mellom celler. En celle som bare inneholder én knapp eller én lenke, får fokus ' +
      'direkte. I celler med flere kontroller trykker du Enter for å bruke dem, Tab for å flytte fremover mellom ' +
      'dem, Skift+Tab for å flytte bakover og Esc for å gå tilbake til cellen.',
    listKeyboardInstructions:
      'Bruk Pil opp og Pil ned for å flytte mellom elementer. Trykk Enter for å bruke kontrollene i et element, ' +
      'Tab for å flytte fremover mellom dem, Skift+Tab for å flytte bakover og Esc for å gå tilbake til elementet.',
    emptyState: 'Ingen rader samsvarer med gjeldende visning.',
    loadingState: 'Laster rader.',
    errorState: 'Radene kunne ikke lastes.',
    reorderKeyboardInstructions:
      'Trykk Ctrl+Skift+Venstrepil eller Ctrl+Skift+Høyrepil for å endre rekkefølgen på kolonner innenfor området ' +
      'de er festet i. På macOS trykker du Kommando+Skift+Venstrepil eller Kommando+Skift+Høyrepil.',
    resizeKeyboardInstructions:
      'På en kolonneoverskrift som kan endre størrelse, trykker du Alt sammen med Venstrepil eller Høyrepil for å ' +
      'endre kolonnens bredde, og Alt sammen med Home eller End for å hoppe til minste eller største bredde.',
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
        summary = `Ingen rader vises nå. ${columns}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} av ${totalRowsText} ${rows(totalRowsValue)} fordelt på ${columns}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${rows(visibleRowsValue)} fordelt på ${columns}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Side ${pageText} av ${pageCountText}.`;
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
        summary = `Ingen elementer vises nå. ${fields}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} av ${totalRowsText} ${items(totalRowsValue)} fordelt på ${fields}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)} fordelt på ${fields}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Side ${pageText} av ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel || sortState === 'none') return 'Sorteringen er fjernet.';

      if (sortedColumns.length > 1) {
        const parts = sortedColumns.map((column) => `${column.label} ${sortDirection(column.sortState)}`);

        return `Sortert etter ${parts.slice(0, -1).join(', ')} og deretter ${parts.at(-1)}.`;
      }

      return `Sortert etter ${columnLabel} ${sortDirection(sortState)}.`;
    },
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `Ingen rader samsvarer med "${query}".` : 'Ingen rader samsvarer med gjeldende filtre.';
      }

      if (query) {
        return `Viser ${visibleRowsText} samsvarende ${rows(visibleRowsValue)} for "${query}".`;
      }

      if (filterState === 'column') {
        return `Viser ${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Viser alle ${visibleRowsText} ${rows(visibleRowsValue)}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Kolonnen ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Feltet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Viser ${pageSizeText} ${rows(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
    listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Viser ${pageSizeText} ${items(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
    listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Kolonnen ${label} er flyttet til posisjon ${positionText} av ${totalText} ${columnZone(zone)}.`,
    columnResize: ({ label, widthText, atMinimum, atMaximum }) =>
      `Kolonnen ${label} har bredden ${widthText} piksler${resizeBoundSuffix(atMinimum, atMaximum)}.`,
    selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
      if (selectedCountValue === 0) {
        return 'Merkingen er fjernet.';
      }

      if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
        return `Alle ${totalRowsText} ${selectedRows(totalRowsValue)}.`;
      }

      return `${selectedCountText} ${selectedRows(selectedCountValue)}.`;
    },
    subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';

      return `${groupLabel}, ${rowCountText} ${rows(rowCountValue)}.`;
    },
    listSubHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';

      return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
    },
    placeholderRow: () => 'Laster.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

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

/** Built-in Norwegian Bokmål render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Gjengivelseshastighet',
      groupAriaLabel: 'Radenes gjengivelseshastighet',
      idleCaption: 'Viser den siste opptegningstiden for rader på gjeldende side.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Måling av radgjengivelse',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Gjengivelse',
      pendingLabel: 'Venter',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
