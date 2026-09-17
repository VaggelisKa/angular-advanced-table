import type { NatTableIntl } from './accessibility.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { NAT_NB_LIST_ACCESSIBILITY_TEXT } from './locale-nb-list.const';
import {
  columnZone,
  filteredRows,
  resizeBoundSuffix,
  rows,
  selectedRows,
  sortDirection,
  visibilityVerb,
  visibleColumns
} from './locale-nb-text.const';

/** Built-in Norwegian Bokmål table labels shipped with `ng-advanced-table/locale`. */
export const NAT_NB_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    ...NAT_NB_LIST_ACCESSIBILITY_TEXT,
    keyboardInstructions:
      'Bruk piltastene for å flytte mellom celler. En celle som bare inneholder én knapp eller én lenke, får fokus ' +
      'direkte. I celler med flere kontroller trykker du Enter for å bruke dem, Tab for å flytte fremover mellom ' +
      'dem, Skift+Tab for å flytte bakover og Esc for å gå tilbake til cellen.',
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
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Viser ${pageSizeText} ${rows(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
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
    placeholderRow: () => 'Laster.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
