import type { NatTableIntl } from './accessibility.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import { NAT_SV_LIST_ACCESSIBILITY_TEXT } from './locale-sv-list.const';
import {
  columnZone,
  filteredRows,
  resizeBoundSuffix,
  rows,
  selectedRows,
  sortDirection,
  visibilityVerb,
  visibleColumns
} from './locale-sv-text.const';

/** Built-in Swedish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_SV_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    ...NAT_SV_LIST_ACCESSIBILITY_TEXT,
    keyboardInstructions:
      'Använd piltangenterna för att flytta mellan celler. En cell vars enda innehåll är en knapp eller en länk får ' +
      'fokus direkt. I celler med flera kontroller trycker du på Retur för att använda dem, Tabb för att flytta ' +
      'framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till cellen.',
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
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Visar ${pageSizeText} ${rows(pageSizeValue)} per sida. Sida ${pageText} av ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} visas.`,
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
    placeholderRow: () => 'Läser in.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
