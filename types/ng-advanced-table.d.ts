import { RowData, Table, Column, Row, SortingState, ColumnFiltersState, PaginationState, VisibilityState, ColumnOrderState, ColumnPinningState, ColumnSizingState, RowSelectionState, CellContext, Updater, ColumnDef, FilterFn, HeaderGroup, Header, HeaderContext } from '@tanstack/angular-table';
export * from '@tanstack/angular-table';
export { flexRenderComponent } from '@tanstack/angular-table';
import * as _angular_core from '@angular/core';
import { TemplateRef, Signal, InjectionToken, ElementRef, WritableSignal, Provider } from '@angular/core';
import { NatTableAccessibilityText } from 'ng-advanced-table/locale';
export { NatTableAccessibilityText } from 'ng-advanced-table/locale';
import * as ng_advanced_table from 'ng-advanced-table';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

/** Data lifecycle state rendered by `<nat-table>` when rows are unavailable. */
type NatTableDataStatus = 'loading' | 'error' | 'success';
/** State row currently rendered in the table body. */
type NatTableBodyState = 'rows' | 'loading' | 'empty' | 'error';
/** Shared context passed to custom table body state templates. */
type NatTableStateTemplateContext<TData extends RowData = RowData> = {
    /** TanStack table instance for advanced reads. */
    readonly table: Table<TData>;
    /** Rows currently rendered in the body. */
    readonly visibleRowsValue: number;
    /** Total rows represented by the current body state before filtering/pagination. */
    readonly totalRowsValue: number;
    /** Visible leaf columns in the current view. */
    readonly visibleColumnsValue: number;
    /** Whether the current view is filtered by global or column filters. */
    readonly filtered: boolean;
};
/** Context passed to `ng-template[natTableLoading]`. */
type NatTableLoadingTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
    /** Alias for `status`, useful for `let-status` style template bindings. */
    readonly $implicit: 'loading';
    /** Current state row status. */
    readonly status: 'loading';
};
/** Context passed to `ng-template[natTableEmpty]`. */
type NatTableEmptyTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
    /** Alias for `status`, useful for `let-status` style template bindings. */
    readonly $implicit: 'empty';
    /** Current state row status. */
    readonly status: 'empty';
};
/** Context passed to `ng-template[natTableError]`. */
type NatTableErrorTemplateContext<TData extends RowData = RowData> = NatTableStateTemplateContext<TData> & {
    /** Alias for `error`, useful for `let-error` style template bindings. */
    readonly $implicit: unknown;
    /** Current state row status. */
    readonly status: 'error';
    /** Consumer-supplied error payload. */
    readonly error: unknown;
};

/**
 * Captures the custom loading body-row template rendered when
 * `<nat-table dataStatus="loading">` has no visible rows.
 */
declare class NatTableLoadingTemplate<TData extends RowData = RowData> {
    readonly templateRef: TemplateRef<any>;
    static ngTemplateContextGuard<TData extends RowData>(_directive: NatTableLoadingTemplate<TData>, context: unknown): context is NatTableLoadingTemplateContext<TData>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableLoadingTemplate<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableLoadingTemplate<any>, "ng-template[natTableLoading]", never, {}, {}, never, never, true, never>;
}
/**
 * Captures the custom empty body-row template rendered when a successful table
 * view has no matching rows.
 */
declare class NatTableEmptyTemplate<TData extends RowData = RowData> {
    readonly templateRef: TemplateRef<any>;
    static ngTemplateContextGuard<TData extends RowData>(_directive: NatTableEmptyTemplate<TData>, context: unknown): context is NatTableEmptyTemplateContext<TData>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableEmptyTemplate<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableEmptyTemplate<any>, "ng-template[natTableEmpty]", never, {}, {}, never, never, true, never>;
}
/**
 * Captures the custom error body-row template rendered when
 * `<nat-table dataStatus="error">` is active.
 */
declare class NatTableErrorTemplate<TData extends RowData = RowData> {
    readonly templateRef: TemplateRef<any>;
    static ngTemplateContextGuard<TData extends RowData>(_directive: NatTableErrorTemplate<TData>, context: unknown): context is NatTableErrorTemplateContext<TData>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableErrorTemplate<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableErrorTemplate<any>, "ng-template[natTableError]", never, {}, {}, never, never, true, never>;
}

/**
 * Context passed to `ng-template[natTableRowPlaceholder]`, rendered once per
 * visible column cell of a placeholder row — a logical row slot the table does
 * not hold under remote windowing (`remoteRowCount`).
 */
type NatTableRowPlaceholderTemplateContext<TData extends RowData = RowData> = {
    /** Alias for `logicalIndex`, useful for `let-logicalIndex` style template bindings. */
    readonly $implicit: number;
    /** Zero-based absolute logical row index of the unfetched slot. */
    readonly logicalIndex: number;
    /** Visible leaf column the placeholder cell belongs to. */
    readonly column: Column<TData, unknown>;
    /** TanStack table instance for advanced reads. */
    readonly table: Table<TData>;
};

/**
 * Captures the custom placeholder cell content rendered for logical row slots
 * the table does not hold under remote windowing (`remoteRowCount` on
 * `natTableVirtualize`). The template renders once per visible column cell of
 * each placeholder row. Without it, placeholder cells render empty but keep
 * the fixed-height row structure.
 */
declare class NatTableRowPlaceholderTemplate<TData extends RowData = RowData> {
    readonly templateRef: TemplateRef<any>;
    static ngTemplateContextGuard<TData extends RowData>(_directive: NatTableRowPlaceholderTemplate<TData>, context: unknown): context is NatTableRowPlaceholderTemplateContext<TData>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableRowPlaceholderTemplate<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableRowPlaceholderTemplate<any>, "ng-template[natTableRowPlaceholder]", never, {}, {}, never, never, true, never>;
}

/**
 * One rendered sub-header group segment: the group value, the group's total
 * row count across the sorted and filtered dataset (pre-pagination), and the
 * first row of the segment on the current page.
 */
type NatTableSubHeaderGroup<TData extends RowData = RowData> = {
    /** Value of the sub-header column shared by every row in the group. */
    readonly value: unknown;
    /** Rows in the group across the filtered dataset, ignoring pagination. */
    readonly rowCountValue: number;
    /** First row of the group segment on the current page. */
    readonly row: Row<TData>;
};
/** Context passed to `ng-template[natTableSubHeader]`. */
type NatTableSubHeaderTemplateContext<TData extends RowData = RowData> = {
    /** Alias for `value`, useful for `let-value` style template bindings. */
    readonly $implicit: unknown;
    /** Value of the sub-header column shared by every row in the group. */
    readonly value: unknown;
    /** Rows in the group across the filtered dataset, ignoring pagination. */
    readonly rowCountValue: number;
    /** First row of the group segment on the current page. */
    readonly row: Row<TData>;
    /** TanStack table instance for advanced reads. */
    readonly table: Table<TData>;
};

/**
 * Captures the custom sub-header content template rendered at the start of
 * each sub-header group when `subHeaderColumn` is set on `<nat-table>` or
 * `<nat-list>`. Without it, the group value renders as plain text.
 */
declare class NatTableSubHeaderTemplate<TData extends RowData = RowData> {
    readonly templateRef: TemplateRef<any>;
    static ngTemplateContextGuard<TData extends RowData>(_directive: NatTableSubHeaderTemplate<TData>, context: unknown): context is NatTableSubHeaderTemplateContext<TData>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableSubHeaderTemplate<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableSubHeaderTemplate<any>, "ng-template[natTableSubHeader]", never, {}, {}, never, never, true, never>;
}

/** Named data lifecycle states accepted by `<nat-table>`. */
declare const NAT_TABLE_DATA_STATUS: {
    readonly loading: "loading";
    readonly error: "error";
    readonly success: "success";
};
/** Named state rows rendered in the table body. */
declare const NAT_TABLE_BODY_STATE: {
    readonly rows: "rows";
    readonly loading: "loading";
    readonly empty: "empty";
    readonly error: "error";
};

/**
 * Payload emitted by {@link NatTable.rowRendered} when row render
 * instrumentation is enabled.
 */
type NatTableRowRenderedEvent = {
    /** Stable row identifier resolved from `getRowId`, `row.id`, or the namespaced positional fallback. */
    readonly rowId: string;
    /** Monotonic token for the render cycle that produced this row measurement. */
    readonly renderToken: number;
    /** Time, in milliseconds, between cycle start and this row becoming painted. */
    readonly durationMs: number;
};

/**
 * Serializable view state exposed by {@link NatTable} and emitted through
 * `stateChange`.
 */
type NatTableUserState = {
    /** Active single-column sort order. */
    readonly sorting: SortingState;
    /** Current global search query. */
    readonly globalFilter: string;
    /** Active column filters keyed by TanStack column id. */
    readonly columnFilters: ColumnFiltersState;
    /** Pagination cursor and page size. */
    readonly pagination: PaginationState;
    /** Visibility map for hideable columns. */
    readonly columnVisibility: VisibilityState;
    /** Leaf-column order, restored when columns are unpinned. */
    readonly columnOrder: ColumnOrderState;
    /** Left and right pinned column ids. */
    readonly columnPinning: ColumnPinningState;
    /** Per-column pixel widths keyed by column id, set by interactive resizing. */
    readonly columnSizing: ColumnSizingState;
    /** Selected row ids keyed by `getRowId`, a string/number `row.id`, or the namespaced positional fallback. */
    readonly rowSelection: RowSelectionState;
};
type NatTableMode = 'auto' | 'manual';
type NatTableModeConfiguration = {
    readonly pagination?: NatTableMode;
    readonly sorting?: NatTableMode;
    readonly filtering?: NatTableMode;
};
/** Alias to NatTableUserState for UI component consumption. */
type NatTableUiState = NatTableUserState;

