import {
  listColumnVisibilityChange,
  listKeyboardInstructions,
  listPageChange,
  listPageSizeChange,
  listSubHeaderRow,
  listSummary
} from './list.const';
import {
  columnZone,
  filteredRows,
  resizeBoundSuffix,
  rows,
  selectedRows,
  sortDirection,
  visibilityVerb,
  visibleColumns
} from './text.const';
import type { NatTableIntl } from '../../accessibility.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

/** Built-in Norwegian Bokmål table labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    listKeyboardInstructions,
    listSummary,
    listColumnVisibilityChange,
    listPageSizeChange,
    listPageChange,
    listSubHeaderRow,
    keyboardInstructions:
      'Bruk piltastene for å flytte mellom celler. Hvis en celle bare inneholder en knapp eller en lenke, får knappen eller lenken fokus direkte. Ellers bruker du Enter for å betjene kontrollene, Tab og Skift+Tab for å flytte mellom dem og Esc for å gå tilbake til cellen.',
    emptyState: 'Ingen rader samsvarer med gjeldende visning.',
    loadingState: 'Laster rader.',
    errorState: 'Radene kunne ikke lastes.',
    reorderKeyboardInstructions:
      'Trykk Ctrl+Skift sammen med Venstrepil eller Høyrepil for å flytte en kolonne innenfor området den er festet i. Bruk Kommando på macOS.',
    resizeKeyboardInstructions:
      'Trykk Alt sammen med Venstrepil eller Høyrepil for å endre kolonnens bredde, eller Alt sammen med Home eller End for minste eller største bredde.',
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
        summary = `Ingen rader vises. ${columns}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} av ${totalRowsText} ${rows(totalRowsValue)}, ${columns}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${rows(visibleRowsValue)}, ${columns}.`;
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
        return `${visibleRowsText} ${rows(visibleRowsValue)} samsvarer med "${query}".`;
      }

      if (filterState === 'column') {
        return `${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Alle rader: ${visibleRowsText}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Kolonnen ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `${pageSizeText} ${rows(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Kolonnen ${label} flyttet til posisjon ${positionText} av ${totalText}, ${columnZone(zone)}.`,
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
    placeholderRow: () => 'Laster.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
