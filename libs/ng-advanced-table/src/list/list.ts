/* eslint-disable max-lines -- list component shell, mirroring table.ts: inputs/outputs, the NatTableUiController surface, state-signal aliases, and input bridging. All pure logic (state views, template contexts, column label resolution) lives in ./utils and ./common. */
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

import type { ColumnDef, FilterFn, HeaderContext, Row, RowData, Updater } from '@tanstack/angular-table';
import { FlexRender } from '@tanstack/angular-table';

import type { NatListStateKey } from './common/list-state.type';
import { NatListFieldArea } from './list-field-area.directive';
import { findRowCell, hasStaticLabel, isSrOnlyLabel } from './utils/list-column.util';
import { buildListStateTemplateContext, resolveListStateView } from './utils/list-state.util';
import type { NatTableRowActivateEvent, NatTableRowIdGetter } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from '../ui/table-status-templates.directive';
import { resolveColumnLabel } from '../utils/column-label.util';

/**
 * SPIKE: list renderer sharing the table engine (`NatTableState`).
 *
 * Renders each row as a stacked list item whose fields follow the visible
 * column order, so sorting, filtering, column order, and column visibility
 * state drive the list exactly as they drive the table. Implements
 * `NatTableUiController`, so surface-bound companion controls resolve it.
 *
 * Deliberately omitted: column resizing, pinning, header measurement, cell
 * interaction, and reorder DOM affordances — consumers drive sorting and
 * field order through surface state / `patchState`.
 */
