import { isSignal, computed, Optional, SkipSelf, InjectionToken, assertInInjectionContext, inject } from '@angular/core';

/** Locale id for the built-in English locale dictionaries. */
const NAT_EN_LOCALE_ID = 'en';
/** Locale id for the built-in Danish locale dictionaries. */
const NAT_DA_LOCALE_ID = 'da';
/** Locale id for the built-in Finnish locale dictionaries. */
const NAT_FI_LOCALE_ID = 'fi';
/** Locale id for the built-in Norwegian Bokmål locale dictionaries. */
const NAT_NB_LOCALE_ID = 'nb';
/**
 * Conventional id for the Norwegian macrolanguage. Nothing registers it on its
 * own, and id lookup cannot reach Bokmål from it: `no` is not a prefix of `nb`,
 * so register {@link NAT_NB_LOCALE_LABELS} under both this id and
 * {@link NAT_NB_LOCALE_ID} when an application sets either. Nynorsk is a
 * separate written standard and is not covered.
 */
const NAT_NO_LOCALE_ID = 'no';
/** Locale id for the built-in Swedish locale dictionaries. */
const NAT_SV_LOCALE_ID = 'sv';

/* Shared Danish (`da`) wording helpers for the built-in Danish locale dictionaries. */
const rows$3 = (count) => (count === 1 ? 'række' : 'rækker');
const items$2 = (count) => (count === 1 ? 'element' : 'elementer');
const visibleColumns$2 = (count) => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');
const visibleFields$2 = (count) => (count === 1 ? 'synligt felt' : 'synlige felter');
const filteredRows$3 = (count) => (count === 1 ? 'filtreret række' : 'filtrerede rækker');
const selectedRows$3 = (count) => (count === 1 ? 'række er valgt' : 'rækker er valgt');
const measuredRows$3 = (count) => (count === 1 ? 'række målt' : 'rækker målt');
const measuredVisibleRows$3 = (count) => (count === 1 ? 'synlig række målt' : 'synlige rækker målt');
const sortDirection$2 = (sortState) => (sortState === 'ascending' ? 'stigende' : 'faldende');
const side$3 = (target) => (target === 'left' ? 'til venstre' : 'til højre');
const pinSideText$3 = (pinSide, toggleAction) => `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'højre'}`;
const visibilityVerb$3 = (visibilityState) => (visibilityState === 'visible' ? 'vises' : 'skjules');
const columnZone$3 = (zone) => {
    if (zone === 'left') {
        return 'blandt kolonner fastgjort til venstre';
    }
    if (zone === 'right') {
        return 'blandt kolonner fastgjort til højre';
    }
    return 'blandt ikke-fastgjorte kolonner';
};
const resizeBoundSuffix$4 = (atMinimum, atMaximum) => {
    if (atMinimum) {
        return ' (minimum)';
    }
    if (atMaximum) {
        return ' (maksimum)';
    }
    return '';
};
const renderToneLabel$3 = (tone) => {
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

/** Default locale-aware number formatter shared by every locale domain. */
const DEFAULT_NUMBER_FORMATTER = (value, options, locale) => new Intl.NumberFormat(locale, options).format(value);

/** Built-in Danish companion-control labels shipped with `ng-advanced-table/locale`. */
const NAT_DA_CONTROLS_LOCALE_LABELS = {
    search: {
        label: 'Søg i rækker',
        placeholder: 'Søg i rækker'
    },
    columnVisibility: {
        label: 'Kolonner',
        groupAriaLabel: 'Kolonnesynlighed',
        accessibilityLabels: {
            visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
            toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
                const state = visibilityState === 'visible' ? 'er synlig' : 'er skjult';
                const action = toggleAction === 'hide' ? 'Skjul' : 'Vis';
                return `${columnLabel} ${state}. ${action} kolonnen`;
            },
            columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
        }
    },
    pageSize: {
        groupAriaLabel: 'Rækker pr. side',
        accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$3(pageSizeValue)}`,
            pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$3(pageSizeValue)} pr. side`
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
                const sortDescription = `${label} er sorteret i ${sortDirection$2(sortState)} rækkefølge`;
                return sortPriority !== null && sortCount > 1
                    ? `${sortDescription}, sorteringsprioritet ${sortPriority} af ${sortCount}. Skift sortering`
                    : `${sortDescription}. Skift sortering`;
            },
            menuButton: ({ label }) => `Åbn kolonnehandlinger for kolonnen ${label}`,
            menuLabel: ({ label }) => `Kolonnehandlinger for kolonnen ${label}`,
            pinButton: ({ label, toggleAction, pinSide }) => {
                const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';
                return `${action} kolonnen ${label} ${pinSideText$3(pinSide, toggleAction)}`;
            },
            pinButtonText: ({ pinSide, toggleAction }) => {
                const action = toggleAction === 'unpin' ? 'Frigør' : 'Fastgør';
                return `${action} ${pinSideText$3(pinSide, toggleAction)}`;
            },
            moveButton: ({ label, direction }) => `Flyt kolonnen ${label} ${side$3(direction)}`,
            moveButtonText: ({ direction }) => `Flyt ${side$3(direction)}`
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

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS$3 = [
    { value: 'all', label: 'Alle rækker', description: 'Vis alle målte rækker' },
    { value: 'fast', label: 'Hurtig', description: 'Rækker, der blev gengivet hurtigt' },
    { value: 'watch', label: 'Hold øje', description: 'Rækker, der er værd at holde øje med' },
    { value: 'slow', label: 'Langsom', description: 'Rækker, der blev gengivet langsomt' }
];
/** Built-in Danish render-metrics labels shipped with `ng-advanced-table/locale`. */
const NAT_DA_RENDER_METRICS_LOCALE_LABELS = {
    renderMetrics: {
        filter: {
            heading: 'Gengivelseshastighed',
            groupAriaLabel: 'Rækkers gengivelseshastighed',
            idleCaption: 'Viser den seneste optegningstid for rækker på den aktuelle side.',
            rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$3(rowCountValue)}`,
            options: FILTER_OPTIONS$3
        },
        panel: {
            ariaLabel: 'Måling af rækkegengivelse',
            toneLabel: renderToneLabel$3,
            idleSummary: 'inaktiv',
            rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$3(rowCountValue)}`,
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

/**
 * Built-in Danish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
const listKeyboardInstructions$4 = 'Brug Pil op og Pil ned til at flytte mellem elementer. Tryk på Enter for at bruge kontrollerne i et element, ' +
    'Tab for at flytte fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til elementet.';
const listSummary$4 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
    const fields = `${visibleColumnsText} ${visibleFields$2(visibleColumnsValue)}`;
    let summary;
    if (visibleRowsValue === 0) {
        summary = `Der vises ingen elementer lige nu. ${fields}.`;
    }
    else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} af ${totalRowsText} ${items$2(totalRowsValue)} fordelt på ${fields}.`;
    }
    else {
        summary = `Viser ${visibleRowsText} ${items$2(visibleRowsValue)} fordelt på ${fields}.`;
    }
    if (paginationState === 'enabled') {
        summary += ` Side ${pageText} af ${pageCountText}.`;
    }
    return summary;
};
const listColumnVisibilityChange$4 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `${visibleColumnsText} ${visibleFields$2(visibleColumnsValue)}.`;
    if (changedColumns.length === 1) {
        const [column] = changedColumns;
        return `Feltet ${column.label} ${visibilityVerb$3(column.visibilityState)}. ${summary}`;
    }
    return summary;
};
const listPageSizeChange$4 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Viser ${pageSizeText} ${items$2(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`;
const listPageChange$4 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${items$2(visibleRowsValue)} vises.`;
const listSubHeaderRow$4 = ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';
    return `${groupLabel}, ${rowCountText} ${items$2(rowCountValue)}.`;
};

/** Built-in Danish table labels shipped with `ng-advanced-table/locale`. */
const NAT_DA_LOCALE_LABELS = {
    accessibilityText: {
        listKeyboardInstructions: listKeyboardInstructions$4,
        listSummary: listSummary$4,
        listColumnVisibilityChange: listColumnVisibilityChange$4,
        listPageSizeChange: listPageSizeChange$4,
        listPageChange: listPageChange$4,
        listSubHeaderRow: listSubHeaderRow$4,
        keyboardInstructions: 'Brug piletasterne til at flytte mellem celler. Hvis en celle kun indeholder en knap eller et link, ' +
            'får knappen eller linket fokus direkte. I celler med flere kontroller skal du trykke på Enter for at bruge dem, Tab for at flytte ' +
            'fremad mellem dem, Skift+Tab for at flytte tilbage og Esc for at vende tilbage til cellen.',
        emptyState: 'Ingen rækker matcher den aktuelle visning.',
        loadingState: 'Indlæser rækker.',
        errorState: 'Rækkerne kunne ikke indlæses.',
        reorderKeyboardInstructions: 'Tryk på Ctrl+Skift+Venstre pil eller Ctrl+Skift+Højre pil for at omarrangere kolonner inden for deres ' +
            'nuværende fastgjorte område. På macOS skal du trykke på Kommando+Skift+Venstre pil eller ' +
            'Kommando+Skift+Højre pil.',
        resizeKeyboardInstructions: 'Når fokus er på en kolonneoverskrift, hvis bredde kan ændres, skal du trykke på Alt sammen med Venstre eller Højre pil ' +
            'for at ændre kolonnens bredde og Alt sammen med Home eller End for at springe til dens mindste eller ' +
            'største bredde.',
        tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
            const columns = `${visibleColumnsText} ${visibleColumns$2(visibleColumnsValue)}`;
            let summary;
            if (visibleRowsValue === 0) {
                summary = `Der vises ingen rækker lige nu. ${columns}.`;
            }
            else if (totalRowsValue !== visibleRowsValue) {
                summary = `Viser ${visibleRowsText} af ${totalRowsText} ${rows$3(totalRowsValue)} fordelt på ${columns}.`;
            }
            else {
                summary = `Viser ${visibleRowsText} ${rows$3(visibleRowsValue)} fordelt på ${columns}.`;
            }
            if (paginationState === 'enabled') {
                summary += ` Side ${pageText} af ${pageCountText}.`;
            }
            return summary;
        },
        sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
            if (!columnLabel || sortState === 'none')
                return 'Sorteringen er ryddet.';
            if (sortedColumns.length > 1) {
                const parts = sortedColumns.map((column) => `${column.label} ${sortDirection$2(column.sortState)}`);
                return `Sorteret efter ${parts.slice(0, -1).join(', ')} og derefter ${parts.at(-1)}.`;
            }
            return `Sorteret efter ${columnLabel} ${sortDirection$2(sortState)}.`;
        },
        filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
            if (visibleRowsValue === 0) {
                return query ? `Ingen rækker matcher "${query}".` : 'Ingen rækker matcher de aktuelle filtre.';
            }
            if (query) {
                return `Viser ${visibleRowsText} matchende ${rows$3(visibleRowsValue)} for "${query}".`;
            }
            if (filterState === 'column') {
                return `Viser ${visibleRowsText} ${filteredRows$3(visibleRowsValue)}.`;
            }
            return `Viser alle ${visibleRowsText} ${rows$3(visibleRowsValue)}.`;
        },
        columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
            const summary = `${visibleColumnsText} ${visibleColumns$2(visibleColumnsValue)}.`;
            if (changedColumns.length === 1) {
                const [column] = changedColumns;
                return `Kolonnen ${column.label} ${visibilityVerb$3(column.visibilityState)}. ${summary}`;
            }
            return summary;
        },
        pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Viser ${pageSizeText} ${rows$3(pageSizeValue)} pr. side. Side ${pageText} af ${pageCountText}.`,
        pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} af ${pageCountText}. ${visibleRowsText} ${rows$3(visibleRowsValue)} vises.`,
        columnReorder: ({ label, positionText, totalText, zone }) => `Kolonnen ${label} er flyttet til position ${positionText} af ${totalText} ${columnZone$3(zone)}.`,
        columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolonnen ${label} har bredden ${widthText} pixel${resizeBoundSuffix$4(atMinimum, atMaximum)}.`,
        selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
            if (selectedCountValue === 0) {
                return 'Markeringen er ryddet.';
            }
            if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
                return `Alle ${totalRowsText} ${selectedRows$3(totalRowsValue)}.`;
            }
            return `${selectedCountText} ${selectedRows$3(selectedCountValue)}.`;
        },
        subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
            const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';
            return `${groupLabel}, ${rowCountText} ${rows$3(rowCountValue)}.`;
        },
        placeholderRow: () => 'Indlæser.'
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};

/* Shared Finnish (`fi`) wording helpers for the built-in Finnish locale dictionaries. */
const rows$2 = (count) => (count === 1 ? 'rivi' : 'riviä');
const items$1 = (count) => (count === 1 ? 'kohde' : 'kohdetta');
const columns = (count) => (count === 1 ? 'sarake' : 'saraketta');
const fields = (count) => (count === 1 ? 'kenttä' : 'kenttää');
const filteredRows$2 = (count) => (count === 1 ? 'suodatettu rivi' : 'suodatettua riviä');
const matchingRows = (count) => (count === 1 ? 'vastaava rivi' : 'vastaavaa riviä');
const selectedRows$2 = (count) => (count === 1 ? 'rivi valittu' : 'riviä valittu');
const measuredRows$2 = (count) => (count === 1 ? 'rivi mitattu' : 'riviä mitattu');
const measuredVisibleRows$2 = (count) => (count === 1 ? 'näkyvä rivi mitattu' : 'näkyvää riviä mitattu');
const sortAdverb = (sortState) => (sortState === 'ascending' ? 'nousevasti' : 'laskevasti');
const sortOrder = (sortState) => (sortState === 'ascending' ? 'nousevaan' : 'laskevaan');
const side$2 = (target) => (target === 'left' ? 'vasemmalle' : 'oikealle');
const pinSideText$2 = (pinSide, toggleAction) => {
    if (toggleAction === 'unpin') {
        return pinSide === 'left' ? 'vasemmalta' : 'oikealta';
    }
    return side$2(pinSide);
};
const visibilityVerb$2 = (visibilityState) => visibilityState === 'visible' ? 'näytetään' : 'piilotetaan';
const columnZone$2 = (zone) => {
    if (zone === 'left') {
        return 'vasemmalle kiinnitettyjen sarakkeiden joukossa';
    }
    if (zone === 'right') {
        return 'oikealle kiinnitettyjen sarakkeiden joukossa';
    }
    return 'kiinnittämättömien sarakkeiden joukossa';
};
const resizeBoundSuffix$3 = (atMinimum, atMaximum) => {
    if (atMinimum) {
        return ' (vähimmäisleveys)';
    }
    if (atMaximum) {
        return ' (enimmäisleveys)';
    }
    return '';
};
const renderToneLabel$2 = (tone) => {
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

/** Built-in Finnish companion-control labels shipped with `ng-advanced-table/locale`. */
const NAT_FI_CONTROLS_LOCALE_LABELS = {
    search: {
        label: 'Hae riveistä',
        placeholder: 'Hae riveistä'
    },
    columnVisibility: {
        label: 'Sarakkeet',
        groupAriaLabel: 'Sarakkeiden näkyvyys',
        accessibilityLabels: {
            visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} näkyvissä`,
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
            pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$2(pageSizeValue)}`,
            pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$2(pageSizeValue)} sivua kohden`
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
                return `${action} sarake ${label} ${pinSideText$2(pinSide, toggleAction)}`;
            },
            pinButtonText: ({ pinSide, toggleAction }) => {
                const action = toggleAction === 'unpin' ? 'Irrota' : 'Kiinnitä';
                return `${action} ${pinSideText$2(pinSide, toggleAction)}`;
            },
            moveButton: ({ label, direction }) => `Siirrä saraketta ${label} ${side$2(direction)}`,
            moveButtonText: ({ direction }) => `Siirrä ${side$2(direction)}`
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

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS$2 = [
    { value: 'all', label: 'Kaikki rivit', description: 'Näytä kaikki mitatut rivit' },
    { value: 'fast', label: 'Nopea', description: 'Nopeasti renderöityneet rivit' },
    { value: 'watch', label: 'Tarkkaile', description: 'Rivit, joita kannattaa tarkkailla' },
    { value: 'slow', label: 'Hidas', description: 'Hitaasti renderöityneet rivit' }
];
/** Built-in Finnish render-metrics labels shipped with `ng-advanced-table/locale`. */
const NAT_FI_RENDER_METRICS_LOCALE_LABELS = {
    renderMetrics: {
        filter: {
            heading: 'Renderöintinopeus',
            groupAriaLabel: 'Rivien renderöintinopeus',
            idleCaption: 'Näyttää nykyisen sivun rivien viimeisimmän piirtoajan.',
            rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$2(rowCountValue)}`,
            options: FILTER_OPTIONS$2
        },
        panel: {
            ariaLabel: 'Rivien renderöintimittaus',
            toneLabel: renderToneLabel$2,
            idleSummary: 'ei mittausta',
            rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$2(rowCountValue)}`,
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

/**
 * Built-in Finnish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
const listKeyboardInstructions$3 = 'Siirry kohteiden välillä Nuoli ylös - ja Nuoli alas -näppäimillä. Käytä kohteen ohjaimia painamalla Enter, ' +
    'siirry eteenpäin sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa kohteeseen ' +
    'painamalla Esc.';
const listSummary$3 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
    const visible = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}`;
    let summary;
    if (visibleRowsValue === 0) {
        summary = `Yhtään kohdetta ei näytetä juuri nyt. ${visible}.`;
    }
    else if (totalRowsValue !== visibleRowsValue) {
        summary = `Näytetään ${visibleRowsText} ${items$1(visibleRowsValue)} ${totalRowsText} kohteesta. ${visible}.`;
    }
    else {
        summary = `Näytetään ${visibleRowsText} ${items$1(visibleRowsValue)}. ${visible}.`;
    }
    if (paginationState === 'enabled') {
        summary += ` Sivu ${pageText} / ${pageCountText}.`;
    }
    return summary;
};
const listColumnVisibilityChange$3 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `Näkyvissä ${visibleColumnsText} ${fields(visibleColumnsValue)}.`;
    if (changedColumns.length === 1) {
        const [column] = changedColumns;
        return `Kenttä ${column.label} ${visibilityVerb$2(column.visibilityState)}. ${summary}`;
    }
    return summary;
};
const listPageSizeChange$3 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Näytetään ${pageSizeText} ${items$1(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`;
const listPageChange$3 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${items$1(visibleRowsValue)}.`;
const listSubHeaderRow$3 = ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Ryhmä ${valueText}` : 'Ryhmä';
    return `${groupLabel}, ${rowCountText} ${items$1(rowCountValue)}.`;
};

/** Built-in Finnish table labels shipped with `ng-advanced-table/locale`. */
const NAT_FI_LOCALE_LABELS = {
    accessibilityText: {
        listKeyboardInstructions: listKeyboardInstructions$3,
        listSummary: listSummary$3,
        listColumnVisibilityChange: listColumnVisibilityChange$3,
        listPageSizeChange: listPageSizeChange$3,
        listPageChange: listPageChange$3,
        listSubHeaderRow: listSubHeaderRow$3,
        keyboardInstructions: 'Siirry solujen välillä nuolinäppäimillä. Jos solun ainoa sisältö on yksi painike tai linkki, kohdistus ' +
            'siirtyy suoraan siihen. Jos solussa on useita ohjaimia, käytä niitä painamalla Enter, siirry eteenpäin ' +
            'sarkaimella, taaksepäin näppäinyhdistelmällä Vaihto+Sarkain ja palaa soluun painamalla Esc.',
        emptyState: 'Mikään rivi ei vastaa nykyistä näkymää.',
        loadingState: 'Ladataan rivejä.',
        errorState: 'Rivien lataaminen epäonnistui.',
        reorderKeyboardInstructions: 'Järjestä sarakkeita niiden nykyisen kiinnitysalueen sisällä painamalla Ctrl+Vaihto+Nuoli vasemmalle tai ' +
            'Ctrl+Vaihto+Nuoli oikealle. macOS:ssä paina Komento+Vaihto+Nuoli vasemmalle tai Komento+Vaihto+Nuoli oikealle.',
        resizeKeyboardInstructions: 'Kun sarakeotsikon kokoa voi muuttaa, muuta sarakkeen leveyttä painamalla Alt-näppäintä ja Nuoli vasemmalle - ' +
            'tai Nuoli oikealle -näppäintä. Siirry pienimpään tai suurimpaan leveyteen painamalla Alt-näppäintä ja Home- ' +
            'tai End-näppäintä.',
        tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
            const visible = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}`;
            let summary;
            if (visibleRowsValue === 0) {
                summary = `Yhtään riviä ei näytetä juuri nyt. ${visible}.`;
            }
            else if (totalRowsValue !== visibleRowsValue) {
                summary = `Näytetään ${visibleRowsText} ${rows$2(visibleRowsValue)} ${totalRowsText} rivistä. ${visible}.`;
            }
            else {
                summary = `Näytetään ${visibleRowsText} ${rows$2(visibleRowsValue)}. ${visible}.`;
            }
            if (paginationState === 'enabled') {
                summary += ` Sivu ${pageText} / ${pageCountText}.`;
            }
            return summary;
        },
        sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
            if (!columnLabel || sortState === 'none')
                return 'Lajittelu poistettu.';
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
                return `Näytetään ${visibleRowsText} ${filteredRows$2(visibleRowsValue)}.`;
            }
            return `Näytetään kaikki ${visibleRowsText} ${rows$2(visibleRowsValue)}.`;
        },
        columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
            const summary = `Näkyvissä ${visibleColumnsText} ${columns(visibleColumnsValue)}.`;
            if (changedColumns.length === 1) {
                const [column] = changedColumns;
                return `Sarake ${column.label} ${visibilityVerb$2(column.visibilityState)}. ${summary}`;
            }
            return summary;
        },
        pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Näytetään ${pageSizeText} ${rows$2(pageSizeValue)} sivua kohden. Sivu ${pageText} / ${pageCountText}.`,
        pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sivu ${pageText} / ${pageCountText}. Näytetään ${visibleRowsText} ${rows$2(visibleRowsValue)}.`,
        columnReorder: ({ label, positionText, totalText, zone }) => `Sarake ${label} siirrettiin sijaintiin ${positionText} / ${totalText} ${columnZone$2(zone)}.`,
        columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Sarakkeen ${label} leveys on ${widthText} pikseliä${resizeBoundSuffix$3(atMinimum, atMaximum)}.`,
        selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
            if (selectedCountValue === 0) {
                return 'Valinta tyhjennetty.';
            }
            if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
                return `Kaikki ${totalRowsText} ${selectedRows$2(totalRowsValue)}.`;
            }
            return `${selectedCountText} ${selectedRows$2(selectedCountValue)}.`;
        },
        subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
            const groupLabel = valueText.trim() ? `Ryhmä ${valueText}` : 'Ryhmä';
            return `${groupLabel}, ${rowCountText} ${rows$2(rowCountValue)}.`;
        },
        placeholderRow: () => 'Ladataan.'
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};

