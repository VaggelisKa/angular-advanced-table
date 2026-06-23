/* eslint-disable max-lines -- large integration spec */
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  DestroyRef,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  FilterFn,
  PaginationState,
  SortingState,
  VisibilityState
} from '@tanstack/angular-table';
import { vi } from 'vitest';

import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from './cell-interaction';
import { NatTable } from './table';
import { provideNatTableIntl } from './table-intl';
import { NatTableEmptyTemplate, NatTableErrorTemplate, NatTableLoadingTemplate } from './table-state-templates';
import { NatTableService } from './table.service';
import { NAT_TABLE_DATA_STATUS } from './table.types';
import type {
  NatTableAccessibilityText,
  NatTableDataStatus,
  NatTableKeybindings,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableRowActivateEvent,
  NatTableState
} from './table.types';

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
const seedPreviousState = (bound: Partial<NatTableState>, initial: Partial<NatTableState>): NatTableState => ({
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
const emitIfChanged = <K extends keyof NatTableState>(
  prev: NatTableState,
  next: NatTableState,
  slice: K,
  emitter: (value: NatTableState[K]) => void
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
class TestTableSurface {
  // The surface takes a one-way controlled `state` input and emits a separately
  // computed next-state through `stateChange`; a two-way model would feed the
  // emitted value back into the binding and change the controlled-state semantics.
  // eslint-disable-next-line @angular-eslint/prefer-signal-model -- one-way controlled input + computed change output, not two-way
  public readonly state = input<Partial<NatTableState>>({});

  public readonly initialState = input<Partial<NatTableState>>({});
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
  public readonly direction = input<'ltr' | 'rtl'>();

  public readonly stateChange = output<NatTableState>();
  public readonly sortingChange = output<SortingState>();
  public readonly globalFilterChange = output<string>();
  public readonly columnFiltersChange = output<ColumnFiltersState>();
  public readonly columnVisibilityChange = output<VisibilityState>();
  public readonly columnOrderChange = output<ColumnOrderState>();
  public readonly columnPinningChange = output<ColumnPinningState>();
  public readonly columnSizingChange = output<ColumnSizingState>();
  public readonly paginationChange = output<PaginationState>();
  public readonly rowSelectionChange = output<NatTableState['rowSelection']>();

  private readonly natTableService = inject(NatTableService);

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
      this.natTableService.direction.set(this.direction());
    });

    let isFirstChange = true;
    let previousState: NatTableState = {
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
  private emitSliceChanges(prev: NatTableState, next: NatTableState): void {
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

type Row = {
  id: string;
  name: string;
  region: string;
  status: 'Healthy' | 'Pending' | 'Alert';
  throughput: number;
};

const statusFilter: FilterFn<Row> = (row, columnId, filterValue) => {
  const selectedStatuses = (filterValue ?? []) as Row['status'][];

  if (!selectedStatuses.length) {
    return true;
  }

  return selectedStatuses.includes(row.getValue(columnId) as Row['status']);
};

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    size: 180,
    minSize: 120,
    meta: {
      label: 'Service',
      rowHeader: true
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    minSize: 100,
    meta: {
      label: 'Region'
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: {
      label: 'Status'
    },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>()
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: {
      label: 'Throughput',
      align: 'end',
      cellTone: (context) => (context.getValue<number>() >= 4000 ? 'positive' : 'negative')
    },
    cell: (info) => String(info.getValue<number>())
  }
];

const resizableColumns: ColumnDef<Row, unknown>[] = columns.map((column) => ({
  ...column,
  enableResizing: true
}));

const getRowIdValue = (row: Row): string => row.id;

const formatErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : 'Request failed');

const query = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T | null =>
  (f.nativeElement as HTMLElement).querySelector<T>(sel);

const queryRequired = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T => {
  const element = (f.nativeElement as HTMLElement).querySelector<T>(sel);

  if (!element) {
    throw new Error(`Expected to find an element matching "${sel}".`);
  }

  return element;
};

const queryAll = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T[] =>
  Array.from((f.nativeElement as HTMLElement).querySelectorAll<T>(sel));

function buildRows(size: number): Row[] {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][index] ?? `Service ${index + 1}`,
    region: ['us-east-1', 'eu-west-3'][index % 2],
    status: statuses[index % statuses.length],
    throughput: 1000 + index * 1000
  }));
}