/** Column zones used for reordering and pinned-offset bookkeeping. */
type ColumnReorderZone = 'left' | 'center' | 'right';
/** Keyboard reorder direction for a column (-1 = left, 1 = right). */
type ColumnReorderKeyboardDirection = -1 | 1;
/** Result of a column reorder operation — returned so callers can announce the change. */
type NatTableColumnReorderResult = {
    readonly movingColumnId: string;
    readonly zone: ColumnReorderZone;
    readonly nextVisibleZoneOrder: readonly string[];
};
/** Resolved per-column render state consumed by the table template. */
type TableColumnRenderState = {
    readonly label: string;
    readonly hiddenHeaderLabel: string | null;
    readonly alignEnd: boolean;
    readonly pinnedLeft: boolean;
    readonly pinnedRight: boolean;
    readonly hasPinnedEdgeLeft: boolean;
    readonly hasPinnedEdgeRight: boolean;
    readonly left: number | null;
    readonly right: number | null;
    readonly width: string | null;
    readonly minWidth: string | null;
    readonly maxWidth: string | null;
    readonly constrainedWidth: boolean;
    readonly headerWidth: string | null;
    readonly headerMinWidth: string | null;
    readonly headerMaxWidth: string | null;
    readonly headerConstrainedWidth: boolean;
    readonly cellHeight: string | null;
    readonly cellMaxLines: number | null;
    readonly ariaSort: 'ascending' | 'descending' | null;
    readonly rowHeader: boolean;
    /** Precomputed space-separated CSS classes for header cells. */
    readonly headerClassMap: string;
    /** Precomputed space-separated CSS classes for body cells. */
    readonly cellClassMap: string;
};

/** Semantic tone that can be applied to a rendered body cell. */
type NatTableCellTone = 'positive' | 'negative' | 'neutral' | 'warning';
/** Horizontal direction used by built-in and custom column-reorder controls. */
type NatTableColumnMoveDirection = 'left' | 'right';
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
    readonly value?: (context: NatTableColumnExportValueContext<TData, TValue>) => unknown;
};
/**
 * Extra metadata understood by `<nat-table>` when attached to a TanStack
 * column definition or optional companion UI.
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
    /** Optional callback that maps a cell to a semantic tone class. */
    readonly cellTone?: (context: CellContext<TData, TValue>) => NatTableCellTone | null;
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
    interface TableMeta<TData extends RowData> {
        /** Current table locale id exposed to companion header controls. */
        readonly natTableLocaleId?: string;
        /** Returns whether a visible column can move within its current pinned region. */
        readonly natTableCanMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => boolean;
        /** Moves a visible column within its current pinned region. Returns the reorder result, or null if no move occurred. */
        readonly natTableMoveColumn?: (columnId: string, direction: NatTableColumnMoveDirection) => NatTableColumnReorderResult | null;
        /** Whether the surface enables sorting; per-column enableSorting overrides. */
        readonly natTableSortingEnabled?: boolean;
        /** Active sub-header column id whose forced primary sort is hidden from sort UI, or null. */
        readonly natTableSubHeaderColumnId?: string | null;
        /** Whether the surface enables pinning; per-column enablePinning overrides. */
        readonly natTablePinningEnabled?: boolean;
        /**
         * Remote windowing: logical row count the grid represents when it exceeds
         * the loaded rows, or `null`/absent otherwise. Lets companion controls
         * detect that the core row model holds only a loaded window.
         */
        readonly natTableRemoteRowCount?: number | null;
    }
}

/**
 * Stable row id resolver passed to `getRowId` when the built-in string/number
 * `row.id` default is not enough. Matches TanStack Table's
 * `getRowId(originalRow, index, parentRow?)` shape so consumers can key sub-rows
 * consistently when they enable nested features later.
 */
type NatTableRowIdGetter<TData extends RowData = RowData> = (row: TData, index: number, parent?: Row<TData>) => string;
/**
 * Payload emitted by `(rowActivate)` when a body row is activated through a
 * primary click or an Enter / Space key press.
 *
 * The originating event is forwarded so consumers can call
 * `event.preventDefault()` or read modifier keys without re-deriving them.
 * The table only fires this event for activations that did not originate
 * from an interactive descendant (button, link, form control, menu item,
 * `contenteditable`), so cell-level controls keep their own behavior.
 */
type NatTableRowActivateEvent<TData extends RowData = RowData> = {
    /** Original row object supplied in `data`. */
    readonly rowData: TData;
    /** TanStack row instance for advanced interactions. */
    readonly row: Row<TData>;
    /** Pointer or keyboard event that triggered the activation. */
    readonly originalEvent: MouseEvent | KeyboardEvent;
};

/**
 * Engine-neutral body-row rendering contract.
 *
 * Core owns these types so `NatTableState` can consume a partial row window
 * without depending on any virtualization engine. The opt-in
 * `ng-advanced-table/virtualization` entry point implements the contract with
 * its own windowing engine; core never imports it, which is what keeps that
 * engine out of the bundle for tables that do not virtualize.
 *
 * Only `NatTableRowRenderStrategy` and `NatTableVirtualItem` are public — a
 * strategy author implements those. `NatTableRenderedBodyRow` and
 * `NatTableBodyRenderPlan` are the internal shape core hands to its own body
 * template and are deliberately absent from the public barrel.
 */
/**
 * One mounted row's logical index and body-local vertical extent, in CSS pixels.
 *
 * The index must be a unique in-range integer and the extent must be finite,
 * non-negative, and increasing. Core discards invalid and duplicate items so
 * malformed custom ranges cannot render duplicate rows or corrupt spacers.
 */
type NatTableVirtualItem = {
    readonly index: number;
    readonly start: number;
    readonly end: number;
};
/**
 * Low-level geometry strategy registered by an opt-in body-row renderer.
 *
 * This contract does not infer engine-specific range retention, cross-window
 * keyboard movement, focus recovery, measurement, lifecycle cleanup, or
 * diagnostics. Custom adapters own those behaviors. `totalSize` must cover at
 * least one `rowHeight` slot per logical row; invalid or undersized global
 * metrics make core fall back to the full-row renderer.
 *
 * ## Variable-height readiness (audit, #327 — documentation only)
 *
 * What core actually consumes, and what a future measured-height strategy
 * would have to satisfy:
 *
 * - **Structural — `items` + `totalSize`.** Core reads only `item.start` /
 *   `item.end` / `item.index` and `totalSize`. `buildNatTableBodyRenderPlan`
 *   turns them into `beforeSize` gaps and one trailing `afterSize`, and the
 *   table template renders those as native spacer rows. Nothing in that path
 *   assumes the extents are equal, contiguous, or a multiple of anything, so a
 *   per-row-height strategy expresses itself in this contract unchanged: it
 *   just emits items whose `end - start` differs per row.
 * - **Not structural — `rowHeight`.** Core uses the scalar in exactly two
 *   places, both guards: it rejects a non-positive height, and it rejects a
 *   `totalSize` smaller than `rows.length * rowHeight` (an undersized global
 *   extent would otherwise produce negative spacers). The rendered body never
 *   reads the scalar in TypeScript; the height itself is applied by core's
 *   `.data-table.is-virtualized` CSS from the `--sys-nat-table-virtual-row-height`
 *   custom property the strategy sets on its host. `rowHeight` is therefore an
 *   artifact of the current fixed-height strategy, not a requirement of the
 *   contract.
 * - **Consequence for a measured-height strategy.** Two assumptions would
 *   break. The `rows.length * rowHeight` floor, because with measured rows
 *   there is no single height that is simultaneously a valid lower bound and a
 *   useful sanity check; and core's fixed-height CSS rule above, which sizes
 *   every body row from one custom property and would have to be scoped off for
 *   a strategy that sizes rows individually. Such a strategy would need core's
 *   guard relaxed —
 *   e.g. `rowHeight` reinterpreted as a *minimum* row extent, or replaced by a
 *   `minRowExtent` field — plus its own scroll-offset correction when a
 *   measurement changes the extent of a row above the viewport. Core's plan
 *   builder, spacer rendering, ARIA row numbering (`subHeaderRowOffsets`,
 *   `gridRowCount`) and focus-retention seam all stay as they are.
 *
 * Measurement, estimation, and scroll anchoring are deliberately not
 * implemented here; this note only records which half of the contract a second
 * strategy could reuse as-is.
 */
type NatTableRowRenderStrategy = {
    readonly items: Signal<readonly NatTableVirtualItem[]>;
    readonly totalSize: Signal<number>;
    readonly rowHeight: Signal<number>;
    /**
     * Remote windowing: the logical row count the grid represents when it spans
     * more rows than the table holds, or `null` while the supplied row model is
     * the full extent. When non-null, item indexes, `totalSize`, `aria-rowcount`,
     * and reported totals are in logical (remote) coordinates, and every logical
     * index outside the loaded window renders as a placeholder row.
     *
     * Must derive from strategy configuration only — never from the table's row
     * model — because core reads it while building the TanStack options. Core
     * treats a value below the loaded row count as the loaded row count.
     */
    readonly logicalRowCount?: Signal<number | null>;
    /**
     * Remote windowing: logical index of the first supplied row. Ignored while
     * `logicalRowCount` is absent or `null`. Core clamps it so the loaded window
     * always fits inside the logical extent.
     */
    readonly rowWindowOffset?: Signal<number>;
};
/**
 * One loaded TanStack row plus any native-flow space immediately before it.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
type NatTableRenderedDataRow<TData extends RowData> = {
    readonly kind: 'row';
    readonly row: Row<TData>;
    readonly logicalIndex: number;
    readonly beforeSize: number;
};
/**
 * One mounted logical row slot with no loaded `Row` behind it — a remote
 * windowing gap the body renders as a fixed-height placeholder row.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
type NatTableRenderedPlaceholderRow = {
    readonly kind: 'placeholder';
    readonly logicalIndex: number;
    readonly beforeSize: number;
};
/**
 * One rendered body slot: a loaded row, or a placeholder for a logical index
 * the table does not hold. Both carry the absolute logical index and the
 * native-flow space rendered immediately before them.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
type NatTableRenderedBodyRow<TData extends RowData> = NatTableRenderedDataRow<TData> | NatTableRenderedPlaceholderRow;
/**
 * Engine-neutral body plan rendered by the single NatTable body template.
 *
 * Internal: core's body template consumes this, no entry point imports it.
 */
