import * as i0 from "@angular/core";
import { InjectionToken, Provider, Signal } from "@angular/core";
import { CellContext, Column, ColumnDef, ColumnFiltersState, ColumnOrderState, ColumnPinningState, ColumnSizingState, FlexRenderContent, HeaderContext, PaginationState, Row, RowData, RowSelectionState, SortingState, Table, VisibilityState } from "@tanstack/angular-table";
import { NatTableAccessibilityColumnVisibilityLabels, NatTableAccessibilityHeaderActionLabels, NatTableAccessibilityPageSizeLabels, NatTableAccessibilityPagerLabels, NatTableAccessibilityScrollControlLabels } from "ng-advanced-table/locale";
import { NatTableAccessibilityText, NatTableKeybindings, NatTableMode, NatTableModeConfiguration, NatTableUiController, NatTableUserState } from "ng-advanced-table";
import * as i1 from "@angular/aria/toolbar";
/** Position of a toolbar item inside the flex row. */
type NatToolbarItemPosition = 'start' | 'center' | 'end';
/**
 * Focus behavior of `nat-table-toolbar`.
 *
 * - `'roving'` (default): one Tab stop for the whole toolbar, arrow keys move
 *   between registered `natToolbarItem`/`NatToolbarGroup` widgets.
 * - `'none'`: the toolbar manages no tabindex at all — every projected control
 *   keeps its native Tab stop and arrow keys are left to the controls. Use this
 *   when the projected controls are sealed (e.g. custom elements with a closed
 *   shadow root) and cannot join the roving pattern.
 */
type NatToolbarFocusManagement = 'roving' | 'none';
/**
 * Contract every registered toolbar item exposes to the shell and to its own
 * hosting component. Implemented by the `NatToolbarItem` directive and
 * provided as `NAT_TOOLBAR_ITEM`. Registration, roving tabindex and keyboard
 * navigation are delegated to the `ToolbarWidget` host directive from
 * `@angular/aria/toolbar`.
 */
type NatToolbarItemRef = {
  /** Widget id used in roving-tabindex bookkeeping (Aria `id` input). */
  readonly id: string;
  /** Host element. */
  readonly element: HTMLElement;
  /** Slot the item renders in (defaults to `'start'`). */
  readonly position: Signal<NatToolbarItemPosition>;
  /** Focuses the host element. */
  focus(): void;
};
/** Token under which `NatToolbarItem` provides itself on its host element. */
export declare const NAT_TOOLBAR_ITEM: InjectionToken<NatToolbarItemRef>;
/** Normalized value exposed to table export handlers before format-specific serialization. */
type NatTableExportCellValue = string | number | boolean | Date | null;
/** Column metadata in the resolved table export snapshot. */
type NatTableExportDataColumn = {
  /** TanStack column id. */
  readonly id: string;
  /** Export header resolved from column metadata or column definition. */
  readonly header: string;
};
/** Row values in the resolved table export snapshot. */
type NatTableExportDataRow = {
  /** TanStack row id. */
  readonly id: string;
  /** Values aligned with `NatTableExportData.columns`. */
  readonly values: readonly NatTableExportCellValue[];
};
/** Structured table data resolved for export handlers. */
type NatTableExportData = {
  /** Exportable columns in their resolved order. */
  readonly columns: readonly NatTableExportDataColumn[];
  /** Exportable row values in their resolved order. */
  readonly rows: readonly NatTableExportDataRow[];
};
/** Context passed to table export handlers. */
type NatTableExportContext<TData extends RowData = RowData> = {
  /** TanStack table instance resolved for the action. */
  readonly table: Table<TData>;
  /** Rows selected by the directive's current export scope. */
  readonly rows: readonly Row<TData>[];
  /** Columns selected by the directive's current export scope. */
  readonly columns: readonly Column<TData, unknown>[];
  /** Normalized base file name supplied to the action. */
  readonly fileName: string;
  /** Lazily resolves structured export data for the same activation. */
  getData(): NatTableExportData;
  /** Runs the built-in CSV export for the same resolved context. */
  exportCsv(): Promise<void>;
};
/** Operation that performs a table export. */
type NatTableExportHandler<TData extends RowData = RowData> = (context: NatTableExportContext<TData>) => void | Promise<void>;
/** App-level table export configuration. */
type NatTableExportConfig<TData extends RowData = RowData> = {
  /** Replaces the built-in CSV export handler for all matching directives. */
  readonly handler?: NatTableExportHandler<TData>;
};
/** Factory used when app-level table export configuration needs Angular DI. */
type NatTableExportConfigFactory<TData extends RowData = RowData> = () => NatTableExportConfig<TData>;
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
 * Custom content accepted by `withNatTableHeaderActions(..., { sortIndicator })`.
 *
 * Return a string/number for simple glyph swaps, or a FlexRender-compatible
 * renderer for richer Angular content, usually via `flexRenderComponent(...)`.
 * The generated sort button still owns sorting behavior, keyboard handling,
 * accessible names, and `aria-sort`; this content should stay visual.
 */
type NatTableSortIndicatorContent = string | number | ((props: NatTableSortIndicatorContext<RowData>) => FlexRenderContent<NatTableSortIndicatorContext<RowData>>) | null | undefined;
/** Custom header content accepted by columns wrapped with {@link withNatTableHeaderActions}. */
type NatTableHeaderRenderContent = string | number | ((props: HeaderContext<RowData, unknown>) => FlexRenderContent<HeaderContext<RowData, unknown>>) | null | undefined;
/**
 * Options for {@link withNatTableHeaderActions}.
 *
 * Use `sortIndicator` to replace the built-in unsorted/ascending/descending glyphs
 * while keeping the same sort, pin, and move-column menu behavior. Do not create
 * extra header rows or custom header DOM just to swap the sort icon.
 */
