/* eslint-disable max-lines -- static renderer component shell, mirroring table.ts: inputs/outputs, the NatTableUiController surface, state-signal aliases, and input bridging. Pure logic lives in the shared engine and utils. */
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

import type { ColumnDef, FilterFn, RowData, Row as TanstackRow, Updater } from '@tanstack/angular-table';
import { FlexRender } from '@tanstack/angular-table';

import type { NatTableRowActivateEvent, NatTableRowIdGetter } from '../common/row.type';
import type { NatTableSubHeaderGroup, NatTableSubHeaderTemplateContext } from '../common/sub-header.type';
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
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
import { NatTableBodyCellLayout, NatTableHeaderCellLayout, NatTablePxWidth } from '../ui/table-layout.directive';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from '../ui/table-status-templates.directive';
import { NatTableSubHeaderTemplate } from '../ui/table-sub-header-template.directive';
import { shouldHidePrimitiveHeaderLabel } from '../utils/column-label.util';
import { getCellTone, originatesFromInteractiveDescendant } from '../utils/interaction.util';

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
@Component({
  selector: 'nat-table-static',
  exportAs: 'natTableStatic',
  imports: [FlexRender, NatTableBodyCellLayout, NatTableHeaderCellLayout, NatTablePxWidth, NgTemplateOutlet],
  providers: [NatTableState, NatTableA11yService],
  templateUrl: './static-table.html',
  // Shares the table skeleton's stylesheet: the static renderer produces the
  // same class structure (header cells, data rows, state rows, pinned zones).
  styleUrl: '../table/table.css'
})
export class NatTableStatic<TData extends RowData = RowData> implements NatTableUiController<TData> {
  // ─── Inputs ───

  /** Row data rendered by the table. */
  public readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  public readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Accessible name announced for the table when no visible caption is rendered. */
  public readonly accessibleName = input<string | undefined>(undefined);
  /** Visible table caption. When present, it provides the table's accessible name. */
  public readonly caption = input<string | undefined>(undefined);
  /** Data lifecycle status. The table renders state rows; consumers still own loading, retry, and error handling. */
  public readonly dataStatus = input<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  /** Optional error payload passed through to `natTableError` templates. */
  public readonly error = input<unknown>(null);
  /** Enables row selection state. Selected rows carry `data-selected` for styling. */
  public readonly enableRowSelection = input(false, { transform: booleanAttribute });
  /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
  public readonly selectionMode = input<'single' | 'multiple'>('multiple');
  /** Optional override for the global filter implementation. */
  public readonly globalFilterFn = input<FilterFn<TData>>();
  /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
  public readonly getRowId = input<NatTableRowIdGetter<TData>>();
  /**
   * Leaf column id whose value groups rows under rendered sub-header rows.
   * The table always sorts by this column first (hidden from sort UI and
   * emitted state); user sorting applies within groups. Unset or unknown ids
   * disable the feature.
   */
  public readonly subHeaderColumn = input<string | undefined>(undefined);
  /**
   * Optional explicit sub-header group order (e.g. `['active', 'archived']`).
   * Unlisted values sort after listed ones in natural ascending order.
   * Requires `subHeaderColumn`.
   */
  public readonly subHeaderOrder = input<readonly unknown[] | undefined>(undefined);
  /**
   * Renderer-level sub-header gate, on by default. Set to `false` to ignore
   * `subHeaderColumn`/`subHeaderOrder` on this table only — useful when the
   * same bound config drives another renderer that should keep its groups.
   */
  public readonly enableSubHeaders = input(true, { transform: booleanAttribute });
  /**
   * Layout mode for the sub-header row.
   * - `'colspan'` (default): Renders a single cell spanning the entire row.
   * - `'cells'`: Renders individual cells matching the column structure, preserving pinned column boundaries.
   */
  public readonly subHeaderLayout = input<'colspan' | 'cells'>('colspan');

  // ─── Outputs ───

  /** Emits on row click unless the event started on an interactive descendant. */
  public readonly rowActivate = output<NatTableRowActivateEvent<TData>>();

  // ─── Injected services ───

  private readonly natTableService = inject<NatTableService<TData>>(NatTableService);
  private readonly state = inject<NatTableState<TData>>(NatTableState);
  private readonly a11yService = inject<NatTableA11yService<TData>>(NatTableA11yService);
  private readonly destroyRef = inject(DestroyRef);

  // ─── NatTableUiController contract ───

  public readonly enablePagination = this.state.enablePagination;
  public readonly enableGlobalFilter = this.state.enableGlobalFilter;
  public readonly table = this.state.table;
  /** Stable DOM id for the rendered `<table>` element. */
  public readonly tableElementId = this.state.tableElementId;
  /** Scrollable wrapper around the rendered `<table>` for companion scroll controls. */
  public readonly tableScrollContainer = computed(() => this.tableRegionRef()?.nativeElement ?? null);
  /** Resolved locale id (from the surface or the built-in English default). */
  public readonly localeId = this.state.localeId;

  // ─── State-derived template aliases ───

