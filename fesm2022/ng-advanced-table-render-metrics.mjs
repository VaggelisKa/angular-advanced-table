import * as i0 from '@angular/core';
import { signal, computed, input, inject, Component } from '@angular/core';
import { NAT_TABLE_RENDER_METRICS_INTL, NAT_EN_LOCALE_ID, resolveNatTableRenderMetricsIntl, mergeRenderMetricsFilterIntl, RENDER_METRICS_FILTER_OPTIONS, formatNatTableRenderMetricsNumber, mergeRenderMetricsPanelIntl, injectNatTableRenderMetricsIntl, mergeRenderMetricsColumnIntl } from 'ng-advanced-table/locale';

/**
 * Maps a row render duration to the library's coarse health bands.
 *
 * @param durationMs Row render duration in milliseconds.
 */
const getRowRenderTone = (durationMs) => {
    if (durationMs > 16.66) {
        return 'slow';
    }
    if (durationMs > 12) {
        return 'watch';
    }
    return 'fast';
};
/**
 * Type guard for values accepted by the render-metrics column filter.
 *
 * @param value Unknown filter payload.
 */
const isRenderFilterValue = (value) => {
    return value === 'all' || value === 'fast' || value === 'watch' || value === 'slow';
};
/**
 * Rounds a number to one decimal place using standard `toFixed` semantics.
 *
 * @param value Number to round.
 */
const roundToSingleDecimal = (value) => {
    return Number(value.toFixed(1));
};

const DEFAULT_MAX_RETAINED_ROW_METRICS = 1000;
const EMPTY_ROW_METRIC_ORDER = Object.freeze([]);
const freezeMetrics = (metrics) => Object.freeze(metrics);
const freezeMetric = (metric) => Object.freeze(metric);
const freezeMeasurement = (measurement) => Object.freeze(measurement);
const freezeOrder = (rowMetricOrder) => Object.freeze(rowMetricOrder);
const freezeState = (state) => Object.freeze(state);
const EMPTY_ROW_METRICS = freezeMetrics({});
const INITIAL_STATE = freezeState({
    currentToken: 0,
    cycleMetrics: EMPTY_ROW_METRICS,
    rowMetrics: EMPTY_ROW_METRICS,
    rowMetricOrder: EMPTY_ROW_METRIC_ORDER
});
const normalizeMaxRetainedRowMetrics = (value) => {
    if (value === undefined) {
        return DEFAULT_MAX_RETAINED_ROW_METRICS;
    }
    if (value === Number.POSITIVE_INFINITY) {
        return Number.POSITIVE_INFINITY;
    }
    if (!Number.isFinite(value)) {
        return DEFAULT_MAX_RETAINED_ROW_METRICS;
    }
    const normalizedValue = Math.floor(value);
    return normalizedValue > 0 ? normalizedValue : DEFAULT_MAX_RETAINED_ROW_METRICS;
};
/**
 * Holds per-row render timings plus a rolling aggregate for the most recent
 * render cycle. A single store instance is shared between
 * `<nat-table>` (which feeds it via `(rowRendered)`), the metrics column
 * factory, and the panel / filter companion components.
 */
