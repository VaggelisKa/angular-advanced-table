import { isSignal, computed, Optional, SkipSelf, InjectionToken, assertInInjectionContext, inject } from '@angular/core';

/** Locale id for the built-in English locale dictionaries. */
const NAT_EN_LOCALE_ID = 'en';

/** Appends a plural `s` unless the count is exactly one. */
const pluralize = (label, count) => (count === 1 ? label : `${label}s`);

/**
 * Built-in English accessibility copy specific to the list renderer.
 *
 * A list has no columns or rows, so these mirror the grid formatters while
 * phrasing the same counts as items and fields. Spread into the English
 * accessibility text; a consumer overriding only the grid formatter still
 * wins, because the renderer falls back to it when the list entry is absent.
 */
const NAT_EN_LIST_ACCESSIBILITY_TEXT = {
    listSubHeaderRow: ({ valueText, rowCountValue, rowCountText }) => {
        const groupLabel = valueText.trim() ? `${valueText} group` : 'Group';
        return `${groupLabel}, ${rowCountText} ${pluralize('item', rowCountValue)}.`;
    },
    listKeyboardInstructions: 'Use the Up and Down arrow keys to move between items. Press Enter to interact with the controls ' +
        'inside an item, Tab to move forward between them, Shift+Tab to move backward, and Escape to ' +
        'return to the item.',
    listSummary: ({ pageCountText, pageText, paginationState, totalRowsValue, totalRowsText, visibleColumnsValue, visibleColumnsText, visibleRowsValue, visibleRowsText }) => {
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
    },
    listColumnVisibilityChange: ({ changedColumns, visibleColumnsValue, visibleColumnsText }) => {
        if (changedColumns.length === 1) {
            const [column] = changedColumns;
            return `${column.label} field ${column.visibilityState === 'visible' ? 'shown' : 'hidden'}. ${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
        }
        return `${visibleColumnsText} visible ${pluralize('field', visibleColumnsValue)}.`;
    },
    listPageSizeChange: ({ pageCountText, pageSizeValue, pageSizeText, pageText }) => `Showing ${pageSizeText} ${pluralize('item', pageSizeValue)} per page. Page ${pageText} of ${pageCountText}.`,
    listPageChange: ({ pageCountText, pageText, visibleRowsValue, visibleRowsText }) => `Page ${pageText} of ${pageCountText}. ${visibleRowsText} ${pluralize('item', visibleRowsValue)} shown.`
};

/** Default locale-aware number formatter shared by every locale domain. */
const DEFAULT_NUMBER_FORMATTER = (value, options, locale) => new Intl.NumberFormat(locale, options).format(value);

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
        ...NAT_EN_LIST_ACCESSIBILITY_TEXT,
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
            if (!columnLabel)
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
 * Importing `provideNatTableLocales()` registers every locale in this object.
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
 * Importing `provideNatTableControlsLocales()` registers every locale in this object.
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
 * Importing `provideNatTableRenderMetricsLocales()` registers every locale in this object.
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
    const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);
    return selectedIntl ? mergeNatTableIntl(englishIntl, selectedIntl) : mergeNatTableIntl(englishIntl, {});
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
 * Registers every table locale shipped by `ng-advanced-table/locale`.
 *
 * Pass `overrides` only when adding custom locale ids or overriding built-in
 * generated table labels. Instance-specific copy such as table names,
 * captions, descriptions, and column labels should stay on component inputs or
 * column definitions.
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
    const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);
    return selectedIntl ? mergeNatTableControlsIntl(englishIntl, selectedIntl) : mergeNatTableControlsIntl(englishIntl, {});
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
 * Registers every companion components locale shipped by `ng-advanced-table/locale`.
 *
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
    const selectedIntl = intl.locales?.[locale] ?? (locale === NAT_EN_LOCALE_ID ? {} : null);
    return selectedIntl ? mergeNatTableRenderMetricsIntl(englishIntl, selectedIntl) : mergeNatTableRenderMetricsIntl(englishIntl, {});
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
 * Registers every render-metrics locale shipped by `ng-advanced-table/locale`.
 *
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

export { NAT_EN_CONTROLS_LOCALE_LABELS, NAT_EN_LOCALE_ID, NAT_EN_LOCALE_LABELS, NAT_EN_RENDER_METRICS_LOCALE_LABELS, NAT_TABLE_BUILT_IN_CONTROLS_LOCALES, NAT_TABLE_BUILT_IN_LOCALES, NAT_TABLE_BUILT_IN_RENDER_METRICS_LOCALES, NAT_TABLE_CONTROLS_INTL, NAT_TABLE_INTL, NAT_TABLE_RENDER_METRICS_INTL, RENDER_METRICS_FILTER_OPTIONS, formatNatTableNumber, formatNatTableRenderMetricsNumber, injectNatTableRenderMetricsIntl, mergeColumnVisibilityLabels, mergeHeaderActionLabels, mergeNatTableAccessibilityText, mergePageSizeLabels, mergePagerLabels, mergeRenderMetricsColumnIntl, mergeRenderMetricsFilterIntl, mergeRenderMetricsPanelIntl, mergeScrollControlLabels, mergeSelectionLabels, provideNatTableControlsIntl, provideNatTableControlsLocales, provideNatTableIntl, provideNatTableLocales, provideNatTableRenderMetricsIntl, provideNatTableRenderMetricsLocales, resolveNatTableControlsIntl, resolveNatTableIntl, resolveNatTableRenderMetricsIntl };
//# sourceMappingURL=ng-advanced-table-locale.mjs.map
