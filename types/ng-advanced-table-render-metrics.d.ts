import * as _angular_core from '@angular/core';
import { Signal } from '@angular/core';
import { RowData, CellContext, Row, Column, Table, SortingState, ColumnFiltersState, VisibilityState, ColumnOrderState, ColumnPinningState, ColumnSizingState, RowSelectionState, PaginationState, Updater, ColumnDef } from '@tanstack/angular-table';
import * as ng_advanced_table_locale from 'ng-advanced-table/locale';
import { NatTableRenderMetricsIntlConfig, NatTableRenderMetricsColumnIntl, NatTableRenderMetricsFilterIntl, NatTableRenderMetricsPanelIntl } from 'ng-advanced-table/locale';

/**
 * Serializable table-state shape expected by the render-metrics helpers.
 *
 * The contract mirrors the slices the filter helper may patch, including
 * column ordering and pinning.
 */
type NatTableRenderMetricsState = {
    readonly sorting: SortingState;
    readonly globalFilter: string;
    readonly columnFilters: ColumnFiltersState;
    readonly columnVisibility: VisibilityState;
    readonly columnOrder: ColumnOrderState;
    readonly columnPinning: ColumnPinningState;
    readonly columnSizing: ColumnSizingState;
    readonly rowSelection: RowSelectionState;
    readonly pagination: PaginationState;
};
/**
 * Minimal controller contract required by the render-metrics helpers.
 *
 * This keeps the utils package structurally compatible with `NatTable` or any
 * custom wrapper that exposes the same `table` instance and `patchState(...)`
 * behavior.
 */
type NatTableRenderMetricsController<TData extends RowData = RowData> = {
    readonly table: Table<TData>;
    /** Locale id used by generated render-metrics labels, when available. */
    readonly localeId?: Signal<string>;
    patchState(updaters: Partial<{
        [K in keyof NatTableRenderMetricsState]: Updater<NatTableRenderMetricsState[K]>;
    }>): void;
};
/** Event payload consumed by `NatTableRenderMetricsStore.record(...)`. */
type NatTableRenderMetricsEvent = {
    /** Stable row identifier emitted by the table. */
    readonly rowId: string;
    /** Render-cycle token used to group timings from the same paint. */
    readonly renderToken: number;
    /** Elapsed render duration for the row, in milliseconds. */
    readonly durationMs: number;
};
/** Value returned by table export metadata before format-specific normalization. */
type NatTableColumnExportValue = unknown;
/** Context passed to column export value callbacks. */
type NatTableColumnExportValueContext<TData extends RowData = RowData, TValue = unknown> = {
    /** Row being exported. */
    readonly row: Row<TData>;
    /** Column being exported. */
    readonly column: Column<TData, TValue>;
    /** Raw value resolved from the row and column before export-specific normalization. */
    readonly value: TValue;
};
/** Export behavior attached to a table column definition. */
type NatTableColumnExportOptions<TData extends RowData = RowData, TValue = unknown> = {
    /** Whether the column participates in table export. Accessor columns opt in by default. */
    readonly enabled?: boolean;
    /** Header text used by export formats. Defaults to column labels and identifiers. */
    readonly header?: string;
    /** Maps a row/column value into an export value. Defaults to the raw accessor value. */
    readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => NatTableColumnExportValue;
};
/**
 * Column metadata shape shared by the render-metrics helpers when augmenting
 * TanStack column definitions. This mirrors the workspace's internal contract
 * without exposing a private package to consumers.
 */
type NatTableColumnMeta<TData extends RowData = RowData, TValue = unknown> = {
    /** Accessible label used by companion controls when the header is not a string. */
    readonly label?: string;
    /** Visually hidden header label for utility columns where a visible title would be redundant. */
    readonly hiddenHeaderLabel?: string;
    /** Horizontal alignment for header and body cells in the column. */
    readonly align?: 'start' | 'end';
    /** Marks the body cell for this column as the row header announced by screen readers. */
    readonly rowHeader?: boolean;
    /** Per-column override for the reorder surface enabler (drag, keyboard, Move buttons). When unset, falls back to the surface `enableReordering`: surface on → reorderable unless set to `false`; surface off → not reorderable unless set to `true`. Setting `false` only blocks grabbing this column; a neighbor reordered past it can still displace it. */
    readonly reorderable?: boolean;
    /** Optional callback that maps a cell to a semantic tone. */
    readonly cellTone?: (context: CellContext<TData, TValue>) => 'positive' | 'negative' | 'neutral' | 'warning' | null;
    /** Optional body-cell height in pixels or any CSS length. Does not affect header cells. */
    readonly cellHeight?: number | string;
    /**
     * Maximum body-cell content lines before truncation. Defaults to 2; set to `Infinity` to disable.
     * Invalid explicit values fall back to 2 lines.
     */
    readonly cellMaxLines?: number;
    /** Optional header-only width in pixels. Does not affect body cells. */
    readonly headerSize?: number | string;
    /** Optional header-only minimum width in pixels. Does not affect body cells. */
    readonly headerMinSize?: number | string;
    /** Optional header-only maximum width in pixels. Does not affect body cells. */
    readonly headerMaxSize?: number | string;
    /** Optional table export behavior for this column. */
    readonly export?: NatTableColumnExportOptions<TData, TValue>;
};
declare module '@tanstack/table-core' {
    interface ColumnMeta<TData extends RowData, TValue> extends NatTableColumnMeta<TData, TValue> {
    }
}