/* Shared Norwegian Bokmål (`nb`) wording helpers for the built-in Norwegian Bokmål locale dictionaries. */
const rows$1 = (count) => (count === 1 ? 'rad' : 'rader');
const items = (count) => (count === 1 ? 'element' : 'elementer');
const visibleColumns$1 = (count) => (count === 1 ? 'synlig kolonne' : 'synlige kolonner');
const visibleFields$1 = (count) => (count === 1 ? 'synlig felt' : 'synlige felter');
const filteredRows$1 = (count) => (count === 1 ? 'filtrert rad' : 'filtrerte rader');
const selectedRows$1 = (count) => (count === 1 ? 'rad er valgt' : 'rader er valgt');
const measuredRows$1 = (count) => (count === 1 ? 'rad målt' : 'rader målt');
const measuredVisibleRows$1 = (count) => (count === 1 ? 'synlig rad målt' : 'synlige rader målt');
const sortDirection$1 = (sortState) => (sortState === 'ascending' ? 'stigende' : 'synkende');
const side$1 = (target) => (target === 'left' ? 'til venstre' : 'til høyre');
const pinSideText$1 = (pinSide, toggleAction) => `${toggleAction === 'unpin' ? 'fra' : 'til'} ${pinSide === 'left' ? 'venstre' : 'høyre'}`;
const visibilityVerb$1 = (visibilityState) => (visibilityState === 'visible' ? 'vises' : 'skjules');
const columnZone$1 = (zone) => {
    if (zone === 'left') {
        return 'blant kolonner som er festet til venstre';
    }
    if (zone === 'right') {
        return 'blant kolonner som er festet til høyre';
    }
    return 'blant kolonner som ikke er festet';
};
const resizeBoundSuffix$2 = (atMinimum, atMaximum) => {
    if (atMinimum) {
        return ' (minimum)';
    }
    if (atMaximum) {
        return ' (maksimum)';
    }
    return '';
};
const renderToneLabel$1 = (tone) => {
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

/** Built-in Norwegian Bokmål companion-control labels shipped with `ng-advanced-table/locale`. */
const NAT_NB_CONTROLS_LOCALE_LABELS = {
    search: {
        label: 'Søk i rader',
        placeholder: 'Søk i rader'
    },
    columnVisibility: {
        label: 'Kolonner',
        groupAriaLabel: 'Kolonnesynlighet',
        accessibilityLabels: {
            visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synlige`,
            toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
                const state = visibilityState === 'visible' ? 'er synlig' : 'er skjult';
                const action = toggleAction === 'hide' ? 'Skjul' : 'Vis';
                return `${columnLabel} ${state}. ${action} kolonnen`;
            },
            columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Vist' : 'Skjult')
        }
    },
    pageSize: {
        groupAriaLabel: 'Rader per side',
        accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$1(pageSizeValue)}`,
            pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows$1(pageSizeValue)} per side`
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
                const sortDescription = `${label} er sortert i ${sortDirection$1(sortState)} rekkefølge`;
                return sortPriority !== null && sortCount > 1
                    ? `${sortDescription}, sorteringsprioritet ${sortPriority} av ${sortCount}. Endre sortering`
                    : `${sortDescription}. Endre sortering`;
            },
            menuButton: ({ label }) => `Åpne kolonnehandlinger for kolonnen ${label}`,
            menuLabel: ({ label }) => `Kolonnehandlinger for kolonnen ${label}`,
            pinButton: ({ label, toggleAction, pinSide }) => {
                const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';
                return `${action} kolonnen ${label} ${pinSideText$1(pinSide, toggleAction)}`;
            },
            pinButtonText: ({ pinSide, toggleAction }) => {
                const action = toggleAction === 'unpin' ? 'Løsne' : 'Fest';
                return `${action} ${pinSideText$1(pinSide, toggleAction)}`;
            },
            moveButton: ({ label, direction }) => `Flytt kolonnen ${label} ${side$1(direction)}`,
            moveButtonText: ({ direction }) => `Flytt ${side$1(direction)}`
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

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS$1 = [
    { value: 'all', label: 'Alle rader', description: 'Vis alle målte rader' },
    { value: 'fast', label: 'Rask', description: 'Rader som ble gjengitt raskt' },
    { value: 'watch', label: 'Følg med', description: 'Rader som er verdt å følge med på' },
    { value: 'slow', label: 'Treg', description: 'Rader som ble gjengitt tregt' }
];
/** Built-in Norwegian Bokmål render-metrics labels shipped with `ng-advanced-table/locale`. */
const NAT_NB_RENDER_METRICS_LOCALE_LABELS = {
    renderMetrics: {
        filter: {
            heading: 'Gjengivelseshastighet',
            groupAriaLabel: 'Radenes gjengivelseshastighet',
            idleCaption: 'Viser den siste opptegningstiden for rader på gjeldende side.',
            rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows$1(rowCountValue)}`,
            options: FILTER_OPTIONS$1
        },
        panel: {
            ariaLabel: 'Måling av radgjengivelse',
            toneLabel: renderToneLabel$1,
            idleSummary: 'inaktiv',
            rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows$1(rowCountValue)}`,
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

/**
 * Built-in Norwegian Bokmål accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
const listKeyboardInstructions$2 = 'Bruk Pil opp og Pil ned for å flytte mellom elementer. Trykk Enter for å bruke kontrollene i et element, ' +
    'Tab for å flytte fremover mellom dem, Skift+Tab for å flytte bakover og Esc for å gå tilbake til elementet.';
const listSummary$2 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
    const fields = `${visibleColumnsText} ${visibleFields$1(visibleColumnsValue)}`;
    let summary;
    if (visibleRowsValue === 0) {
        summary = `Ingen elementer vises nå. ${fields}.`;
    }
    else if (totalRowsValue !== visibleRowsValue) {
        summary = `Viser ${visibleRowsText} av ${totalRowsText} ${items(totalRowsValue)} fordelt på ${fields}.`;
    }
    else {
        summary = `Viser ${visibleRowsText} ${items(visibleRowsValue)} fordelt på ${fields}.`;
    }
    if (paginationState === 'enabled') {
        summary += ` Side ${pageText} av ${pageCountText}.`;
    }
    return summary;
};
const listColumnVisibilityChange$2 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `${visibleColumnsText} ${visibleFields$1(visibleColumnsValue)}.`;
    if (changedColumns.length === 1) {
        const [column] = changedColumns;
        return `Feltet ${column.label} ${visibilityVerb$1(column.visibilityState)}. ${summary}`;
    }
    return summary;
};
const listPageSizeChange$2 = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Viser ${pageSizeText} ${items(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`;
const listPageChange$2 = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${items(visibleRowsValue)} vises.`;
const listSubHeaderRow$2 = ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';
    return `${groupLabel}, ${rowCountText} ${items(rowCountValue)}.`;
};

/** Built-in Norwegian Bokmål table labels shipped with `ng-advanced-table/locale`. */
const NAT_NB_LOCALE_LABELS = {
    accessibilityText: {
        listKeyboardInstructions: listKeyboardInstructions$2,
        listSummary: listSummary$2,
        listColumnVisibilityChange: listColumnVisibilityChange$2,
        listPageSizeChange: listPageSizeChange$2,
        listPageChange: listPageChange$2,
        listSubHeaderRow: listSubHeaderRow$2,
        keyboardInstructions: 'Bruk piltastene for å flytte mellom celler. Hvis en celle bare inneholder én knapp eller én lenke, får knappen eller lenken fokus ' +
            'direkte. I celler med flere kontroller trykker du Enter for å bruke dem, Tab for å flytte fremover mellom ' +
            'dem, Skift+Tab for å flytte bakover og Esc for å gå tilbake til cellen.',
        emptyState: 'Ingen rader samsvarer med gjeldende visning.',
        loadingState: 'Laster rader.',
        errorState: 'Radene kunne ikke lastes.',
        reorderKeyboardInstructions: 'Trykk Ctrl+Skift+Venstrepil eller Ctrl+Skift+Høyrepil for å endre rekkefølgen på kolonner innenfor området ' +
            'de er festet i. På macOS trykker du Kommando+Skift+Venstrepil eller Kommando+Skift+Høyrepil.',
        resizeKeyboardInstructions: 'Når fokus er på en kolonneoverskrift der bredden kan endres, trykker du Alt sammen med Venstrepil eller Høyrepil for å ' +
            'endre kolonnens bredde, og Alt sammen med Home eller End for å hoppe til minste eller største bredde.',
        tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
            const columns = `${visibleColumnsText} ${visibleColumns$1(visibleColumnsValue)}`;
            let summary;
            if (visibleRowsValue === 0) {
                summary = `Ingen rader vises nå. ${columns}.`;
            }
            else if (totalRowsValue !== visibleRowsValue) {
                summary = `Viser ${visibleRowsText} av ${totalRowsText} ${rows$1(totalRowsValue)} fordelt på ${columns}.`;
            }
            else {
                summary = `Viser ${visibleRowsText} ${rows$1(visibleRowsValue)} fordelt på ${columns}.`;
            }
            if (paginationState === 'enabled') {
                summary += ` Side ${pageText} av ${pageCountText}.`;
            }
            return summary;
        },
        sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
            if (!columnLabel || sortState === 'none')
                return 'Sorteringen er fjernet.';
            if (sortedColumns.length > 1) {
                const parts = sortedColumns.map((column) => `${column.label} ${sortDirection$1(column.sortState)}`);
                return `Sortert etter ${parts.slice(0, -1).join(', ')} og deretter ${parts.at(-1)}.`;
            }
            return `Sortert etter ${columnLabel} ${sortDirection$1(sortState)}.`;
        },
        filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
            if (visibleRowsValue === 0) {
                return query ? `Ingen rader samsvarer med "${query}".` : 'Ingen rader samsvarer med gjeldende filtre.';
            }
            if (query) {
                return `Viser ${visibleRowsText} samsvarende ${rows$1(visibleRowsValue)} for "${query}".`;
            }
            if (filterState === 'column') {
                return `Viser ${visibleRowsText} ${filteredRows$1(visibleRowsValue)}.`;
            }
            return `Viser alle ${visibleRowsText} ${rows$1(visibleRowsValue)}.`;
        },
        columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
            const summary = `${visibleColumnsText} ${visibleColumns$1(visibleColumnsValue)}.`;
            if (changedColumns.length === 1) {
                const [column] = changedColumns;
                return `Kolonnen ${column.label} ${visibilityVerb$1(column.visibilityState)}. ${summary}`;
            }
            return summary;
        },
        pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Viser ${pageSizeText} ${rows$1(pageSizeValue)} per side. Side ${pageText} av ${pageCountText}.`,
        pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Side ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows$1(visibleRowsValue)} vises.`,
        columnReorder: ({ label, positionText, totalText, zone }) => `Kolonnen ${label} er flyttet til posisjon ${positionText} av ${totalText} ${columnZone$1(zone)}.`,
        columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolonnen ${label} har bredden ${widthText} piksler${resizeBoundSuffix$2(atMinimum, atMaximum)}.`,
        selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
            if (selectedCountValue === 0) {
                return 'Merkingen er fjernet.';
            }
            if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
                return `Alle ${totalRowsText} ${selectedRows$1(totalRowsValue)}.`;
            }
            return `${selectedCountText} ${selectedRows$1(selectedCountValue)}.`;
        },
        subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
            const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Gruppe';
            return `${groupLabel}, ${rowCountText} ${rows$1(rowCountValue)}.`;
        },
        placeholderRow: () => 'Laster.'
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};