class NatTableRenderMetricsStore {
    state = signal(INITIAL_STATE, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "state" }] : /* istanbul ignore next */ []));
    maxRetainedRowMetrics;
    constructor(options = {}) {
        this.maxRetainedRowMetrics = normalizeMaxRetainedRowMetrics(options.maxRetainedRowMetrics);
    }
    /** Latest retained metric for each row keyed by row id. */
    rowMetrics = computed(() => this.state().rowMetrics, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rowMetrics" }] : /* istanbul ignore next */ []));
    /**
     * Aggregate measurement for the latest completed render cycle on the current
     * page, or `null` when no samples have been recorded yet.
     */
    measurement = computed(() => {
        const cycleMetrics = this.state().cycleMetrics;
        const durations = Object.values(cycleMetrics)
            .map((metric) => metric.durationMs)
            .filter((duration) => duration > 0);
        if (!durations.length) {
            return null;
        }
        const totalDurationMs = Math.max(...durations);
        const averageRowDurationMs = roundToSingleDecimal(durations.reduce((total, duration) => total + duration, 0) / durations.length);
        const rowCount = durations.length;
        return freezeMeasurement({
            durationMs: roundToSingleDecimal(totalDurationMs),
            averageRowDurationMs,
            rowCount,
            rowsPerSecond: totalDurationMs > 0 ? Math.round((rowCount * 1000) / totalDurationMs) : 0
        });
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "measurement" }] : /* istanbul ignore next */ []));
    /**
     * Records a row render timing emitted by `<nat-table>`.
     *
     * @param event Row-level render event payload from the table.
     */
    record(event) {
        const metric = freezeMetric({
            durationMs: event.durationMs,
            measuredAt: Date.now(),
            tone: getRowRenderTone(event.durationMs)
        });
        this.state.update((current) => {
            const retainedMetrics = this.retainRowMetric(current, event.rowId, metric);
            if (event.renderToken !== current.currentToken) {
                return freezeState({
                    currentToken: event.renderToken,
                    cycleMetrics: freezeMetrics({ [event.rowId]: metric }),
                    rowMetrics: retainedMetrics.rowMetrics,
                    rowMetricOrder: retainedMetrics.rowMetricOrder
                });
            }
            return freezeState({
                currentToken: current.currentToken,
                cycleMetrics: freezeMetrics({ ...current.cycleMetrics, [event.rowId]: metric }),
                rowMetrics: retainedMetrics.rowMetrics,
                rowMetricOrder: retainedMetrics.rowMetricOrder
            });
        });
    }
    /**
     * Returns the latest metric captured for a specific row.
     *
     * @param rowId Stable row identifier.
     */
    rowMetric(rowId) {
        return this.state().rowMetrics[rowId];
    }
    /** Clears all recorded row and cycle measurements. */
    reset() {
        this.state.set(INITIAL_STATE);
    }
    retainRowMetric(current, rowId, metric) {
        const nextOrder = [...current.rowMetricOrder.filter((orderedRowId) => orderedRowId !== rowId), rowId];
        const retainedOrder = this.maxRetainedRowMetrics === Number.POSITIVE_INFINITY ? nextOrder : nextOrder.slice(-this.maxRetainedRowMetrics);
        const retainedRowMetrics = {};
        for (const retainedRowId of retainedOrder) {
            retainedRowMetrics[retainedRowId] = retainedRowId === rowId ? metric : current.rowMetrics[retainedRowId];
        }
        return {
            rowMetrics: freezeMetrics(retainedRowMetrics),
            rowMetricOrder: freezeOrder(retainedOrder)
        };
    }
}

/** Default id used by the synthetic render-metrics column. */
const RENDER_METRIC_COLUMN_ID = '__rowRenderMetric';

const upsertColumnFilter = (currentFilters, columnId, value) => {
    const nextFilters = currentFilters.filter((filter) => filter.id !== columnId);
    if (value === null) {
        return nextFilters;
    }
    return [...nextFilters, { id: columnId, value }];
};
/**
 * Filter chip group that drives the synthetic render-metrics column created by
 * {@link withRenderMetricsColumn}.
 */