type NatTableBodyRenderPlan<TData extends RowData> = {
    readonly rows: readonly NatTableRenderedBodyRow<TData>[];
    readonly afterSize: number;
};

/**
 * The slice of table state a body-row rendering strategy needs to size, mount,
 * and focus a window of rows.
 *
 * This exists so `ng-advanced-table/virtualization` can drive the table without
 * core exporting `NatTableState` itself — that class is the internal per-table
 * hub and is deliberately not a public commitment. `NatTableState` structurally
 * satisfies this contract and `NatTable` aliases the token to it.
 */
type NatTableRowWindowHost<TData extends RowData = RowData> = {
    /** Rows in the final sorted/filtered/paginated model — the complete logical set. */
    readonly bodyRows: Signal<readonly Row<TData>[]>;
    /** Currently rendered body branch, used to recover focus across state-row transitions. */
    readonly bodyState: Signal<NatTableBodyState>;
    /**
     * The consumer-supplied data array. Tracked to re-measure on any
     * replacement; row identity, not this reference, decides whether the mounted
     * window resets.
     */
    readonly data: Signal<readonly TData[]>;
    /** Number of header rows, used to offset absolute ARIA row positions. */
    readonly headerRowCount: Signal<number>;
    /**
     * Whether `target` is an interactive control the cell delegates grid focus
     * to. Lets a row-window strategy tell a real grid focus target from an
     * unrelated descendant without core exposing its cell-interaction internals.
     */
    isDelegatedCellControl(cell: HTMLElement, target: HTMLElement): boolean;
    /** Full user state, used to reset the window when the row model changes. */
    readonly mergedState: Signal<NatTableUserState>;
    /** Trimmed caption text, used when measuring non-body chrome in the scroll region. */
    readonly resolvedCaption: Signal<string>;
    /** Whether the header sticks inside the scroll region. */
    readonly stickyHeader: Signal<boolean>;
    /**
     * Running count of sub-header rows rendered at or before each page row, by
     * page index — empty when no sub-header renders. Lets a fixed-height row
     * window place data row `i` at composite slot `i + offsets[i]` without
     * walking the row model, and lets absolute ARIA row positions skip past the
     * sub-header rows above a row. A windowed body cannot count those from the
     * DOM, because most of them are unmounted.
     */
    readonly subHeaderRowOffsets: Signal<readonly number[]>;
    /** The scrollable table region a strategy observes and scrolls. */
    readonly tableRegionRef: Signal<ElementRef<HTMLElement> | undefined>;
    /** Visible leaf columns in render order, used to restore focus by column. */
    readonly visibleColumns: Signal<readonly Column<TData, unknown>[]>;
};
/** Resolves the row-window host for the enclosing table. Provided by `NatTable`. */
declare const NAT_TABLE_ROW_WINDOW_HOST: InjectionToken<NatTableRowWindowHost<unknown>>;

/** Current sort direction for a header cell. */
type NatTableSortDirection = 'asc' | 'desc' | false;
/** Context passed to companion sort-indicator renderers. */
type NatTableSortIndicatorContext<TData extends RowData = RowData> = {
    /** Alias for `sortState`, useful for `let-state` style template bindings. */
    readonly $implicit: NatTableSortDirection;
    /** Current TanStack sort direction for the column. */
    readonly sortState: NatTableSortDirection;
    /** ARIA token applied to the header cell. */
    readonly ariaSort: 'ascending' | 'descending' | 'none';
    /** TanStack column instance for advanced custom indicators. */
    readonly column: Column<TData, unknown>;
    /** Resolved human-readable label for the column. */
    readonly label: string;
};

/**
 * Minimal table-controller contract consumed by UI companion controls.
 */
type NatTableUiController<TData extends RowData = RowData> = {
    readonly table: Table<TData>;
    enableGlobalFilter(): boolean;
    enablePagination(): boolean;
    patchState(updaters: Partial<{
        [K in keyof NatTableUiState]: Updater<NatTableUiState[K]>;
    }>): void;
    /** DOM id of the controlled `<table>`; companion controls bind `aria-controls` to this. */
    readonly tableElementId: Signal<string>;
    /** Scrollable container that wraps the controlled `<table>`, when available. */
    readonly tableScrollContainer?: Signal<HTMLElement | null>;
    /** Locale id used by generated companion-control labels, when available. */
    readonly localeId?: Signal<string>;
};

/**
 * Which renderer owns the accessibility surface. Selects renderer-specific
 * copy (a list announces fields and items where a grid announces columns and
 * rows) and gates the grid-only effects.
 */
type NatTableRendererKind = 'table' | 'list';

/**
 * Cross-cutting accessibility service for the table.
 *
 * Owns the live-region text signal, all `announce*()` methods that format
 * and push screen-reader announcements, snapshot capture, state-change diffing,
 * and ARIA multiselectable management.
 *
 * Provided alongside `NatTableState` in the component's `providers`. The
 * effects every renderer needs register themselves in the constructor, so a
 * renderer that merely provides the service still announces state changes;
 * `registerGridEffects` adds the `<table>`-only behavior, `registerListEffects`
 * adds the list-renderer set, and a non-grid renderer selects its announcement
 * copy through `setRenderer`.
 */
declare class NatTableA11yService<TData extends RowData = RowData> {
    private readonly natTableService;
    private readonly state;
    private renderer;
    private lastAccessibilitySnapshot;
    private previousResizingColumnId;
    /** Text written to the live region for screen-reader announcements. */
    readonly liveMessage: _angular_core.WritableSignal<string>;
    /** Whether announcements are enabled (gate signal from NatTableService). */
    readonly enableAnnouncements: _angular_core.WritableSignal<boolean>;
    /** Table summary string for `aria-describedby`. */
    readonly tableSummary: _angular_core.Signal<string>;
    /**
     * List summary string for `aria-describedby`, phrased as items and fields.
     * Falls back to the `tableSummary` formatter when a consumer overrode only
     * that one.
     */
    readonly listSummary: _angular_core.Signal<string>;
    constructor();
    /**
     * Selects renderer-specific announcement copy, so a list announces items and
     * fields where a grid (the default) announces rows and columns.
     */
    setRenderer(renderer: NatTableRendererKind): void;
    /**
     * Registers the grid-only effects: column-resize announcements, the
     * `aria-multiselectable` writer (which targets the rendered `<table>`), and
     * keybinding validation for the grid's resize/reorder shortcuts. A list
     * renderer supports none of these, so it skips them.
     */
    registerGridEffects(): void;
    /**
     * Registers the effects a list renderer needs: the `aria-multiselectable`
     * writer (self-gating — it only targets a rendered `[role="grid"]` element,
     * so a plain list stays untouched) and dev-mode keybinding validation (the
     * list shares the `rowActivate` and cell-interaction shortcuts). Column
     * resize announcements stay grid-only.
     */
    registerListEffects(): void;
    /**
     * Low-level announce: clears the live region, then sets the message on the
     * next microtask so the browser re-reads the region even when the text is
     * identical to the previous announcement.
     */
    announce(message: string): void;
    /**
     * Format a number for screen-reader readout using the resolved locale.
     */
    formatAccessibilityNumber(value: number): string;
    /**
     * Announce a column reorder. Called by `NatTableReorderService` and
     * companion header-action controls after applying the column order change.
     */
    announceColumnReorder(movingColumnId: string, zone: 'left' | 'center' | 'right', nextVisibleZoneOrder: readonly string[]): void;
    /**
     * Announce a column resize. Called by the resize service when a pointer
     * resize ends or by keyboard resize.
     */
    announceColumnResize(column: Column<TData, unknown>, width: number): void;
    private registerAnnouncementEffect;
    private registerResizeAnnouncementEffect;
    private handleResizeEnd;
    /**
     * Sets `aria-multiselectable` imperatively on the rendered grid element —
     * the `<table>` or, for a list with composite item navigation, the `<ul>`
     * carrying `role="grid"` (a plain list renders no grid element, so the
     * effect is inert there; `aria-multiselectable` is invalid on `role="list"`).
     * Written via `afterRenderEffect` because `ngGrid` clobbers template bindings.
     */
    private registerAriaMultiSelectableEffect;
    private buildTableSummary;
    private captureAccessibilitySnapshot;
    private registerAccessibleNameValidationEffect;
    private registerKeybindingValidationEffect;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableA11yService<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableA11yService<any>>;
}

/**
 * Per-table service that manages header-cell ResizeObserver lifecycle and
 * viewport-width measurement. Writes measured widths back to the store
 * so the authoritative column-width layout stays in sync.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
declare class NatTableHeaderMeasurementService<TData extends RowData = RowData> {
    private readonly state;
    private readonly destroyRef;
    private headerResizeObserver;
    constructor();
    private initializeHeaderObservation;
    private reattachHeaderObservers;
    private measureHeaderWidths;
    private measureRegionViewportWidth;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableHeaderMeasurementService<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableHeaderMeasurementService<any>>;
}

/** Per-table registry for an optional body-row rendering strategy. */
declare class NatTableRowRenderStrategyRegistry {
    private readonly registeredStrategy;
    readonly strategy: _angular_core.Signal<NatTableRowRenderStrategy | null>;
    register(strategy: NatTableRowRenderStrategy): () => void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableRowRenderStrategyRegistry, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableRowRenderStrategyRegistry>;
}