/* Shared Swedish (`sv`) wording helpers for the built-in Swedish locale dictionaries. */
const rows = (count) => (count === 1 ? 'rad' : 'rader');
const visibleColumns = (count) => (count === 1 ? 'synlig kolumn' : 'synliga kolumner');
const visibleFields = (count) => (count === 1 ? 'synligt fält' : 'synliga fält');
const filteredRows = (count) => (count === 1 ? 'filtrerad rad' : 'filtrerade rader');
const selectedRows = (count) => (count === 1 ? 'rad är markerad' : 'rader är markerade');
const measuredRows = (count) => (count === 1 ? 'rad mätt' : 'rader mätta');
const measuredVisibleRows = (count) => (count === 1 ? 'synlig rad mätt' : 'synliga rader mätta');
const sortDirection = (sortState) => (sortState === 'ascending' ? 'stigande' : 'fallande');
const side = (target) => (target === 'left' ? 'till vänster' : 'till höger');
const pinSideText = (pinSide, toggleAction) => `${toggleAction === 'unpin' ? 'från' : 'till'} ${pinSide === 'left' ? 'vänster' : 'höger'}`;
const visibilityVerb = (visibilityState) => (visibilityState === 'visible' ? 'visas' : 'döljs');
const columnZone = (zone) => {
    if (zone === 'left') {
        return 'bland kolumner som är fästa till vänster';
    }
    if (zone === 'right') {
        return 'bland kolumner som är fästa till höger';
    }
    return 'bland kolumner som inte är fästa';
};
const resizeBoundSuffix$1 = (atMinimum, atMaximum) => {
    if (atMinimum) {
        return ' (minimum)';
    }
    if (atMaximum) {
        return ' (maximum)';
    }
    return '';
};
const renderToneLabel = (tone) => {
    switch (tone) {
        case 'fast':
            return 'Snabb';
        case 'watch':
            return 'Bevaka';
        case 'slow':
            return 'Långsam';
        case 'idle':
            return 'Inaktiv';
    }
};

