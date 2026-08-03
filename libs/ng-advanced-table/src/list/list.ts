import {
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core';

import type { ColumnDef, FilterFn, HeaderContext, Row, RowData, Updater } from '@tanstack/angular-table';
import { FlexRender } from '@tanstack/angular-table';

import { LIST_STATE_VIEWS } from './common/list-state.const';
import type { NatListStateKey } from './common/list-state.const';
import { NatListFieldArea } from './list-field-area.directive';
import { findRowCell, hasStaticLabel, isSrOnlyLabel } from './utils/list-column.util';
import type { NatTableRowIdGetter } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_BODY_STATE, NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
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
  imports: [FlexRender, NatListFieldArea],
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
  protected readonly tableSummaryId = this.state.tableSummaryId;
  protected readonly tableDescriptionId = this.state.tableDescriptionId;
  protected readonly listAriaLabel = this.state.tableAriaLabel;

  /**
   * Rendered loading/empty/error item, or `null` while rows are shown. Keeps
   * the three states on one markup shape so they share a base design.
   */
  protected readonly stateView = computed(() => {
    const bodyState = this.bodyState();

    if (bodyState === NAT_TABLE_BODY_STATE.rows) {
      return null;
    }

    const messages: Record<NatListStateKey, string> = {
      [NAT_TABLE_BODY_STATE.loading]: this.resolvedLoadingState(),
      [NAT_TABLE_BODY_STATE.empty]: this.resolvedEmptyState(),
      [NAT_TABLE_BODY_STATE.error]: this.resolvedErrorState()
    };

    return { ...LIST_STATE_VIEWS[bodyState], state: bodyState, message: messages[bodyState] };
  });

  // ─── A11y (delegated to service) ───

  protected readonly tableSummary = this.a11yService.tableSummary;
  protected readonly liveMessage = this.a11yService.liveMessage;

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

    // ── Default item areas bridge ──
    // Written imperatively: Angular host `[style.--*]` bindings silently drop
    // string-valued custom properties on client-side creation, so the `--sys`
    // bridge would only survive SSR-rendered first loads.
    const hostElementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    const renderer = inject(Renderer2);

    effect(() => {
      renderer.setStyle(
        hostElementRef.nativeElement,
        '--sys-nat-table-list-item-areas',
        this.defaultItemAreas(),
        RendererStyleFlags2.DashCase
      );
    });

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

  // ─── NatTableUiController implementation (delegates to state) ───

  public patchState(
    updaters: Partial<{
      [K in keyof NatTableUserState]: Updater<NatTableUserState[K]>;
    }>
  ): void {
    this.state.patchState(updaters);
  }
}