/** Configuration for `withRenderMetricsColumn`. */
type WithRenderMetricsColumnOptions = {
    /** Locale id used when resolving provider defaults at helper-call time. */
    readonly locale?: string;
    /**
     * Captured render-metrics locale config used by reactive column builders.
     *
     * Read this with `injectNatTableRenderMetricsIntl()` during construction,
     * then pass it from a `computed(...)` column builder so provider changes are
     * tracked without calling `inject(...)` outside an injection context.
     */
    readonly intlConfig?: NatTableRenderMetricsIntlConfig;
    /** Column identifier. Defaults to `__rowRenderMetric`. */
    readonly columnId?: string;
    /** Optional TanStack size override. */
    readonly size?: number;
    /** Optional TanStack min-size override. */
    readonly minSize?: number;
    /** Optional TanStack max-size override. */
    readonly maxSize?: number;
} & NatTableRenderMetricsColumnIntl;
/** Tone assigned to a row based on its latest measured render duration. */
type RowRenderTone = 'fast' | 'watch' | 'slow';
/** Filter values understood by the render-metrics column and filter component. */
type RowRenderFilterValue = RowRenderTone | 'all';
/** Latest render metric captured for a single row. */
type RowRenderMetric = Readonly<{
    /** Render duration in milliseconds. */
    readonly durationMs: number;
    /** Epoch timestamp for when the metric was recorded. */
    readonly measuredAt: number;
    /** Derived health band for `durationMs`. */
    readonly tone: RowRenderTone;
}>;
/** Latest render metrics keyed by table row id. */
type RowRenderMetrics = Readonly<Record<string, RowRenderMetric>>;
/** Aggregate view of the latest render cycle across the current page. */
type RowRenderMeasurement = Readonly<{
    /** Total visible render duration in milliseconds. */
    readonly durationMs: number;
    /** Mean row duration for the latest sampled cycle. */
    readonly averageRowDurationMs: number;
    /** Number of visible rows represented in the sample. */
    readonly rowCount: number;
    /** Approximate rows rendered per second for the sample. */
    readonly rowsPerSecond: number;
}>;
/** Default id used by the synthetic render-metrics column. */
declare const RENDER_METRIC_COLUMN_ID = "__rowRenderMetric";

/** Retention policy for row-level render metrics. */
type NatTableRenderMetricsStoreOptions = Readonly<{
    /**
     * Maximum row metrics retained across render cycles. Defaults to 1000.
     * Set to `Infinity` only when the table's row ids are known to be bounded.
     * Non-positive and non-finite values fall back to the default.
     */
    readonly maxRetainedRowMetrics?: number;
}>;
/**
 * Holds per-row render timings plus a rolling aggregate for the most recent
 * render cycle. A single store instance is shared between
 * `<nat-table>` (which feeds it via `(rowRendered)`), the metrics column
 * factory, and the panel / filter companion components.
 */
declare class NatTableRenderMetricsStore {
    private readonly state;
    private readonly maxRetainedRowMetrics;
    constructor(options?: NatTableRenderMetricsStoreOptions);
    /** Latest retained metric for each row keyed by row id. */
    readonly rowMetrics: Signal<RowRenderMetrics>;
    /**
     * Aggregate measurement for the latest completed render cycle on the current
     * page, or `null` when no samples have been recorded yet.
     */
    readonly measurement: Signal<RowRenderMeasurement | null>;
    /**
     * Records a row render timing emitted by `<nat-table>`.
     *
     * @param event Row-level render event payload from the table.
     */
    record(event: NatTableRenderMetricsEvent): void;
    /**
     * Returns the latest metric captured for a specific row.
     *
     * @param rowId Stable row identifier.
     */
    rowMetric(rowId: string): RowRenderMetric | undefined;
    /** Clears all recorded row and cycle measurements. */
    reset(): void;
    private retainRowMetric;
}

/**
 * Filter chip group that drives the synthetic render-metrics column created by
 * {@link withRenderMetricsColumn}.
 */