/** Built-in Swedish companion-control labels shipped with `ng-advanced-table/locale`. */
const NAT_SV_CONTROLS_LOCALE_LABELS = {
    search: {
        label: 'Sök rader',
        placeholder: 'Sök rader'
    },
    columnVisibility: {
        label: 'Kolumner',
        groupAriaLabel: 'Kolumnsynlighet',
        accessibilityLabels: {
            visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} synliga`,
            toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => {
                const state = visibilityState === 'visible' ? 'är synlig' : 'är dold';
                const action = toggleAction === 'hide' ? 'Dölj' : 'Visa';
                return `${columnLabel} ${state}. ${action} kolumnen`;
            },
            columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Synlig' : 'Dold')
        }
    },
    pageSize: {
        groupAriaLabel: 'Rader per sida',
        accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)}`,
            pageSizeOptionAriaLabel: ({ pageSizeValue, pageSizeText }) => `${pageSizeText} ${rows(pageSizeValue)} per sida`
        }
    },
    pager: {
        groupAriaLabel: 'Sidnavigering i tabell',
        accessibilityLabels: {
            previousPageAriaLabel: 'Föregående sida',
            nextPageAriaLabel: 'Nästa sida',
            pageIndicator: ({ pageText, pageCountText }) => `Sida ${pageText} av ${pageCountText}`
        }
    },
    scrollControl: {
        groupAriaLabel: 'Vågrät rullning i tabell',
        accessibilityLabels: {
            scrollLeftAriaLabel: 'Rulla tabellen åt vänster',
            scrollRightAriaLabel: 'Rulla tabellen åt höger',
            scrollPositionAriaLabel: 'Vågrätt rullningsläge',
            scrollPositionText: ({ percentageText }) => `${percentageText} % rullat`
        }
    },
    headerActions: {
        accessibilityLabels: {
            sortButton: ({ label, sortState, sortPriority, sortCount }) => {
                if (sortState === 'none') {
                    return `Sortera efter ${label}`;
                }
                const sortDescription = `${label} är sorterad i ${sortDirection(sortState)} ordning`;
                return sortPriority !== null && sortCount > 1
                    ? `${sortDescription}, sorteringsprioritet ${sortPriority} av ${sortCount}. Ändra sortering`
                    : `${sortDescription}. Ändra sortering`;
            },
            menuButton: ({ label }) => `Öppna kolumnåtgärder för kolumnen ${label}`,
            menuLabel: ({ label }) => `Kolumnåtgärder för kolumnen ${label}`,
            pinButton: ({ label, toggleAction, pinSide }) => {
                const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';
                return `${action} kolumnen ${label} ${pinSideText(pinSide, toggleAction)}`;
            },
            pinButtonText: ({ pinSide, toggleAction }) => {
                const action = toggleAction === 'unpin' ? 'Lossa' : 'Fäst';
                return `${action} ${pinSideText(pinSide, toggleAction)}`;
            },
            moveButton: ({ label, direction }) => `Flytta kolumnen ${label} ${side(direction)}`,
            moveButtonText: ({ direction }) => `Flytta ${side(direction)}`
        }
    },
    toolbar: {
        toolbarLabel: 'Verktygsfält för tabell'
    },
    selection: {
        columnLabel: 'Markering',
        accessibilityLabels: {
            selectAllAriaLabel: 'Markera alla rader',
            selectRowAriaLabel: ({ rowId }) => `Markera rad ${rowId}`
        }
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};

/* Only the label and description are translated: the option values are the filter component's contract. */
const FILTER_OPTIONS = [
    { value: 'all', label: 'Alla rader', description: 'Visa alla mätta rader' },
    { value: 'fast', label: 'Snabb', description: 'Rader som renderades snabbt' },
    { value: 'watch', label: 'Bevaka', description: 'Rader som är värda att bevaka' },
    { value: 'slow', label: 'Långsam', description: 'Rader som renderades långsamt' }
];
/** Built-in Swedish render-metrics labels shipped with `ng-advanced-table/locale`. */
const NAT_SV_RENDER_METRICS_LOCALE_LABELS = {
    renderMetrics: {
        filter: {
            heading: 'Renderingshastighet',
            groupAriaLabel: 'Radernas renderingshastighet',
            idleCaption: 'Visar den senaste uppritningstiden för rader på den aktuella sidan.',
            rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredVisibleRows(rowCountValue)}`,
            options: FILTER_OPTIONS
        },
        panel: {
            ariaLabel: 'Mätning av radrendering',
            toneLabel: renderToneLabel,
            idleSummary: 'inaktiv',
            rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${measuredRows(rowCountValue)}`,
            duration: ({ durationMsText }) => `${durationMsText} ms`
        },
        column: {
            header: 'Rendering',
            pendingLabel: 'Väntar',
            unitSuffix: ' ms'
        }
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};

/**
 * Built-in Swedish accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Exported entry by entry and
 * referenced by name; the English `accessibility-list.const.ts` records why
 * they are never spread into the dictionary.
 */
const listKeyboardInstructions$1 = 'Använd Uppil och Nedpil för att flytta mellan objekt. Tryck på Retur för att använda kontrollerna i ett ' +
    'objekt, Tabb för att flytta framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till ' +
    'objektet.';
