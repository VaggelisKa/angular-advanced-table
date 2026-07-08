/* eslint-disable max-lines -- cohesive set of NatTable integration-test host components extracted from table.spec.ts; splitting fragments the shared test harness */
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, DestroyRef, booleanAttribute, computed, effect, inject, input, output, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  PaginationState,
  SortingState,
  VisibilityState
} from '@tanstack/angular-table';

import { provideNatTableIntl } from 'ng-advanced-table/locale';
import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { buildRows, columns, formatErrorMessage } from './table-data.helper';
import type { Row } from './table-data.helper';
import type { NatTableRowActivateEvent, NatTableRowIdGetter } from '../common/row.type';
import type { NatTableMode, NatTableModeConfiguration, NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import { NatTableService } from '../domain-logic/table.service';
import { NatTableState } from '../domain-logic/table.state';
import type { NatTableKeybindings } from '../hotkey-a11y/common/keybindings.type';
import { NatTable } from '../table/table';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from '../ui/table-status-templates.directive';

@Component({
  selector: 'test-pager',
  template: ''
})
class TestPager {
  private readonly service = inject(NatTableService);
  public constructor() {
    const destroyRef = inject(DestroyRef);

    this.service.registerPagination();
    destroyRef.onDestroy(() => {
      this.service.unregisterPagination();
    });
  }
}

@Component({
  selector: 'test-search',
  template: ''
})
class TestSearch {
  private readonly service = inject(NatTableService);
  public constructor() {
    const destroyRef = inject(DestroyRef);

    this.service.registerSearch();
    destroyRef.onDestroy(() => {
      this.service.unregisterSearch();
    });
  }
}

// Resolves a single state slice from the controlled binding, then the initial
// state, then a hard default. Kept tiny so the seed below stays branch-free.
const pickSlice = <T>(bound: T | undefined, initial: T | undefined, fallback: T): T => bound ?? initial ?? fallback;

// Seeds the "previous state" baseline from whichever slices the host controls,
// falling back to the surface's initial state and then to empty defaults.
const seedPreviousState = (bound: Partial<NatTableUserState>, initial: Partial<NatTableUserState>): NatTableUserState => ({
  sorting: pickSlice(bound.sorting, initial.sorting, []),
  globalFilter: pickSlice(bound.globalFilter, initial.globalFilter, ''),
  columnFilters: pickSlice(bound.columnFilters, initial.columnFilters, []),
  columnVisibility: pickSlice(bound.columnVisibility, initial.columnVisibility, {}),
  columnOrder: pickSlice(bound.columnOrder, initial.columnOrder, []),
  columnPinning: pickSlice(bound.columnPinning, initial.columnPinning, { left: [], right: [] }),
  columnSizing: pickSlice(bound.columnSizing, initial.columnSizing, {}),
  rowSelection: pickSlice(bound.rowSelection, initial.rowSelection, {}),
  pagination: pickSlice(bound.pagination, initial.pagination, { pageIndex: 0, pageSize: 10 })
});

const sliceChanged = (a: unknown, b: unknown): boolean => JSON.stringify(a) !== JSON.stringify(b);

// Emits `next[slice]` on `emitter` only when that slice differs from `prev`.
const emitIfChanged = <K extends keyof NatTableUserState>(
  prev: NatTableUserState,
  next: NatTableUserState,
  slice: K,
  emitter: (value: NatTableUserState[K]) => void
): void => {
  if (sliceChanged(prev[slice], next[slice])) {
    emitter(next[slice]);
  }
};

@Component({
  selector: 'nat-table-surface',
  template: `<ng-content />`,
  providers: [NatTableService]
})
export class TestTableSurface {
  // The surface takes a one-way controlled `state` input and emits a separately
  // computed next-state through `stateChange`; a two-way model would feed the
  // emitted value back into the binding and change the controlled-state semantics.
  // eslint-disable-next-line @angular-eslint/prefer-signal-model -- one-way controlled input + computed change output, not two-way
  public readonly state = input<Partial<NatTableUserState>>({});

  public readonly initialState = input<Partial<NatTableUserState>>({});
  public readonly mode = input<NatTableMode | NatTableModeConfiguration>('auto');

  public readonly manualPageCount = input<number | undefined>(undefined);
  public readonly enableAnnouncements = input(true, { transform: booleanAttribute });
  public readonly stickyHeader = input(true, { transform: booleanAttribute });
  public readonly enableMultiSort = input(false, { transform: booleanAttribute });
  public readonly locale = input<string | undefined>(undefined);
  public readonly accessibilityText = input<NatTableAccessibilityText>({});
  public readonly keybindings = input<NatTableKeybindings>({});
  public readonly columnResizeMode = input<'onEnd' | 'onChange'>('onEnd');
  public readonly columnSizingMode = input<'fill' | 'fixed'>('fill');
  public readonly enableReordering = input(false, { transform: booleanAttribute });
  public readonly direction = input<'ltr' | 'rtl'>();

  public readonly stateChange = output<NatTableUserState>();
  public readonly sortingChange = output<SortingState>();
  public readonly globalFilterChange = output<string>();
  public readonly columnFiltersChange = output<ColumnFiltersState>();
  public readonly columnVisibilityChange = output<VisibilityState>();
  public readonly columnOrderChange = output<ColumnOrderState>();
  public readonly columnPinningChange = output<ColumnPinningState>();
  public readonly columnSizingChange = output<ColumnSizingState>();
  public readonly paginationChange = output<PaginationState>();
  public readonly rowSelectionChange = output<NatTableUserState['rowSelection']>();

  private readonly natTableService = inject(NatTableService);

  // eslint-disable-next-line max-lines-per-function -- test host wires many state-sync effects for integration specs
  public constructor() {
    effect(() => {
      this.natTableService.setState(this.state());
    });
    effect(() => {
      this.natTableService.surfaceInitialState.set(this.initialState());
    });
    effect(() => {
      this.natTableService.surfaceMode.set(this.mode());
    });
    effect(() => {
      this.natTableService.manualPageCount.set(this.manualPageCount());
    });
    effect(() => {
      this.natTableService.enableAnnouncements.set(this.enableAnnouncements());
    });
    effect(() => {
      this.natTableService.stickyHeader.set(this.stickyHeader());
    });
    effect(() => {
      this.natTableService.enableMultiSort.set(this.enableMultiSort());
    });
    effect(() => {
      this.natTableService.locale.set(this.locale());
    });
    effect(() => {
      this.natTableService.accessibilityText.set(this.accessibilityText());
    });
    effect(() => {
      this.natTableService.surfaceKeybindings.set(this.keybindings());
    });
    effect(() => {
      this.natTableService.columnResizeMode.set(this.columnResizeMode());
    });
    effect(() => {
      this.natTableService.columnSizingMode.set(this.columnSizingMode());
    });
    effect(() => {
      this.natTableService.enableReordering.set(this.enableReordering());
    });
    effect(() => {
      this.natTableService.direction.set(this.direction());
    });

    let isFirstChange = true;
    let previousState: NatTableUserState = {
      sorting: [],
      globalFilter: '',
      columnFilters: [],
      columnVisibility: {},
      columnOrder: [],
      columnPinning: { left: [], right: [] },
      columnSizing: {},
      rowSelection: {},
      pagination: { pageIndex: 0, pageSize: 10 }
    };

    effect(() => {
      const nextState = this.natTableService.stateChangeEvent();

      if (!nextState) {
        return;
      }

      if (isFirstChange) {
        previousState = seedPreviousState(this.state(), this.natTableService.surfaceInitialState());
        isFirstChange = false;
      }

      const prev = previousState;

      previousState = nextState;

      this.stateChange.emit(nextState);
      this.emitSliceChanges(prev, nextState);
    });
  }

  // Emits one granular slice output per slice that differs between prev and next.
  private emitSliceChanges(prev: NatTableUserState, next: NatTableUserState): void {
    emitIfChanged(prev, next, 'sorting', (value) => this.sortingChange.emit(value));
    emitIfChanged(prev, next, 'globalFilter', (value) => this.globalFilterChange.emit(value));
    emitIfChanged(prev, next, 'columnFilters', (value) => this.columnFiltersChange.emit(value));
    emitIfChanged(prev, next, 'columnVisibility', (value) => this.columnVisibilityChange.emit(value));
    emitIfChanged(prev, next, 'columnOrder', (value) => this.columnOrderChange.emit(value));
    emitIfChanged(prev, next, 'columnPinning', (value) => this.columnPinningChange.emit(value));
    emitIfChanged(prev, next, 'columnSizing', (value) => this.columnSizingChange.emit(value));
    emitIfChanged(prev, next, 'pagination', (value) => this.paginationChange.emit(value));
    emitIfChanged(prev, next, 'rowSelection', (value) => this.rowSelectionChange.emit(value));
  }
}

@Component({
  selector: 'test-table-host',
  imports: [NatTable, TestTableSurface, TestPager, TestSearch],
  template: `
    <nat-table-surface
      [accessibilityText]="accessibilityText"
      [columnSizingMode]="columnSizingMode"
      [direction]="direction"
      [enableMultiSort]="enableMultiSort"
      [enableReordering]="enableReordering"
      [initialState]="initialState"
      [manualPageCount]="manualPageCount"
      [mode]="mode"
      [state]="state()"
      [stickyHeader]="stickyHeader"
      (columnFiltersChange)="onColumnFiltersChange($event)"
      (columnOrderChange)="onColumnOrderChange($event)"
      (columnPinningChange)="onColumnPinningChange($event)"
      (columnSizingChange)="onColumnSizingChange($event)"
      (columnVisibilityChange)="onColumnVisibilityChange($event)"
      (globalFilterChange)="onGlobalFilterChange($event)"
      (paginationChange)="onPaginationChange($event)"
      (rowSelectionChange)="onRowSelectionChange($event)"
      (sortingChange)="onSortingChange($event)"
      (stateChange)="onStateChange($event)">
      @if (enablePagination) {
        <test-pager />
      }
      @if (enableSearch) {
        <test-search />
      }
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [dataStatus]="dataStatus()"
        [enableRowSelection]="enableRowSelection"
        [error]="error()"
        [getRowId]="getRowId"
        [selectionMode]="selectionMode"
        accessibleName="Operations table"
        (rowActivate)="onRowActivate($event)" />
    </nat-table-surface>
  `
})
export class TableHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly state = signal<Partial<NatTableUserState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  protected readonly error = signal<unknown>(null);
  public columns: ColumnDef<Row, unknown>[] = columns;
  public getRowId: NatTableRowIdGetter<Row> | undefined = undefined;
  public initialState: Partial<NatTableUserState> = {
    sorting: [{ id: 'throughput', desc: true }],
    columnPinning: {
      left: ['name'],
      right: []
    },
    pagination: {
      pageIndex: 0,
      pageSize: 2
    }
  };

  public enablePagination = false;
  protected readonly enableSearch = true;
  public enableMultiSort = false;
  public enableRowSelection = false;
  public selectionMode: 'single' | 'multiple' = 'multiple';
  public stickyHeader = true;
  public direction: 'ltr' | 'rtl' | undefined = undefined;
  public columnSizingMode: 'fill' | 'fixed' = 'fill';
  public enableReordering = false;
  public accessibilityText: NatTableAccessibilityText = {};
  public mode: NatTableMode | NatTableModeConfiguration = 'auto';
  public manualPageCount: number | undefined = undefined;
  public readonly stateEvents: Partial<NatTableUserState>[] = [];
  public readonly rowActivateEvents: NatTableRowActivateEvent<Row>[] = [];
  public readonly sortingEvents: NatTableUserState['sorting'][] = [];
  public readonly paginationEvents: NatTableUserState['pagination'][] = [];
  public readonly globalFilterEvents: NatTableUserState['globalFilter'][] = [];
  public readonly columnFiltersEvents: NatTableUserState['columnFilters'][] = [];
  public readonly columnVisibilityEvents: NatTableUserState['columnVisibility'][] = [];
  public readonly columnOrderEvents: NatTableUserState['columnOrder'][] = [];
  public readonly columnPinningEvents: NatTableUserState['columnPinning'][] = [];
  public readonly columnSizingEvents: NatTableUserState['columnSizing'][] = [];
  public readonly rowSelectionEvents: NatTableUserState['rowSelection'][] = [];

  protected onStateChange(state: Partial<NatTableUserState>): void {
    this.stateEvents.push(state);
  }

  protected onSortingChange(sorting: NatTableUserState['sorting']): void {
    this.sortingEvents.push(sorting);
  }

  protected onPaginationChange(pagination: NatTableUserState['pagination']): void {
    this.paginationEvents.push(pagination);
  }

  protected onGlobalFilterChange(globalFilter: NatTableUserState['globalFilter']): void {
    this.globalFilterEvents.push(globalFilter);
  }

  protected onColumnFiltersChange(columnFilters: NatTableUserState['columnFilters']): void {
    this.columnFiltersEvents.push(columnFilters);
  }

  protected onColumnVisibilityChange(columnVisibility: NatTableUserState['columnVisibility']): void {
    this.columnVisibilityEvents.push(columnVisibility);
  }

  protected onColumnOrderChange(columnOrder: NatTableUserState['columnOrder']): void {
    this.columnOrderEvents.push(columnOrder);
  }

  protected onColumnPinningChange(columnPinning: NatTableUserState['columnPinning']): void {
    this.columnPinningEvents.push(columnPinning);
  }

  protected onColumnSizingChange(columnSizing: NatTableUserState['columnSizing']): void {
    this.columnSizingEvents.push(columnSizing);
  }

  protected onRowSelectionChange(rowSelection: NatTableUserState['rowSelection']): void {
    this.rowSelectionEvents.push(rowSelection);
  }

  protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
    this.rowActivateEvents.push(event);
  }
}

