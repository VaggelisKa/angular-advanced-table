import type { NatTableIntl } from './accessibility.type';
import type { NatTableControlsIntl } from './controls.type';
import { DEFAULT_NUMBER_FORMATTER } from './locale-formatter.const';
import type { NatTableRenderMetricsIntl, RowRenderFilterOption, RowRenderTone } from './render-metrics.type';

/* Finnish (`fi`) copy for all three locale domains. */

const rows = (count: number): string => (count === 1 ? 'rivi' : 'riviä');

const items = (count: number): string => (count === 1 ? 'kohde' : 'kohdetta');

const columns = (count: number): string => (count === 1 ? 'sarake' : 'saraketta');

const fields = (count: number): string => (count === 1 ? 'kenttä' : 'kenttää');

const filteredRows = (count: number): string => (count === 1 ? 'suodatettu rivi' : 'suodatettua riviä');

const matchingRows = (count: number): string => (count === 1 ? 'vastaava rivi' : 'vastaavaa riviä');

const selectedRows = (count: number): string => (count === 1 ? 'rivi valittu' : 'riviä valittu');

const measuredRows = (count: number): string => (count === 1 ? 'rivi mitattu' : 'riviä mitattu');

const measuredVisibleRows = (count: number): string => (count === 1 ? 'näkyvä rivi mitattu' : 'näkyvää riviä mitattu');

const sortAdverb = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'nousevasti' : 'laskevasti');

const sortOrder = (sortState: 'ascending' | 'descending'): string => (sortState === 'ascending' ? 'nousevaan' : 'laskevaan');

const side = (target: 'left' | 'right'): string => (target === 'left' ? 'vasemmalle' : 'oikealle');

const pinSideText = (pinSide: 'left' | 'right', toggleAction: 'pin' | 'unpin'): string => {
  if (toggleAction === 'unpin') {
    return pinSide === 'left' ? 'vasemmalta' : 'oikealta';
  }

  return side(pinSide);
};

const visibilityVerb = (visibilityState: 'visible' | 'hidden'): string =>
  visibilityState === 'visible' ? 'näytetään' : 'piilotetaan';

const columnZone = (zone: 'left' | 'center' | 'right'): string => {
  if (zone === 'left') {
    return 'vasemmalle kiinnitettyjen sarakkeiden joukossa';
  }

  if (zone === 'right') {
    return 'oikealle kiinnitettyjen sarakkeiden joukossa';
  }

  return 'kiinnittämättömien sarakkeiden joukossa';
};

const resizeBoundSuffix = (atMinimum?: boolean, atMaximum?: boolean): string => {
  if (atMinimum) {
    return ' (vähimmäisleveys)';
  }

  if (atMaximum) {
    return ' (enimmäisleveys)';
  }

  return '';
};

const renderToneLabel = (tone: RowRenderTone | 'idle'): string => {
  switch (tone) {
    case 'fast':
      return 'Nopea';
    case 'watch':
      return 'Tarkkaile';
    case 'slow':
      return 'Hidas';
    case 'idle':
      return 'Ei mittausta';
  }
};

const RENDER_METRICS_FILTER_OPTIONS: readonly RowRenderFilterOption[] = [
  { value: 'all', label: 'Kaikki rivit', description: 'Näytä kaikki mitatut rivit' },
  { value: 'fast', label: 'Nopea', description: 'Nopeasti renderöityneet rivit' },
  { value: 'watch', label: 'Tarkkaile', description: 'Rivit, joita kannattaa tarkkailla' },
  { value: 'slow', label: 'Hidas', description: 'Hitaasti renderöityneet rivit' }
];

