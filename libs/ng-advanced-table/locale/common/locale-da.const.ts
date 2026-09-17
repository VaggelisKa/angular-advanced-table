import type { NatTableIntl } from './accessibility.type';
import {
  listColumnVisibilityChange,
  listKeyboardInstructions,
  listPageChange,
  listPageSizeChange,
  listSubHeaderRow,
  listSummary
} from './locale-da-list.const';
import {
  columnZone,
  filteredRows,
  resizeBoundSuffix,
  rows,
  selectedRows,
  sortDirection,
  visibilityVerb,
  visibleColumns
} from './locale-da-text.const';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';

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
      'Brug piletasterne til at flytte mellem celler. En celle, hvis eneste indhold er en enkelt knap eller et link, ' +
      'får fokus direkte. I celler med flere kontroller skal du trykke på Enter for at bruge dem, Tab for at flytte ' +
      'fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til cellen.',
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
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Viser ${pageSizeText} ${rows(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} vises.`,
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
    placeholderRow: () => 'Indlæser.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