function buildDynamicColumns(nameHeader: string): ColumnDef<Row, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: nameHeader,
      size: 180,
      meta: { label: nameHeader, rowHeader: true },
      cell: (info) => info.getValue<string>()
    },
    {
      accessorKey: 'region',
      header: 'Region',
      size: 140,
      meta: { label: 'Region' },
      cell: (info) => info.getValue<string>()
    }
  ];
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
class TableHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly state = signal<Partial<NatTableState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  protected readonly error = signal<unknown>(null);
  public columns: ColumnDef<Row, unknown>[] = columns;
  protected readonly getRowId = getRowIdValue;
  public initialState: Partial<NatTableState> = {
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
  public accessibilityText: NatTableAccessibilityText = {};
  public mode: NatTableMode | NatTableModeConfiguration = 'auto';
  public manualPageCount: number | undefined = undefined;
  public readonly stateEvents: Partial<NatTableState>[] = [];
  public readonly rowActivateEvents: NatTableRowActivateEvent<Row>[] = [];
  public readonly sortingEvents: NatTableState['sorting'][] = [];
  public readonly paginationEvents: NatTableState['pagination'][] = [];
  public readonly globalFilterEvents: NatTableState['globalFilter'][] = [];
  public readonly columnFiltersEvents: NatTableState['columnFilters'][] = [];
  public readonly columnVisibilityEvents: NatTableState['columnVisibility'][] = [];
  public readonly columnOrderEvents: NatTableState['columnOrder'][] = [];
  public readonly columnPinningEvents: NatTableState['columnPinning'][] = [];
  public readonly columnSizingEvents: NatTableState['columnSizing'][] = [];
  public readonly rowSelectionEvents: NatTableState['rowSelection'][] = [];

  protected onStateChange(state: Partial<NatTableState>): void {
    this.stateEvents.push(state);
  }

  protected onSortingChange(sorting: NatTableState['sorting']): void {
    this.sortingEvents.push(sorting);
  }

  protected onPaginationChange(pagination: NatTableState['pagination']): void {
    this.paginationEvents.push(pagination);
  }

  protected onGlobalFilterChange(globalFilter: NatTableState['globalFilter']): void {
    this.globalFilterEvents.push(globalFilter);
  }

  protected onColumnFiltersChange(columnFilters: NatTableState['columnFilters']): void {
    this.columnFiltersEvents.push(columnFilters);
  }

  protected onColumnVisibilityChange(columnVisibility: NatTableState['columnVisibility']): void {
    this.columnVisibilityEvents.push(columnVisibility);
  }

  protected onColumnOrderChange(columnOrder: NatTableState['columnOrder']): void {
    this.columnOrderEvents.push(columnOrder);
  }

  protected onColumnPinningChange(columnPinning: NatTableState['columnPinning']): void {
    this.columnPinningEvents.push(columnPinning);
  }

  protected onColumnSizingChange(columnSizing: NatTableState['columnSizing']): void {
    this.columnSizingEvents.push(columnSizing);
  }

  protected onRowSelectionChange(rowSelection: NatTableState['rowSelection']): void {
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
    <nat-table-surface [accessibilityText]="accessibilityText()">
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Provider table" />
    </nat-table-surface>
  `
})
class ProviderAccessibilityHost {
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
class AccessibleNameHost {
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
class CaptionHost {
  protected readonly rows = signal<Row[]>(buildRows(2));
  protected readonly columns = columns;
}

@Component({
  selector: 'test-state-templates-host',
  imports: [NatTable, TestTableSurface, TestSearch, NatTableLoadingTemplate, NatTableEmptyTemplate, NatTableErrorTemplate],
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
class StateTemplatesHost {
  public readonly rows = signal<Row[]>([]);
  public readonly state = signal<Partial<NatTableState>>({});
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

type NatTableInternals = NatTable<Row> & {
  onHeaderDrop(event: CdkDragDrop<string[]>, headerGroup: ReturnType<NatTable<Row>['table']['getHeaderGroups']>[number]): void;
};

function getInternalTable(fixture: ComponentFixture<TableHost>): NatTableInternals {
  return fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTableInternals;
}

function createDropEvent(columnId: string, previousIndex: number, currentIndex: number): CdkDragDrop<string[]> {
  return {
    previousIndex,
    currentIndex,
    item: { data: columnId }
  } as unknown as CdkDragDrop<string[]>;
}

function getHeaderColumnIds(fixture: ComponentFixture<TableHost>): string[] {
  return queryAll(fixture, 'thead th[data-column-id]').map((header) => header.dataset['columnId'] ?? '');
}

// Derives the size of one axis from its start and (optional) end.
function resolveAxisSize(start: number, size: number | undefined, end: number | undefined): number {
  return size ?? (end ?? start) - start;
}

// Resolves one axis (start/size/end) from any subset of its three values.
function resolveAxis(
  start: number | undefined,
  size: number | undefined,
  end: number | undefined
): { start: number; size: number; end: number } {
  const resolvedStart = start ?? 0;
  const resolvedSize = resolveAxisSize(resolvedStart, size, end);

  return { start: resolvedStart, size: resolvedSize, end: end ?? resolvedStart + resolvedSize };
}

function mockClientRect(element: HTMLElement, rect: Partial<DOMRectReadOnly>): void {
  const horizontal = resolveAxis(rect.left, rect.width, rect.right);
  const vertical = resolveAxis(rect.top, rect.height, rect.bottom);

  element.getBoundingClientRect = (): DOMRect =>
    ({
      x: horizontal.start,
      y: vertical.start,
      left: horizontal.start,
      top: vertical.start,
      right: horizontal.end,
      bottom: vertical.end,
      width: horizontal.size,
      height: vertical.size,
      toJSON: () => ({})
    }) as DOMRect;
}

// Returns the last element of a recorded-events array, throwing if empty. Lets
// assertions read the latest event without optional chaining on `.at(-1)`.
const requireLast = <T>(values: readonly T[]): T => {
  const last = values.at(-1);

  if (last === undefined) {
    throw new Error('Expected at least one recorded event.');
  }

  return last;
};

// Returns the element at an array index, throwing if absent. Lets assertions
// read element properties without optional chaining on each indexed access.
const requireAt = <T>(values: readonly T[], index: number): T => {
  const value = values.at(index);

  if (value === undefined) {
    throw new Error(`Expected an element at index ${index}.`);
  }

  return value;
};

const idSelector = (id: string | undefined): string => `#${id ?? ''}`;

// `#`-prefixed id selectors for a table's first and last aria-describedby targets.
const describedBySelectors = (table: HTMLElement): { first: string; last: string } => {
  const ids = table.getAttribute('aria-describedby')?.split(' ') ?? [];

  return { first: idSelector(ids[0]), last: idSelector(ids.at(-1)) };
};

describe('NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost, ProviderAccessibilityHost, AccessibleNameHost, CaptionHost, StateTemplatesHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  type RecreateHostOptions = {
    enablePagination?: boolean;
    enableMultiSort?: boolean;
    enableRowSelection?: boolean;
    selectionMode?: 'single' | 'multiple';
    stickyHeader?: boolean;
    direction?: 'ltr' | 'rtl';
    columnSizingMode?: 'fill' | 'fixed';
    accessibilityText?: NatTableAccessibilityText;
    initialState?: Partial<NatTableState>;
    state?: Partial<NatTableState>;
    mode?: NatTableMode | NatTableModeConfiguration;
    manualPageCount?: number;
    columns?: ColumnDef<Row, unknown>[];
  };

  async function recreateHost(options: RecreateHostOptions = {}): Promise<void> {
    fixture.destroy();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;

    // `state` drives a signal, the rest are plain fields. Apply only the keys the
    // caller supplied so omitted options keep the host's defaults.
    const { state, ...fieldOverrides } = options;
    const entries = Object.entries(fieldOverrides) as [string, unknown][];
    const providedFields = Object.fromEntries(entries.filter(([, value]) => value !== undefined));

    Object.assign(host, providedFields);

    if (state) {
      host.state.set(state);
    }

    await fixture.whenStable();
  }

  it('renders resize handles only on columns that opt in with enableResizing', async () => {
    // Default columns do not opt in, so no handles render.
    fixture.detectChanges();

    expect(query(fixture, '.column-resize-handle')).toBeNull();

    // Every resizable column declares enableResizing: true on its def.
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();

    expect(queryAll(fixture, '.column-resize-handle')).toHaveLength(4);
  });

  it('renders a handle and allows keyboard resize only on opted-in columns', async () => {
    // Mirror the showcase: opt some columns in, leave others out. Resizing must be
    // strictly per column, not all-or-nothing.
    const mixedColumns: ColumnDef<Row, unknown>[] = columns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'name' ? { ...column, enableResizing: true } : column
    );

    await recreateHost({ columns: mixedColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(query(fixture, 'thead th[data-column-id="name"] .column-resize-handle')).not.toBeNull();
    expect(query(fixture, 'thead th[data-column-id="region"] .column-resize-handle')).toBeNull();
    expect(queryAll(fixture, '.column-resize-handle')).toHaveLength(1);

    // The opted-out column ignores Alt+Arrow keyboard resize.
    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const sizingEventsBefore = host.columnSizingEvents.length;

    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents).toHaveLength(sizingEventsBefore);
  });

  it('resizes a column from the keyboard, updates width, and emits columnSizingChange', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

    const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

    // The resize must drive BOTH body and header widths, or the column never visibly resizes.
    expect(regionCell.style.width).toBe('148px');
    expect(regionHeader.style.width).toBe('148px');

    const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

    expect(liveRegion.textContent.trim()).toBe('Region column width 148 pixels.');
  });

  it('shrinks on first ArrowLeft in LTR without an opposite-direction jump', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();

    // LTR: the resize edge is on the right, so Alt+ArrowLeft must shrink (region 140 → 132),
    // never grow. Guards the first-keystroke direction reversal.
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 132 });
  });

  it('inverts keyboard resize arrows in RTL and clamps to the min bound', async () => {
    await recreateHost({ columns: resizableColumns, direction: 'rtl' });
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();

    // RTL: the resize edge is on the left, so Alt+ArrowLeft grows (region 140 → 148).
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

    // Home jumps to the column's minSize (100).
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 100 });

    // Already at min: ArrowRight (shrink in RTL) clamps to 100 and emits nothing new.
    const eventsAtMin = host.columnSizingEvents.length;

    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents).toHaveLength(eventsAtMin);
  });

  it('resizes the focused header column with Alt+Arrow without focusing the handle', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();
    // Alt+ArrowRight grows the column one step (140 → 148).
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 148 });

    // Alt+ArrowLeft shrinks it back (148 → 140).
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 140 });
  });

  it('does not resize or reorder the focused header on Alt+Shift+Arrow', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const sizingEventsBefore = host.columnSizingEvents.length;
    const orderBefore = getHeaderColumnIds(fixture);

    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        shiftKey: true,
        bubbles: true
      })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Resize needs Alt without Shift; reorder uses Control/Command+Shift. Alt+Shift+Arrow
    // matches neither, so column order and widths are both left untouched.
    expect(getHeaderColumnIds(fixture)).toStrictEqual(orderBefore);
    expect(host.columnSizingEvents).toHaveLength(sizingEventsBefore);
  });

  it('seeds an unsized column from its measured width before the first controlled pointer resize', async () => {
    // An unsized column resolves to TanStack's 150px default for column.getSize(), which
    // getResizeHandler() captures synchronously as the drag start size. Under a controlled
    // columnSizing binding the seed cannot round-trip before that capture, so the transient
    // overlay must expose the measured width or the drag would start from the 150px default.
    const unsizedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, size: undefined } : column
    );

    await recreateHost({
      state: { columnSizing: {} },
      columns: unsizedColumns
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture);

    // jsdom has no layout, so inject a measured width distinct from the 150px default.
    (
      internal as unknown as {
        measuredHeaderWidths: { set(value: Record<string, number>): void };
      }
    ).measuredHeaderWidths.set({ region: 222 });

    const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

    regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    const start = internal.table.getState().columnSizingInfo.columnSizingStart.find(([id]) => id === 'region');

    // Captured start size must be the seeded 222px, not the stale 150px default.
    expect(start?.[1]).toBe(222);

    // End the drag so the document-level pointer listeners detach.
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  it('clamps an out-of-range controlled width so rendered width stays within bounds', async () => {
    // A controlled binding can push columnSizing past the column's bounds (TanStack
    // only clamps in getSize(), not in stored state). Rendered widths must stay within
    // [minSize, maxSize], never the raw controlled value.
    const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
    );
    const regionCell = (): HTMLElement => queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

    await recreateHost({
      columns: boundedColumns,
      state: { columnSizing: { region: 9999 } }
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Above maxSize: clamped to the 200 bound, never the raw 9999.
    expect(regionCell().style.width).toBe('200px');

    // Below minSize: clamped up to the 100 bound.
    host.state.set({ columnSizing: { region: 1 } });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(regionCell().style.width).toBe('100px');
  });

  it('fits resize to the viewport so the table never grows past the visible region', async () => {
    // Fill flex caps a resize to "fit": a column can only grow into the space the
    // other columns can yield (down to their mins), so the table never exceeds the
    // visible region. A generous maxSize makes the fit budget the binding limit.
    const wideColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 1000 } : column
    );
    const regionHeader = (): HTMLTableCellElement => queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const regionCell = (): HTMLElement => queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

    await recreateHost({
      columns: wideColumns
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // jsdom has no layout, so set the region width directly. In fill flex the fit
    // budget is the region minus the OTHER columns' minimums (the space they can
    // yield); column widths come from intrinsic size, so measured headers are unused.
    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
      resolvedColumnWidths(): Record<string, number>;
    };

    internal.regionViewportWidth.set(390);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // End grows region toward maxSize (1000), but fit caps it at the region minus the
    // other columns' mins. status and throughput declare no minSize, so they fall back
    // to the 48px default floor (name 120 + status 48 + throughput 48 = 216): 390 - 216 = 174.
    // The others collapse to their mins so the table fills the region exactly.
    regionHeader().focus();
    regionHeader().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(regionCell().style.width).toBe('174px');
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 174 });

    // The widths still sum to the region: the table fills it exactly, never overflows.
    const widths = internal.resolvedColumnWidths();
    const total = Object.values(widths).reduce((sum, width) => sum + width, 0);

    expect(total).toBe(390);

    // Symptom guard: neighbours without an explicit minSize collapse only to the 48px
    // default floor, never TanStack's 20px — so their resize handles stay grabbable.
    expect(widths['status']).toBe(48);
    expect(widths['throughput']).toBe(48);
  });

  it('floors a keyboard shrink at the default minimum for a column without minSize', async () => {
    // status declares no minSize. Alt+Home jumps to the min bound, which must be the
    // 48px default floor (>= the 24px resize handle), not TanStack's 20px default that
    // would leave the handle wider than the column and effectively ungrabbable.
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');

    statusHeader.focus();
    statusHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ status: 48 });

    const statusCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="status"]');

    expect(statusCell.style.width).toBe('48px');
    expect(statusHeader.style.width).toBe('48px');
  });

  it('clamps the keyboard resize base when fill layout stretches a column past its maxSize', async () => {
    // Cross-column keyboard jump repro: resizing one column in fill layout redistributes
    // slack so a neighbour's measured width stretches past its own maxSize. The resize
    // base must clamp to that bound — otherwise the first keystroke on the neighbour
    // reads the over-max width and "grows" by clamping straight back down to the bound
    // (a backwards jump) while announcing the wrong width.
    const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
    );

    await recreateHost({ columns: boundedColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Simulate fill-layout redistribution stretching region's measured width past maxSize.
    const internal = getInternalTable(fixture) as unknown as {
      measuredHeaderWidths: { set(value: Record<string, number>): void };
    };

    internal.measuredHeaderWidths.set({ region: 272 });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    // Grow on a column already at its max is a no-op, not a down-clamp that jumps backwards.
    const eventsBefore = host.columnSizingEvents.length;

    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents).toHaveLength(eventsBefore);

    // ArrowLeft steps down by exactly one keyboard step from the clamped base (200 → 192).
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 192 });
  });

  it('clamps the resize guide to the fit budget, not just the column maxSize', async () => {
    // The drag guide must stop where the column would fill the region (region minus
    // the other columns' minimums), even when the column's own maxSize is much larger.
    // Every column is sized 100 with min 50 so the fit budget is deterministic.
    const sizedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column ? { ...column, size: 100, minSize: 50, maxSize: column.accessorKey === 'region' ? 1000 : 100 } : column
    );

    await recreateHost({ columns: sizedColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      table: { getState(): { columnSizingInfo: { isResizingColumn: string | false } } };
      columnResizeGuide(): { left: number; offset: number } | null;
      regionViewportWidth: { set(value: number): void };
      visibleColumns(): readonly { id: string }[];
    };
    const otherColumnsWidth = (internal.visibleColumns().length - 1) * 100;

    internal.regionViewportWidth.set(otherColumnsWidth + 250); // region fit budget = 250
    fixture.detectChanges();

    const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

    regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
    expect(internal.table.getState().columnSizingInfo.isResizingColumn).toBe('region');
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 1000 }));

    // Offset clamps to the fit budget: region's max (region 550 - other mins 150 = 400)
    // minus the seeded start width (137) = 263 — not the column's own maxSize (1000).
    // The flex surplus floors per-share (350/4 = 87 each, last absorbs the remainder),
    // so region starts at min 50 + 87 = 137.
    expect(internal.columnResizeGuide()?.offset).toBe(263);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 1000 }));
  });

  it('keeps the table filled in fill flex by reflowing the other columns on resize', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
      resolvedColumnWidths(): Record<string, number>;
    };

    internal.regionViewportWidth.set(600);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const widthsBefore = internal.resolvedColumnWidths();
    const total = (widths: Record<string, number>): number => Object.values(widths).reduce((sum, width) => sum + width, 0);

    // Flex distribution fills the region exactly before any resize.
    expect(total(widthsBefore)).toBe(600);

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // The resized column grows by exactly one step while the others absorb the delta,
    // so the table still fills the region — no jump, no overflow.
    const widthsAfter = internal.resolvedColumnWidths();

    expect(widthsAfter['region']).toBe(widthsBefore['region'] + 8);
    expect(total(widthsAfter)).toBe(600);
  });

  it('announces the final width once an actual pointer resize drag ends', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');
    const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');
    const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');

    regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Pointer-down alone must not announce — no per-frame chatter while dragging.
    expect(liveRegion.textContent.trim()).toBe('');

    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 132 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 132 }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // The announced width must match the committed and rendered width (not a stale
    // pre-drag width), even though the showcase binds columnSizing controlled.
    const announcedWidth = host.columnSizingEvents.at(-1)?.['region'];

    expect(announcedWidth).toBeDefined();
    expect(regionCell.style.width).toBe(`${announcedWidth}px`);
    expect(liveRegion.textContent.trim()).toBe(`Region column width ${announcedWidth} pixels.`);
  });

  it('forwards the resolved text direction to TanStack column resizing', async () => {
    // TanStack mirrors the pointer-drag delta only when columnResizeDirection is 'rtl';
    // leaving it unset inverts resize in RTL (the width grows when it should shrink).
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInternalTable(fixture).table.options.columnResizeDirection).toBe('ltr');

    await recreateHost({ columns: resizableColumns, direction: 'rtl' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getInternalTable(fixture).table.options.columnResizeDirection).toBe('rtl');
  });

  it('uses an authoritative fixed table layout when columnSizingMode is "fixed"', async () => {
    await recreateHost({ columns: resizableColumns, columnSizingMode: 'fixed' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = queryRequired<HTMLElement>(fixture, 'table.data-table');

    expect(table.classList.contains('is-fixed-layout')).toBe(true);

    // A <colgroup> drives column widths so the layout is exact, not stretched.
    const cols = Array.from(table.querySelectorAll('colgroup col')) as HTMLElement[];
    const headers = queryAll(fixture, 'thead th[data-column-id]');

    expect(cols).toHaveLength(headers.length);

    const colWidths = cols.map((col) => Number.parseInt(col.style.width, 10));

    expect(colWidths.every((width) => width > 0)).toBe(true);

    // The table is exactly as wide as the sum of its columns (so the region scrolls).
    const total = colWidths.reduce((sum, width) => sum + width, 0);

    expect(Number.parseInt(table.style.width, 10)).toBe(total);
  });

  it('lets a fixed-mode resize grow past the viewport instead of capping at the fit budget', async () => {
    // Fixed (authoritative) layout is designed to grow and scroll: the viewport "fit"
    // cap that fill mode applies must NOT bind here. A generous maxSize on region makes
    // Alt+End reach the column's own max, well past the fill-mode fit budget (174).
    const wideColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 1000 } : column
    );

    await recreateHost({ columns: wideColumns, columnSizingMode: 'fixed' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Same viewport as the fill-mode fit test, where End capped region at 174.
    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
    };

    internal.regionViewportWidth.set(390);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Fixed mode ignores the fit cap, so region reaches its own maxSize (1000), far past
    // the 174 the fill-mode cap would have allowed — the table grows and scrolls.
    const emittedWidth = host.columnSizingEvents.at(-1)?.['region'];

    expect(emittedWidth).toBe(1000);

    if (emittedWidth === undefined) {
      throw new Error('Expected an emitted width.');
    }

    expect(emittedWidth).toBeGreaterThan(174);
  });

  it('resets a column width in fixed mode even after a stale measured width was recorded', async () => {
    // Regression: "Reset Widths" clears columnSizing to {} but does nothing in fixed mode.
    // Root cause: resolvedColumnWidths fell back to measuredHeaderWidths, which the
    // ResizeObserver re-confirms each frame from the colgroup — so the column was pinned
    // to its pre-reset colgroup width. The fix gates the measured fallback on
    // !usesAuthoritativeLayout(), falling through to the def size instead.
    await recreateHost({ columns: resizableColumns, columnSizingMode: 'fixed' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      measuredHeaderWidths: { set(v: Record<string, number>): void };
      resolvedColumnWidths(): Record<string, number>;
    };

    // Inject a stale measured width (300px) that differs from the region column's def size (140).
    // This simulates the state after a resize: the ResizeObserver captured the colgroup-forced
    // width. With the bug the reset below would leave region at 300; with the fix it returns
    // to the def size because the measured fallback is skipped in authoritative layout.
    internal.measuredHeaderWidths.set({ region: 300 });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // columnSizing is empty — region was never resized, so no entry exists.
    // resolvedColumnWidths must resolve to the column's def size (140), not the stale 300.
    // resizableColumns['region'] has size: 140 (confirmed from the fixture column defs above).
    const widths = internal.resolvedColumnWidths();

    expect(widths['region']).toBe(140);
    expect(widths['region']).not.toBe(300);
  });

  it('announces the minimum bound on a keyboard shrink at the min without emitting a sizing change', async () => {
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

    // Alt+Home jumps region to its minSize (100).
    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 100 });

    // At the min, Alt+ArrowLeft (shrink in LTR) keeps the width and emits nothing new,
    // but the live region still announces the bound so a SR user learns the range.
    const eventsAtMin = host.columnSizingEvents.length;

    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents).toHaveLength(eventsAtMin);
    expect(liveRegion.textContent.trim()).toBe('Region column width 100 pixels (minimum).');
  });

  it('announces the maximum bound on a keyboard grow at the max without emitting a sizing change', async () => {
    // region declares no maxSize, so the fill-mode fit budget is the binding max.
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
    };

    internal.regionViewportWidth.set(390);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const liveRegion = queryRequired<HTMLElement>(fixture, '[aria-live="polite"]');

    // Alt+End jumps region to the fit-budget max (390 - other mins 216 = 174).
    regionHeader.focus();
    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toStrictEqual({ region: 174 });

    // At the max, Alt+ArrowRight (grow in LTR) keeps the width and emits nothing new,
    // but the live region announces the maximum so a SR user learns the range.
    const eventsAtMax = host.columnSizingEvents.length;

    regionHeader.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents).toHaveLength(eventsAtMax);
    expect(liveRegion.textContent.trim()).toBe('Region column width 174 pixels (maximum).');
  });

  it('caps a fill-flex column at its maxSize and never renders it wider', async () => {
    // A small maxSize on a non-resized flex column must clamp its distributed share:
    // even when its intrinsic-weight share is larger, it never renders past the cap.
    const cappedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'status' ? { ...column, maxSize: 90 } : column
    );

    await recreateHost({ columns: cappedColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
      resolvedColumnWidths(): Record<string, number>;
    };

    // A wide region hands every flex column a generous surplus share; without the cap
    // status would stretch well past 90.
    internal.regionViewportWidth.set(900);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(internal.resolvedColumnWidths()['status']).toBe(90);
  });

  it('distributes the fill-flex surplus so the widths sum to the region exactly', async () => {
    // With four flex columns the per-share rounding can drift; the surplus must split so
    // the resolved widths sum to the region precisely — no 1–2px overflow.
    await recreateHost({ columns: resizableColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as unknown as {
      regionViewportWidth: { set(value: number): void };
      resolvedColumnWidths(): Record<string, number>;
      visibleColumns(): readonly { id: string }[];
    };

    // An odd region width forces non-integer per-share splits, exercising the rounding.
    internal.regionViewportWidth.set(917);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(internal.visibleColumns()).toHaveLength(4);
    const widths = internal.resolvedColumnWidths();
    const total = Object.values(widths).reduce((sum, width) => sum + width, 0);

    expect(total).toBe(917);
  });

  it('clamps the resize guide to the column bounds instead of overshooting the cursor', async () => {
    const boundedColumns: ColumnDef<Row, unknown>[] = resizableColumns.map((column) =>
      'accessorKey' in column && column.accessorKey === 'region' ? { ...column, maxSize: 200 } : column
    );

    await recreateHost({ columns: boundedColumns });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const internal = getInternalTable(fixture) as NatTableInternals & {
      columnResizeGuide(): { left: number; offset: number } | null;
    };
    const regionHandle = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"] .column-resize-handle');

    // Begin the drag at region's start width (140), then drag far past maxSize (200).
    regionHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0 }));
    expect(internal.table.getState().columnSizingInfo.isResizingColumn).toBe('region');
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 1000 }));
    expect(internal.table.getState().columnSizingInfo.deltaOffset).toBe(1000);

    const guide = internal.columnResizeGuide();

    expect(guide).not.toBeNull();
    // Offset clamps to (maxSize 200 - startSize 140) = 60px, not the raw 1000px drag.
    expect(guide?.offset).toBe(60);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 1000 }));
  });

  it('renders a bare table surface with no built-in controls', () => {
    fixture.detectChanges();

    const rows = queryAll(fixture, 'tbody tr');
    const headers = queryAll<HTMLElement>(fixture, 'thead th');
    const headerLabels = headers.map((header) => header.textContent.replaceAll(/\s+/g, ' ').trim());

    expect(rows).toHaveLength(6);
    expect(headerLabels).toStrictEqual(['Service', 'Region', 'Status', 'Throughput']);
    expect(query(fixture, 'tbody tr')?.textContent).toContain('Zeta');
    expect(query(fixture, '#table-search')).toBeNull();
    expect(query(fixture, '.column-chip')).toBeNull();
    expect(query(fixture, '.pager')).toBeNull();
    expect(query(fixture, '.sort-button')).toBeNull();
    expect(query(fixture, '.pin-button')).toBeNull();
  });

  it('visually hides primitive header labels while keeping accessible text', async () => {
    @Component({
      selector: 'test-hidden-header-label-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class HiddenHeaderLabelHost {
      protected readonly rows = signal<Row[]>(buildRows(1));
      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Menu',
          meta: {
            hiddenHeaderLabel: 'Row actions'
          },
          cell: (info) => info.getValue<string>()
        }
      ];
    }

    const hiddenHeaderFixture = TestBed.createComponent(HiddenHeaderLabelHost);

    await hiddenHeaderFixture.whenStable();
    hiddenHeaderFixture.detectChanges();

    const header = queryRequired<HTMLElement>(hiddenHeaderFixture, 'thead th[data-column-id="name"]');
    const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

    expect(hiddenLabel.textContent.trim()).toBe('Row actions');
    expect(header.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');
    expect(header.textContent).not.toContain('Menu');

    hiddenHeaderFixture.destroy();
  });

  it('renders hidden header labels for non-primitive headers', async () => {
    @Component({
      selector: 'test-non-primitive-hidden-header-label-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class NonPrimitiveHiddenHeaderLabelHost {
      protected readonly rows = signal<Row[]>(buildRows(1));
      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: () => '',
          meta: {
            hiddenHeaderLabel: 'Row actions'
          },
          cell: (info) => info.getValue<string>()
        }
      ];
    }

    const hiddenHeaderFixture = TestBed.createComponent(NonPrimitiveHiddenHeaderLabelHost);

    await hiddenHeaderFixture.whenStable();
    hiddenHeaderFixture.detectChanges();

    const header = queryRequired<HTMLElement>(hiddenHeaderFixture, 'thead th[data-column-id="name"]');
    const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

    expect(hiddenLabel.textContent.trim()).toBe('Row actions');
    expect(header.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');

    hiddenHeaderFixture.destroy();
  });

  it('applies semantic tone attributes from column metadata', () => {
    fixture.detectChanges();

    const throughputCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child td[data-column-id="throughput"]');

    expect(throughputCell.getAttribute('data-tone')).toBe('positive');
  });

  it('describes the current view and exposes the row header column to assistive technology', () => {
    fixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(fixture, 'table');
    const describedBy = table.getAttribute('aria-describedby');
    const summary = queryRequired<HTMLElement>(fixture, `#${describedBy?.split(' ').at(0) ?? ''}`);
    const rowHeaderCell = queryRequired<HTMLTableCellElement>(fixture, 'tbody tr:first-child th[scope="row"]');

    expect(describedBy).toContain('nat-table-');
    expect(summary.textContent).toContain('Showing 6 rows across 4 visible columns.');
    expect(rowHeaderCell.getAttribute('role')).toBe('rowheader');
    expect(rowHeaderCell.getAttribute('data-column-id')).toBe('name');
  });

  it('omits aria-describedby when all hidden descriptions are suppressed', async () => {
    await recreateHost({
      accessibilityText: {
        keyboardInstructions: '',
        reorderKeyboardInstructions: '',
        tableSummary: () => ''
      }
    });
    fixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(fixture, 'table');

    expect(table.getAttribute('aria-describedby')).toBeNull();
    expect(query(fixture, 'p[id$="-summary"]')).toBeNull();
    expect(query(fixture, 'p[id$="-instructions"]')).toBeNull();
  });

  it('accepts accessibleName as the preferred grid name input', () => {
    const nameFixture = TestBed.createComponent(AccessibleNameHost);

    nameFixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(nameFixture, 'table');

    expect(table.getAttribute('aria-label')).toBe('Latency table');
    expect(table.getAttribute('aria-labelledby')).toBeNull();

    nameFixture.destroy();
  });

  it('renders caption as a semantic table label when provided', () => {
    const captionFixture = TestBed.createComponent(CaptionHost);

    captionFixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(captionFixture, 'table');
    const caption = queryRequired<HTMLTableCaptionElement>(captionFixture, 'caption');

    expect(caption.textContent.trim()).toBe('Visible operations');
    expect(table.getAttribute('aria-label')).toBeNull();
    expect(table.getAttribute('aria-labelledby')).toBe(caption.id);

    captionFixture.destroy();
  });

  it('only applies aria-sort to the actively sorted header', () => {
    fixture.detectChanges();

    const sortedHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="throughput"]');
    const unsortedHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="name"]');

    expect(sortedHeader.getAttribute('aria-sort')).toBe('descending');
    expect(unsortedHeader.getAttribute('aria-sort')).toBeNull();
  });

  it('only paginates when enablePagination is true', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const rows = queryAll(fixture, 'tbody tr');

    expect(rows).toHaveLength(2);
    expect(query(fixture, 'tbody tr')?.textContent).toContain('Zeta');
  });

  it('renders reorder handles on headers by default', () => {
    fixture.detectChanges();

    expect(queryAll(fixture, '.header-cell.is-reorderable')).toHaveLength(3);
  });

  it('lets callers patch state and emits the next state', () => {
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    table.patchState({
      globalFilter: 'gamma',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0
      })
    });
    fixture.detectChanges();

    const lastState = requireLast(host.stateEvents);

    expect(lastState.globalFilter).toBe('gamma');
    expect(lastState.pagination?.pageIndex).toBe(0);
    expect(host.globalFilterEvents.at(-1)).toBe('gamma');
    expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
    expect(query(fixture, 'tbody tr')?.textContent).toContain('Gamma');
  });

  it('only emits granular slice outputs when the corresponding slice actually changed', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    host.sortingEvents.length = 0;
    host.paginationEvents.length = 0;
    host.globalFilterEvents.length = 0;
    host.columnFiltersEvents.length = 0;
    host.columnVisibilityEvents.length = 0;
    host.columnOrderEvents.length = 0;
    host.columnPinningEvents.length = 0;

    table.patchState({ sorting: [{ id: 'name', desc: false }] });
    fixture.detectChanges();

    expect(host.sortingEvents).toStrictEqual([[{ id: 'name', desc: false }]]);
    expect(host.globalFilterEvents).toStrictEqual([]);
    expect(host.paginationEvents).toStrictEqual([]);
    expect(host.columnFiltersEvents).toStrictEqual([]);
    expect(host.columnVisibilityEvents).toStrictEqual([]);
    expect(host.columnOrderEvents).toStrictEqual([]);
    expect(host.columnPinningEvents).toStrictEqual([]);

    table.patchState({ sorting: [{ id: 'name', desc: false }] });
    fixture.detectChanges();

    expect(host.sortingEvents).toHaveLength(1);

    table.patchState({ globalFilter: 'gamma' });
    fixture.detectChanges();

    expect(host.globalFilterEvents).toStrictEqual(['gamma']);
    expect(host.sortingEvents).toHaveLength(1);
    expect(host.columnVisibilityEvents).toStrictEqual([]);
  });

  it('resets the page index and emits both globalFilterChange and paginationChange when the underlying TanStack filter changes', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    table.patchState({
      pagination: (currentPagination) => ({ ...currentPagination, pageIndex: 1 })
    });
    fixture.detectChanges();

    host.paginationEvents.length = 0;
    host.globalFilterEvents.length = 0;

    table.table.setGlobalFilter('gamma');
    fixture.detectChanges();

    expect(host.globalFilterEvents).toStrictEqual(['gamma']);
    expect(host.paginationEvents.at(-1)?.pageIndex).toBe(0);
  });

  it('reorders visible center columns and emits the next column order when uncontrolled', async () => {
    await recreateHost();
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    if (!leafHeaderGroup) {
      throw new Error('Expected a leaf header group.');
    }

    table.onHeaderDrop(createDropEvent('region', 1, 2), leafHeaderGroup);
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
    expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'status', 'region', 'throughput']);
  });

  it('matches the stable row id during global filtering without requiring an id column', () => {
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    table.patchState({
      globalFilter: 'svc-00003',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0
      })
    });
    fixture.detectChanges();

    expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
    expect(query(fixture, 'tbody tr')?.textContent).toContain('Gamma');
  });

  it('respects controlled state slices without mutating the rendered table', () => {
    host.state.set({
      columnVisibility: {
        region: false
      }
    });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    expect(query(fixture, 'thead')?.textContent).not.toContain('Region');

    table.patchState({
      columnVisibility: (currentVisibility) => ({
        ...currentVisibility,
        region: true
      })
    });
    fixture.detectChanges();

    expect(query(fixture, 'thead')?.textContent).not.toContain('Region');
    expect(host.stateEvents.length).toBeGreaterThan(0);
  });

  it('lets callers override accessibility summaries and live announcements', async () => {
    const accessibilityText: NatTableAccessibilityText = {
      reorderKeyboardInstructions: 'Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.',
      tableSummary: ({ visibleRowsText, totalRowsText, visibleColumnsText, pageText, pageCountText }) =>
        `Oversigt ${visibleRowsText}/${totalRowsText}/${visibleColumnsText}/${pageText}/${pageCountText}`,
      filteringChange: ({ query: searchQuery, visibleRowsText }) => `Filter ${searchQuery}:${visibleRowsText}`,
      sortingChange: ({ columnLabel, sortState }) => `Sortering ${columnLabel}:${sortState}`,
      pageChange: ({ pageText, pageCountText, visibleRowsText }) => `Side ${pageText}/${pageCountText}:${visibleRowsText}`
    };

    await recreateHost({
      enablePagination: true,
      accessibilityText
    });
    fixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(fixture, 'table');
    const describedBy = describedBySelectors(table);
    const summary = queryRequired<HTMLElement>(fixture, describedBy.first);
    const instructions = queryRequired<HTMLElement>(fixture, describedBy.last);
    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');
    const tableComponent = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    expect(summary.textContent.trim()).toBe('Oversigt 2/6/4/1/3');
    expect(instructions.textContent).toContain('Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.');

    tableComponent.table.nextPage();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent.trim()).toBe('Side 2/3:2');

    tableComponent.patchState({
      globalFilter: 'gamma',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0
      })
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent.trim()).toBe('Filter gamma:1');

    tableComponent.patchState({
      sorting: [{ id: 'name', desc: false }]
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent.trim()).toBe('Sortering Service:ascending');
  });

  it('uses provider accessibility defaults and lets table inputs override them', () => {
    const providerFixture = TestBed.createComponent(ProviderAccessibilityHost);
    const providerHost = providerFixture.componentInstance;

    providerFixture.detectChanges();

    let summary = queryRequired<HTMLElement>(providerFixture, 'p[id$="-summary"]');
    let emptyState = queryRequired<HTMLElement>(providerFixture, '.empty-state');
    let instructions = queryRequired<HTMLElement>(providerFixture, 'p[id$="-instructions"]');

    expect(summary.textContent.trim()).toBe('Provider summary n0/n0');
    expect(emptyState.textContent.trim()).toBe('Provider empty state');
    expect(instructions.textContent.trim()).toBe(
      'Provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
    );

    providerHost.accessibilityText.set({
      emptyState: 'Input empty state',
      tableSummary: ({ visibleRowsText }) => `Input summary ${visibleRowsText}`
    });
    providerFixture.detectChanges();

    summary = queryRequired<HTMLElement>(providerFixture, 'p[id$="-summary"]');
    emptyState = queryRequired<HTMLElement>(providerFixture, '.empty-state');
    instructions = queryRequired<HTMLElement>(providerFixture, 'p[id$="-instructions"]');

    expect(summary.textContent.trim()).toBe('Input summary n0');
    expect(emptyState.textContent.trim()).toBe('Input empty state');
    expect(instructions.textContent.trim()).toBe(
      'Provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.'
    );
  });

  it('renders built-in loading and error rows as spanning table body cells', async () => {
    host.rows.set([]);
    host.accessibilityText = {
      loadingState: 'Loading operations.',
      errorState: 'Operations failed.'
    };
    host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    fixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(fixture, 'table');
    const loadingCell = queryRequired<HTMLTableCellElement>(fixture, '.loading-state');

    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
    expect(loadingCell.colSpan).toBe(4);
    expect(loadingCell.textContent.trim()).toBe('Loading operations.');

    host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorCell = queryRequired<HTMLTableCellElement>(fixture, '.error-state');
    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

    expect(table.getAttribute('aria-busy')).toBeNull();
    expect(queryAll(fixture, 'tbody tr')).toHaveLength(1);
    expect(errorCell.colSpan).toBe(4);
    expect(errorCell.textContent.trim()).toBe('Operations failed.');
    expect(liveRegion.textContent.trim()).toBe('Operations failed.');
  });

  it('keeps existing rows visible during background loading while exposing aria-busy', () => {
    fixture.detectChanges();

    host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    fixture.detectChanges();

    const table = queryRequired<HTMLTableElement>(fixture, 'table');

    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(query(fixture, '.loading-state')).toBeNull();
    expect(queryAll(fixture, 'tbody tr')).toHaveLength(6);
  });

  it('reports rendered row counts when an error state hides cached rows', async () => {
    const stateFixture = TestBed.createComponent(StateTemplatesHost);
    const stateHost = stateFixture.componentInstance;

    stateHost.rows.set(buildRows(6));
    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
    stateHost.error.set(new Error('Cached refresh failed'));
    stateFixture.detectChanges();
    await stateFixture.whenStable();
    stateFixture.detectChanges();

    const summary = queryRequired<HTMLElement>(stateFixture, 'p[id$="-summary"]');
    const errorCell = queryRequired<HTMLElement>(stateFixture, '.error-state');
    const errorButton = errorCell.querySelector('.custom-error') as HTMLButtonElement;

    expect(queryAll(stateFixture, 'tbody tr')).toHaveLength(1);
    expect(queryAll(stateFixture, 'tbody tr.data-row')).toHaveLength(0);
    expect(summary.textContent.trim()).toBe('No rows are currently shown. 4 visible columns.');
    expect(errorButton.dataset['rowCounts']).toBe('0/0');

    stateFixture.destroy();
  });

  it('renders caller-provided state templates with table state context', async () => {
    const stateFixture = TestBed.createComponent(StateTemplatesHost);
    const stateHost = stateFixture.componentInstance;

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    stateFixture.detectChanges();

    let stateCell = queryRequired<HTMLElement>(stateFixture, '.loading-state');

    expect(stateCell.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('loading 0');

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.success);
    stateHost.state.set({ globalFilter: 'missing' });
    stateFixture.detectChanges();
    await stateFixture.whenStable();
    stateFixture.detectChanges();

    stateCell = queryRequired<HTMLElement>(stateFixture, '.empty-state');

    expect(stateCell.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Filtered empty 4');

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
    stateHost.error.set(new Error('API unavailable'));
    stateFixture.detectChanges();
    await stateFixture.whenStable();
    stateFixture.detectChanges();

    stateCell = queryRequired<HTMLElement>(stateFixture, '.error-state');
    const errorButton = stateCell.querySelector('.custom-error') as HTMLButtonElement;

    expect(stateCell.textContent.trim()).toBe('API unavailable');
    expect(errorButton.textContent).toContain('API unavailable');
    expect(errorButton.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
    expect(errorButton.tabIndex).toBe(-1);

    stateCell.focus();
    stateCell.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      })
    );
    stateFixture.detectChanges();

    expect(document.activeElement).toBe(errorButton);

    stateFixture.destroy();
  });

  it('keeps controlled columnOrder external while still emitting the requested next state', async () => {
    await recreateHost({
      state: {
        columnOrder: ['throughput', 'name', 'region', 'status']
      }
    });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTable<Row>;

    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'region', 'status']);

    table.patchState({
      columnOrder: ['name', 'region', 'status', 'throughput']
    });
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'region', 'status']);
    expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'region', 'status', 'throughput']);
  });

  it('keeps hidden columns in their stored order when they are shown again', async () => {
    await recreateHost();
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    table.patchState({
      columnVisibility: {
        status: false
      }
    });
    fixture.detectChanges();

    const updatedLeafHeaderGroup = table.table.getHeaderGroups().at(-1);

    if (!updatedLeafHeaderGroup) {
      throw new Error('Expected a leaf header group.');
    }

    table.onHeaderDrop(createDropEvent('throughput', 2, 1), updatedLeafHeaderGroup);
    fixture.detectChanges();

    table.patchState({
      columnVisibility: {
        status: true
      }
    });
    fixture.detectChanges();

    expect(host.stateEvents.at(-1)?.columnOrder).toStrictEqual(['name', 'throughput', 'status', 'region']);
    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'throughput', 'status', 'region']);
  });

  it('reorders pinned left and right columns within their own zones', async () => {
    await recreateHost({
      initialState: {
        ...host.initialState,
        columnPinning: {
          left: ['name', 'region'],
          right: ['status', 'throughput']
        }
      }
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    if (!leafHeaderGroup) {
      throw new Error('Expected a leaf header group.');
    }

    table.onHeaderDrop(createDropEvent('name', 0, 1), leafHeaderGroup);
    fixture.detectChanges();
    table.onHeaderDrop(createDropEvent('status', 2, 3), leafHeaderGroup);
    fixture.detectChanges();

    expect(host.stateEvents.at(-1)?.columnPinning).toStrictEqual({
      left: ['region', 'name'],
      right: ['throughput', 'status']
    });
    expect(getHeaderColumnIds(fixture)).toStrictEqual(['region', 'name', 'throughput', 'status']);
  });

  it('ignores attempted cross-zone drops', async () => {
    await recreateHost({
      initialState: {
        ...host.initialState,
        columnPinning: {
          left: ['name'],
          right: []
        }
      }
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    if (!leafHeaderGroup) {
      throw new Error('Expected a leaf header group.');
    }

    host.stateEvents.length = 0;

    table.onHeaderDrop(createDropEvent('region', 1, 0), leafHeaderGroup);
    fixture.detectChanges();

    expect(host.stateEvents).toHaveLength(0);
    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
  });

  it('renders TanStack size hints and uses them for initial pin offsets', () => {
    host.state.set({
      columnPinning: {
        left: ['name', 'region'],
        right: []
      }
    });
    fixture.detectChanges();

    const headers = queryAll<HTMLElement>(fixture, 'thead th');
    const bodyCells = queryAll<HTMLElement>(fixture, 'tbody tr:first-child th, tbody tr:first-child td');
    const firstHeader = requireAt(headers, 0);
    const secondHeader = requireAt(headers, 1);
    const firstBodyCell = requireAt(bodyCells, 0);
    const secondBodyCell = requireAt(bodyCells, 1);

    expect(query(fixture, 'colgroup')).toBeNull();
    expect(firstHeader.style.width).toBe('');
    expect(firstHeader.style.minWidth).toBe('');
    expect(firstHeader.style.maxWidth).toBe('');
    expect(secondHeader.style.width).toBe('');
    expect(secondHeader.style.minWidth).toBe('');
    expect(secondHeader.style.maxWidth).toBe('');
    expect(firstBodyCell.style.width).toBe('180px');
    expect(firstBodyCell.style.minWidth).toBe('120px');
    expect(firstHeader.style.left).toBe('0px');
    expect(secondHeader.style.left).toBe('180px');
    expect(secondBodyCell.style.left).toBe('180px');
    expect(firstHeader.dataset['columnId']).toBe('name');
  });

  it('applies optional header sizing from column meta without affecting body cells', async () => {
    @Component({
      selector: 'test-header-sizing-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class HeaderSizingHost {
      protected readonly rows = signal<Row[]>([
        {
          id: 'svc-header',
          name: 'Service',
          region: 'eu-central-1',
          status: 'Healthy',
          throughput: 1000
        }
      ]);

      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          size: 96,
          minSize: 80,
          meta: {
            label: 'Service',
            rowHeader: true,
            headerSize: 140,
            headerMinSize: 120
          },
          cell: (info) => info.getValue<string>()
        }
      ];
    }

    const headerFixture = TestBed.createComponent(HeaderSizingHost);

    await headerFixture.whenStable();
    headerFixture.detectChanges();

    const header = queryRequired<HTMLElement>(headerFixture, 'thead th[data-column-id="name"]');
    const bodyCell = queryRequired<HTMLElement>(headerFixture, 'tbody th[data-column-id="name"]');

    expect(header.style.width).toBe('140px');
    expect(header.style.minWidth).toBe('120px');
    expect(header.style.maxWidth).toBe('140px');
    expect(header.classList.contains('is-width-constrained')).toBe(true);
    expect(bodyCell.style.width).toBe('96px');
    expect(bodyCell.style.minWidth).toBe('80px');
    expect(bodyCell.style.maxWidth).toBe('96px');
  });

  it('applies fixed, maximum, and intrinsic column sizing from TanStack column definitions', async () => {
    @Component({
      selector: 'test-column-width-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface [initialState]="initialState">
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class ColumnWidthHost {
      protected readonly rows = signal<Row[]>([
        {
          id: 'svc-width',
          name: 'Very long service name that should be truncated',
          region: 'eu-central-1 with extra routing detail',
          status: 'Healthy',
          throughput: 1000
        }
      ]);

      protected readonly initialState: Partial<NatTableState> = {
        columnPinning: {
          left: ['name', 'region', 'status'],
          right: []
        }
      };

      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          size: 96,
          minSize: 80,
          enablePinning: true,
          meta: { label: 'Service', rowHeader: true },
          cell: (info) => info.getValue<string>()
        },
        {
          accessorKey: 'region',
          header: 'Region',
          maxSize: 192,
          enablePinning: true,
          meta: { label: 'Region' },
          cell: (info) => info.getValue<string>()
        },
        {
          accessorKey: 'status',
          header: 'Status',
          enablePinning: true,
          meta: { label: 'Status' },
          cell: (info) => info.getValue<string>()
        }
      ];
    }

    const widthFixture = TestBed.createComponent(ColumnWidthHost);

    await widthFixture.whenStable();
    widthFixture.detectChanges();

    const fixedHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="name"]');
    const cappedHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="region"]');
    const fixedCell = queryRequired<HTMLElement>(widthFixture, 'tbody th[data-column-id="name"]');
    const cappedCell = queryRequired<HTMLElement>(widthFixture, 'tbody td[data-column-id="region"]');
    const intrinsicHeader = queryRequired<HTMLElement>(widthFixture, 'thead th[data-column-id="status"]');
    const intrinsicCell = queryRequired<HTMLElement>(widthFixture, 'tbody td[data-column-id="status"]');

    expect(fixedHeader.style.width).toBe('');
    expect(fixedHeader.style.minWidth).toBe('');
    expect(fixedHeader.style.maxWidth).toBe('');
    expect(fixedHeader.classList.contains('is-width-constrained')).toBe(false);
    expect(cappedHeader.style.left).toBe('96px');
    expect(fixedCell.style.width).toBe('96px');
    expect(fixedCell.style.minWidth).toBe('80px');
    expect(fixedCell.style.maxWidth).toBe('96px');
    expect(fixedCell.classList.contains('is-width-constrained')).toBe(true);
    expect(fixedCell.querySelector('.data-cell-content')).toBeTruthy();
    expect(cappedHeader.style.width).toBe('');
    expect(cappedHeader.style.minWidth).toBe('');
    expect(cappedHeader.style.maxWidth).toBe('');
    expect(cappedHeader.classList.contains('is-width-constrained')).toBe(false);
    expect(cappedCell.style.maxWidth).toBe('192px');
    expect(cappedCell.classList.contains('is-width-constrained')).toBe(true);
    expect(intrinsicHeader.style.width).toBe('');
    expect(intrinsicHeader.style.minWidth).toBe('');
    expect(intrinsicHeader.style.maxWidth).toBe('');
    expect(intrinsicCell.classList.contains('is-width-constrained')).toBe(false);
  });

  it('clamps body cell content to two lines by default and applies column cell height metadata', async () => {
    @Component({
      selector: 'test-cell-height-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class CellHeightHost {
      protected readonly rows = signal<Row[]>([
        {
          id: 'svc-cell-height',
          name: 'Very long service name that should wrap onto multiple visible lines',
          region: 'eu-central-1 with additional routing detail',
          status: 'Healthy',
          throughput: 1000
        }
      ]);

      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          meta: {
            label: 'Service',
            rowHeader: true,
            cellHeight: 72,
            cellMaxLines: 3
          },
          cell: (info) => info.getValue<string>()
        },
        {
          accessorKey: 'region',
          header: 'Region',
          meta: {
            label: 'Region',
            cellMaxLines: Infinity
          },
          cell: (info) => info.getValue<string>()
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { label: 'Status' },
          cell: (info) => info.getValue<string>()
        },
        {
          accessorKey: 'throughput',
          header: 'Throughput',
          meta: {
            label: 'Throughput',
            cellMaxLines: 0
          },
          cell: (info) => `${info.getValue<number>()} req/s`
        }
      ];
    }

    const cellHeightFixture = TestBed.createComponent(CellHeightHost);

    await cellHeightFixture.whenStable();
    cellHeightFixture.detectChanges();

    const serviceCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody th[data-column-id="name"]');
    const regionCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="region"]');
    const statusCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="status"]');
    const throughputCell = queryRequired<HTMLElement>(cellHeightFixture, 'tbody td[data-column-id="throughput"]');

    expect(serviceCell.style.height).toBe('72px');
    expect(serviceCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('3');
    expect(serviceCell.classList.contains('is-cell-clamped')).toBe(true);
    expect(regionCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('');
    expect(regionCell.classList.contains('is-cell-clamped')).toBe(false);
    expect(statusCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
    expect(statusCell.classList.contains('is-cell-clamped')).toBe(true);
    expect(throughputCell.style.getPropertyValue('--nat-table-cell-max-lines')).toBe('2');
    expect(throughputCell.classList.contains('is-cell-clamped')).toBe(true);
  });

  it('reorders columns with Ctrl+Shift+Arrow from the keyboard and announces the move', async () => {
    await recreateHost();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
    expect(liveRegion.textContent.trim()).toBe('Moved Region column to position 2 of 3 in the unpinned region.');
  });

  it('reorders columns with Command+Shift+Arrow from the keyboard', async () => {
    const originalPlatform = navigator.platform;
    const originalUserAgent = navigator.userAgent;

    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
      configurable: true
    });
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      writable: true,
      configurable: true
    });

    try {
      await recreateHost();
      fixture.detectChanges();

      const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');

      regionHeader.focus();
      regionHeader.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          metaKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        })
      );
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
    } finally {
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        configurable: true
      });
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    }
  });

  it('scrolls the reordered header into view when keyboard moving right past the viewport edge', async () => {
    await recreateHost();
    fixture.detectChanges();

    const tableRegion = queryRequired<HTMLElement>(fixture, '[data-testid="nat-table-region"]');
    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, '[data-testid="nat-table-header-region"]');

    mockClientRect(tableRegion, { left: 0, right: 300, width: 300, height: 200 });
    mockClientRect(regionHeader, { left: 280, right: 420, width: 140, height: 40 });

    tableRegion.scrollLeft = 10;
    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true
      })
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'status', 'region', 'throughput']);
    expect(tableRegion.scrollLeft).toBe(130);
  });

  it('does not reorder columns unless a single primary modifier and Shift are used', async () => {
    await recreateHost();
    fixture.detectChanges();

    const statusHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="status"]');
    const expectedColumnIds = ['name', 'region', 'status', 'throughput'];

    const blockedEvents: readonly KeyboardEventInit[] = [
      { key: 'ArrowLeft', shiftKey: true },
      { key: 'ArrowLeft', ctrlKey: true },
      { key: 'ArrowLeft', metaKey: true },
      { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, altKey: true },
      { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, metaKey: true },
      { key: 'ArrowLeft', metaKey: true, shiftKey: true, altKey: true }
    ];

    for (const eventInit of blockedEvents) {
      statusHeader.focus();
      statusHeader.dispatchEvent(
        new KeyboardEvent('keydown', {
          ...eventInit,
          bubbles: true,
          cancelable: true
        })
      );
      fixture.detectChanges();

      expect(getHeaderColumnIds(fixture)).toStrictEqual(expectedColumnIds);
    }
  });

  it('consumes keyboard reorder shortcuts at region edges without moving focus', async () => {
    await recreateHost();
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLTableCellElement>(fixture, 'thead th[data-column-id="region"]');
    const edgeEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });

    host.stateEvents.length = 0;
    regionHeader.focus();
    regionHeader.dispatchEvent(edgeEvent);
    fixture.detectChanges();

    expect(edgeEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(regionHeader);
    expect(getHeaderColumnIds(fixture)).toStrictEqual(['name', 'region', 'status', 'throughput']);
    expect(host.stateEvents).toStrictEqual([]);
  });

  it('uses the explicit pin order when computing sticky left offsets', () => {
    host.state.set({
      columnPinning: {
        left: ['region', 'name'],
        right: []
      }
    });
    fixture.detectChanges();

    const regionHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"]');
    const nameHeader = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="name"]');
    const regionCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child td[data-column-id="region"]');
    const nameCell = queryRequired<HTMLElement>(fixture, 'tbody tr:first-child th[data-column-id="name"]');

    expect(regionHeader.style.left).toBe('0px');
    expect(nameHeader.style.left).toBe('140px');
    expect(regionCell.style.left).toBe('0px');
    expect(nameCell.style.left).toBe('140px');
  });

  it('moves focus with arrow keys and stops at the grid edge', () => {
    fixture.detectChanges();

    const firstRowCells = queryAll<HTMLElement>(fixture, 'tbody tr:first-child th, tbody tr:first-child td');
    const [firstCell, secondCell] = firstRowCells;
    const lastCell = firstRowCells.at(-1) as HTMLElement;

    firstCell.focus();
    firstCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(secondCell);

    lastCell.focus();
    lastCell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(lastCell);
  });

  it('does not announce a visibility change when only column labels are swapped', async () => {
    const dynamicColumns = signal<ColumnDef<Row, unknown>[]>(buildDynamicColumns('Service'));

    @Component({
      selector: 'test-dynamic-columns-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns()" [data]="rows()" accessibleName="Operations table" />
        </nat-table-surface>
      `
    })
    class DynamicColumnsHost {
      protected readonly rows = signal<Row[]>(buildRows(3));
      protected readonly columns = dynamicColumns;
    }

    const dynamicFixture = TestBed.createComponent(DynamicColumnsHost);

    await dynamicFixture.whenStable();
    dynamicFixture.detectChanges();

    const liveRegion = queryRequired<HTMLElement>(dynamicFixture, 'p[aria-live="polite"]');

    expect(liveRegion.textContent.trim()).toBe('');

    dynamicColumns.set(buildDynamicColumns('Servicio'));
    dynamicFixture.detectChanges();
    await dynamicFixture.whenStable();
    dynamicFixture.detectChanges();

    expect(liveRegion.textContent.trim()).toBe('');
  });

  it('normalizes sorting state to a single column when multiple entries are supplied', async () => {
    await recreateHost({
      state: {
        sorting: [
          { id: 'name', desc: false },
          { id: 'region', desc: true }
        ]
      }
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    expect(table.table.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);

    const sortedHeaders = queryAll<HTMLTableCellElement>(fixture, 'thead th[aria-sort]');

    expect(sortedHeaders).toHaveLength(1);
    expect(sortedHeaders[0].dataset['columnId']).toBe('name');
  });

  it('normalizes many sorting entries to the first column and announces a single-column sort', async () => {
    await recreateHost({ initialState: {} });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    table.patchState({
      sorting: [
        { id: 'name', desc: false },
        { id: 'region', desc: true },
        { id: 'status', desc: false },
        { id: 'throughput', desc: true }
      ]
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(table.table.getState().sorting).toStrictEqual([{ id: 'name', desc: false }]);
    expect(host.sortingEvents.at(-1)).toStrictEqual([{ id: 'name', desc: false }]);

    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

    expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending.');
  });

  it('keeps multiple sort columns but only exposes aria-sort on the primary header', async () => {
    await recreateHost({
      enableMultiSort: true,
      state: {
        sorting: [
          { id: 'name', desc: false },
          { id: 'region', desc: true }
        ]
      }
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    expect(table.table.getState().sorting).toStrictEqual([
      { id: 'name', desc: false },
      { id: 'region', desc: true }
    ]);

    const sortedHeaders = queryAll<HTMLTableCellElement>(fixture, 'thead th[aria-sort]');

    expect(sortedHeaders.map((header) => header.dataset['columnId'])).toStrictEqual(['name']);
  });

  it('emits the full sorting array and announces a multi-column sort when enableMultiSort is true', async () => {
    await recreateHost({ enableMultiSort: true, initialState: {} });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    table.patchState({
      sorting: [
        { id: 'name', desc: false },
        { id: 'region', desc: true }
      ]
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.sortingEvents.at(-1)).toStrictEqual([
      { id: 'name', desc: false },
      { id: 'region', desc: true }
    ]);

    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

    expect(liveRegion.textContent.trim()).toBe('Sorted by Service ascending, then Region descending.');
  });

  it('does not expose aria-selected unless enableRowSelection is true', () => {
    fixture.detectChanges();

    const row = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row');
    const table = queryRequired<HTMLElement>(fixture, 'table');

    expect(row.getAttribute('aria-selected')).toBeNull();
    expect(table.getAttribute('aria-multiselectable')).toBeNull();
  });

  it('marks the grid aria-multiselectable only for multiple-mode row selection', async () => {
    await recreateHost({ enableRowSelection: true });
    fixture.detectChanges();

    let table = queryRequired<HTMLElement>(fixture, 'table');

    expect(table.getAttribute('aria-multiselectable')).toBe('true');

    await recreateHost({ enableRowSelection: true, selectionMode: 'single' });
    fixture.detectChanges();

    table = queryRequired<HTMLElement>(fixture, 'table');

    expect(table.getAttribute('aria-multiselectable')).toBeNull();
  });

  it('reflects controlled rowSelection through aria-selected', async () => {
    await recreateHost({
      enableRowSelection: true,
      state: { rowSelection: { 'svc-00002': true } }
    });
    fixture.detectChanges();

    const selected = queryAll(fixture, 'tbody tr.data-row').filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true'
    );

    expect(selected).toHaveLength(1);
  });

  it('collapses to the first selected row (by key order) in single mode', async () => {
    await recreateHost({
      enableRowSelection: true,
      selectionMode: 'single',
      state: { rowSelection: { 'svc-00002': true, 'svc-00001': true } }
    });
    fixture.detectChanges();

    const selected = queryAll(fixture, 'tbody tr.data-row').filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true'
    );

    expect(selected).toHaveLength(1);
    // Deterministic by sort order: svc-00001 wins even though svc-00002 was inserted first.
    expect(getInternalTable(fixture).table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });
  });

  it('preserves controlled rowSelection while selection is disabled', async () => {
    await recreateHost({
      enableRowSelection: false,
      state: { rowSelection: { 'svc-00001': true } }
    });
    fixture.detectChanges();
    await fixture.whenStable();

    // The disabled flag must not wipe the controlled slice (continuity for runtime toggles).
    expect(getInternalTable(fixture).table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });
  });

  it('emits rowSelectionChange and announces the selection', async () => {
    await recreateHost({ enableRowSelection: true, initialState: {} });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    table.patchState({ rowSelection: { 'svc-00001': true } });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.rowSelectionEvents.at(-1)).toStrictEqual({ 'svc-00001': true });

    const liveRegion = queryRequired<HTMLElement>(fixture, 'p[aria-live="polite"]');

    expect(liveRegion.textContent.trim()).toBe('1 row selected.');
  });

  it('retains row selection across pagination changes', async () => {
    await recreateHost({
      enableRowSelection: true,
      enablePagination: true,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const table = getInternalTable(fixture);

    // Select a row rendered on the first page.
    table.patchState({ rowSelection: { 'svc-00001': true } });
    fixture.detectChanges();

    // Page past it so the selected row is no longer rendered.
    table.patchState({ pagination: (pagination) => ({ ...pagination, pageIndex: 2 }) });
    fixture.detectChanges();

    expect(table.table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });

    // Returning to the first page still shows the row selected.
    table.patchState({ pagination: (pagination) => ({ ...pagination, pageIndex: 0 }) });
    fixture.detectChanges();

    const firstRow = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row');

    expect(firstRow.getAttribute('aria-selected')).toBe('true');
  });

  it('retains row selection when a selected row is filtered out of view', async () => {
    await recreateHost({ enableRowSelection: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const table = getInternalTable(fixture);

    // Select Alpha (svc-00001).
    table.patchState({ rowSelection: { 'svc-00001': true } });
    fixture.detectChanges();

    // Filter to "gamma" so Alpha is no longer rendered.
    table.patchState({ globalFilter: 'gamma' });
    fixture.detectChanges();

    const visibleRows = queryAll(fixture, 'tbody tr.data-row');

    expect(visibleRows).toHaveLength(1);
    expect((visibleRows[0] as HTMLElement).textContent).toContain('Gamma');
    // Selection is keyed by row id, so it survives the filter.
    expect(table.table.getState().rowSelection).toStrictEqual({ 'svc-00001': true });

    // Clearing the filter brings Alpha back, still selected.
    table.patchState({ globalFilter: '' });
    fixture.detectChanges();

    const selectedRows = queryAll(fixture, 'tbody tr.data-row').filter((row) => row.getAttribute('aria-selected') === 'true');

    expect(selectedRows).toHaveLength(1);
    expect((selectedRows[0] as HTMLElement).textContent).toContain('Alpha');
  });

  it('emits rowActivate for primary clicks and Enter / Space presses on the row', () => {
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const firstRow = queryRequired<HTMLTableRowElement>(fixture, 'tbody tr.data-row');
    const expectedRowId = table.table.getRowModel().rows[0]?.original.id;

    expect(expectedRowId).toBeDefined();

    firstRow.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    fixture.detectChanges();

    expect(host.rowActivateEvents).toHaveLength(1);

    const clickEvent = requireLast(host.rowActivateEvents);

    expect(clickEvent.rowData.id).toBe(expectedRowId);
    expect(clickEvent.originalEvent).toBeInstanceOf(MouseEvent);

    firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.rowActivateEvents).toHaveLength(2);
    expect(requireLast(host.rowActivateEvents).originalEvent).toBeInstanceOf(KeyboardEvent);

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    firstRow.dispatchEvent(spaceEvent);
    fixture.detectChanges();

    expect(host.rowActivateEvents).toHaveLength(3);
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it('does not emit rowActivate when activation originates from an interactive cell descendant', async () => {
    @Component({
      selector: 'test-interactive-cell-host',
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" (rowActivate)="onRowActivate($event)" />
        </nat-table-surface>
      `
    })
    class InteractiveCellHost {
      protected readonly rows = signal<Row[]>(buildRows(2));
      protected readonly columns: ColumnDef<Row, unknown>[] = [
        {
          id: 'select',
          header: 'Select',
          enableSorting: false,
          enableGlobalFilter: false,
          cell: () => '<button type="button" class="row-action">Select</button>'
        },
        {
          accessorKey: 'name',
          header: 'Service',
          meta: { label: 'Service', rowHeader: true },
          cell: (info) => info.getValue<string>()
        }
      ];

      public readonly events: NatTableRowActivateEvent<Row>[] = [];

      protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
        this.events.push(event);
      }
    }

    const interactiveFixture = TestBed.createComponent(InteractiveCellHost);

    await interactiveFixture.whenStable();
    interactiveFixture.detectChanges();

    const cell = queryRequired<HTMLElement>(interactiveFixture, 'tbody tr.data-row td[data-column-id="select"]');

    cell.innerHTML = '<button type="button" class="row-action">Select</button>';
    interactiveFixture.detectChanges();

    const button = cell.querySelector('button.row-action') as HTMLButtonElement;

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    interactiveFixture.detectChanges();

    expect(interactiveFixture.componentInstance.events).toHaveLength(0);
  });

  it('moves focus into a cell control with Enter and back to the cell with Escape', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.innerHTML =
      '<button type="button" class="cell-action">Edit</button><button type="button" class="cell-action">Delete</button>';

    const [editButton] = Array.from(cell.querySelectorAll<HTMLButtonElement>('button.cell-action'));

    cell.focus();

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    });

    cell.dispatchEvent(enterEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(editButton);
    expect(enterEvent.defaultPrevented).toBe(true);
    expect(host.rowActivateEvents).toHaveLength(0);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    });

    editButton.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);
    expect(escapeEvent.defaultPrevented).toBe(true);
  });

  it('lets Enter on a control-less cell fall through to row activation', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(host.rowActivateEvents).toHaveLength(1);
  });

  it("walks the cell's controls with Tab and Shift+Tab and releases Tab at the cell edges", () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.innerHTML = '<button type="button" class="first">First</button><button type="button" class="second">Second</button>';

    const firstButton = cell.querySelector('button.first') as HTMLButtonElement;
    const secondButton = cell.querySelector('button.second') as HTMLButtonElement;

    // Plain Tab on a focused cell is not intercepted, so focus can leave the grid.
    cell.focus();

    const tabFromCell = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true
    });

    cell.dispatchEvent(tabFromCell);
    fixture.detectChanges();

    expect(tabFromCell.defaultPrevented).toBe(false);

    // Tab from a control walks to the next control of the same cell.
    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(secondButton);

    // Shift+Tab walks back.
    secondButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(firstButton);

    // Tab past the cell's last control is not handled, so focus can leave the grid.
    const leaveEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true
    });

    secondButton.dispatchEvent(leaveEvent);
    fixture.detectChanges();

    expect(leaveEvent.defaultPrevented).toBe(false);
  });

  it('skips non-tabbable controls but keeps roving grid-cell widgets reachable', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.innerHTML =
      '<button type="button" class="first">First</button>' +
      '<button type="button" tabindex="-1">Removed from tab order</button>' +
      '<span inert><button type="button">Inert</button></span>' +
      '<span aria-hidden="true"><button type="button">Hidden</button></span>' +
      '<button type="button" ngGridCellWidget tabindex="-1" class="widget">Widget</button>';

    const firstButton = cell.querySelector('button.first') as HTMLButtonElement;
    const widgetButton = cell.querySelector('button.widget') as HTMLButtonElement;

    // The roving widget sits at tabindex="-1" (flexRender keeps it unregistered),
    // but the model still treats it as the cell's next control.
    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(widgetButton);
  });

  it('delegates focus to a header cell whose only content is its sort button', () => {
    fixture.detectChanges();

    const headerCell = queryRequired<HTMLElement>(fixture, 'thead th[data-column-id="region"]');

    headerCell.innerHTML = '<button type="button" class="header-action">Sort by Region</button>';

    const sortButton = headerCell.querySelector('button') as HTMLButtonElement;

    // Arriving on the cell moves focus straight to its sole control — no Enter needed.
    headerCell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(sortButton);

    // The delegated control is the cell's focus stop, so Escape stays native.
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    });

    sortButton.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(escapeEvent.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(sortButton);
  });

  it('delegates focus to a body cell whose only perceivable content is one arrow-safe control', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    // Decorative content hidden from assistive technology does not block delegation.
    cell.innerHTML = '<span aria-hidden="true">icon</span><button type="button" class="cell-action">Acknowledge</button>';

    const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('keeps the Enter model when a single control sits next to other cell content', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.innerHTML = 'EMEA <button type="button" class="cell-action">Edit</button>';

    const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

    // Focus stays on the cell so screen readers announce the text content too.
    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);

    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('keeps the Enter model for a single arrow-consuming control', () => {
    fixture.detectChanges();

    const cell = queryRequired<HTMLElement>(fixture, 'tbody tr.data-row td[data-column-id="region"]');

    cell.innerHTML = '<input type="text" class="cell-input" aria-label="Region" />';

    const inputEl = cell.querySelector('input.cell-input') as HTMLInputElement;

    // A text input needs arrow keys for itself, so the grid keeps focus on the cell.
    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);

    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(inputEl);
  });

  it('applies sticky class and toggles vertical sticky header positioning', async () => {
    fixture.detectChanges();
    let tableElement = queryRequired<HTMLTableElement>(fixture, 'table');

    expect(tableElement.classList.contains('has-sticky-header')).toBe(true);

    await recreateHost({ stickyHeader: false });
    fixture.detectChanges();
    tableElement = queryRequired<HTMLTableElement>(fixture, 'table');
    expect(tableElement.classList.contains('has-sticky-header')).toBe(false);
  });

  it('correctly resolves sticky top offset specified in non-pixel CSS units', async () => {
    await recreateHost({ stickyHeader: true });
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const region = queryRequired<HTMLElement>(fixture, '.table-region');
    
    region.style.setProperty('--nat-table-sticky-top', '4rem');

    const originalGetComputedStyle = window.getComputedStyle;

    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element, pseudoElt?: string | null) => {
      const styles = originalGetComputedStyle(el, pseudoElt);

      if (el instanceof HTMLDivElement && el.style.height === '4rem') {
        Object.defineProperty(styles, 'height', {
          value: '64px',
          configurable: true
        });
      }

      return styles;
    });

    const tableInstance = table as unknown as {
      updateCachedStickyTop(): void;
      cachedStickyTop: number;
    };

    tableInstance.updateCachedStickyTop();
    expect(tableInstance.cachedStickyTop).toBe(64);
  });

  it('refreshes cached sticky dimensions when rendered rows change', async () => {
    await recreateHost({ stickyHeader: true, initialState: {} });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const table = getInternalTable(fixture) as unknown as {
      measureTableDimensions(): void;
      tableHeight: number;
    };
    const tableElement = queryRequired<HTMLTableElement>(fixture, 'table');
    const thead = queryRequired<HTMLTableSectionElement>(fixture, 'thead');
    let measuredTableHeight = 80;

    tableElement.getBoundingClientRect = (): DOMRect =>
      ({
        top: 20,
        height: measuredTableHeight,
      }) as DOMRect;
    thead.getBoundingClientRect = (): DOMRect =>
      ({
        height: 24,
      }) as DOMRect;

    table.measureTableDimensions();
    expect(table.tableHeight).toBe(80);

    measuredTableHeight = 280;
    host.rows.set(buildRows(12));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(table.tableHeight).toBe(280);
  });

  describe('manual mode', () => {
    it('does not paginate, sort, or filter client-side, but still tracks and emits state changes', async () => {
      await recreateHost({
        mode: 'manual',
        enablePagination: true,
        initialState: {
          sorting: [{ id: 'throughput', desc: true }],
          pagination: { pageIndex: 0, pageSize: 2 }
        },
        manualPageCount: 3
      });

      fixture.detectChanges();

      // In manual mode, all rows must be rendered since client-side pagination, sorting, and filtering are disabled.
      const rows = queryAll(fixture, 'tbody tr.data-row');

      expect(rows).toHaveLength(6);

      // Verify the rendered order is the original order (Alpha first), not sorted by throughput descending
      expect(rows[0].textContent).toContain('Alpha');

      // Trigger pagination change
      const table = getInternalTable(fixture);

      table.patchState({
        pagination: { pageIndex: 1, pageSize: 2 }
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.paginationEvents.at(-1)).toStrictEqual({ pageIndex: 1, pageSize: 2 });

      // Rows must still not be sliced client-side
      const rowsAfterPage = queryAll(fixture, 'tbody tr.data-row');

      expect(rowsAfterPage).toHaveLength(6);

      // Trigger sorting change
      table.patchState({
        sorting: [{ id: 'name', desc: false }]
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.sortingEvents.at(-1)).toStrictEqual([{ id: 'name', desc: false }]);

      // Rows must still not be sorted client-side (Alpha first)
      const rowsAfterSort = queryAll(fixture, 'tbody tr.data-row');

      expect(rowsAfterSort[0].textContent).toContain('Alpha');
    });

    it('supports mixed mode configuration (e.g. manual pagination, auto sorting)', async () => {
      await recreateHost({
        mode: {
          pagination: 'manual',
          sorting: 'auto'
        },
        enablePagination: true,
        initialState: {
          sorting: [{ id: 'throughput', desc: true }],
          pagination: { pageIndex: 0, pageSize: 2 }
        },
        manualPageCount: 3
      });

      fixture.detectChanges();

      // In mixed mode: pagination is manual, sorting is auto.
      // So sorting should be applied client-side (throughput desc).
      // But pagination is manual, so data should NOT be sliced client-side (all 6 rows rendered).
      const rows = queryAll(fixture, 'tbody tr.data-row');

      expect(rows).toHaveLength(6);

      // Verify the rendered order is sorted by throughput descending (Zeta has highest throughput)
      expect(rows[0].textContent).toContain('Zeta');

      // Trigger pagination change
      const table = getInternalTable(fixture);

      table.patchState({
        pagination: { pageIndex: 1, pageSize: 2 }
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.paginationEvents.at(-1)).toStrictEqual({ pageIndex: 1, pageSize: 2 });

      // Rows must still not be sliced client-side
      const rowsAfterPage = queryAll(fixture, 'tbody tr.data-row');

      expect(rowsAfterPage).toHaveLength(6);
    });
  });

  describe('custom keybindings', () => {
    it('should allow overriding keybindings via the [keybindings] input', async () => {
      @Component({
        selector: 'test-custom-keybindings-host',
        imports: [NatTable, TestTableSurface],
        template: `
          <nat-table-surface [keybindings]="keybindings">
            <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" (rowActivate)="onRowActivate($event)" />
          </nat-table-surface>
        `
      })
      class CustomKeybindingsHost {
        protected readonly rows = signal<Row[]>(buildRows(3));
        protected readonly columns: ColumnDef<Row, unknown>[] = [
          {
            accessorKey: 'name',
            header: 'Service',
            meta: { label: 'Service', rowHeader: true },
            cell: (info) => info.getValue<string>()
          }
        ];

        protected readonly keybindings = {
          rowActivate: 'a',
          columnReorderLeft: 'Ctrl+ArrowLeft',
          columnReorderRight: 'Ctrl+ArrowRight'
        };

        public readonly events: NatTableRowActivateEvent<Row>[] = [];

        protected onRowActivate(event: NatTableRowActivateEvent<Row>): void {
          this.events.push(event);
        }
      }

      const customFixture = TestBed.createComponent(CustomKeybindingsHost);

      await customFixture.whenStable();
      customFixture.detectChanges();

      const firstRow = queryRequired<HTMLTableRowElement>(customFixture, 'tbody tr.data-row');

      // 1. Try default 'Enter' - should NOT activate
      firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      customFixture.detectChanges();
      expect(customFixture.componentInstance.events).toHaveLength(0);

      // 2. Press custom key 'a' - should activate
      firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      customFixture.detectChanges();
      expect(customFixture.componentInstance.events).toHaveLength(1);
    });

    it('should fall back to default keybindings for non-overridden properties when keybindings are partially customized', async () => {
      @Component({
        selector: 'test-partial-keybindings-host',
        imports: [NatTable, TestTableSurface],
        template: `
          <nat-table-surface [keybindings]="keybindings">
            <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations table" />
          </nat-table-surface>
        `
      })
      class PartialKeybindingsHost {
        protected readonly rows = signal<Row[]>(buildRows(3));
        protected readonly columns: ColumnDef<Row, unknown>[] = [
          {
            accessorKey: 'region',
            header: 'Region',
            meta: { label: 'Region' },
            cell: (info) => info.getValue<string>()
          }
        ];

        protected readonly keybindings = {
          rowActivate: 'a'
        };
      }

      const partialFixture = TestBed.createComponent(PartialKeybindingsHost);

      await partialFixture.whenStable();
      partialFixture.detectChanges();

      const cell = queryRequired<HTMLElement>(partialFixture, 'tbody tr.data-row td[data-column-id="region"]');

      cell.innerHTML = '<button type="button" class="first">First</button><button type="button" class="second">Second</button>';
      const firstButton = cell.querySelector('button.first') as HTMLButtonElement;

      cell.focus();
      expect(document.activeElement).toBe(cell);

      // Trigger 'Enter' (default cellEnterControl) on the cell
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });

      cell.dispatchEvent(enterEvent);
      partialFixture.detectChanges();

      // Should focus the first button inside the cell because default cellEnterControl is Enter
      expect(document.activeElement).toBe(firstButton);
      expect(enterEvent.defaultPrevented).toBe(true);
    });
  });
});
