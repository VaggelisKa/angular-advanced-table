/* eslint-disable max-lines -- table component: presentational template consumer + input bridging. A11y, resize, reorder, and header measurement logic live in injectable services. */
import { Grid, GridCell, GridRow } from '@angular/aria/grid';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import type { ElementRef, TemplateRef } from '@angular/core';
import {
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';

import type { Column, ColumnDef, FilterFn, Header, HeaderGroup, Row, RowData, Updater } from '@tanstack/angular-table';
import { FlexRender } from '@tanstack/angular-table';

import { NatTableCellControlManager } from '../cell-interaction/table-cell-control-manager.service';
import { NatTableCell } from '../cell-interaction/table-cell.directive';
import { handleCellInteractionFocusIn, handleCellInteractionKeydown } from '../cell-interaction/utils/cell-interaction.util';
import type { NatTableRowRenderedEvent } from '../common/row-render.type';
import type { NatTableRowActivateEvent, NatTableRowIdGetter } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type {
  NatTableDataStatus,
  NatTableEmptyTemplateContext,
  NatTableErrorTemplateContext,
  NatTableLoadingTemplateContext
} from '../common/table-status.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableHeaderMeasurementService } from '../domain-logic/table-header-measurement.service';
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
import { isSpaceShortcutKey } from '../hotkey-a11y/utils/shortcut-parsing.util';
import { NatTableReorderService } from '../reorder/table-reorder.service';
import { NatTableResizeService } from '../resize/table-resize.service';
import { NatTableRowRenderEmitter } from '../ui/row-render-emitter.directive';
import { NatTableBodyCellLayout, NatTableHeaderCellLayout, NatTablePxWidth, NatTableResizeGuide } from '../ui/table-layout.directive';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from '../ui/table-status-templates.directive';
import { getHeaderRowColumnIds, shouldHidePrimitiveHeaderLabel } from '../utils/column-label.util';
import { canResizeColumn, getCellTone, isResizeKey, originatesFromInteractiveDescendant } from '../utils/interaction.util';

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
@Component({
  selector: 'nat-table',
  exportAs: 'natTable',
  imports: [
    NgTemplateOutlet,
    Grid,
    GridCell,
    GridRow,
    CdkDropList,
    CdkDrag,
    FlexRender,
    NatTableRowRenderEmitter,
    NatTableCell,
    NatTableHeaderCellLayout,
    NatTableBodyCellLayout,
    NatTablePxWidth,
    NatTableResizeGuide
  ],
  providers: [
    NatTableState,
    NatTableA11yService,
    NatTableResizeService,
    NatTableReorderService,
    NatTableHeaderMeasurementService,
    NatTableCellControlManager
  ],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class NatTable<TData extends RowData = RowData> implements NatTableUiController<TData> {
  // ─── Inputs ───

  /** Row data rendered by the table. */
  public readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  public readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Accessible name announced for the grid when no visible caption is rendered. */
  public readonly accessibleName = input<string | undefined>(undefined);
  /** Visible table caption. When present, it provides the grid's accessible name. */
  public readonly caption = input<string | undefined>(undefined);
  /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
  public readonly dataStatus = input<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  /** Optional error payload passed through to `natTableError` templates. */
  public readonly error = input<unknown>(null);
  /** Enables row selection (`aria-selected`, selection state, companion checkbox column). */
  public readonly enableRowSelection = input(false, { transform: booleanAttribute });
  /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
  public readonly selectionMode = input<'single' | 'multiple'>('multiple');
  /** Optional override for the global filter implementation. */
  public readonly globalFilterFn = input<FilterFn<TData>>();
  /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
  public readonly getRowId = input<NatTableRowIdGetter<TData>>();
  /** Emits one `rowRendered` event per body row per cycle. Off by default (adds an `afterRenderEffect` per row). */
  public readonly emitRowRenderEvents = input(false, { transform: booleanAttribute });

  // ─── Outputs ───

  /** Emits per-row paint timings when `emitRowRenderEvents` is enabled. */
  public readonly rowRendered = output<NatTableRowRenderedEvent>();
  /** Emits on row click or Enter/Space unless the event started on an interactive descendant. */
  public readonly rowActivate = output<NatTableRowActivateEvent<TData>>();

  // ─── Injected services and directives ───

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly a11yService = inject<NatTableA11yService<TData>>(NatTableA11yService);
  private readonly resizeService = inject<NatTableResizeService<TData>>(NatTableResizeService);
  private readonly reorderService = inject<NatTableReorderService<TData>>(NatTableReorderService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── State-derived template aliases ───
  // These expose state signals to the template with the same names the template expects.

  /** Public: NatTableUiController consumers (surface `[for]="grid"`) need these. */
  public readonly enablePagination = this.state.enablePagination;
  public readonly enableGlobalFilter = this.state.enableGlobalFilter;
  public readonly table = this.state.table;
  /** Stable DOM id for the rendered `<table>` element. */
  public readonly tableElementId = this.state.tableElementId;
  /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
  public readonly tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null);
  /** Resolved locale id (from the surface or the built-in English default). */
  public readonly localeId = this.state.localeId;

  protected readonly headerGroups = this.state.headerGroups;
  protected readonly bodyRows = this.state.bodyRows;
  protected readonly visibleColumns = this.state.visibleColumns;
  protected readonly bodyState = this.state.bodyState;
  protected readonly resolvedDataStatus = this.state.resolvedDataStatus;
  protected readonly resolvedCaption = this.state.resolvedCaption;
  protected readonly resolvedDirection = this.state.resolvedDirection;
  protected readonly stickyHeader = this.state.stickyHeader;
  protected readonly usesAuthoritativeLayout = this.state.usesAuthoritativeLayout;
  protected readonly tableClassMap = this.state.tableClassMap;
  protected readonly fixedLayoutTableWidth = this.state.fixedLayoutTableWidth;
  protected readonly resolvedColumnWidths = this.state.resolvedColumnWidths;
  protected readonly columnRenderStates = this.state.columnRenderStates;
  protected readonly visibleColumnCount = this.state.visibleColumnCount;
  protected readonly emptyStateColSpan = this.state.emptyStateColSpan;
  protected readonly tableAriaBusy = this.state.tableAriaBusy;
  protected readonly renderCycleToken = this.state.renderCycleToken;
  protected readonly renderCycleStartedAt = this.state.renderCycleStartedAt;
  protected readonly resolvedDescription = this.state.resolvedDescription;
  protected readonly resolvedEmptyState = this.state.resolvedEmptyState;
  protected readonly resolvedLoadingState = this.state.resolvedLoadingState;
  protected readonly resolvedErrorState = this.state.resolvedErrorState;

  // ─── ARIA computeds (delegated to state, except ariaDescribedBy which bridges state + service) ───

  protected readonly tableCaptionId = this.state.tableCaptionId;
  protected readonly tableSummaryId = this.state.tableSummaryId;
  protected readonly tableDescriptionId = this.state.tableDescriptionId;
  protected readonly tableKeyboardInstructionsId = this.state.tableKeyboardInstructionsId;
  protected readonly tableAriaLabel = this.state.tableAriaLabel;
  protected readonly tableAriaLabelledBy = this.state.tableAriaLabelledBy;
  protected readonly resolvedKeyboardInstructions = this.state.resolvedKeyboardInstructions;

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.tableSummary().trim()) {
      ids.push(this.tableSummaryId());
    }

    if (this.resolvedDescription().trim()) {
      ids.push(this.tableDescriptionId());
    }

    if (this.resolvedKeyboardInstructions().trim()) {
      ids.push(this.tableKeyboardInstructionsId());
    }

    return ids.length ? ids.join(' ') : null;
  });

  // ─── Template ref queries (component-owned, DOM-coupled) ───

  private readonly loadingTemplate = contentChild(NatTableLoadingTemplate);
  private readonly emptyTemplate = contentChild(NatTableEmptyTemplate);
  private readonly errorTemplate = contentChild(NatTableErrorTemplate);

  protected readonly loadingTemplateRef = computed<TemplateRef<NatTableLoadingTemplateContext<TData>> | null>(() => {
    const templateRef = this.loadingTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableLoadingTemplateContext<TData>>) : null;
  });

  protected readonly emptyTemplateRef = computed<TemplateRef<NatTableEmptyTemplateContext<TData>> | null>(() => {
    const templateRef = this.emptyTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableEmptyTemplateContext<TData>>) : null;
  });

  protected readonly errorTemplateRef = computed<TemplateRef<NatTableErrorTemplateContext<TData>> | null>(() => {
    const templateRef = this.errorTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableErrorTemplateContext<TData>>) : null;
  });

  protected readonly loadingTemplateContext = computed<NatTableLoadingTemplateContext<TData>>(() => ({
    ...this.state.getStateTemplateBaseContext(),
    $implicit: NAT_TABLE_BODY_STATE.loading,
    status: NAT_TABLE_BODY_STATE.loading
  }));

  protected readonly emptyTemplateContext = computed<NatTableEmptyTemplateContext<TData>>(() => ({
    ...this.state.getStateTemplateBaseContext(),
    $implicit: NAT_TABLE_BODY_STATE.empty,
    status: NAT_TABLE_BODY_STATE.empty
  }));

  protected readonly errorTemplateContext = computed<NatTableErrorTemplateContext<TData>>(() => {
    const error = this.error();

    return {
      ...this.state.getStateTemplateBaseContext(),
      $implicit: error,
      status: NAT_TABLE_BODY_STATE.error,
      error
    };
  });

  // ─── A11y (delegated to service) ───

  protected readonly tableSummary = this.a11yService.tableSummary;
  protected readonly liveMessage = this.a11yService.liveMessage;

  // ─── Resize (delegated to service) ───

  protected readonly columnResizeGuide = this.resizeService.columnResizeGuide;
  protected readonly isColumnResizing = this.resizeService.isColumnResizing;

  // ─── DOM-coupled state ───

  private readonly tableRegionRef = viewChild<ElementRef<HTMLElement>>('tableRegion');

  // ─── Template-bound util aliases ───

  protected readonly getHeaderRowColumnIds = getHeaderRowColumnIds<TData>;
  protected readonly shouldHidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel<TData>;
  protected readonly getCellTone = getCellTone<TData>;
  protected readonly onCellFocusIn = handleCellInteractionFocusIn;
  protected readonly canResizeColumn = (header: Header<TData, unknown>): boolean =>
    canResizeColumn(header, this.state.resizingEnabled());

  protected readonly isLeafHeaderRow = (headerGroup: HeaderGroup<TData>): boolean => this.reorderService.isLeafHeaderRow(headerGroup);
  protected readonly hasReorderableColumns = (): boolean => this.reorderService.hasReorderableColumns();
  protected readonly canReorderHeader = (header: Header<TData, unknown>): boolean =>
    !header.isPlaceholder && this.reorderService.canReorderHeader(header.column);

  // ─── Constructor ───

  public constructor() {
    // NatTableHeaderMeasurementService is self-contained; injecting triggers its constructor lifecycle.
    inject<NatTableHeaderMeasurementService<TData>>(NatTableHeaderMeasurementService);
    // NatTableCellControlManager owns one initial control sweep and one observer per table.
    inject(NatTableCellControlManager);

    this.natTableService.setController(this);

    // ── Signal-based input bridging ──
    // Sync component inputs → state writable signals via effects (no ngOnChanges).
    effect(() => this.state.data.set(this.data()));
    effect(() => this.state.columnDefs.set(this.columns()));
    effect(() => this.state.dataStatus.set(this.dataStatus()));
    effect(() => this.state.error.set(this.error()));
    effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
    effect(() => this.state.selectionMode.set(this.selectionMode()));
    effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
    effect(() => this.state.getRowId.set(this.getRowId()));
    effect(() => this.state.accessibleName.set(this.accessibleName()));
    effect(() => this.state.caption.set(this.caption()));
    effect(() => this.state.emitRowRenderEvents.set(this.emitRowRenderEvents()));

    // ── Wire table region ref to state (read by all services) ──
    effect(() => this.state.tableRegionRef.set(this.tableRegionRef()));

    // ── Lifecycle effects (seed + render cycle delegated to state) ──
    this.state.registerSeedEffect();
    this.state.registerRenderCycleEffect();

    this.destroyRef.onDestroy(() => {
      this.natTableService.clearController(this);
    });
  }

  // ─── NatTableUiController implementation (public API, delegates to state) ───

  public patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    this.state.patchState(updaters);
  }

  // ─── Template event handlers ───

  protected onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: HeaderGroup<TData>): void {
    this.reorderService.onHeaderDrop(event, headerGroup);
  }

  protected onHeaderKeydown(event: KeyboardEvent, column: Column<TData, unknown>): void {
    const keyboard = this.natTableService.keyboard();

    if (handleCellInteractionKeydown(event, keyboard.cellInteraction)) return;

    if (event.altKey && !event.shiftKey && isResizeKey(event)) {
      this.resizeService.resizeFromKey(event, column);

      return;
    }

    const directionDelta = keyboard.columnReorderDirection(event);

    if (directionDelta === null) return;

    this.reorderService.handleKeyboardReorder(event, column, directionDelta);
  }

  protected onResizeStart(event: MouseEvent | TouchEvent, header: Header<TData, unknown>): void {
    this.resizeService.startResize(event, header);
  }

  protected onRowRendered(event: NatTableRowRenderedEvent): void {
    this.rowRendered.emit(event);
  }

  protected rowAriaSelected(row: Row<TData>): boolean | null {
    return this.state.enableRowSelection() ? row.getIsSelected() : null;
  }

  protected onRowClick(event: MouseEvent, row: Row<TData>): void {
    if (event.button !== 0 || event.defaultPrevented) {
      return;
    }

    if (originatesFromInteractiveDescendant(event)) {
      return;
    }

    this.rowActivate.emit({
      rowData: row.original,
      row,
      originalEvent: event
    });
  }

  protected onRowKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (event.defaultPrevented) {
      return;
    }

    if (!this.natTableService.keyboard().rowActivate(event)) {
      return;
    }

    if (originatesFromInteractiveDescendant(event)) {
      return;
    }

    if (isSpaceShortcutKey(event.key)) {
      event.preventDefault();
    }

    this.rowActivate.emit({
      rowData: row.original,
      row,
      originalEvent: event
    });
  }
}