@Component({
  selector: 'test-provider-accessibility-host',
  imports: [NatTable, TestTableSurface],
  providers: [
    provideNatTableIntl({
      formatNumber: (value) => `n${value}`,
      accessibilityText: {
        emptyState: 'Provider empty state',
        keyboardInstructions: 'Provider keyboard instructions.',
        tableSummary: ({ visibleRowsText, totalRowsText }) => `Provider summary ${visibleRowsText}/${totalRowsText}`
      }
    })
  ],
  template: `
    <nat-table-surface [accessibilityText]="accessibilityText()" [enableReordering]="true">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Provider table" />
    </nat-table-surface>
  `
})
export class ProviderAccessibilityHost {
  protected readonly rows = signal<Row[]>([]);
  protected readonly columns = columns;
  public readonly accessibilityText = signal<NatTableAccessibilityText>({});
}

@Component({
  selector: 'test-accessible-name-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Latency table" />
    </nat-table-surface>
  `
})
export class AccessibleNameHost {
  protected readonly rows = signal<Row[]>(buildRows(2));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-caption-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Ignored accessible name" caption="Visible operations" />
    </nat-table-surface>
  `
})
export class CaptionHost {
  protected readonly rows = signal<Row[]>(buildRows(2));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-caption-only-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" caption="Visible operations" />
    </nat-table-surface>
  `
})
export class CaptionOnlyHost {
  protected readonly rows = signal<Row[]>(buildRows(2));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-destroyable-table-host',
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      @if (showTable()) {
        <nat-table [columns]="columns" [data]="rows()" accessibleName="Destroyable table" />
      }
    </nat-table-surface>
  `
})
export class DestroyableTableHost {
  public readonly showTable = signal(true);
  protected readonly rows = signal<Row[]>(buildRows(2));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-state-template-service-probe',
  template: `<span class="custom-template-controller">{{ controllerId() }}</span>`
})
class StateTemplateServiceProbe {
  private readonly natTableService = inject(NatTableService);
  protected readonly controllerId = computed(() => this.natTableService.controller()?.tableElementId() ?? 'missing');
}

