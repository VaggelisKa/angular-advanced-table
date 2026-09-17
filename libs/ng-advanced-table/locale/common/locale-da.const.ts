import type { NatTableIntl } from './accessibility.type';
import type { NatTableControlsIntl } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption, RowRenderTone } from './render-metrics.type';

/* Danish (`da`) copy for all three locale domains. */

const rows = (count: number): string => (count === 1 ? 'række' : 'rækker');

const items = (count: number): string => (count === 1 ? 'element' : 'elementer');

const visibleColumns = (count: number): string => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');

const visibleFields = (count: number): string => (count === 1 ? 'synligt felt' : 'synlige felter');

const filteredRows = (count: number): string => (count === 1 ? 'filtreret række' : 'filtrerede rækker');

const selectedRows = (count: number): string => (count === 1 ? 'række er valgt' : 'rækker er valgt');

const measuredRows = (count: number): string => (count === 1 ? 'række målt' : 'rækker målt');

const measuredVisibleRows = (count: number): string => (count === 1 ? 'synlig række målt' : 'synlige rækker målt');

const sortDirection = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'stigende' : 'faldende');

const side = (target: 'left' | 'right'): string => (target === 'left' ? 'til venstre' : 'til højre');

const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string =>
  `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'højre'}`;

const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string => (visibilityState === 'visible' ? 'vises' : 'skjules');

const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'blandt kolonner fastgjort til venstre';
  }

  if (zone === 'right') {
    return 'blandt kolonner fastgjort til højre';
  }

  return 'blandt ikke-fastgjorte kolonner';
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
      return 'Hurtig';
    case 'watch':
      return 'Hold øje';
    case 'slow':
      return 'Langsom';
    case 'idle':
      return 'Inaktiv';
  }
};

const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Alle rækker', description: 'Vis alle målte rækker' },
  { value: 'fast', label: 'Hurtig', description: 'Rækker, der blev gengivet hurtigt' },
  { value: 'watch', label: 'Hold øje', description: 'Rækker, der er værd at holde øje med' },
  { value: 'slow', label: 'Langsom', description: 'Rækker, der blev gengivet langsomt' }
];

/** Built-in Danish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_DA_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    keyboardInstructions:
      'Brug piletasterne til at flytte mellem celler. En celle, hvis eneste indhold er en enkelt knap eller et link, ' +
      'får fokus direkte. I celler med flere kontroller skal du trykke på Enter for at bruge dem, Tab for at flytte ' +
      'fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til cellen.',
    listKeyboardInstructions:
      'Brug Pil op og Pil ned til at flytte mellem elementer. Tryk på Enter for at bruge kontrollerne i et element, ' +
      'Tab for at flytte fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til elementet.',
    emptyState: 'Ingen rækker matcher den aktuelle visning.',
    loadingState: 'Indlæser rækker.',
    errorState: 'Rækkerne kunne ikke indlæses.',
    reorderKeyboardInstructions:
      'Tryk på Ctrl+Skift+Venstre pil eller Ctrl+Skift+Højre pil for at omarrangere kolonner inden for deres ' +
      'nuværende fastgjorte område. På macOS skal du trykke på Kommando+Skift+Venstre pil eller ' +
      'Kommando+Skift+Højre pil.',
    resizeKeyboardInstructions:
      'På en kolonneoverskrift, der kan ændre størrelse, skal du trykke på Alt sammen med Venstre eller Højre pil ' +
      'for at ændre kolonnens bredde og Alt sammen med Home eller End for at springe til dens mindste eller ' +
      'største bredde.',
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
        summary = `Der vises ingen rækker lige nu. ${columns}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} af ${totalRowsText} ${rows(totalRowsValue)} fordelt på ${columns}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${rows(visibleRowsValue)} fordelt på ${columns}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Side ${pageText} af ${pageCountText}.`;
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
        summary = `Der vises ingen elementer lige nu. ${fields}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} af ${totalRowsText} ${items(totalRowsValue)} fordelt på ${fields}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)} fordelt på ${fields}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Side ${pageText} af ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel || sortState === 'none') return 'Sorteringen er ryddet.';

      if (sortedColumns.length > 1) {
        const parts = sortedColumns.map((column) => `${column.label} ${sortDirection(column.sortState)}`);

        return `Sorteret efter ${parts.slice(0, -1).join(', ')} og derefter ${parts.at(-1)}.`;
      }

      return `Sorteret efter ${columnLabel} ${sortDirection(sortState)}.`;
    },
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `Ingen rækker matcher "${query}".` : 'Ingen rækker matcher de aktuelle filtre.';
      }

      if (query) {
        return `Viser ${visibleRowsText} matchende ${rows(visibleRowsValue)} for "${query}".`;
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
      `Viser ${pageSizeText} ${rows(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
    listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Viser ${pageSizeText} ${items(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
    listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Kolonnen ${label} er flyttet til position ${positionText} af ${totalText} ${columnZone(zone)}.`,
    columnResize: ({ label, widthText, atMinimum, atMaximum }) =>
      `Kolonnen ${label} har bredden ${widthText} pixel${resizeBoundSuffix(atMinimum, atMaximum)}.`,
    selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
      if (selectedCountValue === 0) {
        return 'Markeringen er ryddet.';
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
    placeholderRow: () => 'Indlæser.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

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
        const state = visibilityState === 'visible' ? 'vist' : 'skjult';
        const action = toggleAction === 'hide' ? 'Skjul' : 'Vis';

        return `${columnLabel} ${state}. ${action} kolonne`;
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

        return `${action} ${pinSideText(pinSide, toggleAction)}: kolonnen ${label}`;
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

/** Built-in Danish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_DA_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Gengivelseshastighed',
      groupAriaLabel: 'Rækkers gengivelseshastighed',
      idleCaption: 'Viser den seneste optegningstid for rækker på den aktuelle side.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Måling af rækkegengivelse',
      toneLabel: renderToneLabel,
      idleSummary: 'inaktiv',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Gengivelse',
      pendingLabel: 'Afventer',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