/** A keyboard shortcut definition matching properties of standard browser {@link KeyboardEvent}. */
type NatTableShortcut = {
    /** The value of the key property, e.g. `'ArrowLeft'`, `'Enter'`, `'a'`. */
    readonly key: string;
    /** Whether the Ctrl key is required to be pressed. */
    readonly ctrlKey?: boolean;
    /** Whether the Alt key is required to be pressed. */
    readonly altKey?: boolean;
    /** Whether the Shift key is required to be pressed. */
    readonly shiftKey?: boolean;
    /** Whether the Meta (Command/Windows) key is required to be pressed. */
    readonly metaKey?: boolean;
    /** Maps to Command (metaKey) on Mac/iOS, and Control (ctrlKey) on other platforms. */
    readonly cmdOrCtrlKey?: boolean;
};
/** Configurable value for a keybinding, either a string shorthand, a shortcut object, or a list of them. */
type NatTableShortcutValue = string | NatTableShortcut | (string | NatTableShortcut)[];
/** Keyboard interaction shortcuts configuration. */
type NatTableKeybindings = {
    /** Keys that activate a row. Default: `['Enter', ' ', 'Spacebar']` */
    readonly rowActivate?: NatTableShortcutValue;
    /** Key combination to reorder a column to the left. Default: `'Mod+Shift+ArrowLeft'` */
    readonly columnReorderLeft?: NatTableShortcutValue;
    /** Key combination to reorder a column to the right. Default: `'Mod+Shift+ArrowRight'` */
    readonly columnReorderRight?: NatTableShortcutValue;
    /** Key combination to step into a cell's first interactive control. Default: `'Enter'` */
    readonly cellEnterControl?: NatTableShortcutValue;
    /** Key combination to return focus from a control back to the parent cell. Default: `'Escape'` */
    readonly cellExitControl?: NatTableShortcutValue;
    /** Key combination to move to the next interactive control inside a cell. Default: `'Tab'` */
    readonly cellTabNextControl?: NatTableShortcutValue;
    /** Key combination to move to the previous interactive control inside a cell. Default: `'Shift+Tab'` */
    readonly cellTabPrevControl?: NatTableShortcutValue;
};
/** A compiled, functional keyboard shortcuts helper mapping KeyboardEvents to actions. */
type NatTableKeyboard = {
    readonly cellInteraction: {
        readonly enter: (event: KeyboardEvent) => boolean;
        readonly exit: (event: KeyboardEvent) => boolean;
        readonly next: (event: KeyboardEvent) => boolean;
        readonly previous: (event: KeyboardEvent) => boolean;
    };
    readonly rowActivate: (event: KeyboardEvent) => boolean;
    readonly columnReorderDirection: (event: KeyboardEvent) => -1 | 1 | null;
};

type NatTableColumnResizeMode = 'onEnd' | 'onChange';
type NatTableColumnSizingMode = 'fill' | 'fixed';
type NatTableDirection = 'ltr' | 'rtl';
type NatTableConfig = {
    state: Partial<NatTableUserState>;
    initialState: Partial<NatTableUserState>;
    mode: NatTableMode | NatTableModeConfiguration;
    manualPageCount: number | undefined;
    enableAnnouncements: boolean;
    stickyHeader: boolean;
    enableMultiSort: boolean;
    locale: string | undefined;
    accessibilityText: NatTableAccessibilityText;
    keybindings: NatTableKeybindings;
    columnResizeMode: NatTableColumnResizeMode;
    columnSizingMode: NatTableColumnSizingMode;
    enableColumnResizing: boolean;
    enableReordering: boolean;
    enableSorting: boolean;
    enablePinning: boolean;
    direction: NatTableDirection | undefined;
};
/**
 * Scoped service to share the active table controller instance within a DI hierarchy.
 */