class NatRenderMetricsFilter {
    /** Shared store — used only so the panel/filter can react to measurement changes. */
    store = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "store" }] : /* istanbul ignore next */ []));
    /** Controlled table controller. Pass the `NatTable` instance or a structural controller. */
    controller = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    /** Column id to target when the metrics column uses a custom identifier. */
    columnId = input(RENDER_METRIC_COLUMN_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "columnId" }] : /* istanbul ignore next */ []));
    /** Locale id override for generated render-metrics labels. Defaults to the controlled table locale. */
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    /** Per-instance label overrides. */
    labels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labels" }] : /* istanbul ignore next */ []));
    utilsIntlConfig = inject(NAT_TABLE_RENDER_METRICS_INTL);
    localeId = computed(() => this.locale() ?? this.controller()?.localeId?.() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    utilsIntl = computed(() => resolveNatTableRenderMetricsIntl(this.utilsIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "utilsIntl" }] : /* istanbul ignore next */ []));
    resolvedLabels = computed(() => mergeRenderMetricsFilterIntl(this.utilsIntl().renderMetrics?.filter, this.labels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedLabels" }] : /* istanbul ignore next */ []));
    heading = computed(() => this.resolvedLabels().heading ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "heading" }] : /* istanbul ignore next */ []));
    groupAriaLabel = computed(() => this.resolvedLabels().groupAriaLabel ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "groupAriaLabel" }] : /* istanbul ignore next */ []));
    options = computed(() => this.resolvedLabels().options ?? RENDER_METRICS_FILTER_OPTIONS, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    selected = computed(() => {
        const controller = this.controller();
        if (!controller) {
            return 'all';
        }
        const columnId = this.columnId();
        const filters = controller.table.getState().columnFilters;
        const activeFilter = filters.find((entry) => entry.id === columnId);
        return isRenderFilterValue(activeFilter?.value) ? activeFilter.value : 'all';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    caption = computed(() => {
        const measurement = this.store().measurement();
        const labels = this.resolvedLabels();
        if (!measurement?.rowCount) {
            return labels.idleCaption ?? '';
        }
        const rowCountText = formatNatTableRenderMetricsNumber(this.utilsIntl(), measurement.rowCount, undefined, this.localeId());
        return (labels.rowSampleCaption?.({
            rowCountValue: measurement.rowCount,
            rowCountText
        }) ?? '');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "caption" }] : /* istanbul ignore next */ []));
    setFilter(value) {
        const controller = this.controller();
        if (!controller) {
            return;
        }
        const columnId = this.columnId();
        const nextValue = value === 'all' ? null : value;
        controller.patchState({
            columnFilters: (currentFilters) => upsertColumnFilter(currentFilters, columnId, nextValue),
            pagination: (currentPagination) => ({ ...currentPagination, pageIndex: 0 })
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatRenderMetricsFilter, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.1.1", type: NatRenderMetricsFilter, isStandalone: true, selector: "nat-render-metrics-filter", inputs: { store: { classPropertyName: "store", publicName: "store", isSignal: true, isRequired: true, transformFunction: null }, controller: { classPropertyName: "controller", publicName: "controller", isSignal: true, isRequired: false, transformFunction: null }, columnId: { classPropertyName: "columnId", publicName: "columnId", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, labels: { classPropertyName: "labels", publicName: "labels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<div class=\"control-block\">\n  <div class=\"control-heading\">\n    <span class=\"control-label\">{{ heading() }}</span>\n    <span class=\"control-caption\">{{ caption() }}</span>\n  </div>\n  <div [attr.aria-label]=\"groupAriaLabel()\" class=\"chip-row\" role=\"group\">\n    @for (option of options(); track option.value) {\n      <button\n        [attr.aria-pressed]=\"selected() === option.value\"\n        [attr.data-render-filter]=\"option.value\"\n        [class.is-active]=\"selected() === option.value\"\n        class=\"chip render-chip\"\n        type=\"button\"\n        (click)=\"setFilter(option.value)\">\n        <span>{{ option.label }}</span>\n        <span class=\"chip-count\">{{ option.description }}</span>\n      </button>\n    }\n  </div>\n</div>\n", styles: [":host{display:block}.control-block{display:grid;gap:10px}.control-heading{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between}.control-label{font-size:.85rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText));text-transform:uppercase;letter-spacing:.08em}.control-caption{font-size:.82rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}.chip-row{display:flex;flex-wrap:wrap;gap:10px}.chip{display:inline-flex;gap:10px;align-items:center;min-height:42px;padding:0 14px;color:inherit;cursor:pointer;background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 5%,transparent);border:1px solid transparent;border-color:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 14%,transparent);border-radius:100vmax;transition:background-color .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease,color .18s ease}.chip.is-active{background:color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 18%,transparent);border-color:color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 34%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 14%,transparent)}.chip-count{font-size:.82rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}.render-chip{justify-content:space-between;min-width:140px}.chip:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.chip:hover{background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 8%,transparent);border-color:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 20%,transparent);transform:translateY(-1px)}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatRenderMetricsFilter, decorators: [{
            type: Component,
            args: [{ selector: 'nat-render-metrics-filter', template: "<div class=\"control-block\">\n  <div class=\"control-heading\">\n    <span class=\"control-label\">{{ heading() }}</span>\n    <span class=\"control-caption\">{{ caption() }}</span>\n  </div>\n  <div [attr.aria-label]=\"groupAriaLabel()\" class=\"chip-row\" role=\"group\">\n    @for (option of options(); track option.value) {\n      <button\n        [attr.aria-pressed]=\"selected() === option.value\"\n        [attr.data-render-filter]=\"option.value\"\n        [class.is-active]=\"selected() === option.value\"\n        class=\"chip render-chip\"\n        type=\"button\"\n        (click)=\"setFilter(option.value)\">\n        <span>{{ option.label }}</span>\n        <span class=\"chip-count\">{{ option.description }}</span>\n      </button>\n    }\n  </div>\n</div>\n", styles: [":host{display:block}.control-block{display:grid;gap:10px}.control-heading{display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between}.control-label{font-size:.85rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText));text-transform:uppercase;letter-spacing:.08em}.control-caption{font-size:.82rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}.chip-row{display:flex;flex-wrap:wrap;gap:10px}.chip{display:inline-flex;gap:10px;align-items:center;min-height:42px;padding:0 14px;color:inherit;cursor:pointer;background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 5%,transparent);border:1px solid transparent;border-color:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 14%,transparent);border-radius:100vmax;transition:background-color .18s ease,border-color .18s ease,box-shadow .18s ease,transform .18s ease,color .18s ease}.chip.is-active{background:color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 18%,transparent);border-color:color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 34%,transparent);box-shadow:0 0 16px color-mix(in srgb,var(--nat-table-color-accent, var(--sys-nat-table-color-accent, currentColor)) 14%,transparent)}.chip-count{font-size:.82rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}.render-chip{justify-content:space-between;min-width:140px}.chip:focus-visible{outline:var(--nat-table-focus-ring-width, var(--sys-nat-table-focus-ring-width, 2px)) solid var(--nat-table-focus-ring-color, var(--sys-nat-table-focus-ring-color, currentColor));outline-offset:var(--nat-table-focus-ring-offset, var(--sys-nat-table-focus-ring-offset, 2px))}@media(hover:hover)and (pointer:fine){.chip:hover{background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 8%,transparent);border-color:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 20%,transparent);transform:translateY(-1px)}}\n"] }]
        }], propDecorators: { store: [{ type: i0.Input, args: [{ isSignal: true, alias: "store", required: true }] }], controller: [{ type: i0.Input, args: [{ isSignal: true, alias: "controller", required: false }] }], columnId: [{ type: i0.Input, args: [{ isSignal: true, alias: "columnId", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], labels: [{ type: i0.Input, args: [{ isSignal: true, alias: "labels", required: false }] }] } });

/**
 * Compact KPI panel that summarizes the latest render measurement collected by
 * {@link NatTableRenderMetricsStore}.
 */
class NatRenderMetricsPanel {
    /** Shared store. */
    store = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "store" }] : /* istanbul ignore next */ []));
    /** Controlled table controller. Used to inherit the table locale when provided. */
    controller = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "controller" }] : /* istanbul ignore next */ []));
    /** Locale id override for generated render-metrics labels. */
    locale = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "locale" }] : /* istanbul ignore next */ []));
    /** Per-instance label overrides. */
    labels = input(undefined, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labels" }] : /* istanbul ignore next */ []));
    utilsIntlConfig = inject(NAT_TABLE_RENDER_METRICS_INTL);
    tableLocaleId = computed(() => this.controller()?.localeId?.(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tableLocaleId" }] : /* istanbul ignore next */ []));
    localeId = computed(() => this.locale() ?? this.tableLocaleId() ?? NAT_EN_LOCALE_ID, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "localeId" }] : /* istanbul ignore next */ []));
    utilsIntl = computed(() => resolveNatTableRenderMetricsIntl(this.utilsIntlConfig, this.localeId()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "utilsIntl" }] : /* istanbul ignore next */ []));
    resolvedLabels = computed(() => mergeRenderMetricsPanelIntl(this.utilsIntl().renderMetrics?.panel, this.labels()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "resolvedLabels" }] : /* istanbul ignore next */ []));
    measurement = computed(() => this.store().measurement(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "measurement" }] : /* istanbul ignore next */ []));
    ariaLabel = computed(() => this.resolvedLabels().ariaLabel ?? '', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    health = computed(() => {
        const measurement = this.measurement();
        const labels = this.resolvedLabels();
        if (!measurement?.rowCount) {
            return { label: labels.toneLabel?.('idle') ?? '', tone: 'idle' };
        }
        const tone = getRowRenderTone(measurement.durationMs);
        return { label: labels.toneLabel?.(tone) ?? '', tone };
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "health" }] : /* istanbul ignore next */ []));
    compactSummary = computed(() => {
        const measurement = this.measurement();
        const labels = this.resolvedLabels();
        if (!measurement?.rowCount) {
            return labels.idleSummary ?? '';
        }
        const rowCountText = formatNatTableRenderMetricsNumber(this.utilsIntl(), measurement.rowCount, undefined, this.localeId());
        return (labels.rowSampleSummary?.({
            rowCountValue: measurement.rowCount,
            rowCountText
        }) ?? '');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "compactSummary" }] : /* istanbul ignore next */ []));
    formatDurationMs(value) {
        const labels = this.resolvedLabels();
        const durationMsText = formatNatTableRenderMetricsNumber(this.utilsIntl(), value, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }, this.localeId());
        return (labels.duration?.({
            durationMsValue: value,
            durationMsText
        }) ?? '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatRenderMetricsPanel, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.1.1", type: NatRenderMetricsPanel, isStandalone: true, selector: "nat-render-metrics-panel", inputs: { store: { classPropertyName: "store", publicName: "store", isSignal: true, isRequired: true, transformFunction: null }, controller: { classPropertyName: "controller", publicName: "controller", isSignal: true, isRequired: false, transformFunction: null }, locale: { classPropertyName: "locale", publicName: "locale", isSignal: true, isRequired: false, transformFunction: null }, labels: { classPropertyName: "labels", publicName: "labels", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<div [attr.aria-label]=\"ariaLabel()\" [attr.data-health]=\"health().tone\" class=\"render-kpi\">\n  <span aria-hidden=\"true\" class=\"render-kpi-dot\"></span>\n  <span class=\"render-kpi-text\">\n    <strong>{{ formatDurationMs(measurement()?.durationMs ?? 0) }}</strong>\n    <span class=\"render-kpi-detail\">{{ health().label }} \u00B7 {{ compactSummary() }}</span>\n  </span>\n</div>\n", styles: [":host{display:inline-block}.render-kpi{display:inline-flex;gap:8px;align-items:center;padding:6px 14px;font-size:.85rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText));white-space:nowrap;background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 5%,transparent);border:1px solid color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 12%,transparent);border-radius:100vmax}.render-kpi strong{font-variant-numeric:tabular-nums;color:var(--nat-table-color-text, var(--sys-nat-table-color-text, CanvasText))}.render-kpi-dot{flex-shrink:0;width:7px;height:7px;background:currentcolor;border-radius:50%}.render-kpi[data-health=fast] .render-kpi-dot{background:var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor));box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor)) 40%,transparent)}.render-kpi[data-health=watch] .render-kpi-dot{background:var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor));border-radius:2px;box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor)) 40%,transparent);transform:rotate(45deg)}.render-kpi[data-health=slow] .render-kpi-dot{background:var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor));border-radius:1px;box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor)) 40%,transparent)}.render-kpi-text{display:inline-flex;gap:6px;align-items:baseline}.render-kpi-detail{font-size:.78rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.1.1", ngImport: i0, type: NatRenderMetricsPanel, decorators: [{
            type: Component,
            args: [{ selector: 'nat-render-metrics-panel', template: "<div [attr.aria-label]=\"ariaLabel()\" [attr.data-health]=\"health().tone\" class=\"render-kpi\">\n  <span aria-hidden=\"true\" class=\"render-kpi-dot\"></span>\n  <span class=\"render-kpi-text\">\n    <strong>{{ formatDurationMs(measurement()?.durationMs ?? 0) }}</strong>\n    <span class=\"render-kpi-detail\">{{ health().label }} \u00B7 {{ compactSummary() }}</span>\n  </span>\n</div>\n", styles: [":host{display:inline-block}.render-kpi{display:inline-flex;gap:8px;align-items:center;padding:6px 14px;font-size:.85rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText));white-space:nowrap;background:color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 5%,transparent);border:1px solid color-mix(in srgb,var(--nat-table-color-text, var(--sys-nat-table-color-text, currentColor)) 12%,transparent);border-radius:100vmax}.render-kpi strong{font-variant-numeric:tabular-nums;color:var(--nat-table-color-text, var(--sys-nat-table-color-text, CanvasText))}.render-kpi-dot{flex-shrink:0;width:7px;height:7px;background:currentcolor;border-radius:50%}.render-kpi[data-health=fast] .render-kpi-dot{background:var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor));box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-success, var(--sys-nat-table-color-success, currentColor)) 40%,transparent)}.render-kpi[data-health=watch] .render-kpi-dot{background:var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor));border-radius:2px;box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-warning, var(--sys-nat-table-color-warning, currentColor)) 40%,transparent);transform:rotate(45deg)}.render-kpi[data-health=slow] .render-kpi-dot{background:var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor));border-radius:1px;box-shadow:0 0 6px color-mix(in srgb,var(--nat-table-color-danger, var(--sys-nat-table-color-danger, currentColor)) 40%,transparent)}.render-kpi-text{display:inline-flex;gap:6px;align-items:baseline}.render-kpi-detail{font-size:.78rem;color:var(--nat-table-color-text-muted, var(--sys-nat-table-color-text-muted, GrayText))}\n"] }]
        }], propDecorators: { store: [{ type: i0.Input, args: [{ isSignal: true, alias: "store", required: true }] }], controller: [{ type: i0.Input, args: [{ isSignal: true, alias: "controller", required: false }] }], locale: [{ type: i0.Input, args: [{ isSignal: true, alias: "locale", required: false }] }], labels: [{ type: i0.Input, args: [{ isSignal: true, alias: "labels", required: false }] }] } });