@Component({
  selector: 'test-state-templates-host',
  imports: [
    NatTable,
    TestTableSurface,
    TestSearch,
    StateTemplateServiceProbe,
    NatTableLoadingTemplate,
    NatTableEmptyTemplate,
    NatTableErrorTemplate
  ],
  template: `
    <nat-table-surface [accessibilityText]="accessibilityText" [state]="state()">
      <test-search />
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [dataStatus]="dataStatus()"
        [error]="error()"
        accessibleName="State template table">
        <ng-template let-status="status" let-totalRowsValue="totalRowsValue" natTableLoading>
          <span class="custom-loading">{{ status }} {{ totalRowsValue }}</span>
          <test-state-template-service-probe />
        </ng-template>

        <ng-template let-columns="visibleColumnsValue" let-filtered="filtered" natTableEmpty>
          <span class="custom-empty">{{ filtered ? 'Filtered empty' : 'Empty' }} {{ columns }}</span>
        </ng-template>

        <ng-template let-error let-totalRowsValue="totalRowsValue" let-visibleRowsValue="visibleRowsValue" natTableError>
          <button [attr.data-row-counts]="visibleRowsValue + '/' + totalRowsValue" class="custom-error" type="button">
            {{ formatError(error) }}
          </button>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
export class StateTemplatesHost {
  public readonly rows = signal<Row[]>([]);
  public readonly state = signal<Partial<NatTableUserState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  public readonly error = signal<unknown>(new Error('Request failed'));
  protected readonly columns = columns;
  protected readonly accessibilityText: NatTableAccessibilityText = {
    loadingState: 'Loading operations.',
    emptyState: 'No operations.',
    errorState: 'Operations failed.'
  };

  protected readonly formatError = formatErrorMessage;
}

export type NatTableInternals = NatTable<Row> & {
  onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: ReturnType<NatTable<Row>['table']['getHeaderGroups']>[number]): void;
};

export const getInternalTable = (fixture: ComponentFixture<TableHost>): NatTableInternals => {
  return fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTableInternals;
};

export const getInternalStore = (fixture: ComponentFixture<TableHost>): NatTableState<Row> => {
  return fixture.debugElement.query(By.directive(NatTable)).injector.get(NatTableState) as NatTableState<Row>;
};

export type RecreateHostOptions = {
  readonly enablePagination?: boolean;
  readonly enableMultiSort?: boolean;
  readonly enableRowSelection?: boolean;
  readonly selectionMode?: 'single' | 'multiple';
  readonly stickyHeader?: boolean;
  readonly direction?: 'ltr' | 'rtl';
  readonly columnSizingMode?: 'fill' | 'fixed';
  readonly enableReordering?: boolean;
  readonly accessibilityText?: NatTableAccessibilityText;
  readonly initialState?: Partial<NatTableUserState>;
  readonly state?: Partial<NatTableUserState>;
  readonly mode?: NatTableMode | NatTableModeConfiguration;
  readonly manualPageCount?: number;
  readonly columns?: ColumnDef<Row, unknown>[];
  readonly getRowId?: NatTableRowIdGetter<Row>;
};

// Creates a fresh TableHost fixture and applies the supplied option overrides.
// `state` drives a signal, the rest are plain fields; only keys the caller
// supplied are applied so omitted options keep the host's defaults.
export const createTableHostFixture = async (
  options: RecreateHostOptions = {}
): Promise<{ readonly fixture: ComponentFixture<TableHost>; readonly host: TableHost }> => {
  const fixture = TestBed.createComponent(TableHost);
  const host = fixture.componentInstance;

  const { state, ...fieldOverrides } = options;
  const entries = Object.entries(fieldOverrides) as [string, unknown][];
  const providedFields = Object.fromEntries(entries.filter(([, value]) => value !== undefined));

  Object.assign(host, providedFields);

  if (state) {
    host.state.set(state);
  }

  await fixture.whenStable();

  return { fixture, host };
};