declare class NatTableService<TData extends RowData = RowData> {
    private readonly controllerSignal;
    readonly controller: _angular_core.Signal<NatTableUiController<TData> | null>;
    private readonly stateSignal;
    readonly state: _angular_core.Signal<Partial<NatTableUserState>>;
    readonly surfaceInitialState: WritableSignal<Partial<NatTableUserState>>;
    readonly surfaceMode: WritableSignal<NatTableMode | NatTableModeConfiguration>;
    readonly manualPageCount: WritableSignal<number | undefined>;
    readonly enableAnnouncements: WritableSignal<boolean>;
    readonly stickyHeader: WritableSignal<boolean>;
    readonly enableMultiSort: WritableSignal<boolean>;
    readonly locale: WritableSignal<string | undefined>;
    readonly accessibilityText: WritableSignal<NatTableAccessibilityText>;
    readonly columnResizeMode: WritableSignal<"onEnd" | "onChange">;
    readonly columnSizingMode: WritableSignal<"fill" | "fixed">;
    readonly enableColumnResizing: WritableSignal<boolean>;
    readonly enableReordering: WritableSignal<boolean>;
    readonly enableSorting: WritableSignal<boolean>;
    readonly enablePinning: WritableSignal<boolean>;
    readonly direction: WritableSignal<"ltr" | "rtl" | undefined>;
    private readonly globalKeybindings;
    readonly surfaceKeybindings: WritableSignal<NatTableKeybindings>;
    readonly keybindings: _angular_core.Signal<Required<NatTableKeybindings>>;
    readonly keyboard: _angular_core.Signal<ng_advanced_table.NatTableKeyboard>;
    readonly manualPagination: _angular_core.Signal<boolean>;
    readonly manualSorting: _angular_core.Signal<boolean>;
    readonly manualFiltering: _angular_core.Signal<boolean>;
    private readonly paginationRegistrations;
    readonly hasPagination: _angular_core.Signal<boolean>;
    private readonly searchRegistrations;
    readonly hasSearch: _angular_core.Signal<boolean>;
    readonly stateChangeEvent: WritableSignal<NatTableUserState | null>;
    setController(controller: NatTableUiController<TData> | null): void;
    clearController(controller: NatTableUiController<TData>): void;
    notifyStateChange(state: NatTableUserState): void;
    updateState(updater: (current: Partial<NatTableUserState>) => Partial<NatTableUserState>): void;
    setState(value: Partial<NatTableUserState>): void;
    patchState(config: Partial<NatTableConfig>): void;
    registerPagination(): void;
    unregisterPagination(): void;
    registerSearch(): void;
    unregisterSearch(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableService<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableService<any>>;
}

/**
 * Signals-first Angular table primitive built on TanStack Table.
 *
 * The core component renders the table structure only. Optional controls,
 * header actions, and themed surfaces live in companion packages.
 *
 * State ownership, TanStack wiring, column widths, resize/reorder state logic
 * and derived computeds are delegated to the injected `NatTableState`.
 * Accessibility announcements are handled by `NatTableA11yService`.
 * Resize DOM interactions are handled by `NatTableResizeService`.
 * Reorder scroll-into-view is handled by `NatTableReorderService`.
 * Header measurement is handled by `NatTableHeaderMeasurementService`.
 */
declare class NatTable<TData extends RowData = RowData> implements NatTableUiController<TData> {
    /** Row data rendered by the table. */
    readonly data: _angular_core.InputSignal<readonly TData[]>;
    /** TanStack column definitions for the current row type. */
    readonly columns: _angular_core.InputSignal<readonly ColumnDef<TData, unknown>[]>;
    /** Accessible name announced for the grid when no visible caption is rendered. */
    readonly accessibleName: _angular_core.InputSignal<string | undefined>;
    /** Visible table caption. When present, it provides the grid's accessible name. */
    readonly caption: _angular_core.InputSignal<string | undefined>;
    /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
    readonly dataStatus: _angular_core.InputSignal<NatTableDataStatus>;
    /** Optional error payload passed through to `natTableError` templates. */
    readonly error: _angular_core.InputSignal<unknown>;
    /** Enables row selection (`aria-selected`, selection state, companion checkbox column). */
    readonly enableRowSelection: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    readonly selectionMode: _angular_core.InputSignal<"single" | "multiple">;
    /** Optional override for the global filter implementation. */
    readonly globalFilterFn: _angular_core.InputSignal<FilterFn<TData> | undefined>;
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    readonly getRowId: _angular_core.InputSignal<NatTableRowIdGetter<TData> | undefined>;
    /** Emits one `rowRendered` event per body row per cycle. Off by default (adds an `afterRenderEffect` per row). */
    readonly emitRowRenderEvents: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Leaf column id whose value groups rows under rendered sub-header rows.
     * The table always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    readonly subHeaderColumn: _angular_core.InputSignal<string | undefined>;
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    readonly subHeaderOrder: _angular_core.InputSignal<readonly unknown[] | undefined>;
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this table only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    readonly enableSubHeaders: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Layout mode for the sub-header row.
     * - `'colspan'` (default): Renders a single cell spanning the entire row.
     * - `'cells'`: Renders individual cells matching the column structure, preserving pinned column boundaries.
     */
    readonly subHeaderLayout: _angular_core.InputSignal<"colspan" | "cells">;
    /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
    readonly rowRendered: _angular_core.OutputEmitterRef<NatTableRowRenderedEvent>;
    /** Emits on row click or Enter/Space unless the event started on an interactive descendant. */
    readonly rowActivate: _angular_core.OutputEmitterRef<NatTableRowActivateEvent<TData>>;
    private readonly natTableService;
    private readonly state;
    private readonly a11yService;
    private readonly resizeService;
    private readonly reorderService;
    private readonly destroyRef;
    /** Public: NatTableUiController consumers (surface `[for]="grid"`) need these. */
    readonly enablePagination: _angular_core.Signal<boolean>;
    readonly enableGlobalFilter: _angular_core.Signal<boolean>;
    readonly table: ng_advanced_table.Table<TData>;
    /** Stable DOM id for the rendered `<table>` element. */
    readonly tableElementId: _angular_core.WritableSignal<string>;
    /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
    readonly tableScrollContainer: _angular_core.Signal<HTMLElement | null>;
    /** Resolved locale id (from the surface or the built-in English default). */
    readonly localeId: _angular_core.Signal<string>;
    protected readonly headerGroups: _angular_core.Signal<HeaderGroup<TData>[]>;
    protected readonly bodyRows: _angular_core.Signal<Row<TData>[]>;
    protected readonly bodyRenderPlan: _angular_core.Signal<NatTableBodyRenderPlan<TData>>;
    protected readonly headerRowCount: _angular_core.Signal<number>;
    protected readonly gridRowCount: _angular_core.Signal<number>;
    protected readonly visibleColumns: _angular_core.Signal<Column<TData, unknown>[]>;
    protected readonly bodyState: _angular_core.Signal<ng_advanced_table.NatTableBodyState>;
    protected readonly resolvedDataStatus: _angular_core.Signal<NatTableDataStatus>;
    protected readonly resolvedCaption: _angular_core.Signal<string>;
    protected readonly resolvedDirection: _angular_core.Signal<"ltr" | "rtl">;
    protected readonly stickyHeader: _angular_core.Signal<boolean>;
    protected readonly usesAuthoritativeLayout: _angular_core.Signal<boolean>;
    protected readonly tableClassMap: _angular_core.Signal<string>;
    protected readonly fixedLayoutTableWidth: _angular_core.Signal<number>;
    protected readonly resolvedColumnWidths: _angular_core.Signal<Record<string, number>>;
    protected readonly columnRenderStates: _angular_core.Signal<Record<string, TableColumnRenderState>>;
    protected readonly visibleColumnCount: _angular_core.Signal<number>;
    protected readonly emptyStateColSpan: _angular_core.Signal<number>;
    protected readonly tableAriaBusy: _angular_core.Signal<"true" | null>;
    protected readonly renderCycleToken: _angular_core.WritableSignal<number>;
    protected readonly renderCycleStartedAt: _angular_core.WritableSignal<number>;
    protected readonly resolvedDescription: _angular_core.Signal<string>;
    protected readonly resolvedEmptyState: _angular_core.Signal<string>;
    protected readonly resolvedLoadingState: _angular_core.Signal<string>;
    protected readonly resolvedErrorState: _angular_core.Signal<string>;
    protected readonly tableCaptionId: _angular_core.Signal<string>;
    protected readonly tableSummaryId: _angular_core.Signal<string>;
    protected readonly tableDescriptionId: _angular_core.Signal<string>;
    protected readonly tableKeyboardInstructionsId: _angular_core.Signal<string>;
    protected readonly tableAriaLabel: _angular_core.Signal<string | null>;
    protected readonly tableAriaLabelledBy: _angular_core.Signal<string | null>;
    protected readonly resolvedKeyboardInstructions: _angular_core.Signal<string>;
    protected readonly ariaDescribedBy: _angular_core.Signal<string | null>;
    private readonly loadingTemplate;
    private readonly emptyTemplate;
    private readonly errorTemplate;
    private readonly subHeaderTemplate;
    private readonly rowPlaceholderTemplate;
    protected readonly loadingTemplateRef: _angular_core.Signal<TemplateRef<NatTableLoadingTemplateContext<TData>> | null>;
    protected readonly emptyTemplateRef: _angular_core.Signal<TemplateRef<NatTableEmptyTemplateContext<TData>> | null>;
    protected readonly errorTemplateRef: _angular_core.Signal<TemplateRef<NatTableErrorTemplateContext<TData>> | null>;
    protected readonly subHeaderTemplateRef: _angular_core.Signal<TemplateRef<NatTableSubHeaderTemplateContext<TData>> | null>;
    protected readonly rowPlaceholderTemplateRef: _angular_core.Signal<TemplateRef<NatTableRowPlaceholderTemplateContext<TData>> | null>;
    protected readonly subHeaderGroups: _angular_core.Signal<ReadonlyMap<string, NatTableSubHeaderGroup<TData>>>;
    protected readonly subHeaderRowOffsets: _angular_core.Signal<readonly number[]>;
    protected getSubHeaderContext(group: NatTableSubHeaderGroup<TData>): NatTableSubHeaderTemplateContext<TData>;
    protected getSubHeaderAriaText(group: NatTableSubHeaderGroup<TData>): string;
    protected getRowPlaceholderContext(logicalIndex: number, column: Column<TData, unknown>): NatTableRowPlaceholderTemplateContext<TData>;
    protected getRowPlaceholderAriaText(logicalIndex: number): string;
    /** Bound to the body plan `@for` track; see `trackNatTableBodyRow`. */
    protected readonly bodyRowTrackId: (renderedRow: NatTableRenderedBodyRow<TData>) => string;
    protected readonly loadingTemplateContext: _angular_core.Signal<NatTableLoadingTemplateContext<TData>>;
    protected readonly emptyTemplateContext: _angular_core.Signal<NatTableEmptyTemplateContext<TData>>;
    protected readonly errorTemplateContext: _angular_core.Signal<NatTableErrorTemplateContext<TData>>;
    protected readonly tableSummary: _angular_core.Signal<string>;
    protected readonly liveMessage: _angular_core.WritableSignal<string>;
    protected readonly columnResizeGuide: _angular_core.Signal<{
        readonly left: number;
        readonly offset: number;
    } | null>;
    protected readonly isColumnResizing: _angular_core.Signal<boolean>;
    private readonly tableRegionRef;
    protected readonly getHeaderRowColumnIds: (headerGroup: HeaderGroup<TData>) => string[];
    protected readonly shouldHidePrimitiveHeaderLabel: (header: Header<TData, unknown>, columnState: {
        readonly hiddenHeaderLabel: string | null;
    } | undefined) => boolean;
    protected readonly getCellTone: (column: Column<TData, unknown>, context: ng_advanced_table.CellContext<TData, unknown>) => ng_advanced_table.NatTableCellTone | null;
    protected readonly canResizeColumn: (header: Header<TData, unknown>) => boolean;
    protected readonly isLeafHeaderRow: (headerGroup: HeaderGroup<TData>) => boolean;
    protected readonly hasReorderableColumns: () => boolean;
    protected readonly canReorderHeader: (header: Header<TData, unknown>) => boolean;
    constructor();
    patchState(updaters: Partial<{
        [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>): void;
    protected onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void;
    protected onHeaderKeydown(event: KeyboardEvent, column: Column<TData, unknown>): void;
    protected onResizeStart(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void;
    protected onRowRendered(event: NatTableRowRenderedEvent): void;
    protected rowAriaSelected(row: Row<TData>): boolean | null;
    protected onRowClick(event: MouseEvent, row: Row<TData>): void;
    protected onRowKeydown(event: KeyboardEvent, row: Row<TData>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTable<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NatTable<any>, "nat-table", ["natTable"], { "data": { "alias": "data"; "required": true; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "accessibleName": { "alias": "accessibleName"; "required": false; "isSignal": true; }; "caption": { "alias": "caption"; "required": false; "isSignal": true; }; "dataStatus": { "alias": "dataStatus"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "enableRowSelection": { "alias": "enableRowSelection"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "globalFilterFn": { "alias": "globalFilterFn"; "required": false; "isSignal": true; }; "getRowId": { "alias": "getRowId"; "required": false; "isSignal": true; }; "emitRowRenderEvents": { "alias": "emitRowRenderEvents"; "required": false; "isSignal": true; }; "subHeaderColumn": { "alias": "subHeaderColumn"; "required": false; "isSignal": true; }; "subHeaderOrder": { "alias": "subHeaderOrder"; "required": false; "isSignal": true; }; "enableSubHeaders": { "alias": "enableSubHeaders"; "required": false; "isSignal": true; }; "subHeaderLayout": { "alias": "subHeaderLayout"; "required": false; "isSignal": true; }; }, { "rowRendered": "rowRendered"; "rowActivate": "rowActivate"; }, ["loadingTemplate", "emptyTemplate", "errorTemplate", "subHeaderTemplate", "rowPlaceholderTemplate"], never, true, never>;
}

/**
 * Presentation for the non-row body states. All three share the `list-state`
 * base class and add one state modifier, so consumers can theme them together
 * through the shared `--nat-list-state-*` tokens or individually through
 * the per-state accent tokens.
 */
declare const LIST_STATE_VIEWS: {
    readonly loading: {
        readonly className: "list-state list-state-loading";
        readonly testId: "nat-list-loading-state";
    };
    readonly empty: {
        readonly className: "list-state list-state-empty";
        readonly testId: "nat-list-empty-state";
    };
    readonly error: {
        readonly className: "list-state list-state-error";
        readonly testId: "nat-list-error-state";
    };
};

/** Body states that render a state item rather than rows. */
type NatListStateKey = keyof typeof LIST_STATE_VIEWS;
/** Rendered presentation for one non-row body state. */
type NatListStateView = {
    /** `list-state` base class plus the per-state modifier. */
    readonly className: string;
    /** Stable test hook for the state item. */
    readonly testId: string;
    /** The body state this item represents. */
    readonly state: NatListStateKey;
    /** Localized message rendered when no consumer template is projected. */
    readonly message: string;
};

/**
 * SPIKE: list renderer sharing the table engine (`NatTableState`).
 *
 * Renders each row as a stacked list item whose fields follow the visible
 * column order, so sorting, filtering, column order, and column visibility
 * state drive the list exactly as they drive the table. Implements
 * `NatTableUiController`, so surface-bound companion controls resolve it.
 *
 * `enableItemNavigation` opts into the table's composite grid pattern
 * (`@angular/aria/grid` + the cell-interaction model) with one gridcell per
 * item.
 *
 * Deliberately omitted: column resizing, pinning, header measurement, and
 * reorder DOM affordances — consumers drive sorting and field order through
 * surface state / `patchState`.
 */
declare class NatList<TData extends RowData = RowData> implements NatTableUiController<TData> {
    /** Row data rendered by the list. */
    readonly data: _angular_core.InputSignal<readonly TData[]>;
    /** TanStack column definitions for the current row type. */
    readonly columns: _angular_core.InputSignal<readonly ColumnDef<TData, unknown>[]>;
    /** Accessible name announced for the list. */
    readonly accessibleName: _angular_core.InputSignal<string | undefined>;
    /** Data lifecycle status. The list renders state items; consumers still own loading, retry, and error handling. */
    readonly dataStatus: _angular_core.InputSignal<NatTableDataStatus>;
    /** Optional error payload. */
    readonly error: _angular_core.InputSignal<unknown>;
    /** Optional override for the global filter implementation. */
    readonly globalFilterFn: _angular_core.InputSignal<FilterFn<TData> | undefined>;
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    readonly getRowId: _angular_core.InputSignal<NatTableRowIdGetter<TData> | undefined>;
    /**
     * Enables row selection state. Pair with a selection column (for example
     * `withNatTableSelectionColumn(...)`) to render a per-item checkbox; the
     * item then carries `data-selected` for styling.
     */
    readonly enableRowSelection: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    readonly selectionMode: _angular_core.InputSignal<"single" | "multiple">;
    /**
     * Makes items activatable: each item renders a stretched activator button
     * that emits `rowActivate` on click and Enter/Space.
     *
     * A real `<button>` rather than a focusable `<li>`: a focusable listitem
     * exposes no interactive role, so assistive technology would announce it as
     * plain text with no way to discover that Enter does anything (WCAG 4.1.2).
     * Opt-in because it adds a tab stop per item.
     *
     * With `enableItemNavigation` the activator is not rendered: the focusable
     * gridcell already carries an interactive role, so items activate on click
     * and on the `rowActivate` shortcut directly, exactly like table rows.
     */
    readonly enableRowActivation: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Leaf column id whose value groups items under rendered sub-header items.
     * The list always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    readonly subHeaderColumn: _angular_core.InputSignal<string | undefined>;
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    readonly subHeaderOrder: _angular_core.InputSignal<readonly unknown[] | undefined>;
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this list only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    readonly enableSubHeaders: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Enables composite item navigation (the APG layout-grid pattern, shared
     * with `NatTable`): the list becomes one tab stop, Up/Down arrows move a
     * roving focus between items, Enter steps into an item's controls, Tab
     * cycles through them, and Escape returns to the item. Items render as
     * `role="row"`/`role="gridcell"` instead of plain list items, items emit
     * `rowActivate` on click and on the `rowActivate` shortcut, and native
     * controls inside fields are managed into the roving tab order.
     *
     * Opt-in: the default plain list keeps browse-mode-friendly `role="list"`
     * semantics, which suit short lists; composite navigation suits long lists
     * where one tab stop per item would make keyboard traversal expensive.
     */
    readonly enableItemNavigation: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Emits when an item's activator button is clicked or keyboard-activated. */
    readonly rowActivate: _angular_core.OutputEmitterRef<NatTableRowActivateEvent<TData>>;
    private readonly natTableService;
    private readonly state;
    private readonly a11yService;
    private readonly destroyRef;
    readonly enablePagination: _angular_core.Signal<boolean>;
    readonly enableGlobalFilter: _angular_core.Signal<boolean>;
    readonly table: ng_advanced_table.Table<TData>;
    /** Stable DOM id for the rendered `<ul>` element. */
    readonly tableElementId: _angular_core.WritableSignal<string>;
    /** Scrollable wrapper around the rendered list for companion scroll controls. */
    readonly tableScrollContainer: _angular_core.Signal<HTMLElement | null>;
    /** Resolved locale id (from the surface or the built-in English default). */
    readonly localeId: _angular_core.Signal<string>;
    protected readonly bodyRows: _angular_core.Signal<Row<TData>[]>;
    protected readonly visibleColumns: _angular_core.Signal<ng_advanced_table.Column<TData, unknown>[]>;
    protected readonly bodyState: _angular_core.Signal<ng_advanced_table.NatTableBodyState>;
    /**
     * Default stacked `grid-template-areas` for a list item: one row per visible
     * column, named by column id. Written to the internal `--sys-*` bridge so a
     * consumer's `--nat-list-item-areas` (plus `-columns`) can lay out the
     * named field areas freely; each field carries `grid-area: <column-id>`.
     */
    protected readonly defaultItemAreas: _angular_core.Signal<string>;
    protected readonly tableAriaBusy: _angular_core.Signal<"true" | null>;
    protected readonly resolvedDirection: _angular_core.Signal<"ltr" | "rtl">;
    protected readonly resolvedDescription: _angular_core.Signal<string>;
    protected readonly resolvedEmptyState: _angular_core.Signal<string>;
    protected readonly resolvedLoadingState: _angular_core.Signal<string>;
    protected readonly resolvedErrorState: _angular_core.Signal<string>;
    protected readonly listSummaryId: _angular_core.Signal<string>;
    protected readonly tableDescriptionId: _angular_core.Signal<string>;
    protected readonly tableKeyboardInstructionsId: _angular_core.Signal<string>;
    protected readonly resolvedListKeyboardInstructions: _angular_core.Signal<string>;
    protected readonly listAriaLabel: _angular_core.Signal<string | null>;
    /**
     * Rendered loading/empty/error item, or `null` while rows are shown. Keeps
     * the three states on one markup shape so they share a base design.
     */
    protected readonly stateView: _angular_core.Signal<NatListStateView | null>;
    private readonly loadingTemplate;
    private readonly emptyTemplate;
    private readonly errorTemplate;
    private readonly subHeaderTemplate;
    protected readonly subHeaderGroups: _angular_core.Signal<ReadonlyMap<string, NatTableSubHeaderGroup<TData>>>;
    protected readonly subHeaderTemplateRef: _angular_core.Signal<TemplateRef<NatTableSubHeaderTemplateContext<TData>> | null>;
    protected getSubHeaderContext(group: NatTableSubHeaderGroup<TData>): NatTableSubHeaderTemplateContext<TData>;
    protected getSubHeaderAriaText(group: NatTableSubHeaderGroup<TData>): string;
    /**
     * Active consumer state template plus its context, or `null` to fall back to
     * the built-in indicator and message. The template replaces the state item's
     * content while keeping the shared `list-state` shell and its style tokens.
     */
    protected readonly stateTemplateView: _angular_core.Signal<{
        templateRef: TemplateRef<unknown>;
        context: ng_advanced_table.NatTableLoadingTemplateContext<TData> | ng_advanced_table.NatTableEmptyTemplateContext<TData> | ng_advanced_table.NatTableErrorTemplateContext<TData>;
    } | null>;
    protected readonly listSummary: _angular_core.Signal<string>;
    protected readonly liveMessage: _angular_core.WritableSignal<string>;
    protected readonly ariaDescribedBy: _angular_core.Signal<string | null>;
    private readonly listRegionRef;
    protected readonly resolveColumnLabel: (column: ng_advanced_table.Column<TData, unknown>) => string;
    protected readonly cellForColumn: (row: Row<TData>, columnId: string) => ng_advanced_table.Cell<TData, unknown> | null;
    protected readonly hasStaticLabel: (column: ng_advanced_table.Column<TData, unknown>) => boolean;
    protected readonly isSrOnlyLabel: (column: ng_advanced_table.Column<TData, unknown>) => boolean;
    /**
     * Selected flag for a list item, or `null` when selection is disabled.
     *
     * Exposed as `data-selected` rather than `aria-selected`: `aria-selected` is
     * invalid on `role="listitem"`, and the selection control inside the item
     * (a real checkbox) already conveys state to assistive technology. In
     * composite mode the item row additionally carries `aria-selected` (valid on
     * `role="row"`) via `rowAriaSelected`, mirroring the table.
     */
    protected rowSelectedAttribute(row: Row<TData>): string | null;
    /** `aria-selected` for a composite-mode item row, mirroring `NatTable`. */
    protected rowAriaSelected(row: Row<TData>): boolean | null;
    /** Leaf header contexts by column id, for rendering non-string header defs as field labels. */
    protected readonly leafHeaderContexts: _angular_core.Signal<Map<string, HeaderContext<TData, unknown>>>;
    constructor();
    /**
     * Id of the item's first visible field, naming the activator button via
     * `aria-labelledby`. Keyed by render index, not `row.id`: row ids come from
     * the consumer's `getRowId` and may contain whitespace or other characters
     * that break an id reference (`aria-labelledby` is a space-separated list),
     * which would leave the activator with no accessible name.
     */
    protected activatorLabelId(index: number): string;
    protected onActivatorClick(event: MouseEvent, row: Row<TData>): void;
    protected onActivatorKeydown(event: KeyboardEvent, row: Row<TData>): void;
    protected onItemClick(event: MouseEvent, row: Row<TData>): void;
    protected onItemKeydown(event: KeyboardEvent, row: Row<TData>): void;
    patchState(updaters: Partial<{
        [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatList<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NatList<any>, "nat-list", ["natList"], { "data": { "alias": "data"; "required": true; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "accessibleName": { "alias": "accessibleName"; "required": false; "isSignal": true; }; "dataStatus": { "alias": "dataStatus"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "globalFilterFn": { "alias": "globalFilterFn"; "required": false; "isSignal": true; }; "getRowId": { "alias": "getRowId"; "required": false; "isSignal": true; }; "enableRowSelection": { "alias": "enableRowSelection"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "enableRowActivation": { "alias": "enableRowActivation"; "required": false; "isSignal": true; }; "subHeaderColumn": { "alias": "subHeaderColumn"; "required": false; "isSignal": true; }; "subHeaderOrder": { "alias": "subHeaderOrder"; "required": false; "isSignal": true; }; "enableSubHeaders": { "alias": "enableSubHeaders"; "required": false; "isSignal": true; }; "enableItemNavigation": { "alias": "enableItemNavigation"; "required": false; "isSignal": true; }; }, { "rowActivate": "rowActivate"; }, ["loadingTemplate", "emptyTemplate", "errorTemplate", "subHeaderTemplate"], never, true, never>;
}

/**
 * Static table renderer sharing the table engine (`NatTableState`).
 *
 * Renders the same surface-driven state as `NatTable` — sorting, filtering,
 * pinning, column order/visibility/sizing, sub-headers, and data states — as a
 * plain semantic `<table>` with no ARIA grid: no grid roles, no roving cell
 * keyboard model, no cell tab stops, and no managed in-cell controls. Controls
 * rendered inside cells stay in the natural tab order. Implements
 * `NatTableUiController`, so surface-bound companion controls resolve it.
 *
 * Deliberately omitted: the grid keyboard model, drag/keyboard column
 * reordering, column resize affordances, cell-interaction management, and
 * virtualization — none of `@angular/aria` or the CDK drag machinery is
 * imported, so consumers using only the static renderer tree-shake them away.
 * Cells built on `ngGridCellWidget` require the grid context and cannot render
 * here; exclude those columns, as with `NatList`.
 */
declare class NatTableStatic<TData extends RowData = RowData> implements NatTableUiController<TData> {
    /** Row data rendered by the table. */
    readonly data: _angular_core.InputSignal<readonly TData[]>;
    /** TanStack column definitions for the current row type. */
    readonly columns: _angular_core.InputSignal<readonly ColumnDef<TData, unknown>[]>;
    /** Accessible name announced for the table when no visible caption is rendered. */
    readonly accessibleName: _angular_core.InputSignal<string | undefined>;
    /** Visible table caption. When present, it provides the table's accessible name. */
    readonly caption: _angular_core.InputSignal<string | undefined>;
    /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
    readonly dataStatus: _angular_core.InputSignal<NatTableDataStatus>;
    /** Optional error payload passed through to `natTableError` templates. */
    readonly error: _angular_core.InputSignal<unknown>;
    /** Enables row selection state. Selected rows carry `data-selected` for styling. */
    readonly enableRowSelection: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
    readonly selectionMode: _angular_core.InputSignal<"single" | "multiple">;
    /** Optional override for the global filter implementation. */
    readonly globalFilterFn: _angular_core.InputSignal<FilterFn<TData> | undefined>;
    /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
    readonly getRowId: _angular_core.InputSignal<NatTableRowIdGetter<TData> | undefined>;
    /**
     * Leaf column id whose value groups rows under rendered sub-header rows.
     * The table always sorts by this column first (hidden from sort UI and
     * emitted state); user sorting applies within groups. Unset or unknown ids
     * disable the feature.
     */
    readonly subHeaderColumn: _angular_core.InputSignal<string | undefined>;
    /**
     * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
     * Unlisted values sort after listed ones in natural ascending order.
     * Requires `subHeaderColumn`.
     */
    readonly subHeaderOrder: _angular_core.InputSignal<readonly unknown[] | undefined>;
    /**
     * Renderer-level sub-header gate, on by default. Set to `false` to ignore
     * `subHeaderColumn`/`subHeaderOrder` on this table only — useful when the
     * same bound config drives another renderer that should keep its groups.
     */
    readonly enableSubHeaders: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Layout mode for the sub-header row.
     * - `'colspan'` (default): Renders a single cell spanning the entire row.
     * - `'cells'`: Renders individual cells matching the column structure, preserving pinned column boundaries.
     */
    readonly subHeaderLayout: _angular_core.InputSignal<"colspan" | "cells">;
    /** Emits on row click unless the event started on an interactive descendant. */
    readonly rowActivate: _angular_core.OutputEmitterRef<NatTableRowActivateEvent<TData>>;
    private readonly natTableService;
    private readonly state;
    private readonly a11yService;
    private readonly destroyRef;
    readonly enablePagination: _angular_core.Signal<boolean>;
    readonly enableGlobalFilter: _angular_core.Signal<boolean>;
    readonly table: ng_advanced_table.Table<TData>;
    /** Stable DOM id for the rendered `<table>` element. */
    readonly tableElementId: _angular_core.WritableSignal<string>;
    /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
    readonly tableScrollContainer: _angular_core.Signal<HTMLElement | null>;
    /** Resolved locale id (from the surface or the built-in English default). */
    readonly localeId: _angular_core.Signal<string>;
    protected readonly headerGroups: _angular_core.Signal<ng_advanced_table.HeaderGroup<TData>[]>;
    protected readonly bodyRows: _angular_core.Signal<Row<TData>[]>;
    protected readonly visibleColumns: _angular_core.Signal<ng_advanced_table.Column<TData, unknown>[]>;
    protected readonly bodyState: _angular_core.Signal<ng_advanced_table.NatTableBodyState>;
    protected readonly resolvedCaption: _angular_core.Signal<string>;
    protected readonly resolvedDirection: _angular_core.Signal<"ltr" | "rtl">;
    protected readonly usesAuthoritativeLayout: _angular_core.Signal<boolean>;
    protected readonly tableClassMap: _angular_core.Signal<string>;
    protected readonly fixedLayoutTableWidth: _angular_core.Signal<number>;
    protected readonly resolvedColumnWidths: _angular_core.Signal<Record<string, number>>;
    protected readonly columnRenderStates: _angular_core.Signal<Record<string, TableColumnRenderState>>;
    protected readonly emptyStateColSpan: _angular_core.Signal<number>;
    protected readonly tableAriaBusy: _angular_core.Signal<"true" | null>;
    protected readonly resolvedDescription: _angular_core.Signal<string>;
    protected readonly resolvedEmptyState: _angular_core.Signal<string>;
    protected readonly resolvedLoadingState: _angular_core.Signal<string>;
    protected readonly resolvedErrorState: _angular_core.Signal<string>;
    protected readonly tableCaptionId: _angular_core.Signal<string>;
    protected readonly tableSummaryId: _angular_core.Signal<string>;
    protected readonly tableDescriptionId: _angular_core.Signal<string>;
    protected readonly tableAriaLabel: _angular_core.Signal<string | null>;
    protected readonly tableAriaLabelledBy: _angular_core.Signal<string | null>;
    /**
     * No keyboard-instructions id here: a static table has no grid keyboard
     * model to describe, so `aria-describedby` carries summary + description only.
     */
    protected readonly ariaDescribedBy: _angular_core.Signal<string | null>;
    private readonly loadingTemplate;
    private readonly emptyTemplate;
    private readonly errorTemplate;
    private readonly subHeaderTemplate;
    protected readonly loadingTemplateRef: _angular_core.Signal<TemplateRef<NatTableLoadingTemplateContext<TData>> | null>;
    protected readonly emptyTemplateRef: _angular_core.Signal<TemplateRef<NatTableEmptyTemplateContext<TData>> | null>;
    protected readonly errorTemplateRef: _angular_core.Signal<TemplateRef<NatTableErrorTemplateContext<TData>> | null>;
    protected readonly subHeaderTemplateRef: _angular_core.Signal<TemplateRef<NatTableSubHeaderTemplateContext<TData>> | null>;
    protected readonly loadingTemplateContext: _angular_core.Signal<NatTableLoadingTemplateContext<TData>>;
    protected readonly emptyTemplateContext: _angular_core.Signal<NatTableEmptyTemplateContext<TData>>;
    protected readonly errorTemplateContext: _angular_core.Signal<NatTableErrorTemplateContext<TData>>;
    protected readonly subHeaderGroups: _angular_core.Signal<ReadonlyMap<string, NatTableSubHeaderGroup<TData>>>;
    protected getSubHeaderContext(group: NatTableSubHeaderGroup<TData>): NatTableSubHeaderTemplateContext<TData>;
    protected getSubHeaderAriaText(group: NatTableSubHeaderGroup<TData>): string;
    protected readonly tableSummary: _angular_core.Signal<string>;
    protected readonly liveMessage: _angular_core.WritableSignal<string>;
    private readonly tableRegionRef;
    protected readonly shouldHidePrimitiveHeaderLabel: (header: ng_advanced_table.Header<TData, unknown>, columnState: {
        readonly hiddenHeaderLabel: string | null;
    } | undefined) => boolean;
    protected readonly getCellTone: (column: ng_advanced_table.Column<TData, unknown>, context: ng_advanced_table.CellContext<TData, unknown>) => ng_advanced_table.NatTableCellTone | null;
    /** `data-selected` for styling; `aria-selected` is invalid on a plain table row. */
    protected rowSelectedAttribute(row: Row<TData>): string | null;
    constructor();
    patchState(updaters: Partial<{
        [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>): void;
    protected onRowClick(event: MouseEvent, row: Row<TData>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableStatic<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NatTableStatic<any>, "nat-table-static", ["natTableStatic"], { "data": { "alias": "data"; "required": true; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "accessibleName": { "alias": "accessibleName"; "required": false; "isSignal": true; }; "caption": { "alias": "caption"; "required": false; "isSignal": true; }; "dataStatus": { "alias": "dataStatus"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "enableRowSelection": { "alias": "enableRowSelection"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "globalFilterFn": { "alias": "globalFilterFn"; "required": false; "isSignal": true; }; "getRowId": { "alias": "getRowId"; "required": false; "isSignal": true; }; "subHeaderColumn": { "alias": "subHeaderColumn"; "required": false; "isSignal": true; }; "subHeaderOrder": { "alias": "subHeaderOrder"; "required": false; "isSignal": true; }; "enableSubHeaders": { "alias": "enableSubHeaders"; "required": false; "isSignal": true; }; "subHeaderLayout": { "alias": "subHeaderLayout"; "required": false; "isSignal": true; }; }, { "rowActivate": "rowActivate"; }, ["loadingTemplate", "emptyTemplate", "errorTemplate", "subHeaderTemplate"], never, true, never>;
}

/**
 * Directive to manage keyboard shortcut screen reader readouts and ARIA attributes.
 * Updates `aria-keyshortcuts` and appends shortcut descriptions to `aria-label`
 * without losing the element's base text.
 */
declare class NatTableHotkeyA11y {
    private readonly el;
    private readonly renderer;
    private readonly destroyRef;
    private readonly natTableService;
    private readonly globalKeybindings;
    readonly natHotkeyA11y: _angular_core.InputSignal<"" | keyof NatTableKeybindings>;
    readonly natTableHotkeyA11y: _angular_core.InputSignal<"" | keyof NatTableKeybindings>;
    readonly appHotkeyA11y: _angular_core.InputSignal<"" | keyof NatTableKeybindings>;
    private readonly actionKey;
    private readonly keybindings;
    private readonly shortcut;
    private readonly originalAriaLabel;
    private readonly originalInnerText;
    private readonly baseLabel;
    private updatingAttributes;
    constructor();
    private createMutationObserver;
    /** Re-reads aria-label / text into the original-* signals when changed from outside this directive. */
    private syncFromMutations;
    /** Captures an aria-label edit made outside this directive (one not carrying our shortcut suffix). */
    private syncExternalAriaLabel;
    /** Writes aria-keyshortcuts and the shortcut-suffixed aria-label, or restores the originals when no shortcut applies. */
    private writeAriaAttributes;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableHotkeyA11y, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NatTableHotkeyA11y, "[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]", never, { "natHotkeyA11y": { "alias": "natHotkeyA11y"; "required": false; "isSignal": true; }; "natTableHotkeyA11y": { "alias": "natTableHotkeyA11y"; "required": false; "isSignal": true; }; "appHotkeyA11y": { "alias": "appHotkeyA11y"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Injection token for custom keyboard shortcuts configuration. */
declare const NAT_TABLE_KEYBINDINGS: InjectionToken<NatTableKeybindings>;

/** Provides global keyboard shortcut overrides for every nat-table in the injector scope. */
declare const provideNatTableKeybindings: (keybindings: NatTableKeybindings) => Provider;

/** Serializes a keybinding shortcut value to a string representation suitable for ARIA attributes. */
declare const serializeShortcutValue: (value: NatTableShortcutValue | undefined) => string;
/** Compiles a functional keyboard shortcuts helper from a keybindings configuration. */
declare const createNatTableKeyboard: (keybindings: Required<NatTableKeybindings>) => NatTableKeyboard;

/**
 * Per-table service that manages column-reorder logic and scroll-into-view behavior.
 *
 * After a column is reordered (drag-drop or keyboard), this service applies
 * the state change, announces the move for screen readers, and scrolls the
 * moved header into the visible viewport.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
declare class NatTableReorderService<TData extends RowData = RowData> {
    private readonly injector;
    private readonly state;
    private readonly a11yService;
    isLeafHeaderRow(headerGroup: HeaderGroup<TData>): boolean;
    isReorderingEnabled(): boolean;
    hasReorderableColumns(): boolean;
    canReorderHeader(column: Column<TData, unknown>): boolean;
    onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void;
    /**
     * CDK hides the dragged header mid-drag by stomping its inline `left` and
     * restores it to `''` before emitting `dropped`. Angular rewrites the
     * `[style.left.px]` host binding only when its value changes, so a rejected
     * (no-op) drop would leave a pinned header without its sticky offset — it
     * then scrolls away with the center columns. Re-apply it on every drop.
     */
    private restoreDraggedHeaderPinnedOffset;
    /**
     * Resolves the moving column's next in-zone order at drop time.
     *
     * CDK's `event.currentIndex` comes from live clientRects, which the sticky
     * pinned headers skew under horizontal scroll — wrongly rejecting valid
     * in-zone drops (issue #288). So prefer the drop point: slot the moving column
     * among its same-zone neighbors by their header centers. Fall back to
     * `currentIndex` when no geometry is available (jsdom / synthetic unit-test
     * events with no drop point). Returns `null` to reject the drop.
     */
    private resolveDropZoneOrder;
    /** Viewport-x center of a column's header cell, or `null` when it has no laid-out rect (jsdom). */
    private getHeaderCenterX;
    /**
     * Handles the keyboard reorder portion of a header keydown.
     * Returns `true` if the event was handled (reorder occurred), `false` otherwise.
     */
    handleKeyboardReorder(event: KeyboardEvent, column: Column<TData, unknown>, directionDelta: ColumnReorderKeyboardDirection): boolean;
    /**
     * Scroll a column header into view after reordering.
     */
    scrollHeaderIntoView(columnId: string): void;
    private getHeaderElement;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableReorderService<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableReorderService<any>>;
}

/**
 * Per-table service that manages column-resize DOM interactions.
 *
 * Owns the resize guide position state, pointer resize-start coordination,
 * and keyboard resize delegation. The `NatTable` component keeps the template
 * event bindings and delegates to methods on this service.
 *
 * Provided alongside `NatTableState` in the component's `providers`.
 */
declare class NatTableResizeService<TData extends RowData = RowData> {
    private readonly state;
    private readonly a11yService;
    /** Pixel offset of the dragged column's resize edge within the scrollable region content box. */
    private readonly resizeGuideOrigin;
    /** True when the column being resized is pinned (sticky), so the guide must compensate for scroll. */
    private readonly resizeGuidePinned;
    /** `region.scrollLeft` captured at drag start, the baseline for the pinned-guide scroll compensation. */
    private readonly resizeStartScrollLeft;
    /** Live `region.scrollLeft`, updated by the scroll listener while a drag is active. */
    private readonly regionScrollLeft;
    constructor();
    /** Full-height drag guide position: column edge + live drag delta, or null when idle. */
    readonly columnResizeGuide: _angular_core.Signal<{
        readonly left: number;
        readonly offset: number;
    } | null>;
    /** True while a pointer/touch column-resize drag is in progress. */
    readonly isColumnResizing: _angular_core.Signal<boolean>;
    /**
     * Start a pointer/touch column resize.
     * Called by the component's template `(mousedown)` / `(touchstart)` handler.
     */
    startResize(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void;
    /**
     * Resize a column from a keyboard event (Alt+Arrow).
     * Called by the component's header keydown handler.
     */
    resizeFromKey(event: KeyboardEvent, column: Column<TData, unknown>): void;
    private captureGuideOrigin;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NatTableResizeService<any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NatTableResizeService<any>>;
}

/**
 * Avoid JSON serialization: consumer-owned filter values can include BigInt,
 * Sets, Maps, Dates, or RegExps that either throw or stringify incorrectly.
 * Extremely deep or broad values are treated as changed once the comparison
 * budget is exhausted so state checks terminate predictably.
 */
declare const hasNatTableStateValueChanged: (left: unknown, right: unknown) => boolean;

/**
 * Removes the forced sub-header entry from a TanStack-facing sorting state,
 * yielding the user-visible sorting. Preserves the input reference when the
 * forced entry is absent.
 */
declare const stripNatTableSubHeaderSorting: (sorting: SortingState, columnId: string | null) => SortingState;

export { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS, NAT_TABLE_KEYBINDINGS, NAT_TABLE_ROW_WINDOW_HOST, NatList, NatTable, NatTableA11yService, NatTableEmptyTemplate, NatTableErrorTemplate, NatTableHeaderMeasurementService, NatTableHotkeyA11y, NatTableLoadingTemplate, NatTableReorderService, NatTableResizeService, NatTableRowPlaceholderTemplate, NatTableRowRenderStrategyRegistry, NatTableService, NatTableStatic, NatTableSubHeaderTemplate, createNatTableKeyboard, hasNatTableStateValueChanged, provideNatTableKeybindings, serializeShortcutValue, stripNatTableSubHeaderSorting };
export type { NatTableBodyState, NatTableCellTone, NatTableColumnMeta, NatTableColumnMoveDirection, NatTableColumnReorderResult, NatTableDataStatus, NatTableEmptyTemplateContext, NatTableErrorTemplateContext, NatTableKeybindings, NatTableKeyboard, NatTableLoadingTemplateContext, NatTableMode, NatTableModeConfiguration, NatTableRowActivateEvent, NatTableRowIdGetter, NatTableRowPlaceholderTemplateContext, NatTableRowRenderStrategy, NatTableRowRenderedEvent, NatTableRowWindowHost, NatTableShortcut, NatTableSortIndicatorContext, NatTableSubHeaderGroup, NatTableSubHeaderTemplateContext, NatTableUiController, NatTableUiState, NatTableUserState, NatTableVirtualItem };