const resolveRenderMetricsIntlConfig = (intlConfig) => intlConfig ?? injectNatTableRenderMetricsIntl();
/**
 * Builds the metrics column filter predicate that keeps rows whose latest
 * render tone matches the active filter value.
 *
 * @param store Shared metrics store used to look up per-row tone.
 */
const createMetricsFilterFn = (store) => {
    return (row, _columnId, filterValue) => {
        const activeFilter = isRenderFilterValue(filterValue) ? filterValue : 'all';
        if (activeFilter === 'all') {
            return true;
        }
        const metric = store.rowMetric(row.id);
        if (!metric) {
            return true;
        }
        return metric.tone === activeFilter;
    };
};
/**
 * Builds the metrics column cell renderer that formats the latest per-row
 * render duration, falling back to the pending label when no metric exists.
 */
const createMetricsCell = (config) => {
    const { store, utilsIntl, columnIntl, locale, pendingLabel, unitSuffix } = config;
    return (info) => {
        const metric = store.rowMetric(info.row.id);
        if (!metric) {
            return pendingLabel;
        }
        const durationMsText = formatNatTableRenderMetricsNumber(utilsIntl, metric.durationMs, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }, locale);
        return (columnIntl.duration?.({
            durationMsValue: metric.durationMs,
            durationMsText
        }) ?? `${durationMsText}${unitSuffix}`);
    };
};
/**
 * Returns a new column definition array with a synthetic "render" column
 * appended. The column renders the latest per-row render time from the given
 * store and installs a filter function driven by row-render tone.
 *
 * @param columns Existing table columns.
 * @param store Shared metrics store populated from `<nat-table (rowRendered)>`.
 * @param options Optional labels, sizing, and identifier overrides.
 *
 * Call this helper from an Angular injection context to apply
 * `provideNatTableRenderMetricsIntl(...)` defaults. For a reactive column
 * builder, capture the config with `injectNatTableRenderMetricsIntl()` during
 * construction and pass it through `options.intlConfig`; this lets the
 * surrounding `computed(...)` track provider and locale changes. Calls outside
 * DI without an explicit config still use built-in defaults plus the explicit
 * labels passed here.
 *
 * @returns A shallow copy of `columns` with the metrics column appended.
 */