  protected readonly headerGroups = this.state.headerGroups;
  protected readonly bodyRows = this.state.bodyRows;
  protected readonly visibleColumns = this.state.visibleColumns;
  protected readonly bodyState = this.state.bodyState;
  protected readonly resolvedCaption = this.state.resolvedCaption;
  protected readonly resolvedDirection = this.state.resolvedDirection;
  protected readonly usesAuthoritativeLayout = this.state.usesAuthoritativeLayout;
  protected readonly tableClassMap = this.state.tableClassMap;
  protected readonly fixedLayoutTableWidth = this.state.fixedLayoutTableWidth;
  protected readonly resolvedColumnWidths = this.state.resolvedColumnWidths;
  protected readonly columnRenderStates = this.state.columnRenderStates;
  protected readonly emptyStateColSpan = this.state.emptyStateColSpan;
  protected readonly tableAriaBusy = this.state.tableAriaBusy;
  protected readonly resolvedDescription = this.state.resolvedDescription;
  protected readonly resolvedEmptyState = this.state.resolvedEmptyState;
  protected readonly resolvedLoadingState = this.state.resolvedLoadingState;
  protected readonly resolvedErrorState = this.state.resolvedErrorState;
  protected readonly tableCaptionId = this.state.tableCaptionId;
  protected readonly tableSummaryId = this.state.tableSummaryId;
  protected readonly tableDescriptionId = this.state.tableDescriptionId;
  protected readonly tableAriaLabel = this.state.tableAriaLabel;
  protected readonly tableAriaLabelledBy = this.state.tableAriaLabelledBy;

  /**
   * No keyboard-instructions id here: a static table has no grid keyboard
   * model to describe, so `aria-describedby` carries summary + description only.
   */
  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.tableSummary().trim()) {
      ids.push(this.tableSummaryId());
    }

    if (this.resolvedDescription().trim()) {
      ids.push(this.tableDescriptionId());
    }

    return ids.length ? ids.join(' ') : null;
  });

  // ─── Consumer state templates (same directives the table accepts) ───

  private readonly loadingTemplate = contentChild(NatTableLoadingTemplate);
  private readonly emptyTemplate = contentChild(NatTableEmptyTemplate);
  private readonly errorTemplate = contentChild(NatTableErrorTemplate);
  private readonly subHeaderTemplate = contentChild(NatTableSubHeaderTemplate);

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

  protected readonly subHeaderTemplateRef = computed<TemplateRef<NatTableSubHeaderTemplateContext<TData>> | null>(() => {
    const templateRef = this.subHeaderTemplate()?.templateRef;

    return templateRef ? (templateRef as TemplateRef<NatTableSubHeaderTemplateContext<TData>>) : null;
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

  // ─── Sub-header groups (delegated to state) ───

  protected readonly subHeaderGroups = this.state.subHeaderGroups;

  protected getSubHeaderContext(group: NatTableSubHeaderGroup<TData>): NatTableSubHeaderTemplateContext<TData> {
    return this.state.getSubHeaderTemplateContext(group);
  }

  protected getSubHeaderAriaText(group: NatTableSubHeaderGroup<TData>): string {
    return this.state.getSubHeaderAnnouncement(group, 'table');
  }

  // ─── A11y (delegated to service) ───

  protected readonly tableSummary = this.a11yService.tableSummary;
  protected readonly liveMessage = this.a11yService.liveMessage;

  // ─── DOM-coupled state ───

  private readonly tableRegionRef = viewChild<ElementRef<HTMLElement>>('tableRegion');

  // ─── Template-bound util aliases ───

  protected readonly shouldHidePrimitiveHeaderLabel = shouldHidePrimitiveHeaderLabel<TData>;
  protected readonly getCellTone = getCellTone<TData>;

  /** `data-selected` for styling; `aria-selected` is invalid on a plain table row. */
  protected rowSelectedAttribute(row: TanstackRow<TData>): string | null {
    return this.enableRowSelection() ? String(row.getIsSelected()) : null;
  }

  // ─── Constructor ───

  public constructor() {
    this.natTableService.setController(this);

    // The shared a11y effects (state-change announcements, summaries)
    // self-register in the service constructor; the grid-only and list-only
    // effect sets are deliberately not registered — a static table has no
    // roving keyboard model, resize announcements, or managed widgets.

    // ── Signal-based input bridging (same pattern as NatTable) ──
    effect(() => this.state.data.set(this.data()));
    effect(() => this.state.columnDefs.set(this.columns()));
    effect(() => this.state.dataStatus.set(this.dataStatus()));
    effect(() => this.state.error.set(this.error()));
    effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
    effect(() => this.state.getRowId.set(this.getRowId()));
    effect(() => this.state.accessibleName.set(this.accessibleName()));
    effect(() => this.state.caption.set(this.caption()));
    effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
    effect(() => this.state.selectionMode.set(this.selectionMode()));
    effect(() => this.state.subHeaderColumn.set(this.subHeaderColumn()));
    effect(() => this.state.subHeaderOrder.set(this.subHeaderOrder()));
    effect(() => this.state.enableSubHeaders.set(this.enableSubHeaders()));

    effect(() => this.state.tableRegionRef.set(this.tableRegionRef()));

    this.state.registerSeedEffect();
    this.state.registerSubHeaderValidationEffect();

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

  protected onRowClick(event: MouseEvent, row: TanstackRow<TData>): void {
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
}