/** Built-in Finnish table labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_LOCALE_LABELS: NatTableIntl = {
  accessibilityText: {
    keyboardInstructions:
      'Siirry solujen välillä nuolinäppäimillä. Jos solun ainoa sisältö on yksi painike tai linkki, kohdistus ' +
      'siirtyy suoraan siihen. Jos solussa on useita ohjaimia, käytä niitä painamalla Enter, siirry eteenpäin ' +
      'sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa soluun painamalla Esc.',
    listKeyboardInstructions:
      'Siirry kohteiden välillä Nuoli ylös- ja Nuoli alas -näppäimillä. Käytä kohteen ohjaimia painamalla Enter, ' +
      'siirry eteenpäin sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa kohteeseen ' +
      'painamalla Esc.',
    emptyState: 'Mikään rivi ei vastaa nykyistä näkymää.',
    loadingState: 'Ladataan rivejä.',
    errorState: 'Rivien lataaminen epäonnistui.',
    reorderKeyboardInstructions:
      'Järjestä sarakkeita niiden nykyisen kiinnitysalueen sisällä painamalla Ctrl+Vaihto+Nuoli vasemmalle tai ' +
      'Ctrl+Vaihto+Nuoli oikealle. macOS:ssä paina Komento+Vaihto+Nuoli vasemmalle tai Komento+Vaihto+Nuoli oikealle.',
    resizeKeyboardInstructions:
      'Kun sarakeotsikon kokoa voi muuttaa, muuta sarakkeen leveyttä painamalla Alt-näppäintä ja Nuoli vasemmalle- ' +
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
      const visible = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}`;
      let summary: string;

      if (visibleRowsValue === 0) {
        summary = `Yhtään kohdetta ei näytetä juuri nyt. ${visible}.`;
      } else if (totalRowsValue !== visibleRowsValue) {
        summary = `Näytetään ${visibleRowsText} ${items(visibleRowsValue)} ${totalRowsText} kohteesta. ${visible}.`;
      } else {
        summary = `Näytetään ${visibleRowsText} ${items(visibleRowsValue)}. ${visible}.`;
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
    listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
      const summary = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}.`;

      if (changedColumns.length === 1) {
        const [column] = changedColumns;

        return `Kenttä ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
      }

      return summary;
    },
    pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Näytetään ${pageSizeText} ${rows(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
    listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) =>
      `Näytetään ${pageSizeText} ${items(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
    pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${rows(visibleRowsValue)}.`,
    listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) =>
      `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${items(visibleRowsValue)}.`,
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
    listSubHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
      const groupLabel = valueText.trim() ? `Ryhmä ${valueText}` : 'Ryhmä';

      return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
    },
    placeholderRow: () => 'Ladataan.'
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

/** Built-in Finnish companion-control labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_CONTROLS_LOCALE_LABELS: NatTableControlsIntl = {
  search: {
    label: 'Hae riveistä',
    placeholder: 'Hae riveistä'
  },
  columnVisibility: {
    label: 'Sarakkeet',
    groupAriaLabel: 'Sarakkeiden näkyvyys',
    accessibilityLabels: {
      visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) =>
        `${visibleColumnCountText} / ${totalColumnCountText} näkyvissä`,
      toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
        const state = visibilityState === 'visible' ? 'näkyvissä' : 'piilotettu';
        const action = toggleAction === 'hide' ? 'Piilota' : 'Näytä';

        return `${columnLabel} ${state}. ${action} sarake`;
      },
      columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Näkyvissä' : 'Piilotettu')
    }
  },
  pageSize: {
    groupAriaLabel: 'Rivejä sivulla',
    accessibilityLabels: {
      pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
      pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} sivua kohden`
    }
  },
  pager: {
    groupAriaLabel: 'Taulukon sivutus',
    accessibilityLabels: {
      previousPageAriaLabel: 'Edellinen sivu',
      nextPageAriaLabel: 'Seuraava sivu',
      pageIndicator: ({ pageText, pageCountText }) => `Sivu ${pageText} / ${pageCountText}`
    }
  },
  scrollControl: {
    groupAriaLabel: 'Taulukon vaakavieritys',
    accessibilityLabels: {
      scrollLeftAriaLabel: 'Vieritä taulukkoa vasemmalle',
      scrollRightAriaLabel: 'Vieritä taulukkoa oikealle',
      scrollPositionAriaLabel: 'Vaakavierityksen sijainti',
      scrollPositionText: ({ percentageText }) => `Vieritetty ${percentageText} %`
    }
  },
  headerActions: {
    accessibilityLabels: {
      sortButton: ({ label, sortState, sortPriority, sortCount }) => {
        if (sortState === 'none') {
          return `Lajittele sarakkeen ${label} mukaan`;
        }

        const sortDescription = `${label} on lajiteltu ${sortOrder(sortState)} järjestykseen`;

        return sortPriority !== null && sortCount > 1
          ? `${sortDescription}, lajittelujärjestys ${sortPriority} / ${sortCount}. Muuta lajittelua`
          : `${sortDescription}. Muuta lajittelua`;
      },
      menuButton: ({ label }) => `Avaa sarakkeen ${label} toiminnot`,
      menuLabel: ({ label }) => `Sarakkeen ${label} toiminnot`,
      pinButton: ({ label, toggleAction, pinSide }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}: sarake ${label}`;
      },
      pinButtonText: ({ pinSide, toggleAction }) => {
        const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';

        return `${action} ${pinSideText(pinSide, toggleAction)}`;
      },
      moveButton: ({ label, direction }) => `Siirrä saraketta ${label} ${side(direction)}`,
      moveButtonText: ({ direction }) => `Siirrä ${side(direction)}`
    }
  },
  toolbar: {
    toolbarLabel: 'Taulukon työkalurivi'
  },
  selection: {
    columnLabel: 'Valinta',
    accessibilityLabels: {
      selectAllAriaLabel: 'Valitse kaikki rivit',
      selectRowAriaLabel: ({ rowId }) => `Valitse rivi ${rowId}`
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};

/** Built-in Finnish render-metrics labels shipped with `ng-advanced-table/locale`. */
export const NAT_FI_RENDER_METRICS_LOCALE_LABELS: NatTableRenderMetricsIntl = {
  renderMetrics: {
    filter: {
      heading: 'Renderöintinopeus',
      groupAriaLabel: 'Rivien renderöintinopeus',
      idleCaption: 'Näyttää nykyisen sivun rivien viimeisimmän piirtoajan.',
      rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
      options: RENDER_METRICS_FILTER_OPTIONS
    },
    panel: {
      ariaLabel: 'Rivien renderöintimittaus',
      toneLabel: renderToneLabel,
      idleSummary: 'ei mittausta',
      rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
      duration: ({ durationMsText }) => `${durationMsText} ms`
    },
    column: {
      header: 'Renderöinti',
      pendingLabel: 'Odottaa',
      unitSuffix: ' ms'
    }
  },
  formatNumber: DEFAULT_NUMBER_FORMATTER
};