const listSummary$1 = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
    const fields = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}`;
    let summary;
    if (visibleRowsValue === 0) {
        summary = `Inga objekt visas just nu. ${fields}.`;
    }
    else if (totalRowsValue !== visibleRowsValue) {
        summary = `Visar ${visibleRowsText} av ${totalRowsText} objekt i ${fields}.`;
    }
    else {
        summary = `Visar ${visibleRowsText} objekt i ${fields}.`;
    }
    if (paginationState === 'enabled') {
        summary += ` Sida ${pageText} av ${pageCountText}.`;
    }
    return summary;
};
const listColumnVisibilityChange$1 = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    const summary = `${visibleColumnsText} ${visibleFields(visibleColumnsValue)}.`;
    if (changedColumns.length === 1) {
        const [column] = changedColumns;
        return `Fältet ${column.label} ${visibilityVerb(column.visibilityState)}. ${summary}`;
    }
    return summary;
};
const listPageSizeChange$1 = ({ pageCountText, pageSizeText, pageText }) => `Visar ${pageSizeText} objekt per sida. Sida ${pageText} av ${pageCountText}.`;
const listPageChange$1 = ({ pageCountText, pageText, visibleRowsText }) => `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} objekt visas.`;
const listSubHeaderRow$1 = ({ valueText, rowCountText }) => {
    const groupLabel = valueText.trim() ? `Gruppen ${valueText}` : 'Grupp';
    return `${groupLabel}, ${rowCountText} objekt.`;
};

/** Built-in Swedish table labels shipped with `ng-advanced-table/locale`. */
const NAT_SV_LOCALE_LABELS = {
    accessibilityText: {
        listKeyboardInstructions: listKeyboardInstructions$1,
        listSummary: listSummary$1,
        listColumnVisibilityChange: listColumnVisibilityChange$1,
        listPageSizeChange: listPageSizeChange$1,
        listPageChange: listPageChange$1,
        listSubHeaderRow: listSubHeaderRow$1,
        keyboardInstructions: 'Använd piltangenterna för att flytta mellan celler. Om en cell bara innehåller en knapp eller en länk får knappen eller länken ' +
            'fokus direkt. I celler med flera kontroller trycker du på Retur för att använda dem, Tabb för att flytta ' +
            'framåt mellan dem, Skift+Tabb för att flytta bakåt och Esc för att återgå till cellen.',
        emptyState: 'Inga rader matchar den aktuella vyn.',
        loadingState: 'Läser in rader.',
        errorState: 'Raderna kunde inte läsas in.',
        reorderKeyboardInstructions: 'Tryck på Ctrl+Skift+Vänsterpil eller Ctrl+Skift+Högerpil för att ordna om kolumner inom det område de är ' +
            'fästa i. På macOS trycker du på Kommando+Skift+Vänsterpil eller Kommando+Skift+Högerpil.',
        resizeKeyboardInstructions: 'På en kolumnrubrik som går att ändra storlek på trycker du på Alt tillsammans med Vänsterpil eller Högerpil ' +
            'för att ändra kolumnens bredd, och Alt tillsammans med Home eller End för att hoppa till dess minsta eller ' +
            'största bredd.',
        tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
            const columns = `${visibleColumnsText} ${visibleColumns(visibleColumnsValue)}`;
            let summary;
            if (visibleRowsValue === 0) {
                summary = `Inga rader visas just nu. ${columns}.`;
            }
            else if (totalRowsValue !== visibleRowsValue) {
                summary = `Visar ${visibleRowsText} av ${totalRowsText} ${rows(totalRowsValue)} i ${columns}.`;
            }
            else {
                summary = `Visar ${visibleRowsText} ${rows(visibleRowsValue)} i ${columns}.`;
            }
            if (paginationState === 'enabled') {
                summary += ` Sida ${pageText} av ${pageCountText}.`;
            }
            return summary;
        },
        sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
            if (!columnLabel || sortState === 'none')
                return 'Sorteringen är rensad.';
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
        pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Visar ${pageSizeText} ${rows(pageSizeValue)} per sida. Sida ${pageText} av ${pageCountText}.`,
        pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Sida ${pageText} av ${pageCountText}. ${visibleRowsText} ${rows(visibleRowsValue)} visas.`,
        columnReorder: ({ label, positionText, totalText, zone }) => `Kolumnen ${label} har flyttats till position ${positionText} av ${totalText} ${columnZone(zone)}.`,
        columnResize: ({ label, widthText, atMinimum, atMaximum }) => `Kolumnen ${label} har bredden ${widthText} pixlar${resizeBoundSuffix$1(atMinimum, atMaximum)}.`,
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

/** Appends a plural `s` unless the count is exactly one. */
const pluralize = (label, count) => (count === 1 ? label : `${label}s`);

/**
 * Built-in English accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Each entry is exported on its
 * own and referenced by name from the dictionary rather than spread into it:
 * an object spread is not provably side-effect free, so a bundler keeps the
 * whole dictionary even for an application that never registers this locale.
 */
const listSubHeaderRow = ({ valueText, rowCountValue, rowCountText }) => {
    const groupLabel = valueText.trim() ? `${valueText} group` : 'Group';
    return `${groupLabel}, ${rowCountText} ${pluralize('item', rowCountValue)}.`;
};
const listKeyboardInstructions = 'Use the Up and Down arrow keys to move between items. Press Enter to interact with the controls ' +
    'inside an item, Tab to move forward between them, Shift+Tab to move backward, and Escape to ' +
    'return to the item.';
const listSummary = ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
    let summary;
    // The subset phrasing fires whenever the shown items are fewer than the
    // represented total — filtered views, paginated pages, and remote windows
    // alike — so the summary can never contradict the grid's aria-rowcount.
    if (visibleRowsValue === 0) {
        summary = `No items are currently shown. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }
    else if (totalRowsValue !== visibleRowsValue) {
        summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize('item', totalRowsValue)} across ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }
    else {
        summary = `Showing ${visibleRowsText} ${pluralize('item', visibleRowsValue)} across ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }
    if (paginationState === 'enabled') {
        summary += ` Page ${pageText} of ${pageCountText}.`;
    }
    return summary;
};
const listColumnVisibilityChange = ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
    if (changedColumns.length === 1) {
        const [column] = changedColumns;
        return `${column.label} field ${column.visibilityState === 'visible' ? 'shown' : 'hidden'}. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    }
    return `${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
};
const listPageSizeChange = ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Showing ${pageSizeText} ${pluralize('item', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`;
const listPageChange = ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('item', visibleRowsValue)} shown.`;

const describeColumnZone = (zone) => {
    if (zone === 'left') {
        return 'left pinned';
    }
    if (zone === 'right') {
        return 'right pinned';
    }
    return 'unpinned';
};
const resizeBoundSuffix = (atMinimum, atMaximum) => {
    if (atMinimum) {
        return ' (minimum)';
    }
    if (atMaximum) {
        return ' (maximum)';
    }
    return '';
};
/** Built-in English labels shipped with the table locale package. */
const NAT_EN_LOCALE_LABELS = {
    accessibilityText: {
        listSubHeaderRow,
        listKeyboardInstructions,
        listSummary,
        listColumnVisibilityChange,
        listPageSizeChange,
        listPageChange,
        keyboardInstructions: 'Use arrow keys to move between cells. A cell whose only content is a single button or link ' +
            'focuses it directly. In cells with several controls, press Enter to interact with them, ' +
            'Tab to move forward between them, Shift+Tab to move backward, and Escape to return to the cell.',
        emptyState: 'No rows match the current view.',
        loadingState: 'Loading rows.',
        errorState: 'Rows could not be loaded.',
        reorderKeyboardInstructions: 'Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.',
        resizeKeyboardInstructions: 'On a resizable column header, press Alt with Left or Right Arrow to resize the column, ' +
            'and Alt with Home or End to jump to its minimum or maximum width.',
        tableSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
            let summary;
            // The subset phrasing fires whenever the shown rows are fewer than the
            // represented total — filtered views, paginated pages, and remote
            // windows alike — so the summary can never contradict aria-rowcount.
            if (visibleRowsValue === 0) {
                summary = `No rows are currently shown. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
            }
            else if (totalRowsValue !== visibleRowsValue) {
                summary = `Showing ${visibleRowsText} of ${totalRowsText} ${pluralize('row', totalRowsValue)} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
            }
            else {
                summary = `Showing ${visibleRowsText} ${pluralize('row', visibleRowsValue)} across ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
            }
            if (paginationState === 'enabled') {
                summary += ` Page ${pageText} of ${pageCountText}.`;
            }
            return summary;
        },
        sortingChange: ({ columnLabel, sortState, sortedColumns }) => {
            if (!columnLabel || sortState === 'none')
                return 'Sorting cleared.';
            if (sortedColumns.length > 1) {
                const parts = sortedColumns.map((column) => `${column.label} ${column.sortState}`);
                return `Sorted by ${parts.slice(0, -1).join(', ')}, then ${parts.at(-1)}.`;
            }
            return `Sorted by ${columnLabel} ${sortState}.`;
        },
        filteringChange: ({ filterState, query, visibleRowsValue, visibleRowsText }) => {
            if (visibleRowsValue === 0) {
                return query ? `No rows match "${query}".` : 'No rows match the current filters.';
            }
            if (query) {
                return `Showing ${visibleRowsText} matching ${pluralize('row', visibleRowsValue)} for "${query}".`;
            }
            if (filterState === 'column') {
                return `Showing ${visibleRowsText} filtered ${pluralize('row', visibleRowsValue)}.`;
            }
            return `Showing all ${visibleRowsText} ${pluralize('row', visibleRowsValue)}.`;
        },
        columnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
            if (changedColumns.length === 1) {
                const [column] = changedColumns;
                return `${column.label} column ${column.visibilityState === 'visible' ? 'shown' : 'hidden'}. ${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
            }
            return `${visibleColumnsText} visible ${pluralize('column', visibleColumnsValue)}.`;
        },
        pageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Showing ${pageSizeText} ${pluralize('row', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`,
        pageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('row', visibleRowsValue)} shown.`,
        columnReorder: ({ label, positionText, totalText, zone }) => `Moved ${label} column to position ${positionText} of ${totalText} in the ${describeColumnZone(zone)} region.`,
        columnResize: ({ label, widthText, atMinimum, atMaximum }) => `${label} column width ${widthText} pixels${resizeBoundSuffix(atMinimum, atMaximum)}.`,
        selectionChange: ({ selectedCountValue, selectedCountText, totalRowsValue, totalRowsText }) => {
            if (selectedCountValue === 0) {
                return 'Selection cleared.';
            }
            if (selectedCountValue >= totalRowsValue && totalRowsValue > 0) {
                return `All ${totalRowsText} ${pluralize('row', totalRowsValue)} selected.`;
            }
            return `${selectedCountText} ${pluralize('row', selectedCountValue)} selected.`;
        },
        subHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
            const groupLabel = valueText.trim() ? `${valueText} group` : 'Group';
            return `${groupLabel}, ${rowCountText} ${pluralize('row', rowCountValue)}.`;
        },
        // Deliberately position-free: the grid already announces the row's
        // position through aria-rowindex/aria-rowcount, and those are counted in
        // grid coordinates (header row included) — restating the position here
        // would read out a second, off-by-one number for the same row. The context
        // still carries position and total for consumers who override this.
        placeholderRow: () => 'Loading.'
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};
/**
 * Table locale registry shipped by `ng-advanced-table/locale`.
 *
 * English only. The translated dictionaries ship as individual exports that
 * `provideNatTableLocales()` registers on request, so an app bundles just the
 * languages it uses.
 */
const NAT_TABLE_BUILT_IN_LOCALES = {
    [NAT_EN_LOCALE_ID]: NAT_EN_LOCALE_LABELS
};

const describeSortState = (sortState) => sortState === 'ascending' ? 'in ascending order' : 'in descending order';
/** Built-in English labels shipped with `ng-advanced-table/locale`. */
const NAT_EN_CONTROLS_LOCALE_LABELS = {
    search: {
        label: 'Search rows',
        placeholder: 'Search rows'
    },
    columnVisibility: {
        label: 'Columns',
        groupAriaLabel: 'Column visibility',
        accessibilityLabels: {
            visibilitySummary: ({ visibleColumnCountText, totalColumnCountText }) => `${visibleColumnCountText} / ${totalColumnCountText} visible`,
            toggleColumnAriaLabel: ({ columnLabel, toggleAction, visibilityState }) => `${columnLabel} ${visibilityState === 'visible' ? 'shown' : 'hidden'}. ${toggleAction === 'hide' ? 'Hide' : 'Show'} column`,
            columnState: ({ visibilityState }) => (visibilityState === 'visible' ? 'Shown' : 'Hidden')
        }
    },
    pageSize: {
        groupAriaLabel: 'Rows per page',
        accessibilityLabels: {
            pageSizeOptionText: ({ pageSizeText }) => `${pageSizeText} rows`,
            pageSizeOptionAriaLabel: ({ pageSizeText }) => `${pageSizeText} rows per page`
        }
    },
    pager: {
        groupAriaLabel: 'Table pagination',
        accessibilityLabels: {
            previousPageAriaLabel: 'Previous page',
            nextPageAriaLabel: 'Next page',
            pageIndicator: ({ pageText, pageCountText }) => `Page ${pageText} of ${pageCountText}`
        }
    },
    scrollControl: {
        groupAriaLabel: 'Table horizontal scroll',
        accessibilityLabels: {
            scrollLeftAriaLabel: 'Scroll table left',
            scrollRightAriaLabel: 'Scroll table right',
            scrollPositionAriaLabel: 'Horizontal scroll position',
            scrollPositionText: ({ percentageText }) => `${percentageText}% scrolled`
        }
    },
    headerActions: {
        accessibilityLabels: {
            // The visible priority badge is aria-hidden, so fold the ordinal into the
            // accessible name; otherwise AT cannot tell primary from secondary sort.
            sortButton: ({ label, sortState, sortPriority, sortCount }) => {
                if (sortState === 'none') {
                    return `Sort by ${label}`;
                }
                const sortDescription = `${label} sorted ${describeSortState(sortState)}`;
                return sortPriority !== null && sortCount > 1
                    ? `${sortDescription}, sort priority ${sortPriority} of ${sortCount}. Change sorting`
                    : `${sortDescription}. Change sorting`;
            },
            menuButton: ({ label }) => `Open column actions for ${label} column`,
            menuLabel: ({ label }) => `Column actions for ${label} column`,
            pinButton: ({ label, toggleAction, pinSide }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}: ${label} column`,
            pinButtonText: ({ pinSide, toggleAction }) => `${toggleAction === 'unpin' ? 'Unpin' : 'Pin'} ${pinSide}`,
            moveButton: ({ label, direction }) => `Move ${label} column ${direction}`,
            moveButtonText: ({ direction }) => `Move ${direction}`
        }
    },
    toolbar: {
        toolbarLabel: 'Table toolbar'
    },
    selection: {
        columnLabel: 'Selection',
        accessibilityLabels: {
            selectAllAriaLabel: 'Select all rows',
            selectRowAriaLabel: ({ rowId }) => `Select row ${rowId}`
        }
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};
/**
 * Companion components locale registry shipped by `ng-advanced-table/locale`.
 *
 * English only. The translated dictionaries ship as individual exports that
 * `provideNatTableControlsLocales()` registers on request, so an app bundles just the
 * languages it uses.
 */