const withRenderMetricsColumn = (columns, store, options = {}) => {
    const utilsIntlConfig = resolveRenderMetricsIntlConfig(options.intlConfig);
    const locale = options.locale ?? NAT_EN_LOCALE_ID;
    const utilsIntl = resolveNatTableRenderMetricsIntl(utilsIntlConfig, locale);
    const columnIntl = mergeRenderMetricsColumnIntl(utilsIntl.renderMetrics?.column, options);
    const columnId = options.columnId ?? RENDER_METRIC_COLUMN_ID;
    const pendingLabel = columnIntl.pendingLabel ?? '';
    const unitSuffix = columnIntl.unitSuffix ?? '';
    const header = columnIntl.header ?? '';
    const metricsColumn = {
        id: columnId,
        header,
        size: options.size ?? 110,
        minSize: options.minSize ?? 80,
        maxSize: options.maxSize,
        meta: {
            label: header,
            align: 'end'
        },
        enableGlobalFilter: false,
        enableHiding: false,
        enablePinning: false,
        enableSorting: false,
        filterFn: createMetricsFilterFn(store),
        cell: createMetricsCell({ store, utilsIntl, columnIntl, locale, pendingLabel, unitSuffix })
    };
    return [...columns, metricsColumn];
};

/**
 * Generated bundle index. Do not edit.
 */

export { NatRenderMetricsFilter, NatRenderMetricsPanel, NatTableRenderMetricsStore, RENDER_METRIC_COLUMN_ID, getRowRenderTone, isRenderFilterValue, withRenderMetricsColumn };
//# sourceMappingURL=ng-advanced-table-render-metrics.mjs.map
