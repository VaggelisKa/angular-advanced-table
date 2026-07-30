import type { ElementRef } from '@angular/core';
import { Component, DestroyRef, computed, effect, inject, input, viewChild } from '@angular/core';

import type { Cell, ColumnDef, FilterFn, Row, RowData, Updater } from '@tanstack/angular-table';
import { FlexRender } from '@tanstack/angular-table';

import type { NatTableRowIdGetter } from '../common/row.type';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NatTableA11yService } from '../domain-logic/table-a11y.service';
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
import { resolveColumnLabel } from '../utils/column-label.util';

const findRowCell = <TData extends RowData>(row: Row<TData>, columnId: string): Cell<TData, unknown> | null =>
  row.getAllCells().find((cell) => cell.column.id === columnId) ?? null;

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
  imports: [FlexRender],
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
  protected readonly tableAriaBusy = this.state.tableAriaBusy;
  protected readonly resolvedDirection = this.state.resolvedDirection;
  protected readonly resolvedDescription = this.state.resolvedDescription;
  protected readonly resolvedEmptyState = this.state.resolvedEmptyState;
  protected readonly resolvedLoadingState = this.state.resolvedLoadingState;
  protected readonly resolvedErrorState = this.state.resolvedErrorState;
  protected readonly tableSummaryId = this.state.tableSummaryId;
  protected readonly tableDescriptionId = this.state.tableDescriptionId;
  protected readonly listAriaLabel = this.state.tableAriaLabel;

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

  // ─── Constructor ───

  public constructor() {
    this.natTableService.setController(this);

    // ── Signal-based input bridging (same pattern as NatTable) ──
    effect(() => this.state.data.set(this.data()));
    effect(() => this.state.columnDefs.set(this.columns()));
    effect(() => this.state.dataStatus.set(this.dataStatus()));
    effect(() => this.state.error.set(this.error()));
    effect(() => this.state.globalFilterFn.set(this.globalFilterFn()));
    effect(() => this.state.getRowId.set(this.getRowId()));
    effect(() => this.state.accessibleName.set(this.accessibleName()));

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