const NAT_TABLE_BUILT_IN_CONTROLS_LOCALES = {
    [NAT_EN_LOCALE_ID]: NAT_EN_CONTROLS_LOCALE_LABELS
};

const RENDER_METRICS_FILTER_OPTIONS = [
    { value: 'all', label: 'All rows', description: 'Show every measured row' },
    { value: 'fast', label: 'Fast', description: 'Rows that rendered quickly' },
    { value: 'watch', label: 'Watch', description: 'Rows worth watching' },
    { value: 'slow', label: 'Slow', description: 'Rows that rendered slowly' }
];
const getRenderToneLabel = (tone) => {
    switch (tone) {
        case 'fast':
            return 'Fast';
        case 'watch':
            return 'Watch';
        case 'slow':
            return 'Slow';
        case 'idle':
            return 'Idle';
    }
};
/** Built-in English labels shipped with `ng-advanced-table/locale`. */
const NAT_EN_RENDER_METRICS_LOCALE_LABELS = {
    renderMetrics: {
        filter: {
            heading: 'Render speed',
            groupAriaLabel: 'Row render speed',
            idleCaption: 'Captures the latest row paint time for the current page.',
            rowSampleCaption: ({ rowCountValue, rowCountText }) => `${rowCountText} visible ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
            options: RENDER_METRICS_FILTER_OPTIONS
        },
        panel: {
            ariaLabel: 'Row render sample',
            toneLabel: getRenderToneLabel,
            idleSummary: 'idle',
            rowSampleSummary: ({ rowCountValue, rowCountText }) => `${rowCountText} ${rowCountValue === 1 ? 'row' : 'rows'} sampled`,
            duration: ({ durationMsText }) => `${durationMsText} ms`
        },
        column: {
            header: 'Render',
            pendingLabel: 'Pending',
            unitSuffix: ' ms'
        }
    },
    formatNumber: DEFAULT_NUMBER_FORMATTER
};
/**
 * Render-metrics locale registry shipped by `ng-advanced-table/locale`.
 *
 * English only. The translated dictionaries ship as individual exports that
 * `provideNatTableRenderMetricsLocales()` registers on request, so an app bundles just the
 * languages it uses.
 */
const NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES = {
    [NAT_EN_LOCALE_ID]: NAT_EN_RENDER_METRICS_LOCALE_LABELS
};

const isSignalOf = (value) => isSignal(value);
const resolveNatTableProviderConfig = (config) => {
    if (isSignalOf(config)) {
        return config;
    }
    const resolved = typeof config === 'function' ? config() : config;
    return isSignalOf(resolved) ? resolved : computed(() => resolved);
};
const createLiveConfigFacade = (config) => ({
    get locales() {
        return config().locales;
    }
});
const mapNatTableProviderConfig = (config, map) => {
    if (isSignalOf(config)) {
        return computed(() => map(config()));
    }
    if (typeof config === 'function') {
        return () => {
            const resolved = config();
            return isSignalOf(resolved) ? computed(() => map(resolved())) : map(resolved);
        };
    }
    return map(config);
};
const createNatTableMergedProvider = (token, 
// Adding another top-level config key makes this parameter `never`, forcing the facade contract to be updated.
defaultConfig, config, mergeConfig) => {
    return [
        {
            provide: token,
            deps: [[new Optional(), new SkipSelf(), token]],
            useFactory: (parent) => {
                const source = resolveNatTableProviderConfig(config);
                const merged = computed(() => mergeConfig(parent ?? defaultConfig, source()), /* @ts-ignore */
                ...(ngDevMode ? [{ debugName: "merged" }] : /* istanbul ignore next */ []));
                return createLiveConfigFacade(merged);
            }
        }
    ];
};

/*
 * RFC 4647 §2.1: language tags are not case sensitive. `DA-DK` therefore has
 * to reach a registered `da`, the same way `Intl.NumberFormat` already
 * formats it as Danish. An exact key still wins, so a registry holding two
 * spellings of one id resolves the one the caller asked for.
 */
const findRegisteredId = (locales, candidate) => {
    if (locales[candidate] !== undefined) {
        return candidate;
    }
    const folded = candidate.toLowerCase();
    return Object.keys(locales).find((id) => id.toLowerCase() === folded && locales[id] !== undefined) ?? null;
};
/**
 * RFC 4647 §3.4 lookup: the best registered match for a locale id, or `null`.
 *
 * An exact match always wins. Otherwise the id is truncated one subtag at a
 * time, so `da-DK` resolves the registered `da` dictionary — Angular's own
 * `LOCALE_ID` is a BCP 47 tag, so applications bind region-tagged ids, and
 * `Intl.NumberFormat` already negotiates them. Truncation skips a trailing
 * singleton subtag (`de-DE-u-co-phonebk` → `de-DE`), which is never a language
 * match on its own. Matching ignores case. Macrolanguage pairs such as `no`
 * and `nb` share no prefix and still need registering under both ids.
 */
const matchNatTableLocaleId = (locales, localeId) => {
    if (!locales) {
        return null;
    }
    let candidate = localeId;
    while (candidate.length > 0) {
        const registeredId = findRegisteredId(locales, candidate);
        if (registeredId !== null) {
            return registeredId;
        }
        const lastSeparator = candidate.lastIndexOf('-');
        if (lastSeparator < 0) {
            return null;
        }
        candidate = candidate.slice(0, lastSeparator);
        const singletonAt = candidate.lastIndexOf('-');
        if (singletonAt >= 0 && candidate.length - singletonAt === 2) {
            candidate = candidate.slice(0, singletonAt);
        }
    }
    return null;
};

/** Merges the description and keyboard instruction text, override values winning. */
const mergeAccessibilityInstructions = (parent, override) => ({
    description: override?.description ?? parent?.description,
    keyboardInstructions: override?.keyboardInstructions ?? parent?.keyboardInstructions,
    listKeyboardInstructions: override?.listKeyboardInstructions ?? parent?.listKeyboardInstructions
});
/** Merges the body state messages, override values winning. */
const mergeAccessibilityStateText = (parent, override) => ({
    emptyState: override?.emptyState ?? parent?.emptyState,
    loadingState: override?.loadingState ?? parent?.loadingState,
    errorState: override?.errorState ?? parent?.errorState
});
/** Merges the reorder and resize instruction text, override values winning. */
const mergeAccessibilityGestureText = (parent, override) => ({
    reorderKeyboardInstructions: override?.reorderKeyboardInstructions ?? parent?.reorderKeyboardInstructions,
    resizeKeyboardInstructions: override?.resizeKeyboardInstructions ?? parent?.resizeKeyboardInstructions
});
/** Merges the summary and sort/filter announcement formatters, override values winning. */
const mergeAccessibilitySummaryAnnouncers = (parent, override) => ({
    tableSummary: override?.tableSummary ?? parent?.tableSummary,
    listSummary: override?.listSummary ?? parent?.listSummary,
    sortingChange: override?.sortingChange ?? parent?.sortingChange,
    filteringChange: override?.filteringChange ?? parent?.filteringChange
});
/** Merges the visibility and pagination announcement formatters (grid and list variants), override values winning. */
const mergeAccessibilityPaginationAnnouncers = (parent, override) => ({
    columnVisibilityChange: override?.columnVisibilityChange ?? parent?.columnVisibilityChange,
    listColumnVisibilityChange: override?.listColumnVisibilityChange ?? parent?.listColumnVisibilityChange,
    pageSizeChange: override?.pageSizeChange ?? parent?.pageSizeChange,
    listPageSizeChange: override?.listPageSizeChange ?? parent?.listPageSizeChange,
    pageChange: override?.pageChange ?? parent?.pageChange,
    listPageChange: override?.listPageChange ?? parent?.listPageChange
});
/** Merges the column and selection announcement formatters, override values winning. */
const mergeAccessibilityColumnAnnouncers = (parent, override) => ({
    columnReorder: override?.columnReorder ?? parent?.columnReorder,
    columnResize: override?.columnResize ?? parent?.columnResize,
    selectionChange: override?.selectionChange ?? parent?.selectionChange
});
/** Merges the sub-header (grid and list variants) and placeholder row text formatters, override values winning. */
const mergeAccessibilitySubHeaderText = (parent, override) => ({
    subHeaderRow: override?.subHeaderRow ?? parent?.subHeaderRow,
    listSubHeaderRow: override?.listSubHeaderRow ?? parent?.listSubHeaderRow,
    placeholderRow: override?.placeholderRow ?? parent?.placeholderRow
});
/** Merges table accessibility copy and formatter callbacks field by field. */
const mergeNatTableAccessibilityText = (parent, override) => ({
    ...mergeAccessibilityInstructions(parent, override),
    ...mergeAccessibilityStateText(parent, override),
    ...mergeAccessibilityGestureText(parent, override),
    ...mergeAccessibilitySummaryAnnouncers(parent, override),
    ...mergeAccessibilityPaginationAnnouncers(parent, override),
    ...mergeAccessibilityColumnAnnouncers(parent, override),
    ...mergeAccessibilitySubHeaderText(parent, override)
});
const mergeNatTableIntl = (parent, override) => ({
    accessibilityText: mergeNatTableAccessibilityText(parent?.accessibilityText, override?.accessibilityText),
    formatNumber: override?.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeLocaleMaps$2 = (parentLocales, overrideLocales) => {
    const merged = {};
    for (const [localeId, labels] of Object.entries(parentLocales)) {
        merged[localeId] = mergeNatTableIntl(undefined, labels);
    }
    for (const [localeId, labels] of Object.entries(overrideLocales)) {
        merged[localeId] = mergeNatTableIntl(merged[localeId], labels);
    }
    return merged;
};
const isIntlConfig = (config) => 'locales' in config;
const normalizeIntlProviderConfig = (config) => {
    if (isIntlConfig(config))
        return config;
    return {
        locales: {
            [NAT_EN_LOCALE_ID]: config
        }
    };
};
/** Merges a parent intl config with a provider override, field by field. */
const mergeNatTableIntlConfig = (parent, override) => {
    const overrideConfig = normalizeIntlProviderConfig(override);
    return {
        locales: mergeLocaleMaps$2(parent.locales ?? {}, overrideConfig.locales ?? {})
    };
};
/** Formats generated table accessibility numbers through the configured locale formatter. */
const formatNatTableNumber = (intl, value, options, locale) => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
/** Resolves a locale dictionary, falling back to built-in English defaults. */
const resolveNatTableIntl = (intl, locale) => {
    const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_LOCALE_LABELS;
    const matchedId = matchNatTableLocaleId(intl.locales, locale);
    return mergeNatTableIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : undefined) ?? {});
};

/** Built-in locale defaults used when no provider is configured. */
const NAT_TABLE_DEFAULT_INTL = {
    locales: NAT_TABLE_BUILT_IN_LOCALES
};
/** Injection token backing `provideNatTableLocales(...)`. */
const NAT_TABLE_INTL = new InjectionToken('NAT_TABLE_INTL', {
    providedIn: 'root',
    factory: () => NAT_TABLE_DEFAULT_INTL
});
/**
 * Provides default table labels, announcement formatters, and number formatting.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
const provideNatTableIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_INTL, NAT_TABLE_DEFAULT_INTL, intl, mergeNatTableIntlConfig);
/**
 * Registers table locale dictionaries on top of the built-in English default.
 *
 * Pass the dictionaries the application uses — `{ da: NAT_DA_LOCALE_LABELS }` —
 * along with any custom ids and any partial entries that override built-in
 * copy; each entry merges onto the locale id it names. Instance-specific copy
 * such as table names, captions, descriptions, and column labels should stay on
 * component inputs or column definitions.
 */
const provideNatTableLocales = (overrides = {}) => provideNatTableIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));

/** Merges the visible column-visibility labels, override values winning. */
const mergeColumnVisibilityText = (parent, override) => ({
    heading: override?.heading ?? parent?.heading,
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel
});
/** Merges the column-visibility formatter callbacks, override values winning. */
const mergeColumnVisibilityFormatters = (parent, override) => ({
    visibilitySummary: override?.visibilitySummary ?? parent?.visibilitySummary,
    toggleColumnAriaLabel: override?.toggleColumnAriaLabel ?? parent?.toggleColumnAriaLabel,
    columnState: override?.columnState ?? parent?.columnState
});
/** Merges column visibility labels and formatters field by field. */
const mergeColumnVisibilityLabels = (parent, override) => ({
    ...mergeColumnVisibilityText(parent, override),
    ...mergeColumnVisibilityFormatters(parent, override)
});
/** Merges page-size labels and formatters field by field. */
const mergePageSizeLabels = (parent, override) => ({
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    pageSizeOptionText: override?.pageSizeOptionText ?? parent?.pageSizeOptionText,
    pageSizeOptionAriaLabel: override?.pageSizeOptionAriaLabel ?? parent?.pageSizeOptionAriaLabel
});
/** Merges the pager button labels, override values winning. */
const mergePagerButtonLabels = (parent, override) => ({
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    previousPageAriaLabel: override?.previousPageAriaLabel ?? parent?.previousPageAriaLabel
});
/** Merges the remaining pager labels and indicators, override values winning. */
const mergePagerIndicatorLabels = (parent, override) => ({
    nextPageAriaLabel: override?.nextPageAriaLabel ?? parent?.nextPageAriaLabel,
    pageIndicator: override?.pageIndicator ?? parent?.pageIndicator
});
/** Merges pager labels and formatters field by field. */
const mergePagerLabels = (parent, override) => ({
    ...mergePagerButtonLabels(parent, override),
    ...mergePagerIndicatorLabels(parent, override)
});
/** Merges the scroll-control button labels, override values winning. */
const mergeScrollControlButtonLabels = (parent, override) => ({
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    scrollLeftAriaLabel: override?.scrollLeftAriaLabel ?? parent?.scrollLeftAriaLabel,
    scrollRightAriaLabel: override?.scrollRightAriaLabel ?? parent?.scrollRightAriaLabel
});
/** Merges the scroll-position labels and formatters, override values winning. */
const mergeScrollControlPositionLabels = (parent, override) => ({
    scrollPositionAriaLabel: override?.scrollPositionAriaLabel ?? parent?.scrollPositionAriaLabel,
    scrollPositionText: override?.scrollPositionText ?? parent?.scrollPositionText
});
/** Merges horizontal scroll-control labels and formatters field by field. */
const mergeScrollControlLabels = (parent, override) => ({
    ...mergeScrollControlButtonLabels(parent, override),
    ...mergeScrollControlPositionLabels(parent, override)
});
/** Merges selection-column labels and formatters field by field. */
const mergeSelectionLabels = (parent, override) => ({
    selectAllAriaLabel: override?.selectAllAriaLabel ?? parent?.selectAllAriaLabel,
    selectRowAriaLabel: override?.selectRowAriaLabel ?? parent?.selectRowAriaLabel
});
/** Merges the header sort and menu labels, override values winning. */
const mergeHeaderSortAndMenuLabels = (parent, override) => ({
    sortButton: override?.sortButton ?? parent?.sortButton,
    menuButton: override?.menuButton ?? parent?.menuButton,
    menuLabel: override?.menuLabel ?? parent?.menuLabel
});
/** Merges the header pin labels, override values winning. */
const mergeHeaderPinLabels = (parent, override) => ({
    pinButton: override?.pinButton ?? parent?.pinButton,
    pinButtonText: override?.pinButtonText ?? parent?.pinButtonText
});
/** Merges the header move labels, override values winning. */
const mergeHeaderMoveLabels = (parent, override) => ({
    moveButton: override?.moveButton ?? parent?.moveButton,
    moveButtonText: override?.moveButtonText ?? parent?.moveButtonText
});
/** Merges header action labels and formatters field by field. */
const mergeHeaderActionLabels = (parent, override) => ({
    ...mergeHeaderSortAndMenuLabels(parent, override),
    ...mergeHeaderPinLabels(parent, override),
    ...mergeHeaderMoveLabels(parent, override)
});

const mergeDefined = (parent, override) => {
    const merged = {
        ...parent,
        ...override
    };
    return merged;
};
const mergeColumnVisibilitySlice = (parent, override) => ({
    ...mergeDefined(parent?.columnVisibility, override.columnVisibility),
    accessibilityLabels: mergeColumnVisibilityLabels(parent?.columnVisibility?.accessibilityLabels, override.columnVisibility?.accessibilityLabels)
});
const mergePageSizeSlice = (parent, override) => ({
    ...mergeDefined(parent?.pageSize, override.pageSize),
    accessibilityLabels: mergePageSizeLabels(parent?.pageSize?.accessibilityLabels, override.pageSize?.accessibilityLabels)
});
const mergePagerSlice = (parent, override) => ({
    ...mergeDefined(parent?.pager, override.pager),
    accessibilityLabels: mergePagerLabels(parent?.pager?.accessibilityLabels, override.pager?.accessibilityLabels)
});
const mergeScrollControlSlice = (parent, override) => ({
    ...mergeDefined(parent?.scrollControl, override.scrollControl),
    accessibilityLabels: mergeScrollControlLabels(parent?.scrollControl?.accessibilityLabels, override.scrollControl?.accessibilityLabels)
});
const mergeHeaderActionsSlice = (parent, override) => ({
    accessibilityLabels: mergeHeaderActionLabels(parent?.headerActions?.accessibilityLabels, override.headerActions?.accessibilityLabels)
});
const mergeSelectionSlice = (parent, override) => ({
    ...mergeDefined(parent?.selection, override.selection),
    accessibilityLabels: mergeSelectionLabels(parent?.selection?.accessibilityLabels, override.selection?.accessibilityLabels)
});
/** Merges companion components locale dictionaries, with override values taking precedence. */
const mergeNatTableControlsIntl = (parent, override) => ({
    search: mergeDefined(parent?.search, override.search),
    columnVisibility: mergeColumnVisibilitySlice(parent, override),
    pageSize: mergePageSizeSlice(parent, override),
    pager: mergePagerSlice(parent, override),
    scrollControl: mergeScrollControlSlice(parent, override),
    headerActions: mergeHeaderActionsSlice(parent, override),
    toolbar: mergeDefined(parent?.toolbar, override.toolbar),
    selection: mergeSelectionSlice(parent, override),
    formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeNatTableControlsLocaleIntl = (parent, override) => mergeNatTableControlsIntl(parent, override ?? {});
const mergeLocaleMaps$1 = (parentLocales, overrideLocales) => {
    const merged = {};
    for (const [localeId, labels] of Object.entries(parentLocales)) {
        merged[localeId] = mergeNatTableControlsLocaleIntl(undefined, labels);
    }
    for (const [localeId, labels] of Object.entries(overrideLocales)) {
        merged[localeId] = mergeNatTableControlsLocaleIntl(merged[localeId], labels);
    }
    return merged;
};
const isControlsIntlConfig = (config) => 'locales' in config;
const normalizeControlsIntlProviderConfig = (config) => {
    if (isControlsIntlConfig(config))
        return config;
    return {
        locales: {
            [NAT_EN_LOCALE_ID]: config
        }
    };
};
/** Merges a parent components intl config with a provider override, field by field. */
const mergeNatTableControlsIntlConfig = (parent, override) => {
    const overrideConfig = normalizeControlsIntlProviderConfig(override);
    return {
        locales: mergeLocaleMaps$1(parent.locales ?? {}, overrideConfig.locales ?? {})
    };
};
/** Resolves a companion components locale dictionary, falling back to built-in English defaults. */
const resolveNatTableControlsIntl = (intl, locale) => {
    const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_CONTROLS_LOCALE_LABELS;
    const matchedId = matchNatTableLocaleId(intl.locales, locale);
    return mergeNatTableControlsIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : undefined) ?? {});
};

/** Built-in locale defaults used when no components locale provider is configured. */
const NAT_TABLE_CONTROLS_DEFAULT_INTL = {
    locales: NAT_TABLE_BUILT_IN_CONTROLS_LOCALES
};
/** Injection token backing `provideNatTableControlsLocales(...)`. */
const NAT_TABLE_CONTROLS_INTL = new InjectionToken('NAT_TABLE_CONTROLS_INTL', {
    providedIn: 'root',
    factory: () => NAT_TABLE_CONTROLS_DEFAULT_INTL
});
/**
 * Provides default labels and number formatting for the companion controls in `ng-advanced-table/components`.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
const provideNatTableControlsIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_CONTROLS_INTL, NAT_TABLE_CONTROLS_DEFAULT_INTL, intl, mergeNatTableControlsIntlConfig);
/**
 * Registers companion-control locale dictionaries on top of built-in English.
 *
 * Pass the dictionaries the application uses — `{ da: NAT_DA_CONTROLS_LOCALE_LABELS }`.
 * Call this only when using `ng-advanced-table/components`.
 */
const provideNatTableControlsLocales = (overrides = {}) => provideNatTableControlsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));

/** Merges the render-metrics filter text fields, override values winning. */
const mergeRenderMetricsFilterText = (parent, override) => ({
    heading: override?.heading ?? parent?.heading,
    groupAriaLabel: override?.groupAriaLabel ?? parent?.groupAriaLabel,
    idleCaption: override?.idleCaption ?? parent?.idleCaption
});
/** Merges the render-metrics filter callbacks and options, override values winning. */
const mergeRenderMetricsFilterFormatters = (parent, override) => ({
    rowSampleCaption: override?.rowSampleCaption ?? parent?.rowSampleCaption,
    options: override?.options ?? parent?.options
});
/** Merges render-metrics filter labels and options field by field. */
const mergeRenderMetricsFilterIntl = (parent, override) => ({
    ...mergeRenderMetricsFilterText(parent, override),
    ...mergeRenderMetricsFilterFormatters(parent, override)
});
/** Merges the render-metrics panel text fields, override values winning. */
const mergeRenderMetricsPanelText = (parent, override) => ({
    ariaLabel: override?.ariaLabel ?? parent?.ariaLabel,
    toneLabel: override?.toneLabel ?? parent?.toneLabel,
    idleSummary: override?.idleSummary ?? parent?.idleSummary
});
/** Merges the render-metrics panel callbacks, override values winning. */
const mergeRenderMetricsPanelFormatters = (parent, override) => ({
    rowSampleSummary: override?.rowSampleSummary ?? parent?.rowSampleSummary,
    duration: override?.duration ?? parent?.duration
});
/** Merges render-metrics panel labels and formatters field by field. */
const mergeRenderMetricsPanelIntl = (parent, override) => ({
    ...mergeRenderMetricsPanelText(parent, override),
    ...mergeRenderMetricsPanelFormatters(parent, override)
});
/** Merges the render-metrics column text fields, override values winning. */
const mergeRenderMetricsColumnText = (parent, override) => ({
    header: override?.header ?? parent?.header,
    pendingLabel: override?.pendingLabel ?? parent?.pendingLabel
});
/** Merges the render-metrics column suffix and formatters, override values winning. */
const mergeRenderMetricsColumnFormatters = (parent, override) => ({
    unitSuffix: override?.unitSuffix ?? parent?.unitSuffix,
    duration: override?.duration ?? parent?.duration
});
/** Merges render-metrics column labels and formatters field by field. */
const mergeRenderMetricsColumnIntl = (parent, override) => ({
    ...mergeRenderMetricsColumnText(parent, override),
    ...mergeRenderMetricsColumnFormatters(parent, override)
});
const mergeRenderMetricsWidgetsIntl = (parent, override) => ({
    filter: mergeRenderMetricsFilterIntl(parent?.filter, override?.filter),
    panel: mergeRenderMetricsPanelIntl(parent?.panel, override?.panel),
    column: mergeRenderMetricsColumnIntl(parent?.column, override?.column)
});
/** Merges render-metrics locale dictionaries, with override values taking precedence. */
const mergeNatTableRenderMetricsIntl = (parent, override) => ({
    renderMetrics: mergeRenderMetricsWidgetsIntl(parent?.renderMetrics, override.renderMetrics),
    formatNumber: override.formatNumber ?? parent?.formatNumber ?? DEFAULT_NUMBER_FORMATTER
});
const mergeNatTableRenderMetricsLocaleIntl = (parent, override) => mergeNatTableRenderMetricsIntl(parent, override ?? {});
const mergeLocaleMaps = (parentLocales, overrideLocales) => {
    const merged = {};
    for (const [localeId, labels] of Object.entries(parentLocales)) {
        merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(undefined, labels);
    }
    for (const [localeId, labels] of Object.entries(overrideLocales)) {
        merged[localeId] = mergeNatTableRenderMetricsLocaleIntl(merged[localeId], labels);
    }
    return merged;
};
const isRenderMetricsIntlConfig = (config) => 'locales' in config;
const normalizeRenderMetricsIntlProviderConfig = (config) => {
    if (isRenderMetricsIntlConfig(config))
        return config;
    return {
        locales: {
            [NAT_EN_LOCALE_ID]: config
        }
    };
};
/** Merges a parent render-metrics intl config with a provider override, field by field. */
const mergeNatTableRenderMetricsIntlConfig = (parent, override) => {
    const overrideConfig = normalizeRenderMetricsIntlProviderConfig(override);
    return {
        locales: mergeLocaleMaps(parent.locales ?? {}, overrideConfig.locales ?? {})
    };
};
/** Formats generated render-metrics numbers through the configured locale formatter. */
const formatNatTableRenderMetricsNumber = (intl, value, options, locale) => (intl.formatNumber ?? DEFAULT_NUMBER_FORMATTER)(value, options, locale);
/** Resolves a render-metrics locale dictionary, falling back to built-in English defaults. */
const resolveNatTableRenderMetricsIntl = (intl, locale) => {
    const englishIntl = intl.locales?.[NAT_EN_LOCALE_ID] ?? NAT_EN_RENDER_METRICS_LOCALE_LABELS;
    const matchedId = matchNatTableLocaleId(intl.locales, locale);
    return mergeNatTableRenderMetricsIntl(englishIntl, (matchedId !== null ? intl.locales?.[matchedId] : undefined) ?? {});
};

/** Built-in locale defaults used when no render-metrics locale provider is configured. */
const NAT_TABLE_RENDER_METRICS_DEFAULT_INTL = {
    locales: NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES
};
/** Injection token backing `provideNatTableRenderMetricsLocales(...)`. */
const NAT_TABLE_RENDER_METRICS_INTL = new InjectionToken('NAT_TABLE_RENDER_METRICS_INTL', {
    providedIn: 'root',
    factory: () => NAT_TABLE_RENDER_METRICS_DEFAULT_INTL
});
/**
 * Provides default labels and number formatting for optional render-metrics helpers.
 *
 * Static configs, direct signals, and factories returning either are supported.
 * Nested providers merge with parent defaults, so feature-level providers can
 * override a subset of app-level copy without replacing the entire bag. Signal
 * updates flow through that hierarchy without recreating an injector.
 */
const provideNatTableRenderMetricsIntl = (intl) => createNatTableMergedProvider(NAT_TABLE_RENDER_METRICS_INTL, NAT_TABLE_RENDER_METRICS_DEFAULT_INTL, intl, mergeNatTableRenderMetricsIntlConfig);
/**
 * Registers render-metrics locale dictionaries on top of built-in English.
 *
 * Pass the dictionaries the application uses — `{ da: NAT_DA_RENDER_METRICS_LOCALE_LABELS }`.
 * Call this only when using `ng-advanced-table/render-metrics`.
 */
const provideNatTableRenderMetricsLocales = (overrides = {}) => provideNatTableRenderMetricsIntl(mapNatTableProviderConfig(overrides, (locales) => ({ locales })));
/**
 * Reads render-metrics locale defaults when called inside Angular injection context.
 *
 * Calls outside injection context fall back to the built-in default config.
 */
const injectNatTableRenderMetricsIntl = () => {
    try {
        assertInInjectionContext(injectNatTableRenderMetricsIntl);
    }
    catch {
        return NAT_TABLE_RENDER_METRICS_DEFAULT_INTL;
    }
    return inject(NAT_TABLE_RENDER_METRICS_INTL);
};

/**
 * Generated bundle index. Do not edit.
 */

export { NAT_DA_CONTROLS_LOCALE_LABELS, NAT_DA_LOCALE_ID, NAT_DA_LOCALE_LABELS, NAT_DA_RENDER_METRICS_LOCALE_LABELS, NAT_EN_CONTROLS_LOCALE_LABELS, NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS, NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_FI_CONTROLS_LOCALE_LABELS, NAT_FI_LOCALE_ID, NAT_FI_LOCALE_LABELS, NAT_FI_RENDER_METRICS_LOCALE_LABELS, NAT_NB_CONTROLS_LOCALE_LABELS, NAT_NB_LOCALE_ID, NAT_NB_LOCALE_LABELS, NAT_NB_RENDER_METRICS_LOCALE_LABELS, NAT_NO_LOCALE_ID, NAT_SV_CONTROLS_LOCALE_LABELS, NAT_SV_LOCALE_ID, NAT_SV_LOCALE_LABELS, NAT_SV_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES, NAT_TABLE_BUILT_IN_LOCALES, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES, NAT_TABLE_CONTROLS_INTL, NAT_TABLE_INTL, NAT_TABLE_RENDER_METRICS_INTL, RENDER_METRICS_FILTER_OPTIONS, formatNatTableNumber, formatNatTableRenderMetricsNumber, injectNatTableRenderMetricsIntl, matchNatTableLocaleId, mergeColumnVisibilityLabels, mergeHeaderActionLabels, mergeNatTableAccessibilityText, mergePageSizeLabels, mergePagerLabels, mergeRenderMetricsColumnIntl, mergeRenderMetricsFilterIntl, mergeRenderMetricsPanelIntl, mergeScrollControlLabels, mergeSelectionLabels, provideNatTableControlsIntl, provideNatTableControlsLocales, provideNatTableIntl, provideNatTableLocales, provideNatTableRenderMetricsIntl, provideNatTableRenderMetricsLocales, resolveNatTableControlsIntl, resolveNatTableIntl, resolveNatTableRenderMetricsIntl };
//# sourceMappingURL=ng-advanced-table-locale.mjs.map