@Component({
  selector: 'nat-list',
  exportAs: 'natList',
  // A runtime state binding, not a theme default — exempt from the "never
  // declare --nat-table-* tokens on hosts" rule, and it targets the internal
  // `--sys-*` bridge anyway.
  host: {
    '[style.--sys-nat-table-list-item-areas]': 'defaultItemAreas()'
  },
  imports: [FlexRender, NatListFieldArea, NgTemplateOutlet],
  providers: [NatTableState, NatTableA11yService],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class NatList<TData extends RowData = RowData> implements NatTableUiController<TData> {
  // ─── Inputs ───

  /** Row data rendered by the list. */
  public readonly data = input.required<readonly TData[]>();
  /** TanStack column definitions for the current row type. */
  public readonly columns = input.required<readonly ColumnDef<TData, unknown>[]>();
  /** Accessible name announced for the list. */
  public readonly accessibleName = input<string | undefined>(undefined);
  /** Data lifecycle status. The list renders state items; consumers still own loading, retry, and error handling. */
  public readonly dataStatus = input<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  /** Optional error payload. */
  public readonly error = input<unknown>(null);
  /** Optional override for the global filter implementation. */
  public readonly globalFilterFn = input<FilterFn<TData>>();
  /** Optional row id resolver. Defaults to a string/number `row.id`, then a namespaced positional fallback. */
  public readonly getRowId = input<NatTableRowIdGetter<TData>>();
  /**
   * Enables row selection state. Pair with a selection column (for example
   * `withNatTableSelectionColumn(...)`) to render a per-item checkbox; the
   * item then carries `data-selected` for styling.
   */
  public readonly enableRowSelection = input(false, { transform: booleanAttribute });
  /** Selection cardinality when enabled: `'multiple'` (default) or `'single'`. */
  public readonly selectionMode = input<'single' | 'multiple'>('multiple');
  /**
   * Makes items activatable: each item renders a stretched activator button
   * that emits `rowActivate` on click and Enter/Space.
   *
   * A real `<button>` rather than a focusable `<li>`: a focusable listitem
   * exposes no interactive role, so assistive technology would announce it as
   * plain text with no way to discover that Enter does anything (WCAG 4.1.2).
   * Opt-in because it adds a tab stop per item.
   */
  public readonly enableRowActivation = input(false, { transform: booleanAttribute });

  // ─── Outputs ───

  /** Emits when an item's activator button is clicked or keyboard-activated. */
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
  /** Stable DOM id for the rendered `<ul>` element. */
  public readonly tableElementId = this.state.tableElementId;
  /** Scrollable wrapper around the rendered list for companion scroll controls. */
  public readonly tableScrollContainer = computed(() => this.listRegionRef()?.nativeElement ?? null);
  /** Resolved locale id (from the surface or the built-in English default). */
  public readonly localeId = this.state.localeId;

  // ─── State-derived template aliases ───

  protected readonly bodyRows = this.state.bodyRows;
  protected readonly visibleColumns = this.state.visibleColumns;
  protected readonly bodyState = this.state.bodyState;

  /**
   * Default stacked `grid-template-areas` for a list item: one row per visible
   * column, named by column id. Written to the internal `--sys-*` bridge so a
   * consumer's `--nat-table-list-item-areas` (plus `-columns`) can lay out the
   * named field areas freely; each field carries `grid-area: <column-id>`.
   */
  protected readonly defaultItemAreas = computed(() =>
    this.visibleColumns()
      .map((column) => `'${column.id}'`)
      .join(' ')
  );

  protected readonly tableAriaBusy = this.state.tableAriaBusy;
  protected readonly resolvedDirection = this.state.resolvedDirection;
  protected readonly resolvedDescription = this.state.resolvedDescription;
  protected readonly resolvedEmptyState = this.state.resolvedEmptyState;
  protected readonly resolvedLoadingState = this.state.resolvedLoadingState;
  protected readonly resolvedErrorState = this.state.resolvedErrorState;
  protected readonly listSummaryId = this.state.tableSummaryId;
  protected readonly tableDescriptionId = this.state.tableDescriptionId;
  protected readonly listAriaLabel = this.state.tableAriaLabel;

  /**
   * Rendered loading/empty/error item, or `null` while rows are shown. Keeps
   * the three states on one markup shape so they share a base design.
   */
  protected readonly stateView = computed(() =>
    resolveListStateView(this.bodyState(), {
      [NAT_TABLE_BODY_STATE.loading]: this.resolvedLoadingState(),
      [NAT_TABLE_BODY_STATE.empty]: this.resolvedEmptyState(),
      [NAT_TABLE_BODY_STATE.error]: this.resolvedErrorState()
    })
  );

  // ─── Consumer state templates (same directives the table accepts) ───

  private readonly loadingTemplate = contentChild(NatTableLoadingTemplate);
  private readonly emptyTemplate = contentChild(NatTableEmptyTemplate);
  private readonly errorTemplate = contentChild(NatTableErrorTemplate);

  /**
   * Active consumer state template plus its context, or `null` to fall back to
   * the built-in indicator and message. The template replaces the state item's
   * content while keeping the shared `list-state` shell and its style tokens.
   */
  protected readonly stateTemplateView = computed(() => {
    const bodyState = this.bodyState();

    if (bodyState === NAT_TABLE_BODY_STATE.rows) {
      return null;
    }

    const templateRefs: Record<NatListStateKey, TemplateRef<unknown> | undefined> = {
      [NAT_TABLE_BODY_STATE.loading]: this.loadingTemplate()?.templateRef,
      [NAT_TABLE_BODY_STATE.empty]: this.emptyTemplate()?.templateRef,
      [NAT_TABLE_BODY_STATE.error]: this.errorTemplate()?.templateRef
    };
    const templateRef = templateRefs[bodyState];

    return templateRef
      ? { templateRef, context: buildListStateTemplateContext(this.state.getStateTemplateBaseContext(), bodyState, this.error()) }
      : null;
  });

  // ─── A11y (delegated to service) ───

  protected readonly listSummary = this.a11yService.listSummary;
  protected readonly liveMessage = this.a11yService.liveMessage;

  protected readonly ariaDescribedBy = computed(() => {
    const ids: string[] = [];

    if (this.listSummary().trim()) {
      ids.push(this.listSummaryId());
    }

    if (this.resolvedDescription().trim()) {
      ids.push(this.tableDescriptionId());
    }

    return ids.length ? ids.join(' ') : null;
  });

  // ─── DOM-coupled state ───

  private readonly listRegionRef = viewChild<ElementRef<HTMLElement>>('listRegion');

  // ─── Template-bound util aliases ───

  protected readonly resolveColumnLabel = resolveColumnLabel<TData>;

  protected readonly cellForColumn = findRowCell<TData>;

  protected readonly hasStaticLabel = hasStaticLabel<TData>;

  protected readonly isSrOnlyLabel = isSrOnlyLabel<TData>;

  /**
   * Selected flag for a list item, or `null` when selection is disabled.
   *
   * Exposed as `data-selected` rather than `aria-selected`: `aria-selected` is
   * invalid on `role="listitem"`, and the selection control inside the item
   * (a real checkbox) already conveys state to assistive technology.
   */
  protected rowSelectedAttribute(row: Row<TData>): string | null {
    return this.enableRowSelection() ? String(row.getIsSelected()) : null;
  }

  /** Leaf header contexts by column id, for rendering non-string header defs as field labels. */
  protected readonly leafHeaderContexts = computed<Map<string, HeaderContext<TData, unknown>>>(() => {
    const leafHeaders = this.state.headerGroups().at(-1)?.headers ?? [];

    return new Map(
      leafHeaders.filter((header) => !header.isPlaceholder).map((header) => [header.column.id, header.getContext()] as const)
    );
  });

  // ─── Constructor ───

  public constructor() {
    this.natTableService.setController(this);

    // ── Accessibility copy ──
    // The shared a11y effects self-register in the service constructor; the
    // list only selects its announcement copy (items/fields, not rows/columns)
    // and skips `registerGridEffects` — column-resize announcements, the
    // `aria-multiselectable` writer, and resize/reorder keybinding validation
    // target a rendered `<table>`, which a list renderer has none of.
    this.a11yService.setRenderer('list');

    // ── Signal-based input bridging (same pattern as NatTable) ──
    effect(() => this.state.data.set(this.data()));
    effect(() => this.state.columnDefs.set(this.columns()));
    effect(() => this.state.dataStatus.set(this.dataStatus()));
    effect(() => this.state.error.set(this.error()));
    effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
    effect(() => this.state.getRowId.set(this.getRowId()));
    effect(() => this.state.accessibleName.set(this.accessibleName()));
    effect(() => this.state.enableRowSelection.set(this.enableRowSelection()));
    effect(() => this.state.selectionMode.set(this.selectionMode()));

    effect(() => this.state.tableRegionRef.set(this.listRegionRef()));

    this.state.registerSeedEffect();

    this.destroyRef.onDestroy(() => {
      this.natTableService.clearController(this);
    });
  }

  // ─── Row activation ───

  /**
   * Id of the item's first visible field, naming the activator button via
   * `aria-labelledby`. Keyed by render index, not `row.id`: row ids come from
   * the consumer's `getRowId` and may contain whitespace or other characters
   * that break an id reference (`aria-labelledby` is a space-separated list),
   * which would leave the activator with no accessible name.
   */
  protected activatorLabelId(index: number): string {
    return `${this.tableElementId()}-item-${index}-label`;
  }

  // No interactive-descendant guard here: the activator is a stretched sibling
  // of the fields, so events from controls inside fields never reach it — they
  // stack above it in CSS.
  protected onActivatorClick(event: MouseEvent, row: Row<TData>): void {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }

    this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
  }

  protected onActivatorKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (event.defaultPrevented || !this.natTableService.keyboard().rowActivate(event)) {
      return;
    }

    // Emit through the configured keybinding (so a surface rebind applies to
    // the list) and suppress the button's own native activation: without this,
    // Enter/Space would synthesize a click and emit twice, and Space would
    // scroll the page.
    event.preventDefault();
    this.rowActivate.emit({ rowData: row.original, row, originalEvent: event });
  }

  // ─── NatTableUiController implementation (delegates to state) ───

  public patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    this.state.patchState(updaters);
  }
}
