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
  columns,
  filteredRows,
  matchingRows,
  resizeBoundSuffix,
  rows,
  selectedRows,
  sortAdverb,
  visibilityVerb
} from './text.const';
import type { NatTableIntl } from '../../accessibility.type';
import { DEFAULT_NUMBER_FORMATTER } from '../../locale-formatter.const';

/** Built-in Finnish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    listKeyboardInstructions,
    listSummary,
    listColumnVisibilityChange,
    listPageSizeChange,
    listPageChange,
    listSubHeaderRow,
    keyboardInstructions:
      'Siirry solujen välillä nuolinäppäimillä. Jos solun ainoa sisältö on painike tai linkki, kohdistus siirtyy suoraan siihen. Muissa soluissa käytä ohjaimia painamalla Enter, siirry niiden välillä sarkaimella ja näppäinyhdistelmällä Vaihto+Sarkain ja palaa soluun painamalla Esc.',
    emptyState: 'Mikään rivi ei vastaa nykyistä näkymää.',
    loadingState: 'Ladataan rivejä.',
    errorState: 'Rivien lataaminen epäonnistui.',
    reorderKeyboardInstructions:
      'Siirrä saraketta kiinnitysalueensa sisällä painamalla Ctrl+Vaihto ja Nuoli vasemmalle - tai Nuoli oikealle -näppäintä. Käytä macOS:ssä Komento-näppäintä Ctrl-näppäimen sijaan.',
    resizeKeyboardInstructions:
      'Muuta sarakkeen leveyttä painamalla Alt-näppäintä ja Nuoli vasemmalle - tai Nuoli oikealle -näppäintä. Valitse pienin tai suurin leveys painamalla Alt+Home tai Alt+End.',
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
      const visible = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}`;
      let summary: string;

      if (visibleRowsValue === 0) {
        summary = `Ei rivejä näkyvissä. ${visible}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Näytetään ${visibleRowsText} / ${totalRowsText} ${rows(totalRowsValue)}. ${visible}.`;
      } else {
        summary = `Näytetään ${visibleRowsText} ${rows(visibleRowsValue)}. ${visible}.`;
      }

      if (paginationState === 'enabled') {
        summary += ` Sivu ${pageText} / ${pageCountText}.`;
      }

      return summary;
    },
    sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
      if (!columnLabel || sortState === 'none') return 'Lajittelu poistettu.';

      if (sortedColumns.length > 1) {
        const parts = sortedColumns.map((column) => `${column.label} ${sortAdverb(column.sortState)}`);

        return `Lajiteltu: ${parts.slice(0, -1).join(', ')} ja sitten ${parts.at(-1)}.`;
      }

      return `Lajiteltu sarakkeen ${columnLabel} mukaan ${sortAdverb(sortState)}.`;
    },
    filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
      if (visibleRowsValue === 0) {
        return query ? `Mikään rivi ei vastaa hakua "${query}".` : 'Mikään rivi ei vastaa nykyisiä suodattimia.';
      }

      if (query) {
        return `${visibleRowsText} hakua "${query}" ${matchingRows(visibleRowsValue)}.`;
      }

      if (filterState === 'column') {
        return `${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Kaikki rivit: ${visibleRowsText}.`;
    },
    columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Sarake ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `${pageSizeText} ${rows(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${rows(visibleRowsValue)}.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Sarake ${label} siirretty paikkaan ${positionText} / ${totalText}, ${columnZone(zone)}.`,
    columnResize: ({ label, widthText, atMinimum, atMaximum }) =>
      `Sarakkeen ${label} leveys on ${widthText} pikseliä${resizeBoundSuffix(atMinimum, atMaximum)}.`,
    selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
      if (selectedCountValue === 0) {
        return 'Valinta tyhjennetty.';
      }

      if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
        return `Kaikki ${totalRowsText} ${selectedRows(totalRowsValue)}.`;
      }

      return `${selectedCountText} ${selectedRows(selectedCountValue)}.`;
    },
    subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Ryhmä ${valueText}` : 'Ryhmä';

      return `${groupLabel}, ${rowCountText} ${rows(rowCountValue)}.`;
    },
    placeholderRow: () => 'Ladataan.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
