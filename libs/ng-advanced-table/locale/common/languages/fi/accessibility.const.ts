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
      'Siirry solujen välillä nuolinäppäimillä. Jos solun ainoa sisältö on yksi painike tai linkki, kohdistus ' +
      'siirtyy suoraan siihen. Jos solussa on useita ohjaimia, käytä niitä painamalla Enter, siirry eteenpäin ' +
      'sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa soluun painamalla Esc.',
    emptyState: 'Mikään rivi ei vastaa nykyistä näkymää.',
    loadingState: 'Ladataan rivejä.',
    errorState: 'Rivien lataaminen epäonnistui.',
    reorderKeyboardInstructions:
      'Järjestä sarakkeita niiden nykyisen kiinnitysalueen sisällä painamalla Ctrl+Vaihto+Nuoli vasemmalle tai ' +
      'Ctrl+Vaihto+Nuoli oikealle. macOS:ssä paina Komento+Vaihto+Nuoli vasemmalle tai Komento+Vaihto+Nuoli oikealle.',
    resizeKeyboardInstructions:
      'Kun sarakeotsikon kokoa voi muuttaa, muuta sarakkeen leveyttä painamalla Alt-näppäintä ja Nuoli vasemmalle - ' +
      'tai Nuoli oikealle -näppäintä. Siirry pienimpään tai suurimpaan leveyteen painamalla Alt-näppäintä ja Home- ' +
      'tai End-näppäintä.',
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
        summary = `Yhtään riviä ei näytetä juuri nyt. ${visible}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Näytetään ${visibleRowsText} ${rows(visibleRowsValue)} ${totalRowsText} rivistä. ${visible}.`;
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
        return `Näytetään ${visibleRowsText} hakua "${query}" ${matchingRows(visibleRowsValue)}.`;
      }

      if (filterState === 'column') {
        return `Näytetään ${visibleRowsText} ${filteredRows(visibleRowsValue)}.`;
      }

      return `Näytetään kaikki ${visibleRowsText} ${rows(visibleRowsValue)}.`;
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
      `Näytetään ${pageSizeText} ${rows(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${rows(visibleRowsValue)}.`,
    columnReorder: ({ label, positionText, totalText, zone }) =>
      `Sarake ${label} siirrettiin sijaintiin ${positionText} / ${totalText} ${columnZone(zone)}.`,
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