type NatTableHeaderActionsOptions = {
  /** Custom content rendered inside the sort button for each sortable column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Static locale override for generated action labels. Defaults to the hosting table locale. */
  readonly locale?: string;
  /** Optional accessibility label overrides for the built-in sort, pin, and move actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /**
   * Removes the built-in sort button/indicator for wrapped columns. Programmatic sorting via
   * `NatTable.patchState({ sorting })` (or `natTable.table.setSorting(...)` on the underlying
   * TanStack instance) and columnDef-level `enableSorting` are unaffected. Defaults to `true`.
   */
  readonly enableSortActions?: boolean;
  /** Enables left/right pin menu items when the controlled table can pin this column. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items when the controlled table can reorder this column. */
  readonly enableColumnReorderActions?: boolean;
};
/** Per-column options for the header action wrapper. */
type NatTableHeaderActionsColumnOptions = {
  /** Custom content rendered inside the sort button for this column. */
  readonly sortIndicator?: NatTableSortIndicatorContent;
  /** Optional accessibility label overrides for this column's built-in actions. */
  readonly accessibilityLabels?: NatTableAccessibilityHeaderActionLabels;
  /**
   * Removes the built-in sort button/indicator for this column. Programmatic sorting via
   * `NatTable.patchState({ sorting })` (or `natTable.table.setSorting(...)` on the underlying
   * TanStack instance) and columnDef-level `enableSorting` are unaffected. Defaults to `true`.
   */
  readonly enableSortActions?: boolean;
  /** Enables left/right pin menu items for this column when the table can pin it. */
  readonly enableColumnPinActions?: boolean;
  /** Enables Move left / Move right menu items for this column when the table can reorder it. */
  readonly enableColumnReorderActions?: boolean;
};
/**
 * Extra metadata understood by companion UI when attached to a TanStack
 * column definition. This mirrors the workspace's internal contract without
 * exposing a private package to consumers.
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
  /** Set to `false` to exclude the column's body cells from row activation (see core `NatTableColumnMeta`). */
  readonly rowActivation?: boolean;
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
    /**
     * Controls the shared header action wrapper for this column.
     *
     * Set to `false` to opt out of `withNatTableHeaderActions(...)`, or provide
     * overrides such as a per-column `sortIndicator` that merge with the
     * helper-level options for this column only.
     */
    readonly headerActions?: false | NatTableHeaderActionsColumnOptions;
  }
}
/** Options for {@link withNatTableSelectionColumn}. */
type NatTableSelectionColumnOptions<TData extends RowData = RowData> = {
  /** Column id. Defaults to `__natSelect`. */
  readonly columnId?: string;
  /** Accessible label for the column. Defaults to the locale `selection.columnLabel`. */
  readonly label?: string;
  /** Column width in pixels. Defaults to 48. */
  readonly size?: number;
  /** Whether the column may be pinned. Defaults to true (pin it left via state). */
  readonly enablePinning?: boolean;
  /**
   * Whether clicks and Enter/Space that start in the selection cell (beside the checkbox) may
   * emit `rowActivate`. Defaults to `false`: the checkbox is well under the 24 px WCAG 2.5.8
   * target, so the padding around it must not be a second, larger row target.
   */
  readonly rowActivation?: boolean;
  /** `aria-label` override for the select-all checkbox. Defaults to the locale label. */
  readonly selectAllAriaLabel?: string;
  /** `aria-label` override for a per-row checkbox. Defaults to the locale formatter. */
  readonly selectRowAriaLabel?: (row: Row<TData>) => string;
};
export declare const NAT_TABLE_EXPORT: InjectionToken<NatTableExportConfig>;
export declare const provideNatTableExport: <TData extends RowData = RowData>(config: NatTableExportConfig<TData> | NatTableExportConfigFactory<TData>) => Provider[];
type ColumnVisibilityItem<TData extends RowData = RowData> = {
  readonly column: Column<TData, unknown>;
  readonly label: string;
  readonly visible: boolean;
  readonly canToggle: boolean;
  readonly actionLabel: string;
  readonly stateLabel: string;
};
export declare class NatTableColumnVisibility<TData extends RowData = RowData> {
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  readonly label: import("@angular/core").InputSignal<string | undefined>;
  readonly groupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly accessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityColumnVisibilityLabels | undefined>;
  private readonly natTableService;
  protected readonly controller: import("@angular/core").Signal<import("ng-advanced-table").NatTableUiController<TData> | null>;
  private readonly tableUiIntlConfig;
  private readonly localeId;
  private readonly tableUiIntl;
  protected readonly tableElementId: import("@angular/core").Signal<string>;
  private readonly allLeafColumns;
  protected readonly visibleColumnCount: import("@angular/core").Signal<number>;
  protected readonly totalColumnCount: import("@angular/core").Signal<number>;
  private readonly resolvedAccessibilityLabels;
  protected readonly resolvedHeading: import("@angular/core").Signal<string>;
  protected readonly resolvedAriaLabel: import("@angular/core").Signal<string>;
  protected readonly visibilitySummary: import("@angular/core").Signal<string>;
  protected readonly columns: import("@angular/core").Signal<ColumnVisibilityItem<TData>[]>;
  protected readonly toggleColumnVisibility: (column: ColumnVisibilityItem<TData>) => void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableColumnVisibility<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTableColumnVisibility<any>, "nat-table-column-visibility", never, {
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "label": {
      "alias": "label";
      "required": false;
      "isSignal": true;
    };
    "groupAriaLabel": {
      "alias": "groupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "accessibilityLabels": {
      "alias": "accessibilityLabels";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class NatTableExport<TData extends RowData = RowData> {
  /** Optional explicit controller for layouts outside a `NatTableService` scope. */
  readonly for: import("@angular/core").InputSignal<NatTableUiController<TData> | undefined>;
  /** Base download file name. The built-in CSV handler appends `.csv` when omitted. */
  readonly exportFileName: import("@angular/core").InputSignal<string>;
  /** Per-instance export operation. Replaces provider or built-in CSV handlers when present. */
  readonly exportHandler: import("@angular/core").InputSignal<NatTableExportHandler<TData> | undefined>;
  protected readonly isExporting: import("@angular/core").WritableSignal<boolean>;
  protected readonly ariaBusy: import("@angular/core").Signal<"true" | null>;
  protected readonly ariaDisabled: import("@angular/core").Signal<"true" | null>;
  private readonly element;
  private readonly controller;
  private readonly exportConfig;
  private previousDisabledAttribute;
  trigger(event?: Event): Promise<void>;
  protected onHostClick(event: MouseEvent): Promise<void>;
  protected onHostKeydown(event: KeyboardEvent): Promise<void>;
  private activate;
  private createExportContext;
  private setNativeDisabled;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableExport<any>, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NatTableExport<any>, "[natTableExport]", ["natTableExport"], {
    "for": {
      "alias": "for";
      "required": false;
      "isSignal": true;
    };
    "exportFileName": {
      "alias": "exportFileName";
      "required": false;
      "isSignal": true;
    };
    "exportHandler": {
      "alias": "exportHandler";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
type PageSizeOption$1 = {
  readonly pageSize: number;
  readonly text: string;
  readonly ariaLabel: string;
};
export declare class NatTablePageSize<TData extends RowData = RowData> {
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  readonly pageSizeOptions: import("@angular/core").InputSignal<readonly number[]>;
  readonly groupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly accessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityPageSizeLabels | undefined>;
  private readonly natTableService;
  private readonly destroyRef;
  protected readonly controller: import("@angular/core").Signal<import("ng-advanced-table").NatTableUiController<TData> | null>;
  constructor();
  private readonly tableUiIntlConfig;
  private readonly localeId;
  private readonly tableUiIntl;
  protected readonly table: import("@angular/core").Signal<import("ng-advanced-table").Table<TData> | undefined>;
  protected readonly tableElementId: import("@angular/core").Signal<string>;
  protected readonly selectedPageSize: import("@angular/core").Signal<number>;
  private readonly resolvedAccessibilityLabels;
  protected readonly resolvedAriaLabel: import("@angular/core").Signal<string>;
  protected readonly resolvedPageSizeOptions: import("@angular/core").Signal<PageSizeOption$1[]>;
  protected setPageSize(pageSize: number): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTablePageSize<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTablePageSize<any>, "nat-table-page-size", never, {
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "pageSizeOptions": {
      "alias": "pageSizeOptions";
      "required": false;
      "isSignal": true;
    };
    "groupAriaLabel": {
      "alias": "groupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "accessibilityLabels": {
      "alias": "accessibilityLabels";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class NatTablePager<TData extends RowData = RowData> {
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  readonly groupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly accessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityPagerLabels | undefined>;
  private readonly natTableService;
  private readonly destroyRef;
  private readonly injector;
  private readonly previousButton;
  private readonly nextButton;
  protected readonly controller: import("@angular/core").Signal<import("ng-advanced-table").NatTableUiController<TData> | null>;
  constructor();
  private readonly tableUiIntlConfig;
  private readonly localeId;
  private readonly tableUiIntl;
  protected readonly table: import("@angular/core").Signal<import("ng-advanced-table").Table<TData> | undefined>;
  protected readonly tableElementId: import("@angular/core").Signal<string>;
  protected readonly pageIndex: import("@angular/core").Signal<number>;
  protected readonly pageCount: import("@angular/core").Signal<number>;
  protected readonly currentPage: import("@angular/core").Signal<number>;
  protected readonly canPreviousPage: import("@angular/core").Signal<boolean>;
  protected readonly canNextPage: import("@angular/core").Signal<boolean>;
  private readonly resolvedAccessibilityLabels;
  protected readonly resolvedAriaLabel: import("@angular/core").Signal<string>;
  protected readonly previousPageAriaLabel: import("@angular/core").Signal<string>;
  protected readonly nextPageAriaLabel: import("@angular/core").Signal<string>;
  protected readonly pageIndicator: import("@angular/core").Signal<string>;
  protected previousPage(): void;
  protected nextPage(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTablePager<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTablePager<any>, "nat-table-pager", never, {
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "groupAriaLabel": {
      "alias": "groupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "accessibilityLabels": {
      "alias": "accessibilityLabels";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
type PageSizeOption = {
  readonly pageSize: number;
  readonly text: string;
  readonly ariaLabel: string;
};
/**
 * Bundled page-size + pager control row.
 *
 * Deliberately **not** a `<nat-table-toolbar>`: the two controls are ordinary
 * tab stops. A roving tabindex would collapse the select and both pager
 * buttons into one Tab stop — unexpected for a pager — and projecting this
 * component into a consumer toolbar nested `role="toolbar"` inside
 * `role="toolbar"`. Compose it beside `<nat-table-toolbar>`, not inside it.
 */
export declare class NatTablePagination<TData extends RowData = RowData> {
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  readonly pageSizeOptions: import("@angular/core").InputSignal<readonly number[]>;
  readonly pageSizeGroupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly pageSizeAccessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityPageSizeLabels | undefined>;
  readonly pagerGroupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly pagerAccessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityPagerLabels | undefined>;
  private readonly natTableService;
  private readonly destroyRef;
  private readonly injector;
  private readonly previousButton;
  private readonly nextButton;
  protected readonly controller: import("@angular/core").Signal<import("ng-advanced-table").NatTableUiController<TData> | null>;
  constructor();
  private readonly tableUiIntlConfig;
  private readonly localeId;
  private readonly tableUiIntl;
  protected readonly table: import("@angular/core").Signal<import("ng-advanced-table").Table<TData> | undefined>;
  protected readonly tableElementId: import("@angular/core").Signal<string>;
  protected readonly selectedPageSize: import("@angular/core").Signal<number>;
  private readonly resolvedPageSizeAccessibilityLabels;
  protected readonly resolvedPageSizeAriaLabel: import("@angular/core").Signal<string>;
  protected readonly resolvedPageSizeOptions: import("@angular/core").Signal<PageSizeOption[]>;
  protected setPageSize(pageSize: number): void;
  protected readonly pageIndex: import("@angular/core").Signal<number>;
  protected readonly pageCount: import("@angular/core").Signal<number>;
  protected readonly currentPage: import("@angular/core").Signal<number>;
  protected readonly canPreviousPage: import("@angular/core").Signal<boolean>;
  protected readonly canNextPage: import("@angular/core").Signal<boolean>;
  private readonly resolvedPagerAccessibilityLabels;
  protected readonly resolvedPagerAriaLabel: import("@angular/core").Signal<string>;
  protected readonly previousPageAriaLabel: import("@angular/core").Signal<string>;
  protected readonly nextPageAriaLabel: import("@angular/core").Signal<string>;
  protected readonly pageIndicator: import("@angular/core").Signal<string>;
  protected previousPage(): void;
  protected nextPage(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTablePagination<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTablePagination<any>, "nat-table-pagination", never, {
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "pageSizeOptions": {
      "alias": "pageSizeOptions";
      "required": false;
      "isSignal": true;
    };
    "pageSizeGroupAriaLabel": {
      "alias": "pageSizeGroupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "pageSizeAccessibilityLabels": {
      "alias": "pageSizeAccessibilityLabels";
      "required": false;
      "isSignal": true;
    };
    "pagerGroupAriaLabel": {
      "alias": "pagerGroupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "pagerAccessibilityLabels": {
      "alias": "pagerAccessibilityLabels";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class NatTableScrollControl<TData extends RowData = RowData> {
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  readonly groupAriaLabel: import("@angular/core").InputSignal<string | undefined>;
  readonly scrollStep: import("@angular/core").InputSignalWithTransform<number, unknown>;
  readonly accessibilityLabels: import("@angular/core").InputSignal<NatTableAccessibilityScrollControlLabels | undefined>;
  private readonly natTableService;
  protected readonly controller: import("@angular/core").Signal<import("ng-advanced-table").NatTableUiController<TData> | null>;
  private readonly document;
  private readonly destroyRef;
  private readonly tableUiIntlConfig;
  private readonly localeId;
  private readonly tableUiIntl;
  private readonly scrollContainer;
  private cleanupScrollTarget;
  protected readonly tableElementId: import("@angular/core").Signal<string>;
  protected readonly scrollLeft: import("@angular/core").WritableSignal<number>;
  protected readonly maxScrollLeft: import("@angular/core").WritableSignal<number>;
  protected readonly canScroll: import("@angular/core").Signal<boolean>;
  protected readonly canScrollLeft: import("@angular/core").Signal<boolean>;
  protected readonly canScrollRight: import("@angular/core").Signal<boolean>;
  private readonly resolvedAccessibilityLabels;
  protected readonly resolvedAriaLabel: import("@angular/core").Signal<string>;
  protected readonly scrollLeftAriaLabel: import("@angular/core").Signal<string>;
  protected readonly scrollRightAriaLabel: import("@angular/core").Signal<string>;
  protected readonly scrollPositionAriaLabel: import("@angular/core").Signal<string>;
  protected readonly positionText: import("@angular/core").Signal<string>;
  private readonly sanitizedScrollStep;
  constructor();
  protected scrollByStep(direction: -1 | 1): void;
  protected onRangeInput(event: Event): void;
  protected onRangeKeydown(event: KeyboardEvent): void;
  private setScrollContainer;
  private setScrollLeft;
  private updateMetrics;
  private resolveScrollContainer;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableScrollControl<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTableScrollControl<any>, "nat-table-scroll-control", never, {
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "groupAriaLabel": {
      "alias": "groupAriaLabel";
      "required": false;
      "isSignal": true;
    };
    "scrollStep": {
      "alias": "scrollStep";
      "required": false;
      "isSignal": true;
    };
    "accessibilityLabels": {
      "alias": "accessibilityLabels";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class NatTableSurface {
  /** Two-way bindable state representing the current table view state. */
  readonly state: import("@angular/core").ModelSignal<Partial<NatTableUserState>>;
  /** One-time seed configuration for the table state. */
  readonly initialState: import("@angular/core").InputSignal<Partial<NatTableUserState>>;
  /** Operation mode: 'auto' (client-side) or 'manual' (server-side/external), or custom per-slice configuration. */
  readonly mode: import("@angular/core").InputSignal<NatTableMode | NatTableModeConfiguration>;
  /** Total page count for manual (server-side) pagination. */
  readonly manualPageCount: import("@angular/core").InputSignal<number | undefined>;
  /** Enables polite live announcements for sort/filter/pagination changes. */
  readonly enableAnnouncements: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Enables sticky positioning for the table header row. */
  readonly stickyHeader: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Allows multiple simultaneous sort columns. Default false (single-column sort). */
  readonly enableMultiSort: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /**
   * Locale id used to resolve generated table accessibility copy. Resolved by
   * RFC 4647 lookup against the ids registered with `provideNatTableLocales()`
   * (and the companion `provideNatTable*Locales()` helpers), so a registered
   * `da` also serves `da-DK`; an id that matches nothing falls back to English
   * copy while still formatting numbers for this id.
   */
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  /** Optional accessibility copy and live-announcement formatters. */
  readonly accessibilityText: import("@angular/core").InputSignal<NatTableAccessibilityText>;
  /** Optional overrides for keyboard interaction shortcuts. */
  readonly keybindings: import("@angular/core").InputSignal<NatTableKeybindings>;
  /** When to apply resize: `'onEnd'` (default, on pointer release) or `'onChange'` (live). */
  readonly columnResizeMode: import("@angular/core").InputSignal<"onEnd" | "onChange">;
  /** Width model: `'fill'` (default — columns stretch to fill the container) or `'fixed'` (column widths are authoritative and the region scrolls horizontally, giving pixel-exact resizing). */
  readonly columnSizingMode: import("@angular/core").InputSignal<"fill" | "fixed">;
  /** Enables column resizing across the surface. Off by default; a column opts in with `enableResizing: true` or, once the surface is on, opts out with `enableResizing: false`. */
  readonly enableColumnResizing: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Enables column drag/drop, keyboard reordering, and table-owned move-column metadata across the surface. Off by default; `meta.reorderable: true` opts one column into reordering (drag, keyboard, menu) while the surface is off, and `meta.reorderable: false` opts one column out once the surface is on. */
  readonly enableReordering: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Enables the built-in header sort UI across the surface. Off by default; a column opts in with `enableSorting: true` or, once the surface is on, opts out with `enableSorting: false`. Gates only the sort button and indicator — sort state and programmatic `setSorting` work regardless of this flag. (`enableSortActions` on the header-actions helper is a second, independent UI gate.) */
  readonly enableSorting: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Enables column pinning across the surface. Off by default; a column opts in with `enablePinning: true` or, once the surface is on, opts out with `enablePinning: false`. */
  readonly enablePinning: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
  /** Text direction. Falls back to the inherited CDK direction, then `'ltr'`. */
  readonly direction: import("@angular/core").InputSignal<"ltr" | "rtl" | undefined>;
  readonly sortingChange: import("@angular/core").OutputEmitterRef<SortingState>;
  readonly globalFilterChange: import("@angular/core").OutputEmitterRef<string>;
  readonly columnFiltersChange: import("@angular/core").OutputEmitterRef<ColumnFiltersState>;
  readonly columnVisibilityChange: import("@angular/core").OutputEmitterRef<VisibilityState>;
  readonly columnOrderChange: import("@angular/core").OutputEmitterRef<ColumnOrderState>;
  readonly columnPinningChange: import("@angular/core").OutputEmitterRef<ColumnPinningState>;
  readonly columnSizingChange: import("@angular/core").OutputEmitterRef<ColumnSizingState>;
  readonly paginationChange: import("@angular/core").OutputEmitterRef<PaginationState>;
  readonly rowSelectionChange: import("@angular/core").OutputEmitterRef<RowSelectionState>;
  private readonly natTableService;
  private previousTableState;
  private firstStateChange;
  constructor();
  /** Diff incoming table state against the previous and emit each changed slice. */
  private emitStateSliceChanges;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableSurface, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTableSurface, "nat-table-surface", never, {
    "state": {
      "alias": "state";
      "required": false;
      "isSignal": true;
    };
    "initialState": {
      "alias": "initialState";
      "required": false;
      "isSignal": true;
    };
    "mode": {
      "alias": "mode";
      "required": false;
      "isSignal": true;
    };
    "manualPageCount": {
      "alias": "manualPageCount";
      "required": false;
      "isSignal": true;
    };
    "enableAnnouncements": {
      "alias": "enableAnnouncements";
      "required": false;
      "isSignal": true;
    };
    "stickyHeader": {
      "alias": "stickyHeader";
      "required": false;
      "isSignal": true;
    };
    "enableMultiSort": {
      "alias": "enableMultiSort";
      "required": false;
      "isSignal": true;
    };
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "accessibilityText": {
      "alias": "accessibilityText";
      "required": false;
      "isSignal": true;
    };
    "keybindings": {
      "alias": "keybindings";
      "required": false;
      "isSignal": true;
    };
    "columnResizeMode": {
      "alias": "columnResizeMode";
      "required": false;
      "isSignal": true;
    };
    "columnSizingMode": {
      "alias": "columnSizingMode";
      "required": false;
      "isSignal": true;
    };
    "enableColumnResizing": {
      "alias": "enableColumnResizing";
      "required": false;
      "isSignal": true;
    };
    "enableReordering": {
      "alias": "enableReordering";
      "required": false;
      "isSignal": true;
    };
    "enableSorting": {
      "alias": "enableSorting";
      "required": false;
      "isSignal": true;
    };
    "enablePinning": {
      "alias": "enablePinning";
      "required": false;
      "isSignal": true;
    };
    "direction": {
      "alias": "direction";
      "required": false;
      "isSignal": true;
    };
  }, {
    "state": "stateChange";
    "sortingChange": "sortingChange";
    "globalFilterChange": "globalFilterChange";
    "columnFiltersChange": "columnFiltersChange";
    "columnVisibilityChange": "columnVisibilityChange";
    "columnOrderChange": "columnOrderChange";
    "columnPinningChange": "columnPinningChange";
    "columnSizingChange": "columnSizingChange";
    "paginationChange": "paginationChange";
    "rowSelectionChange": "rowSelectionChange";
  }, never, ["*"], true, never>;
}
export declare class NatTableToolbar<TData extends RowData = RowData> {
  readonly for: import("@angular/core").InputSignal<NatTableUiController<TData> | undefined>;
  readonly accessibleName: import("@angular/core").InputSignal<string | undefined>;
  readonly locale: import("@angular/core").InputSignal<string | undefined>;
  /**
   * `'roving'` (default) keeps the WAI-ARIA single-Tab-stop toolbar pattern.
   * `'none'` disables all focus management: no host or item tabindex, no
   * arrow-key navigation — every projected control keeps its native Tab stop.
   * Use `'none'` when projected controls are sealed custom elements (closed
   * shadow root) that cannot register as `natToolbarItem`s.
   */
  readonly focusManagement: import("@angular/core").InputSignal<NatToolbarFocusManagement>;
  private readonly tableUiIntlConfig;
  private readonly controller;
  private readonly ariaToolbar;
  /** Single touch point for Aria's private `_pattern` API — fix here if it ever renames. */
  private get pattern();
  protected readonly localeId: import("@angular/core").Signal<string>;
  protected readonly tableUiIntl: import("@angular/core").Signal<import("ng-advanced-table/locale").NatTableControlsIntl>;
  protected readonly resolvedAccessibleName: import("@angular/core").Signal<string | null>;
  protected readonly ariaControls: import("@angular/core").Signal<string | null>;
  protected readonly hostTabIndex: import("@angular/core").Signal<0 | -1 | null>;
  protected readonly hostAriaDisabled: import("@angular/core").Signal<boolean | null>;
  constructor();
  /**
   * Instance-level patches on the @angular/aria toolbar pattern. Each one
   * works around a behavior of the stock pattern that
   * breaks this toolbar; the aria-integration spec is the tripwire.
   * Re-verify both on every `@angular/aria` bump.
   */
  private patchAriaToolbarPattern;
  /**
   * Keeps Aria's active widget in sync with real focus. Aria only updates it
   * on arrow keys and clicks — Tab (and programmatic focus) would leave the
   * roving tab stop behind.
   */
  protected syncActiveItemFromFocus(event: FocusEvent): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableToolbar<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTableToolbar<any>, "nat-table-toolbar", never, {
    "for": {
      "alias": "for";
      "required": false;
      "isSignal": true;
    };
    "accessibleName": {
      "alias": "accessibleName";
      "required": false;
      "isSignal": true;
    };
    "locale": {
      "alias": "locale";
      "required": false;
      "isSignal": true;
    };
    "focusManagement": {
      "alias": "focusManagement";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, ["*", "[natToolbarItemPosition='center'], [natToolbarGroup='center']", "[natToolbarItemPosition='end'], [natToolbarGroup='end']"], true, [{
    directive: typeof i1.Toolbar;
    inputs: {
      "disabled": "disabled";
      "softDisabled": "softDisabled";
      "wrap": "wrap";
    };
    outputs: {};
  }]>;
}
/**
 * Wraps column headers with the shared sort and column action UI from
 * `ng-advanced-table/components`.
 *
 * The helper preserves the original header content, applies the wrapper
 * recursively to grouped columns, and optionally injects custom sort-indicator
 * content through `options.sortIndicator`. Use this composable instead of
 * adding extra header rows or replacing the table header DOM when the design
 * only needs custom sort icons or badges.
 *
 * Applying the helper repeatedly is safe. Wrapped headers are unwrapped before
 * the next wrapper is installed, so reactive column builders can compose this
 * helper with other column helpers without nesting the generated controls.
 *
 * Set `column.meta.headerActions` to `false` to opt a column out, or provide an
 * object to override `sortIndicator`, `enableSortActions`, `enableColumnPinActions`,
 * `enableColumnReorderActions`, or `accessibilityLabels` for that column.
 *
 * For Angular sort indicator components, return `flexRenderComponent(...)`
 * from `sortIndicator`; the generated sort button keeps ownership of sorting,
 * focus, keyboard, accessible-name, multi-sort, and `aria-sort` behavior.
 *
 * Set `enableSortActions: false` to remove the sort button/indicator for wrapped
 * columns while keeping programmatic sorting (`NatTable.patchState({ sorting })`, or
 * `natTable.table.setSorting(...)` on the underlying TanStack instance) and columnDef-level
 * `enableSorting` working. To toggle this reactively (e.g. per breakpoint), rebuild the
 * columns inside a `computed()` keyed on the breakpoint signal rather than mutating the
 * wrapped columns in place.
 */
export declare const withNatTableHeaderActions: <TData extends RowData>(columns: readonly ColumnDef<TData, unknown>[], options?: NatTableHeaderActionsOptions) => ColumnDef<TData, unknown>[];
/**
 * Accessible selection checkbox rendered by {@link withNatTableSelectionColumn}.
 *
 * In `'all'` mode it reflects and toggles the whole current row model (with an
 * indeterminate state for partial selection); in `'row'` mode it reflects and
 * toggles a single row. Generated labels resolve from the active UI locale
 * unless explicit overrides are provided.
 */
export declare class NatTableSelectionCheckbox<TData extends RowData = RowData> {
  private readonly tableUiIntlConfig;
  readonly mode: import("@angular/core").InputSignal<"row" | "all">;
  readonly table: import("@angular/core").InputSignal<Table<TData>>;
  readonly row: import("@angular/core").InputSignal<Row<TData> | undefined>;
  /** Explicit `aria-label` override; falls back to the active UI locale. */
  readonly ariaLabel: import("@angular/core").InputSignal<string>;
  /** Explicit column label override; falls back to the active UI locale. */
  readonly label: import("@angular/core").InputSignal<string>;
  protected checked(): boolean;
  protected indeterminate(): boolean;
  protected isSingleSelectHeader(): boolean;
  protected resolvedColumnLabel(): string;
  protected resolvedAriaLabel(): string;
  protected onChange(event: Event): void;
  private tableUiIntl;
  private localeId;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatTableSelectionCheckbox<any>, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatTableSelectionCheckbox<any>, "nat-table-selection-checkbox", never, {
    "mode": {
      "alias": "mode";
      "required": true;
      "isSignal": true;
    };
    "table": {
      "alias": "table";
      "required": true;
      "isSignal": true;
    };
    "row": {
      "alias": "row";
      "required": false;
      "isSignal": true;
    };
    "ariaLabel": {
      "alias": "ariaLabel";
      "required": false;
      "isSignal": true;
    };
    "label": {
      "alias": "label";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
/**
 * Prepends a leading selection column with a select-all header checkbox and a
 * per-row checkbox. Pair with `<nat-table [enableRowSelection]="true">`.
 *
 * Follows the same `(columns) => columns` shape as
 * `withNatTableHeaderActions(...)` so it composes with the other helpers.
 * Generated English copy lives in `ng-advanced-table/locale`; pass explicit
 * label options only to override the active locale.
 */
export declare const withNatTableSelectionColumn: <TData extends RowData>(columns: readonly ColumnDef<TData, unknown>[], options?: NatTableSelectionColumnOptions<TData>) => ColumnDef<TData, unknown>[];
/**
 * Groups related toolbar items, proxying `ngToolbarWidgetGroup` from
 * `@angular/aria/toolbar` and adding what the stock directive leaves out:
 * `role="group"`, an accessible name, slot positioning and flex styling.
 *
 * `natToolbarGroup="start" | "center" | "end"` (default start) picks the
 * toolbar slot, same contract as `natToolbarItem` — static attribute only.
 * Items inside keep their own `natToolbarItem` marker; they are
 * projected with the group, so their own `natToolbarItemPosition` is ignored.
 *
 * Keyboard: Left/Right (and Home/End) traverse all toolbar items linearly;
 * Up/Down cycle within this group (Aria's group navigation). `disabled`
 * (from the stock directive) soft-disables every item in the group.
 *
 * @example
 * ```html
 * <div natToolbarGroup="end" accessibleName="View density">
 *   <button natToolbarItem>Compact</button>
 *   <button natToolbarItem>Comfortable</button>
 * </div>
 * ```
 */
export declare class NatToolbarGroup {
  readonly natToolbarGroup: import("@angular/core").InputSignal<NatToolbarItemPosition>;
  readonly accessibleName: import("@angular/core").InputSignal<string | undefined>;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatToolbarGroup, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<NatToolbarGroup, "div[natToolbarGroup], section[natToolbarGroup]", never, {
    "natToolbarGroup": {
      "alias": "natToolbarGroup";
      "required": false;
      "isSignal": true;
    };
    "accessibleName": {
      "alias": "accessibleName";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, ["*"], true, [{
    directive: typeof i1.ToolbarWidgetGroup;
    inputs: {
      "disabled": "disabled";
    };
    outputs: {};
  }]>;
}
/**
 * Marks an interactive element (a `<button>`, `<input>`, …) as a toolbar item,
 * so it joins the toolbar's roving keyboard focus (Left/Right, Home/End) and
 * matches screen-reader order.
 *
 * Any interactive element needs nothing more than the bare attribute:
 * ```html
 * <button natToolbarItem natToolbarItemPosition="start">Export</button>
 * ```
 *
 * `natToolbarItemPosition="start" | "center" | "end"` (default `start`) picks
 * the toolbar slot. It MUST be a static attribute — a binding
 * (`[natToolbarItemPosition]="expr"`) always lands in the start slot.
 *
 * When the item is a wrapper rather than the control itself — an Angular
 * component host, a Stencil custom element, any design-system button — focus
 * is forwarded to the first focusable descendant (an open shadow root is
 * searched before light DOM), so a bare marker is enough:
 * ```html
 * <my-button natToolbarItem>Filters</my-button>
 * ```
 *
 * `natToolbarItemFocusTarget` overrides that choice with a CSS selector when a
 * wrapper renders more than one control, or the first one is not the one that
 * should own focus:
 * ```html
 * <my-split-button natToolbarItem natToolbarItemFocusTarget=".primary">Filters</my-split-button>
 * ```
 *
 * Items only work inside a `<nat-table-toolbar>`.
 *
 * @example
 * ```html
 * <nat-table-toolbar>
 *   <button natToolbarItem natToolbarItemPosition="start">Export</button>
 *   <input natToolbarItem type="search" aria-label="Filter" />
 * </nat-table-toolbar>
 * ```
 */
export declare class NatToolbarItem implements NatToolbarItemRef {
  readonly natToolbarItemPosition: import("@angular/core").InputSignal<NatToolbarItemPosition>;
  /**
   * CSS selector for the descendant that should receive focus instead of this
   * host — for items that wrap their real control rather than being it.
   *
   * Optional: a wrapper host with no selector forwards focus to its first
   * focusable descendant. Set it when that default picks the wrong control.
   *
   * An open shadow root is searched before light DOM, so a custom element
   * resolves without the consumer knowing where its boundary is. The resolved
   * element is pulled out of the sequential tab order (`tabindex="-1"`) so the
   * toolbar keeps exactly one Tab stop.
   *
   * Registration and hit-testing deliberately stay on the host: Aria resolves
   * events with `item.element().contains(target)`, and shadow-DOM events
   * retarget to the host — so repointing the widget element itself would break
   * click, focusin and keydown routing.
   */
  readonly natToolbarItemFocusTarget: import("@angular/core").InputSignal<string | undefined>;
  private readonly widget;
  private readonly destroyRef;
  /** Re-applies the tab-stop suppression when the wrapper re-renders its control away. */
  private observer;
  /** Root the observer is attached to — a shadow root may appear after the first pass. */
  private observedRoot;
  /** One warning per item — a mis-typed selector should not spam every focus. */
  private hasWarnedUnresolved;
  /** One warning per item for a sealed wrapper nothing can be resolved inside of. */
  private hasWarnedSealed;
  /** Guards against queueing a `whenDefined` continuation on every observer tick. */
  private isAwaitingUpgrade;
  /** The control currently pulled out of the tab order, so a selector change or clear can restore it. */
  private suppressedTarget;
  /** The `tabindex` attribute the suppressed control carried beforehand (`null` = none). */
  private suppressedTargetPriorTabIndex;
  private isDestroyed;
  constructor();
  get id(): string;
  /**
   * Host element — the widget's identity for Aria registration and hit-testing,
   * never the nominated focus target. See `natToolbarItemFocusTarget`.
   */
  get element(): HTMLElement;
  readonly position: import("@angular/core").InputSignal<NatToolbarItemPosition>;
  focus(): void;
  /**
   * Forwards focus from the wrapper host to the nominated control.
   *
   * `focus` does not bubble, so this fires only when the host itself is
   * focused — no redirect loop when the target below it takes over. It covers
   * every path Aria uses, since all of them end in `element.focus()`.
   */
  protected redirectFocusToTarget(event: FocusEvent): void;
  /**
   * True when this item forwards focus somewhere below its host: either a
   * selector is set, or the host is a wrapper (not itself an interactive
   * element) whose control is resolved implicitly. A plain `<button>` or
   * `<input>` item is the control and skips all target bookkeeping.
   */
  private get forwardsFocus();
  /**
   * Resolves the target — nominated by selector, or the first focusable
   * descendant of a wrapper host — warning once in dev mode when a selector
   * cannot be satisfied, or a sealed wrapper hides its control entirely.
   */
  private resolveFocusTarget;
  /**
   * Applies tab-stop suppression to the currently resolved target, and keeps
   * the re-render watch pointed at the right root.
   *
   * Suppression has to land before the user first reaches the toolbar — an
   * un-suppressed inner control is a second Tab stop, which is exactly the
   * failure this input exists to remove — so it cannot wait for first focus.
   */
  private syncFocusTarget;
  /**
   * Suppresses `target`, first restoring any previously suppressed control so
   * a selector change never leaves the former target out of the tab order.
   * Re-suppressing the same element keeps its original tabindex record.
   */
  private suppressTargetTabStop;
  /** Returns the previously suppressed control to the tab order it had before. */
  private restoreSuppressedTarget;
  /**
   * Watches the wrapper for re-renders. A component that rebuilds its control
   * drops the `tabindex="-1"` we set, which would silently restore the second
   * Tab stop. Re-attaches when a shadow root appears after the first pass.
   *
   * Only `childList` is observed, so writing the attribute back cannot feed
   * the observer its own mutation.
   */
  private observeFocusTarget;
  /**
   * Re-syncs once a not-yet-upgraded custom element defines itself. Until then
   * it has neither a shadow root nor rendered children, so nothing to resolve.
   */
  private awaitCustomElementUpgrade;
  static ɵfac: i0.ɵɵFactoryDeclaration<NatToolbarItem, never>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NatToolbarItem, "[natToolbarItem]", never, {
    "natToolbarItemPosition": {
      "alias": "natToolbarItemPosition";
      "required": false;
      "isSignal": true;
    };
    "natToolbarItemFocusTarget": {
      "alias": "natToolbarItemFocusTarget";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, [{
    directive: typeof i1.ToolbarWidget;
    inputs: {
      "disabled": "disabled";
      "id": "id";
    };
    outputs: {};
  }]>;
}
export type { NatTableColumnExportOptions, NatTableColumnExportValueContext, NatTableColumnMeta, NatTableExportCellValue, NatTableExportConfig, NatTableExportConfigFactory, NatTableExportContext, NatTableExportData, NatTableExportHandler, NatTableHeaderActionsOptions, NatTableSelectionColumnOptions, NatTableSortDirection, NatTableSortIndicatorContent, NatTableSortIndicatorContext, NatToolbarFocusManagement, NatToolbarItemPosition, NatToolbarItemRef };