declare class NatRenderMetricsFilter<TData = unknown> {
    /** Shared store — used only so the panel/filter can react to measurement changes. */
    readonly store: _angular_core.InputSignal<NatTableRenderMetricsStore>;
    /** Controlled table controller. Pass the `NatTable` instance or a structural controller. */
    readonly controller: _angular_core.InputSignal<NatTableRenderMetricsController<TData> | null | undefined>;
    /** Column id to target when the metrics column uses a custom identifier. */
    readonly columnId: _angular_core.InputSignal<string>;
    /** Locale id override for generated render-metrics labels. Defaults to the controlled table locale. */
    readonly locale: _angular_core.InputSignal<string | undefined>;
    /** Per-instance label overrides. */
    readonly labels: _angular_core.InputSignal<NatTableRenderMetricsFilterIntl | undefined>;
    private readonly utilsIntlConfig;
    private readonly localeId;
    private readonly utilsIntl;
    private readonly resolvedLabels;
    protected readonly heading: _angular_core.Signal<string>;
    protected readonly groupAriaLabel: _angular_core.Signal<string>;
    protected readonly options: _angular_core.Signal<readonly ng_advanced_table_locale.RowRenderFilterOption[]>;
    protected readonly selected: _angular_core.Signal<RowRenderFilterValue>;
    protected readonly caption: _angular_core.Signal<string>;
    protected setFilter(value: RowRenderFilterValue): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatRenderMetricsFilter<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NatRenderMetricsFilter<any>, "nat-render-metrics-filter", never, { "store": { "alias": "store"; "required": true; "isSignal": true; }; "controller": { "alias": "controller"; "required": false; "isSignal": true; }; "columnId": { "alias": "columnId"; "required": false; "isSignal": true; }; "locale": { "alias": "locale"; "required": false; "isSignal": true; }; "labels": { "alias": "labels"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

type RenderHealthTone = 'idle' | 'fast' | 'watch' | 'slow';
type RenderHealthState = {
    readonly label: string;
    readonly tone: RenderHealthTone;
};
/**
 * Compact KPI panel that summarizes the latest render measurement collected by
 * {@link NatTableRenderMetricsStore}.
 */
declare class NatRenderMetricsPanel<TData = unknown> {
    /** Shared store. */
    readonly store: _angular_core.InputSignal<NatTableRenderMetricsStore>;
    /** Controlled table controller. Used to inherit the table locale when provided. */
    readonly controller: _angular_core.InputSignal<NatTableRenderMetricsController<TData> | null | undefined>;
    /** Locale id override for generated render-metrics labels. */
    readonly locale: _angular_core.InputSignal<string | undefined>;
    /** Per-instance label overrides. */
    readonly labels: _angular_core.InputSignal<NatTableRenderMetricsPanelIntl | undefined>;
    private readonly utilsIntlConfig;
    private readonly tableLocaleId;
    private readonly localeId;
    private readonly utilsIntl;
    private readonly resolvedLabels;
    protected readonly measurement: _angular_core.Signal<Readonly<{
        readonly durationMs: number;
        readonly averageRowDurationMs: number;
        readonly rowCount: number;
        readonly rowsPerSecond: number;
    }> | null>;
    protected readonly ariaLabel: _angular_core.Signal<string>;
    protected readonly health: _angular_core.Signal<RenderHealthState>;
    protected readonly compactSummary: _angular_core.Signal<string>;
    protected formatDurationMs(value: number): string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatRenderMetricsPanel<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NatRenderMetricsPanel<any>, "nat-render-metrics-panel", never, { "store": { "alias": "store"; "required": true; "isSignal": true; }; "controller": { "alias": "controller"; "required": false; "isSignal": true; }; "locale": { "alias": "locale"; "required": false; "isSignal": true; }; "labels": { "alias": "labels"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

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
declare const withRenderMetricsColumn: <TData extends RowData>(columns: readonly ColumnDef<TData, unknown>[], store: NatTableRenderMetricsStore, options?: WithRenderMetricsColumnOptions) => ColumnDef<TData, unknown>[];

/**
 * Maps a row render duration to the library's coarse health bands.
 *
 * @param durationMs Row render duration in milliseconds.
 */
declare const getRowRenderTone: (durationMs: number) => RowRenderTone;
/**
 * Type guard for values accepted by the render-metrics column filter.
 *
 * @param value Unknown filter payload.
 */
declare const isRenderFilterValue: (value: unknown) => value is RowRenderFilterValue;

export { NatRenderMetricsFilter, NatRenderMetricsPanel, NatTableRenderMetricsStore, RENDER_METRIC_COLUMN_ID, getRowRenderTone, isRenderFilterValue, withRenderMetricsColumn };
export type { NatTableColumnMeta, NatTableRenderMetricsController, NatTableRenderMetricsEvent, NatTableRenderMetricsState, RowRenderFilterValue, RowRenderMeasurement, RowRenderMetric, RowRenderMetrics, RowRenderTone, WithRenderMetricsColumnOptions };
