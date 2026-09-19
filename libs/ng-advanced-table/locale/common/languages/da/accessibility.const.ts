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

/** Built-in Danish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_DA_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    listKeyboardInstructions,
    listSummary,
    listColumnVisibilityChange,
    listPageSizeChange,
    listPageChange,
    listSubHeaderRow,
    keyboardInstructions:
      'Brug piletasterne til at flytte mellem celler. Hvis en celle kun indeholder en knap eller et link, får knappen eller linket fokus direkte. Ellers bruges Enter til at betjene kontrollerne, Tab og Skift+Tab til at flytte mellem dem og Esc til at vende tilbage til cellen.',
    emptyState: 'Ingen rækker matcher den aktuelle visning.',
    loadingState: 'Indlæser rækker.',
    errorState: 'Rækkerne kunne ikke indlæses.',
    reorderKeyboardInstructions:
      'Tryk på Ctrl+Skift sammen med Venstre eller Højre pil for at flytte en kolonne inden for dens fastgjorte område. Brug Kommando på macOS.',
    resizeKeyboardInstructions:
      'Tryk på Alt sammen med Venstre eller Højre pil for at ændre kolonnens bredde, eller Alt sammen med Home eller End for mindste eller største bredde.',
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
        summary = `Ingen rækker vises. ${columns}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} af ${totalRowsText} ${rows(totalRowsValue)}, ${columns}.`;
      } else {
        summary = `Viser ${visibleRowsText} ${rows(visibleRowsValue)}, ${columns}.`;
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
        return `${visibleRowsText} ${rows(visibleRowsValue)} matcher "${query}".`;
      }

      if (filterState === 'column') {
        return `${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Alle rækker: ${visibleRowsText}.`;
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
      `${pageSizeText} ${rows(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Kolonnen ${label} flyttet til position ${positionText} af ${totalText}, ${columnZone(zone)}.`,
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
    placeholderRow: () => 'Indlæser.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
