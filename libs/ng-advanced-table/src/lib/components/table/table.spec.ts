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
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  VisibilityState,
} from '@tanstack/angular-table';

import { NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE } from './cell-interaction';
import { NatTable } from './table';
import { provideNatTableIntl } from './table-intl';
import { NatTableService } from './table.service';
import { NAT_TABLE_DATA_STATUS } from './table.types';
import {
  NatTableEmptyTemplate,
  NatTableErrorTemplate,
  NatTableLoadingTemplate,
} from './table-state-templates';
import type {
  NatTableAccessibilityText,
  NatTableDataStatus,
  NatTableMode,
  NatTableModeConfiguration,
  NatTableRowActivateEvent,
  NatTableState,
} from './table.types';

@Component({
  selector: 'test-pager',
  template: '',
})
class TestPager {
  private readonly service = inject(NatTableService);
  constructor() {
    const destroyRef = inject(DestroyRef);
    this.service.registerPagination();
    destroyRef.onDestroy(() => {
      this.service.unregisterPagination();
    });
  }
}

@Component({
  selector: 'test-search',
  template: '',
})
class TestSearch {
  private readonly service = inject(NatTableService);
  constructor() {
    const destroyRef = inject(DestroyRef);
    this.service.registerSearch();
    destroyRef.onDestroy(() => {
      this.service.unregisterSearch();
    });
  }
}

@Component({
  selector: 'nat-table-surface',
  template: `<ng-content />`,
  providers: [NatTableService],
})
class TestTableSurface {
  readonly state = input<Partial<NatTableState>>({});
  readonly stateChange = output<Partial<NatTableState>>();
  readonly initialState = input<Partial<NatTableState>>({});
  readonly mode = input<NatTableMode | NatTableModeConfiguration>('auto');

  readonly manualPageCount = input<number | undefined>(undefined);
  readonly enableAnnouncements = input(true, { transform: booleanAttribute });
  readonly stickyHeader = input(true, { transform: booleanAttribute });
  readonly enableMultiSort = input(false, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);
  readonly accessibilityText = input<NatTableAccessibilityText>({});
  readonly enableColumnResizing = input(false, { transform: booleanAttribute });
  readonly columnResizeMode = input<'onEnd' | 'onChange'>('onEnd');
  readonly direction = input<'ltr' | 'rtl'>();

  readonly sortingChange = output<SortingState>();
  readonly globalFilterChange = output<string>();
  readonly columnFiltersChange = output<ColumnFiltersState>();
  readonly columnVisibilityChange = output<VisibilityState>();
  readonly columnOrderChange = output<ColumnOrderState>();
  readonly columnPinningChange = output<ColumnPinningState>();
  readonly columnSizingChange = output<ColumnSizingState>();
  readonly paginationChange = output<PaginationState>();
  readonly rowSelectionChange = output<NatTableState['rowSelection']>();

  private readonly natTableService = inject(NatTableService);

  constructor() {
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
      this.natTableService.enableColumnResizing.set(this.enableColumnResizing());
    });
    effect(() => {
      this.natTableService.columnResizeMode.set(this.columnResizeMode());
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
      pagination: { pageIndex: 0, pageSize: 10 },
    };
    effect(() => {
      const nextState = this.natTableService.stateChangeEvent();
      if (!nextState) {
        return;
      }

      if (isFirstChange) {
        const initial = this.natTableService.surfaceInitialState();
        const currentBound = this.state();
        previousState = {
          sorting: currentBound.sorting ?? initial.sorting ?? [],
          globalFilter: currentBound.globalFilter ?? initial.globalFilter ?? '',
          columnFilters: currentBound.columnFilters ?? initial.columnFilters ?? [],
          columnVisibility: currentBound.columnVisibility ?? initial.columnVisibility ?? {},
          columnOrder: currentBound.columnOrder ?? initial.columnOrder ?? [],
          columnPinning: currentBound.columnPinning ??
            initial.columnPinning ?? { left: [], right: [] },
          columnSizing: currentBound.columnSizing ?? initial.columnSizing ?? {},
          rowSelection: currentBound.rowSelection ?? initial.rowSelection ?? {},
          pagination: currentBound.pagination ??
            initial.pagination ?? { pageIndex: 0, pageSize: 10 },
        };
        isFirstChange = false;
      }

      const prev = previousState;
      previousState = nextState;

      this.stateChange.emit(nextState);

      if (JSON.stringify(prev.sorting) !== JSON.stringify(nextState.sorting)) {
        this.sortingChange.emit(nextState.sorting);
      }
      if (prev.globalFilter !== nextState.globalFilter) {
        this.globalFilterChange.emit(nextState.globalFilter);
      }
      if (JSON.stringify(prev.columnFilters) !== JSON.stringify(nextState.columnFilters)) {
        this.columnFiltersChange.emit(nextState.columnFilters);
      }
      if (JSON.stringify(prev.columnVisibility) !== JSON.stringify(nextState.columnVisibility)) {
        this.columnVisibilityChange.emit(nextState.columnVisibility);
      }
      if (JSON.stringify(prev.columnOrder) !== JSON.stringify(nextState.columnOrder)) {
        this.columnOrderChange.emit(nextState.columnOrder);
      }
      if (JSON.stringify(prev.columnPinning) !== JSON.stringify(nextState.columnPinning)) {
        this.columnPinningChange.emit(nextState.columnPinning);
      }
      if (JSON.stringify(prev.columnSizing) !== JSON.stringify(nextState.columnSizing)) {
        this.columnSizingChange.emit(nextState.columnSizing);
      }
      if (JSON.stringify(prev.pagination) !== JSON.stringify(nextState.pagination)) {
        this.paginationChange.emit(nextState.pagination);
      }
      if (JSON.stringify(prev.rowSelection) !== JSON.stringify(nextState.rowSelection)) {
        this.rowSelectionChange.emit(nextState.rowSelection);
      }
    });
  }
}

interface Row {
  id: string;
  name: string;
  region: string;
  status: 'Healthy' | 'Pending' | 'Alert';
  throughput: number;
}

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
      rowHeader: true,
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'region',
    header: 'Region',
    size: 140,
    minSize: 100,
    meta: {
      label: 'Region',
    },
    enablePinning: true,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    meta: {
      label: 'Status',
    },
    filterFn: statusFilter,
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: 'throughput',
    header: 'Throughput',
    size: 160,
    meta: {
      label: 'Throughput',
      align: 'end',
      cellTone: (context) => (context.getValue<number>() >= 4000 ? 'positive' : 'negative'),
    },
    cell: (info) => String(info.getValue<number>()),
  },
];

@Component({
  imports: [NatTable, TestTableSurface, TestPager, TestSearch],
  template: `
    <nat-table-surface
      [state]="state()"
      [initialState]="initialState"
      [mode]="mode"
      [enableMultiSort]="enableMultiSort"
      [stickyHeader]="stickyHeader"
      [accessibilityText]="accessibilityText"
      [manualPageCount]="manualPageCount"
      [enableColumnResizing]="enableColumnResizing"
      [direction]="direction"
      (stateChange)="onStateChange($event)"
      (sortingChange)="onSortingChange($event)"
      (paginationChange)="onPaginationChange($event)"
      (globalFilterChange)="onGlobalFilterChange($event)"
      (columnFiltersChange)="onColumnFiltersChange($event)"
      (columnVisibilityChange)="onColumnVisibilityChange($event)"
      (columnOrderChange)="onColumnOrderChange($event)"
      (columnPinningChange)="onColumnPinningChange($event)"
      (columnSizingChange)="onColumnSizingChange($event)"
      (rowSelectionChange)="onRowSelectionChange($event)"
    >
      @if (enablePagination) {
        <test-pager />
      }
      @if (enableSearch) {
        <test-search />
      }
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Operations table"
        [getRowId]="getRowId"
        [dataStatus]="dataStatus()"
        [error]="error()"
        [enableRowSelection]="enableRowSelection"
        [selectionMode]="selectionMode"
        (rowActivate)="onRowActivate($event)"
      />
    </nat-table-surface>
  `,
})
class TableHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly state = signal<Partial<NatTableState>>({});
  readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  readonly error = signal<unknown>(null);
  readonly columns = columns;
  readonly getRowId = (row: Row) => row.id;
  initialState: Partial<NatTableState> = {
    sorting: [{ id: 'throughput', desc: true }],
    columnPinning: {
      left: ['name'],
      right: [],
    },
    pagination: {
      pageIndex: 0,
      pageSize: 2,
    },
  };
  enablePagination = false;
  enableSearch = true;
  enableMultiSort = false;
  enableRowSelection = false;
  selectionMode: 'single' | 'multiple' = 'multiple';
  stickyHeader = true;
  enableColumnResizing = false;
  direction: 'ltr' | 'rtl' | undefined = undefined;
  accessibilityText: NatTableAccessibilityText = {};
  mode: NatTableMode | NatTableModeConfiguration = 'auto';
  manualPageCount: number | undefined = undefined;
  readonly stateEvents: Partial<NatTableState>[] = [];
  readonly rowActivateEvents: NatTableRowActivateEvent<Row>[] = [];
  readonly sortingEvents: NatTableState['sorting'][] = [];
  readonly paginationEvents: NatTableState['pagination'][] = [];
  readonly globalFilterEvents: NatTableState['globalFilter'][] = [];
  readonly columnFiltersEvents: NatTableState['columnFilters'][] = [];
  readonly columnVisibilityEvents: NatTableState['columnVisibility'][] = [];
  readonly columnOrderEvents: NatTableState['columnOrder'][] = [];
  readonly columnPinningEvents: NatTableState['columnPinning'][] = [];
  readonly columnSizingEvents: NatTableState['columnSizing'][] = [];
  readonly rowSelectionEvents: NatTableState['rowSelection'][] = [];

  onStateChange(state: Partial<NatTableState>): void {
    this.stateEvents.push(state);
  }

  onSortingChange(sorting: NatTableState['sorting']): void {
    this.sortingEvents.push(sorting);
  }

  onPaginationChange(pagination: NatTableState['pagination']): void {
    this.paginationEvents.push(pagination);
  }

  onGlobalFilterChange(globalFilter: NatTableState['globalFilter']): void {
    this.globalFilterEvents.push(globalFilter);
  }

  onColumnFiltersChange(columnFilters: NatTableState['columnFilters']): void {
    this.columnFiltersEvents.push(columnFilters);
  }

  onColumnVisibilityChange(columnVisibility: NatTableState['columnVisibility']): void {
    this.columnVisibilityEvents.push(columnVisibility);
  }

  onColumnOrderChange(columnOrder: NatTableState['columnOrder']): void {
    this.columnOrderEvents.push(columnOrder);
  }

  onColumnPinningChange(columnPinning: NatTableState['columnPinning']): void {
    this.columnPinningEvents.push(columnPinning);
  }

  onColumnSizingChange(columnSizing: NatTableState['columnSizing']): void {
    this.columnSizingEvents.push(columnSizing);
  }

  onRowSelectionChange(rowSelection: NatTableState['rowSelection']): void {
    this.rowSelectionEvents.push(rowSelection);
  }

  onRowActivate(event: NatTableRowActivateEvent<Row>): void {
    this.rowActivateEvents.push(event);
  }
}

@Component({
  imports: [NatTable, TestTableSurface],
  providers: [
    provideNatTableIntl({
      formatNumber: (value) => `n${value}`,
      accessibilityText: {
        emptyState: 'Provider empty state',
        keyboardInstructions: 'Provider keyboard instructions.',
        tableSummary: ({ visibleRowsText, totalRowsText }) =>
          `Provider summary ${visibleRowsText}/${totalRowsText}`,
      },
    }),
  ],
  template: `
    <nat-table-surface [accessibilityText]="accessibilityText()">
      <nat-table [data]="rows()" [columns]="columns" accessibleName="Provider table" />
    </nat-table-surface>
  `,
})
class ProviderAccessibilityHost {
  readonly rows = signal<Row[]>([]);
  readonly columns = columns;
  readonly accessibilityText = signal<NatTableAccessibilityText>({});
}

@Component({
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [data]="rows()" [columns]="columns" accessibleName="Latency table" />
    </nat-table-surface>
  `,
})
class AccessibleNameHost {
  readonly rows = signal<Row[]>(buildRows(2));
  readonly columns = columns;
}

@Component({
  imports: [NatTable, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table
        [data]="rows()"
        [columns]="columns"
        accessibleName="Ignored accessible name"
        caption="Visible operations"
      />
    </nat-table-surface>
  `,
})
class CaptionHost {
  readonly rows = signal<Row[]>(buildRows(2));
  readonly columns = columns;
}

@Component({
  imports: [
    NatTable,
    TestTableSurface,
    TestSearch,
    NatTableLoadingTemplate,
    NatTableEmptyTemplate,
    NatTableErrorTemplate,
  ],
  template: `
    <nat-table-surface [state]="state()" [accessibilityText]="accessibilityText">
      <test-search />
      <nat-table
        [data]="rows()"
        [columns]="columns"
        [dataStatus]="dataStatus()"
        [error]="error()"
        accessibleName="State template table"
      >
        <ng-template natTableLoading let-status="status" let-totalRowsValue="totalRowsValue">
          <span class="custom-loading">{{ status }} {{ totalRowsValue }}</span>
        </ng-template>

        <ng-template natTableEmpty let-filtered="filtered" let-columns="visibleColumnsValue">
          <span class="custom-empty"
            >{{ filtered ? 'Filtered empty' : 'Empty' }} {{ columns }}</span
          >
        </ng-template>

        <ng-template
          natTableError
          let-error
          let-visibleRowsValue="visibleRowsValue"
          let-totalRowsValue="totalRowsValue"
        >
          <button
            type="button"
            class="custom-error"
            [attr.data-row-counts]="visibleRowsValue + '/' + totalRowsValue"
          >
            {{ formatError(error) }}
          </button>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `,
})
class StateTemplatesHost {
  readonly rows = signal<Row[]>([]);
  readonly state = signal<Partial<NatTableState>>({});
  readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
  readonly error = signal<unknown>(new Error('Request failed'));
  readonly columns = columns;
  readonly accessibilityText: NatTableAccessibilityText = {
    loadingState: 'Loading operations.',
    emptyState: 'No operations.',
    errorState: 'Operations failed.',
  };

  formatError(error: unknown): string {
    return error instanceof Error ? error.message : 'Request failed';
  }
}

describe('NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TableHost,
        ProviderAccessibilityHost,
        AccessibleNameHost,
        CaptionHost,
        StateTemplatesHost,
      ],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function recreateHost(
    options: {
      enablePagination?: boolean;
      enableMultiSort?: boolean;
      enableRowSelection?: boolean;
      selectionMode?: 'single' | 'multiple';
      stickyHeader?: boolean;
      enableColumnResizing?: boolean;
      direction?: 'ltr' | 'rtl';
      accessibilityText?: NatTableAccessibilityText;
      initialState?: Partial<NatTableState>;
      state?: Partial<NatTableState>;
      mode?: NatTableMode | NatTableModeConfiguration;
      manualPageCount?: number;
    } = {},
  ): Promise<void> {
    fixture.destroy();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    host.enablePagination = options.enablePagination ?? host.enablePagination;
    host.enableMultiSort = options.enableMultiSort ?? host.enableMultiSort;
    host.enableRowSelection = options.enableRowSelection ?? host.enableRowSelection;
    host.selectionMode = options.selectionMode ?? host.selectionMode;
    host.stickyHeader = options.stickyHeader ?? host.stickyHeader;
    host.enableColumnResizing = options.enableColumnResizing ?? host.enableColumnResizing;
    host.direction = options.direction ?? host.direction;
    host.accessibilityText = options.accessibilityText ?? host.accessibilityText;
    host.initialState = options.initialState ?? host.initialState;
    host.mode = options.mode ?? host.mode;
    host.manualPageCount = options.manualPageCount ?? host.manualPageCount;

    if (options.state) {
      host.state.set(options.state);
    }

    await fixture.whenStable();
  }

  it('renders resize handles only when column resizing is enabled', async () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.column-resize-handle')).toBeNull();

    await recreateHost({ enableColumnResizing: true });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.column-resize-handle').length).toBe(4);
  });

  it('resizes a column from the keyboard, updates width, and emits columnSizingChange', async () => {
    await recreateHost({ enableColumnResizing: true });
    fixture.detectChanges();

    const regionHandle = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"] .column-resize-handle',
    ) as HTMLElement;

    expect(regionHandle.getAttribute('aria-label')).toBe('Resize Region column');

    regionHandle.focus();
    regionHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.columnSizingEvents.at(-1)).toEqual({ region: 148 });

    const regionCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="region"]',
    ) as HTMLElement;
    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLElement;

    // The resize must drive BOTH body and header widths, or the column never visibly resizes.
    expect(regionCell.style.width).toBe('148px');
    expect(regionHeader.style.width).toBe('148px');
    expect(regionHandle.getAttribute('aria-valuetext')).toBe('148 pixels');

    const liveRegion = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(liveRegion.textContent?.trim()).toBe('Region column width 148 pixels.');
  });

  it('inverts keyboard resize arrows in RTL and clamps to the min bound', async () => {
    await recreateHost({ enableColumnResizing: true, direction: 'rtl' });
    fixture.detectChanges();

    const handle = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"] .column-resize-handle',
    ) as HTMLElement;
    handle.focus();

    // RTL: the resize edge is on the left, so ArrowLeft grows (region 140 → 148).
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toEqual({ region: 148 });

    // Home jumps to the column's minSize (100).
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.at(-1)).toEqual({ region: 100 });

    // Already at min: ArrowRight (shrink in RTL) clamps to 100 and emits nothing new.
    const eventsAtMin = host.columnSizingEvents.length;
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(host.columnSizingEvents.length).toBe(eventsAtMin);
  });

  it('renders a bare table surface with no built-in controls', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const headerLabels = headers.map((header) =>
      header.textContent?.replaceAll(/\s+/g, ' ').trim(),
    );

    expect(rows.length).toBe(6);
    expect(headerLabels).toEqual(['Service', 'Region', 'Status', 'Throughput']);
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Zeta');
    expect(fixture.nativeElement.querySelector('#table-search')).toBeNull();
    expect(fixture.nativeElement.querySelector('.column-chip')).toBeNull();
    expect(fixture.nativeElement.querySelector('.pager')).toBeNull();
    expect(fixture.nativeElement.querySelector('.sort-button')).toBeNull();
    expect(fixture.nativeElement.querySelector('.pin-button')).toBeNull();
  });

  it('visually hides primitive header labels while keeping accessible text', async () => {
    @Component({
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [data]="rows()" [columns]="columns" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class HiddenHeaderLabelHost {
      readonly rows = signal<Row[]>(buildRows(1));
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Menu',
          meta: {
            hiddenHeaderLabel: 'Row actions',
          },
          cell: (info) => info.getValue<string>(),
        },
      ];
    }

    const hiddenHeaderFixture = TestBed.createComponent(HiddenHeaderLabelHost);

    await hiddenHeaderFixture.whenStable();
    hiddenHeaderFixture.detectChanges();

    const header = hiddenHeaderFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

    expect(hiddenLabel.textContent?.trim()).toBe('Row actions');
    expect(header.textContent?.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');
    expect(header.textContent).not.toContain('Menu');

    hiddenHeaderFixture.destroy();
  });

  it('renders hidden header labels for non-primitive headers', async () => {
    @Component({
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [data]="rows()" [columns]="columns" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class NonPrimitiveHiddenHeaderLabelHost {
      readonly rows = signal<Row[]>(buildRows(1));
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: () => '',
          meta: {
            hiddenHeaderLabel: 'Row actions',
          },
          cell: (info) => info.getValue<string>(),
        },
      ];
    }

    const hiddenHeaderFixture = TestBed.createComponent(NonPrimitiveHiddenHeaderLabelHost);

    await hiddenHeaderFixture.whenStable();
    hiddenHeaderFixture.detectChanges();

    const header = hiddenHeaderFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const hiddenLabel = header.querySelector('.sr-only') as HTMLElement;

    expect(hiddenLabel.textContent?.trim()).toBe('Row actions');
    expect(header.textContent?.replaceAll(/\s+/g, ' ').trim()).toBe('Row actions');

    hiddenHeaderFixture.destroy();
  });

  it('applies semantic tone attributes from column metadata', () => {
    fixture.detectChanges();

    const throughputCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="throughput"]',
    ) as HTMLTableCellElement;

    expect(throughputCell.getAttribute('data-tone')).toBe('positive');
  });

  it('describes the current view and exposes the row header column to assistive technology', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const describedBy = table.getAttribute('aria-describedby');
    const summary = fixture.nativeElement.querySelector(
      `#${describedBy?.split(' ').at(0) ?? ''}`,
    ) as HTMLElement;
    const rowHeaderCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child th[scope="row"]',
    ) as HTMLTableCellElement;

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
        tableSummary: () => '',
      },
    });
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;

    expect(table.getAttribute('aria-describedby')).toBeNull();
    expect(fixture.nativeElement.querySelector('p[id$="-summary"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('p[id$="-instructions"]')).toBeNull();
  });

  it('accepts accessibleName as the preferred grid name input', () => {
    const nameFixture = TestBed.createComponent(AccessibleNameHost);

    nameFixture.detectChanges();

    const table = nameFixture.nativeElement.querySelector('table') as HTMLTableElement;

    expect(table.getAttribute('aria-label')).toBe('Latency table');
    expect(table.getAttribute('aria-labelledby')).toBeNull();

    nameFixture.destroy();
  });

  it('renders caption as a semantic table label when provided', () => {
    const captionFixture = TestBed.createComponent(CaptionHost);

    captionFixture.detectChanges();

    const table = captionFixture.nativeElement.querySelector('table') as HTMLTableElement;
    const caption = captionFixture.nativeElement.querySelector(
      'caption',
    ) as HTMLTableCaptionElement;

    expect(caption.textContent?.trim()).toBe('Visible operations');
    expect(table.getAttribute('aria-label')).toBeNull();
    expect(table.getAttribute('aria-labelledby')).toBe(caption.id);

    captionFixture.destroy();
  });

  it('only applies aria-sort to the actively sorted header', () => {
    fixture.detectChanges();

    const sortedHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="throughput"]',
    ) as HTMLTableCellElement;
    const unsortedHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLTableCellElement;

    expect(sortedHeader.getAttribute('aria-sort')).toBe('descending');
    expect(unsortedHeader.getAttribute('aria-sort')).toBeNull();
  });

  it('only paginates when enablePagination is true', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Zeta');
  });

  it('renders reorder handles on headers by default', async () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.header-cell.is-reorderable').length).toBe(3);
  });

  it('lets callers patch state and emits the next state', () => {
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    table.patchState({
      globalFilter: 'gamma',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
    fixture.detectChanges();

    expect(host.stateEvents.at(-1)?.globalFilter).toBe('gamma');
    expect(host.stateEvents.at(-1)?.pagination?.pageIndex).toBe(0);
    expect(host.globalFilterEvents.at(-1)).toBe('gamma');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Gamma');
  });

  it('only emits granular slice outputs when the corresponding slice actually changed', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    host.sortingEvents.length = 0;
    host.paginationEvents.length = 0;
    host.globalFilterEvents.length = 0;
    host.columnFiltersEvents.length = 0;
    host.columnVisibilityEvents.length = 0;
    host.columnOrderEvents.length = 0;
    host.columnPinningEvents.length = 0;

    table.patchState({ sorting: [{ id: 'name', desc: false }] });
    fixture.detectChanges();

    expect(host.sortingEvents).toEqual([[{ id: 'name', desc: false }]]);
    expect(host.globalFilterEvents).toEqual([]);
    expect(host.paginationEvents).toEqual([]);
    expect(host.columnFiltersEvents).toEqual([]);
    expect(host.columnVisibilityEvents).toEqual([]);
    expect(host.columnOrderEvents).toEqual([]);
    expect(host.columnPinningEvents).toEqual([]);

    table.patchState({ sorting: [{ id: 'name', desc: false }] });
    fixture.detectChanges();

    expect(host.sortingEvents.length).toBe(1);

    table.patchState({ globalFilter: 'gamma' });
    fixture.detectChanges();

    expect(host.globalFilterEvents).toEqual(['gamma']);
    expect(host.sortingEvents.length).toBe(1);
    expect(host.columnVisibilityEvents).toEqual([]);
  });

  it('resets the page index and emits both globalFilterChange and paginationChange when the underlying TanStack filter changes', async () => {
    await recreateHost({ enablePagination: true });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    table.patchState({
      pagination: (currentPagination) => ({ ...currentPagination, pageIndex: 1 }),
    });
    fixture.detectChanges();

    host.paginationEvents.length = 0;
    host.globalFilterEvents.length = 0;

    table.table.setGlobalFilter('gamma');
    fixture.detectChanges();

    expect(host.globalFilterEvents).toEqual(['gamma']);
    expect(host.paginationEvents.at(-1)?.pageIndex).toBe(0);
  });

  it('reorders visible center columns and emits the next column order when uncontrolled', async () => {
    await recreateHost();
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    expect(leafHeaderGroup).toBeTruthy();

    table.onHeaderDrop(createDropEvent('region', 1, 2), leafHeaderGroup!);
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'status', 'region', 'throughput']);
    expect(host.stateEvents.at(-1)?.columnOrder).toEqual([
      'name',
      'status',
      'region',
      'throughput',
    ]);
  });

  it('matches the stable row id during global filtering without requiring an id column', () => {
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    table.patchState({
      globalFilter: 'svc-00003',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Gamma');
  });

  it('respects controlled state slices without mutating the rendered table', () => {
    host.state.set({
      columnVisibility: {
        region: false,
      },
    });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Region');

    table.patchState({
      columnVisibility: (currentVisibility) => ({
        ...currentVisibility,
        region: true,
      }),
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Region');
    expect(host.stateEvents.length).toBeGreaterThan(0);
  });

  it('lets callers override accessibility summaries and live announcements', async () => {
    const accessibilityText: NatTableAccessibilityText = {
      reorderKeyboardInstructions:
        'Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.',
      tableSummary: ({
        visibleRowsText,
        totalRowsText,
        visibleColumnsText,
        pageText,
        pageCountText,
      }) =>
        `Oversigt ${visibleRowsText}/${totalRowsText}/${visibleColumnsText}/${pageText}/${pageCountText}`,
      filteringChange: ({ query, visibleRowsText }) => `Filter ${query}:${visibleRowsText}`,
      sortingChange: ({ columnLabel, sortState }) => `Sortering ${columnLabel}:${sortState}`,
      pageChange: ({ pageText, pageCountText, visibleRowsText }) =>
        `Side ${pageText}/${pageCountText}:${visibleRowsText}`,
    };
    await recreateHost({
      enablePagination: true,
      accessibilityText,
    });
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const describedByIds = table.getAttribute('aria-describedby')?.split(' ') ?? [];
    const summary = fixture.nativeElement.querySelector(
      `#${describedByIds[0] ?? ''}`,
    ) as HTMLElement;
    const instructions = fixture.nativeElement.querySelector(
      `#${describedByIds.at(-1) ?? ''}`,
    ) as HTMLElement;
    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;
    const tableComponent = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    expect(summary.textContent?.trim()).toBe('Oversigt 2/6/4/1/3');
    expect(instructions.textContent).toContain(
      'Brug Control+Shift+Piletaster til at flytte kolonner. Brug Command+Shift på macOS.',
    );

    tableComponent.table.nextPage();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('Side 2/3:2');

    tableComponent.patchState({
      globalFilter: 'gamma',
      pagination: (currentPagination) => ({
        ...currentPagination,
        pageIndex: 0,
      }),
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('Filter gamma:1');

    tableComponent.patchState({
      sorting: [{ id: 'name', desc: false }],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('Sortering Service:ascending');
  });

  it('uses provider accessibility defaults and lets table inputs override them', () => {
    const providerFixture = TestBed.createComponent(ProviderAccessibilityHost);
    const providerHost = providerFixture.componentInstance;

    providerFixture.detectChanges();

    let summary = providerFixture.nativeElement.querySelector('p[id$="-summary"]') as HTMLElement;
    let emptyState = providerFixture.nativeElement.querySelector('.empty-state') as HTMLElement;
    let instructions = providerFixture.nativeElement.querySelector(
      'p[id$="-instructions"]',
    ) as HTMLElement;

    expect(summary.textContent?.trim()).toBe('Provider summary n0/n0');
    expect(emptyState.textContent?.trim()).toBe('Provider empty state');
    expect(instructions.textContent?.trim()).toBe(
      'Provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.',
    );

    providerHost.accessibilityText.set({
      emptyState: 'Input empty state',
      tableSummary: ({ visibleRowsText }) => `Input summary ${visibleRowsText}`,
    });
    providerFixture.detectChanges();

    summary = providerFixture.nativeElement.querySelector('p[id$="-summary"]') as HTMLElement;
    emptyState = providerFixture.nativeElement.querySelector('.empty-state') as HTMLElement;
    instructions = providerFixture.nativeElement.querySelector(
      'p[id$="-instructions"]',
    ) as HTMLElement;

    expect(summary.textContent?.trim()).toBe('Input summary n0');
    expect(emptyState.textContent?.trim()).toBe('Input empty state');
    expect(instructions.textContent?.trim()).toBe(
      'Provider keyboard instructions. Press Control+Shift+Left Arrow or Control+Shift+Right Arrow to reorder columns within their current pinned region. On macOS, press Command+Shift+Left Arrow or Command+Shift+Right Arrow.',
    );
  });

  it('renders built-in loading and error rows as spanning table body cells', async () => {
    host.rows.set([]);
    host.accessibilityText = {
      loadingState: 'Loading operations.',
      errorState: 'Operations failed.',
    };
    host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const loadingCell = fixture.nativeElement.querySelector(
      '.loading-state',
    ) as HTMLTableCellElement;

    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(loadingCell.colSpan).toBe(4);
    expect(loadingCell.textContent?.trim()).toBe('Loading operations.');

    host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorCell = fixture.nativeElement.querySelector('.error-state') as HTMLTableCellElement;
    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    expect(table.getAttribute('aria-busy')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(errorCell.colSpan).toBe(4);
    expect(errorCell.textContent?.trim()).toBe('Operations failed.');
    expect(liveRegion.textContent?.trim()).toBe('Operations failed.');
  });

  it('keeps existing rows visible during background loading while exposing aria-busy', () => {
    fixture.detectChanges();

    host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;

    expect(table.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('.loading-state')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(6);
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

    const summary = stateFixture.nativeElement.querySelector('p[id$="-summary"]') as HTMLElement;
    const errorCell = stateFixture.nativeElement.querySelector('.error-state') as HTMLElement;
    const errorButton = errorCell.querySelector('.custom-error') as HTMLButtonElement;

    expect(stateFixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(stateFixture.nativeElement.querySelectorAll('tbody tr.data-row').length).toBe(0);
    expect(summary.textContent?.trim()).toBe('No rows are currently shown. 4 visible columns.');
    expect(errorButton.dataset['rowCounts']).toBe('0/0');

    stateFixture.destroy();
  });

  it('renders caller-provided state templates with table state context', async () => {
    const stateFixture = TestBed.createComponent(StateTemplatesHost);
    const stateHost = stateFixture.componentInstance;

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
    stateFixture.detectChanges();

    let stateCell = stateFixture.nativeElement.querySelector('.loading-state') as HTMLElement;

    expect(stateCell.textContent?.replaceAll(/\s+/g, ' ').trim()).toBe('loading 0');

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.success);
    stateHost.state.set({ globalFilter: 'missing' });
    stateFixture.detectChanges();
    await stateFixture.whenStable();
    stateFixture.detectChanges();

    stateCell = stateFixture.nativeElement.querySelector('.empty-state') as HTMLElement;

    expect(stateCell.textContent?.replaceAll(/\s+/g, ' ').trim()).toBe('Filtered empty 4');

    stateHost.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
    stateHost.error.set(new Error('API unavailable'));
    stateFixture.detectChanges();
    await stateFixture.whenStable();
    stateFixture.detectChanges();

    stateCell = stateFixture.nativeElement.querySelector('.error-state') as HTMLElement;
    const errorButton = stateCell.querySelector('.custom-error') as HTMLButtonElement;

    expect(stateCell.textContent?.trim()).toBe('API unavailable');
    expect(errorButton.textContent).toContain('API unavailable');
    expect(errorButton.getAttribute(NAT_TABLE_MANAGED_CELL_WIDGET_ATTRIBUTE)).toBe('');
    expect(errorButton.tabIndex).toBe(-1);

    stateCell.focus();
    stateCell.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    stateFixture.detectChanges();

    expect(document.activeElement).toBe(errorButton);

    stateFixture.destroy();
  });

  it('keeps controlled columnOrder external while still emitting the requested next state', async () => {
    await recreateHost({
      state: {
        columnOrder: ['throughput', 'name', 'region', 'status'],
      },
    });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'throughput', 'region', 'status']);

    table.patchState({
      columnOrder: ['name', 'region', 'status', 'throughput'],
    });
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'throughput', 'region', 'status']);
    expect(host.stateEvents.at(-1)?.columnOrder).toEqual([
      'name',
      'region',
      'status',
      'throughput',
    ]);
  });

  it('keeps hidden columns in their stored order when they are shown again', async () => {
    await recreateHost();
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    table.patchState({
      columnVisibility: {
        status: false,
      },
    });
    fixture.detectChanges();

    const updatedLeafHeaderGroup = table.table.getHeaderGroups().at(-1);

    expect(updatedLeafHeaderGroup).toBeTruthy();

    table.onHeaderDrop(createDropEvent('throughput', 2, 1), updatedLeafHeaderGroup!);
    fixture.detectChanges();

    table.patchState({
      columnVisibility: {
        status: true,
      },
    });
    fixture.detectChanges();

    expect(host.stateEvents.at(-1)?.columnOrder).toEqual([
      'name',
      'throughput',
      'status',
      'region',
    ]);
    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'throughput', 'status', 'region']);
  });

  it('reorders pinned left and right columns within their own zones', async () => {
    await recreateHost({
      initialState: {
        ...host.initialState,
        columnPinning: {
          left: ['name', 'region'],
          right: ['status', 'throughput'],
        },
      },
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    expect(leafHeaderGroup).toBeTruthy();

    table.onHeaderDrop(createDropEvent('name', 0, 1), leafHeaderGroup!);
    fixture.detectChanges();
    table.onHeaderDrop(createDropEvent('status', 2, 3), leafHeaderGroup!);
    fixture.detectChanges();

    expect(host.stateEvents.at(-1)?.columnPinning).toEqual({
      left: ['region', 'name'],
      right: ['throughput', 'status'],
    });
    expect(getHeaderColumnIds(fixture)).toEqual(['region', 'name', 'throughput', 'status']);
  });

  it('ignores attempted cross-zone drops', async () => {
    await recreateHost({
      initialState: {
        ...host.initialState,
        columnPinning: {
          left: ['name'],
          right: [],
        },
      },
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const leafHeaderGroup = table.table.getHeaderGroups().at(-1);

    expect(leafHeaderGroup).toBeTruthy();

    host.stateEvents.length = 0;

    table.onHeaderDrop(createDropEvent('region', 1, 0), leafHeaderGroup!);
    fixture.detectChanges();

    expect(host.stateEvents.length).toBe(0);
    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'region', 'status', 'throughput']);
  });

  it('renders TanStack size hints and uses them for initial pin offsets', () => {
    host.state.set({
      columnPinning: {
        left: ['name', 'region'],
        right: [],
      },
    });
    fixture.detectChanges();

    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const bodyCells = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:first-child th, tbody tr:first-child td'),
    ) as HTMLElement[];

    expect(fixture.nativeElement.querySelector('colgroup')).toBeNull();
    expect(headers[0]?.style.width).toBe('');
    expect(headers[0]?.style.minWidth).toBe('');
    expect(headers[0]?.style.maxWidth).toBe('');
    expect(headers[1]?.style.width).toBe('');
    expect(headers[1]?.style.minWidth).toBe('');
    expect(headers[1]?.style.maxWidth).toBe('');
    expect(bodyCells[0]?.style.width).toBe('180px');
    expect(bodyCells[0]?.style.minWidth).toBe('120px');
    expect(headers[0]?.style.left).toBe('0px');
    expect(headers[1]?.style.left).toBe('180px');
    expect(bodyCells[1]?.style.left).toBe('180px');
    expect(headers[0]?.dataset['columnId']).toBe('name');
  });

  it('applies optional header sizing from column meta without affecting body cells', async () => {
    @Component({
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [data]="rows()" [columns]="columns" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class HeaderSizingHost {
      readonly rows = signal<Row[]>([
        {
          id: 'svc-header',
          name: 'Service',
          region: 'eu-central-1',
          status: 'Healthy',
          throughput: 1000,
        },
      ]);
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          size: 96,
          minSize: 80,
          meta: {
            label: 'Service',
            rowHeader: true,
            headerSize: 140,
            headerMinSize: 120,
          },
          cell: (info) => info.getValue<string>(),
        },
      ];
    }

    const headerFixture = TestBed.createComponent(HeaderSizingHost);

    await headerFixture.whenStable();
    headerFixture.detectChanges();

    const header = headerFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const bodyCell = headerFixture.nativeElement.querySelector(
      'tbody th[data-column-id="name"]',
    ) as HTMLElement;

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
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface [initialState]="initialState">
          <nat-table [data]="rows()" [columns]="columns" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class ColumnWidthHost {
      readonly rows = signal<Row[]>([
        {
          id: 'svc-width',
          name: 'Very long service name that should be truncated',
          region: 'eu-central-1 with extra routing detail',
          status: 'Healthy',
          throughput: 1000,
        },
      ]);
      readonly initialState: Partial<NatTableState> = {
        columnPinning: {
          left: ['name', 'region', 'status'],
          right: [],
        },
      };
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          size: 96,
          minSize: 80,
          enablePinning: true,
          meta: { label: 'Service', rowHeader: true },
          cell: (info) => info.getValue<string>(),
        },
        {
          accessorKey: 'region',
          header: 'Region',
          maxSize: 192,
          enablePinning: true,
          meta: { label: 'Region' },
          cell: (info) => info.getValue<string>(),
        },
        {
          accessorKey: 'status',
          header: 'Status',
          enablePinning: true,
          meta: { label: 'Status' },
          cell: (info) => info.getValue<string>(),
        },
      ];
    }

    const widthFixture = TestBed.createComponent(ColumnWidthHost);

    await widthFixture.whenStable();
    widthFixture.detectChanges();

    const fixedHeader = widthFixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const cappedHeader = widthFixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLElement;
    const fixedCell = widthFixture.nativeElement.querySelector(
      'tbody th[data-column-id="name"]',
    ) as HTMLElement;
    const cappedCell = widthFixture.nativeElement.querySelector(
      'tbody td[data-column-id="region"]',
    ) as HTMLElement;
    const intrinsicHeader = widthFixture.nativeElement.querySelector(
      'thead th[data-column-id="status"]',
    ) as HTMLElement;
    const intrinsicCell = widthFixture.nativeElement.querySelector(
      'tbody td[data-column-id="status"]',
    ) as HTMLElement;

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
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [data]="rows()" [columns]="columns" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class CellHeightHost {
      readonly rows = signal<Row[]>([
        {
          id: 'svc-cell-height',
          name: 'Very long service name that should wrap onto multiple visible lines',
          region: 'eu-central-1 with additional routing detail',
          status: 'Healthy',
          throughput: 1000,
        },
      ]);
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          accessorKey: 'name',
          header: 'Service',
          meta: {
            label: 'Service',
            rowHeader: true,
            cellHeight: 72,
            cellMaxLines: 3,
          },
          cell: (info) => info.getValue<string>(),
        },
        {
          accessorKey: 'region',
          header: 'Region',
          meta: {
            label: 'Region',
            cellMaxLines: Infinity,
          },
          cell: (info) => info.getValue<string>(),
        },
        {
          accessorKey: 'status',
          header: 'Status',
          meta: { label: 'Status' },
          cell: (info) => info.getValue<string>(),
        },
        {
          accessorKey: 'throughput',
          header: 'Throughput',
          meta: {
            label: 'Throughput',
            cellMaxLines: 0,
          },
          cell: (info) => `${info.getValue<number>()} req/s`,
        },
      ];
    }

    const cellHeightFixture = TestBed.createComponent(CellHeightHost);

    await cellHeightFixture.whenStable();
    cellHeightFixture.detectChanges();

    const serviceCell = cellHeightFixture.nativeElement.querySelector(
      'tbody th[data-column-id="name"]',
    ) as HTMLElement;
    const regionCell = cellHeightFixture.nativeElement.querySelector(
      'tbody td[data-column-id="region"]',
    ) as HTMLElement;
    const statusCell = cellHeightFixture.nativeElement.querySelector(
      'tbody td[data-column-id="status"]',
    ) as HTMLElement;
    const throughputCell = cellHeightFixture.nativeElement.querySelector(
      'tbody td[data-column-id="throughput"]',
    ) as HTMLElement;

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

    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLTableCellElement;
    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'status', 'region', 'throughput']);
    expect(liveRegion.textContent?.trim()).toBe(
      'Moved Region column to position 2 of 3 in the unpinned region.',
    );
  });

  it('reorders columns with Command+Shift+Arrow from the keyboard', async () => {
    await recreateHost();
    fixture.detectChanges();

    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLTableCellElement;

    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        metaKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'status', 'region', 'throughput']);
  });

  it('scrolls the reordered header into view when keyboard moving right past the viewport edge', async () => {
    await recreateHost();
    fixture.detectChanges();

    const tableRegion = fixture.nativeElement.querySelector(
      '[data-testid="nat-table-region"]',
    ) as HTMLElement;
    const regionHeader = fixture.nativeElement.querySelector(
      '[data-testid="nat-table-header-region"]',
    ) as HTMLTableCellElement;

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
        cancelable: true,
      }),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'status', 'region', 'throughput']);
    expect(tableRegion.scrollLeft).toBe(130);
  });

  it('does not reorder columns unless a single primary modifier and Shift are used', async () => {
    await recreateHost();
    fixture.detectChanges();

    const statusHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="status"]',
    ) as HTMLTableCellElement;
    const expectedColumnIds = ['name', 'region', 'status', 'throughput'];

    const blockedEvents: readonly KeyboardEventInit[] = [
      { key: 'ArrowLeft', shiftKey: true },
      { key: 'ArrowLeft', ctrlKey: true },
      { key: 'ArrowLeft', metaKey: true },
      { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, altKey: true },
      { key: 'ArrowLeft', ctrlKey: true, shiftKey: true, metaKey: true },
      { key: 'ArrowLeft', metaKey: true, shiftKey: true, altKey: true },
    ];

    for (const eventInit of blockedEvents) {
      statusHeader.focus();
      statusHeader.dispatchEvent(
        new KeyboardEvent('keydown', {
          ...eventInit,
          bubbles: true,
          cancelable: true,
        }),
      );
      fixture.detectChanges();

      expect(getHeaderColumnIds(fixture)).toEqual(expectedColumnIds);
    }
  });

  it('consumes keyboard reorder shortcuts at region edges without moving focus', async () => {
    await recreateHost();
    fixture.detectChanges();

    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLTableCellElement;
    const edgeEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });

    host.stateEvents.length = 0;
    regionHeader.focus();
    regionHeader.dispatchEvent(edgeEvent);
    fixture.detectChanges();

    expect(edgeEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(regionHeader);
    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'region', 'status', 'throughput']);
    expect(host.stateEvents).toEqual([]);
  });

  it('uses the explicit pin order when computing sticky left offsets', () => {
    host.state.set({
      columnPinning: {
        left: ['region', 'name'],
        right: [],
      },
    });
    fixture.detectChanges();

    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLElement;
    const nameHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="name"]',
    ) as HTMLElement;
    const regionCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="region"]',
    ) as HTMLElement;
    const nameCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child th[data-column-id="name"]',
    ) as HTMLElement;

    expect(regionHeader.style.left).toBe('0px');
    expect(nameHeader.style.left).toBe('140px');
    expect(regionCell.style.left).toBe('0px');
    expect(nameCell.style.left).toBe('140px');
  });

  it('moves focus with arrow keys and stops at the grid edge', () => {
    fixture.detectChanges();

    const firstRowCells = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:first-child th, tbody tr:first-child td'),
    ) as HTMLElement[];
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
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table [data]="rows()" [columns]="columns()" accessibleName="Operations table" />
        </nat-table-surface>
      `,
    })
    class DynamicColumnsHost {
      readonly rows = signal<Row[]>(buildRows(3));
      readonly columns = dynamicColumns;
    }

    const dynamicFixture = TestBed.createComponent(DynamicColumnsHost);

    await dynamicFixture.whenStable();
    dynamicFixture.detectChanges();

    const liveRegion = dynamicFixture.nativeElement.querySelector(
      'p[aria-live="polite"]',
    ) as HTMLElement;

    expect(liveRegion.textContent?.trim()).toBe('');

    dynamicColumns.set(buildDynamicColumns('Servicio'));
    dynamicFixture.detectChanges();
    await dynamicFixture.whenStable();
    dynamicFixture.detectChanges();

    expect(liveRegion.textContent?.trim()).toBe('');
  });

  it('normalizes sorting state to a single column when multiple entries are supplied', async () => {
    await recreateHost({
      state: {
        sorting: [
          { id: 'name', desc: false },
          { id: 'region', desc: true },
        ],
      },
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    expect(table.table.getState().sorting).toEqual([{ id: 'name', desc: false }]);

    const sortedHeaders = Array.from(
      fixture.nativeElement.querySelectorAll('thead th[aria-sort]'),
    ) as HTMLTableCellElement[];

    expect(sortedHeaders.length).toBe(1);
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
        { id: 'throughput', desc: true },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(table.table.getState().sorting).toEqual([{ id: 'name', desc: false }]);
    expect(host.sortingEvents.at(-1)).toEqual([{ id: 'name', desc: false }]);

    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    expect(liveRegion.textContent?.trim()).toBe('Sorted by Service ascending.');
  });

  it('keeps multiple sort columns but only exposes aria-sort on the primary header', async () => {
    await recreateHost({
      enableMultiSort: true,
      state: {
        sorting: [
          { id: 'name', desc: false },
          { id: 'region', desc: true },
        ],
      },
    });
    fixture.detectChanges();

    const table = getInternalTable(fixture);

    expect(table.table.getState().sorting).toEqual([
      { id: 'name', desc: false },
      { id: 'region', desc: true },
    ]);

    const sortedHeaders = Array.from(
      fixture.nativeElement.querySelectorAll('thead th[aria-sort]'),
    ) as HTMLTableCellElement[];

    expect(sortedHeaders.map((header) => header.dataset['columnId'])).toEqual(['name']);
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
        { id: 'region', desc: true },
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.sortingEvents.at(-1)).toEqual([
      { id: 'name', desc: false },
      { id: 'region', desc: true },
    ]);

    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    expect(liveRegion.textContent?.trim()).toBe(
      'Sorted by Service ascending, then Region descending.',
    );
  });

  it('does not expose aria-selected unless enableRowSelection is true', () => {
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('tbody tr.data-row') as HTMLElement;
    const table = fixture.nativeElement.querySelector('table') as HTMLElement;

    expect(row.getAttribute('aria-selected')).toBeNull();
    expect(table.getAttribute('aria-multiselectable')).toBeNull();
  });

  it('marks the grid aria-multiselectable only for multiple-mode row selection', async () => {
    await recreateHost({ enableRowSelection: true });
    fixture.detectChanges();

    let table = fixture.nativeElement.querySelector('table') as HTMLElement;

    expect(table.getAttribute('aria-multiselectable')).toBe('true');

    await recreateHost({ enableRowSelection: true, selectionMode: 'single' });
    fixture.detectChanges();

    table = fixture.nativeElement.querySelector('table') as HTMLElement;

    expect(table.getAttribute('aria-multiselectable')).toBeNull();
  });

  it('reflects controlled rowSelection through aria-selected', async () => {
    await recreateHost({
      enableRowSelection: true,
      state: { rowSelection: { 'svc-00002': true } },
    });
    fixture.detectChanges();

    const selected = Array.from(fixture.nativeElement.querySelectorAll('tbody tr.data-row')).filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true',
    );

    expect(selected.length).toBe(1);
  });

  it('collapses to the first selected row (by key order) in single mode', async () => {
    await recreateHost({
      enableRowSelection: true,
      selectionMode: 'single',
      state: { rowSelection: { 'svc-00002': true, 'svc-00001': true } },
    });
    fixture.detectChanges();

    const selected = Array.from(fixture.nativeElement.querySelectorAll('tbody tr.data-row')).filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true',
    );

    expect(selected.length).toBe(1);
    // Deterministic by sort order: svc-00001 wins even though svc-00002 was inserted first.
    expect(getInternalTable(fixture).table.getState().rowSelection).toEqual({ 'svc-00001': true });
  });

  it('preserves controlled rowSelection while selection is disabled', async () => {
    await recreateHost({
      enableRowSelection: false,
      state: { rowSelection: { 'svc-00001': true } },
    });
    fixture.detectChanges();
    await fixture.whenStable();

    // The disabled flag must not wipe the controlled slice (continuity for runtime toggles).
    expect(getInternalTable(fixture).table.getState().rowSelection).toEqual({ 'svc-00001': true });
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

    expect(host.rowSelectionEvents.at(-1)).toEqual({ 'svc-00001': true });

    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    expect(liveRegion.textContent?.trim()).toBe('1 row selected.');
  });

  it('retains row selection across pagination changes', async () => {
    await recreateHost({
      enableRowSelection: true,
      enablePagination: true,
      initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
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

    expect(table.table.getState().rowSelection).toEqual({ 'svc-00001': true });

    // Returning to the first page still shows the row selected.
    table.patchState({ pagination: (pagination) => ({ ...pagination, pageIndex: 0 }) });
    fixture.detectChanges();

    const firstRow = fixture.nativeElement.querySelector('tbody tr.data-row') as HTMLElement;

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

    const visibleRows = fixture.nativeElement.querySelectorAll('tbody tr.data-row');

    expect(visibleRows.length).toBe(1);
    expect((visibleRows[0] as HTMLElement).textContent).toContain('Gamma');
    // Selection is keyed by row id, so it survives the filter.
    expect(table.table.getState().rowSelection).toEqual({ 'svc-00001': true });

    // Clearing the filter brings Alpha back, still selected.
    table.patchState({ globalFilter: '' });
    fixture.detectChanges();

    const selectedRows = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr.data-row'),
    ).filter((row) => (row as HTMLElement).getAttribute('aria-selected') === 'true');

    expect(selectedRows.length).toBe(1);
    expect((selectedRows[0] as HTMLElement).textContent).toContain('Alpha');
  });

  it('emits rowActivate for primary clicks and Enter / Space presses on the row', () => {
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const firstRow = fixture.nativeElement.querySelector(
      'tbody tr.data-row',
    ) as HTMLTableRowElement;
    const expectedRowId = table.table.getRowModel().rows[0]?.original.id;

    expect(expectedRowId).toBeDefined();

    firstRow.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    fixture.detectChanges();

    expect(host.rowActivateEvents.length).toBe(1);
    expect(host.rowActivateEvents.at(-1)?.rowData.id).toBe(expectedRowId);
    expect(host.rowActivateEvents.at(-1)?.originalEvent).toBeInstanceOf(MouseEvent);

    firstRow.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.rowActivateEvents.length).toBe(2);
    expect(host.rowActivateEvents.at(-1)?.originalEvent).toBeInstanceOf(KeyboardEvent);

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    firstRow.dispatchEvent(spaceEvent);
    fixture.detectChanges();

    expect(host.rowActivateEvents.length).toBe(3);
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it('does not emit rowActivate when activation originates from an interactive cell descendant', async () => {
    @Component({
      imports: [NatTable, TestTableSurface],
      template: `
        <nat-table-surface>
          <nat-table
            [data]="rows()"
            [columns]="columns"
            accessibleName="Operations table"
            (rowActivate)="onRowActivate($event)"
          />
        </nat-table-surface>
      `,
    })
    class InteractiveCellHost {
      readonly rows = signal<Row[]>(buildRows(2));
      readonly columns: ColumnDef<Row, unknown>[] = [
        {
          id: 'select',
          header: 'Select',
          enableSorting: false,
          enableGlobalFilter: false,
          cell: () => '<button type="button" class="row-action">Select</button>',
        },
        {
          accessorKey: 'name',
          header: 'Service',
          meta: { label: 'Service', rowHeader: true },
          cell: (info) => info.getValue<string>(),
        },
      ];
      readonly events: NatTableRowActivateEvent<Row>[] = [];

      onRowActivate(event: NatTableRowActivateEvent<Row>): void {
        this.events.push(event);
      }
    }

    const interactiveFixture = TestBed.createComponent(InteractiveCellHost);

    await interactiveFixture.whenStable();
    interactiveFixture.detectChanges();

    const cell = interactiveFixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="select"]',
    ) as HTMLElement;

    cell.innerHTML = '<button type="button" class="row-action">Select</button>';
    interactiveFixture.detectChanges();

    const button = cell.querySelector('button.row-action') as HTMLButtonElement;

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
    interactiveFixture.detectChanges();

    expect(interactiveFixture.componentInstance.events.length).toBe(0);
  });

  it('moves focus into a cell control with Enter and back to the cell with Escape', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    cell.innerHTML =
      '<button type="button" class="cell-action">Edit</button>' +
      '<button type="button" class="cell-action">Delete</button>';

    const [editButton] = Array.from(cell.querySelectorAll<HTMLButtonElement>('button.cell-action'));

    cell.focus();

    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    cell.dispatchEvent(enterEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(editButton);
    expect(enterEvent.defaultPrevented).toBe(true);
    expect(host.rowActivateEvents.length).toBe(0);

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });

    editButton.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);
    expect(escapeEvent.defaultPrevented).toBe(true);
  });

  it('lets Enter on a control-less cell fall through to row activation', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    cell.focus();
    cell.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(host.rowActivateEvents.length).toBe(1);
  });

  it("walks the cell's controls with Tab and Shift+Tab and releases Tab at the cell edges", () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    cell.innerHTML =
      '<button type="button" class="first">First</button>' +
      '<button type="button" class="second">Second</button>';

    const firstButton = cell.querySelector('button.first') as HTMLButtonElement;
    const secondButton = cell.querySelector('button.second') as HTMLButtonElement;

    // Plain Tab on a focused cell is not intercepted, so focus can leave the grid.
    cell.focus();

    const tabFromCell = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    cell.dispatchEvent(tabFromCell);
    fixture.detectChanges();

    expect(tabFromCell.defaultPrevented).toBe(false);

    // Tab from a control walks to the next control of the same cell.
    firstButton.focus();
    firstButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(secondButton);

    // Shift+Tab walks back.
    secondButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(firstButton);

    // Tab past the cell's last control is not handled, so focus can leave the grid.
    const leaveEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    secondButton.dispatchEvent(leaveEvent);
    fixture.detectChanges();

    expect(leaveEvent.defaultPrevented).toBe(false);
  });

  it('skips non-tabbable controls but keeps roving grid-cell widgets reachable', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

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
    firstButton.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(widgetButton);
  });

  it('delegates focus to a header cell whose only content is its sort button', () => {
    fixture.detectChanges();

    const headerCell = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLElement;

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
      cancelable: true,
    });

    sortButton.dispatchEvent(escapeEvent);
    fixture.detectChanges();

    expect(escapeEvent.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(sortButton);
  });

  it('delegates focus to a body cell whose only perceivable content is one arrow-safe control', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    // Decorative content hidden from assistive technology does not block delegation.
    cell.innerHTML =
      '<span aria-hidden="true">icon</span>' +
      '<button type="button" class="cell-action">Acknowledge</button>';

    const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('keeps the Enter model when a single control sits next to other cell content', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    cell.innerHTML = 'EMEA <button type="button" class="cell-action">Edit</button>';

    const button = cell.querySelector('button.cell-action') as HTMLButtonElement;

    // Focus stays on the cell so screen readers announce the text content too.
    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);

    cell.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
  });

  it('keeps the Enter model for a single arrow-consuming control', () => {
    fixture.detectChanges();

    const cell = fixture.nativeElement.querySelector(
      'tbody tr.data-row td[data-column-id="region"]',
    ) as HTMLElement;

    cell.innerHTML = '<input type="text" class="cell-input" aria-label="Region" />';

    const input = cell.querySelector('input.cell-input') as HTMLInputElement;

    // A text input needs arrow keys for itself, so the grid keeps focus on the cell.
    cell.focus();
    fixture.detectChanges();

    expect(document.activeElement).toBe(cell);

    cell.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(input);
  });

  it('applies sticky class and toggles vertical sticky header positioning', async () => {
    fixture.detectChanges();
    let tableElement = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(tableElement.classList.contains('has-sticky-header')).toBe(true);

    await recreateHost({ stickyHeader: false });
    fixture.detectChanges();
    tableElement = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    expect(tableElement.classList.contains('has-sticky-header')).toBe(false);
  });

  describe('manual mode', () => {
    it('does not paginate, sort, or filter client-side, but still tracks and emits state changes', async () => {
      await recreateHost({
        mode: 'manual',
        enablePagination: true,
        initialState: {
          sorting: [{ id: 'throughput', desc: true }],
          pagination: { pageIndex: 0, pageSize: 2 },
        },
        manualPageCount: 3,
      });

      fixture.detectChanges();

      // In manual mode, all rows must be rendered since client-side pagination, sorting, and filtering are disabled.
      const rows = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
      expect(rows.length).toBe(6);

      // Verify the rendered order is the original order (Alpha first), not sorted by throughput descending
      expect(rows[0].textContent).toContain('Alpha');

      // Trigger pagination change
      const table = getInternalTable(fixture);
      table.patchState({
        pagination: { pageIndex: 1, pageSize: 2 },
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.paginationEvents.at(-1)).toEqual({ pageIndex: 1, pageSize: 2 });

      // Rows must still not be sliced client-side
      const rowsAfterPage = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
      expect(rowsAfterPage.length).toBe(6);

      // Trigger sorting change
      table.patchState({
        sorting: [{ id: 'name', desc: false }],
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.sortingEvents.at(-1)).toEqual([{ id: 'name', desc: false }]);

      // Rows must still not be sorted client-side (Alpha first)
      const rowsAfterSort = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
      expect(rowsAfterSort[0].textContent).toContain('Alpha');
    });

    it('supports mixed mode configuration (e.g. manual pagination, auto sorting)', async () => {
      await recreateHost({
        mode: {
          pagination: 'manual',
          sorting: 'auto',
        },
        enablePagination: true,
        initialState: {
          sorting: [{ id: 'throughput', desc: true }],
          pagination: { pageIndex: 0, pageSize: 2 },
        },
        manualPageCount: 3,
      });

      fixture.detectChanges();

      // In mixed mode: pagination is manual, sorting is auto.
      // So sorting should be applied client-side (throughput desc).
      // But pagination is manual, so data should NOT be sliced client-side (all 6 rows rendered).
      const rows = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
      expect(rows.length).toBe(6);

      // Verify the rendered order is sorted by throughput descending (Zeta has highest throughput)
      expect(rows[0].textContent).toContain('Zeta');

      // Trigger pagination change
      const table = getInternalTable(fixture);
      table.patchState({
        pagination: { pageIndex: 1, pageSize: 2 },
      });
      fixture.detectChanges();

      // State should have updated, raising the output event
      expect(host.paginationEvents.at(-1)).toEqual({ pageIndex: 1, pageSize: 2 });

      // Rows must still not be sliced client-side
      const rowsAfterPage = fixture.nativeElement.querySelectorAll('tbody tr.data-row');
      expect(rowsAfterPage.length).toBe(6);
    });
  });
});

function buildDynamicColumns(nameHeader: string): ColumnDef<Row, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: nameHeader,
      size: 180,
      meta: { label: nameHeader, rowHeader: true },
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: 'region',
      header: 'Region',
      size: 140,
      meta: { label: 'Region' },
      cell: (info) => info.getValue<string>(),
    },
  ];
}

type NatTableInternals = NatTable<Row> & {
  onHeaderDrop(
    event: CdkDragDrop<string[]>,
    headerGroup: ReturnType<NatTable<Row>['table']['getHeaderGroups']>[number],
  ): void;
};

function getInternalTable(fixture: ComponentFixture<TableHost>): NatTableInternals {
  return fixture.debugElement.query(By.directive(NatTable)).componentInstance as NatTableInternals;
}

function createDropEvent(
  columnId: string,
  previousIndex: number,
  currentIndex: number,
): CdkDragDrop<string[]> {
  return {
    previousIndex,
    currentIndex,
    item: { data: columnId },
  } as unknown as CdkDragDrop<string[]>;
}

function getHeaderColumnIds(fixture: ComponentFixture<TableHost>): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('thead th[data-column-id]')).map(
    (header) => (header as HTMLElement).dataset['columnId'] ?? '',
  );
}

function mockClientRect(element: HTMLElement, rect: Partial<DOMRectReadOnly>): void {
  const left = rect.left ?? 0;
  const top = rect.top ?? 0;
  const width = rect.width ?? (rect.right ?? left) - left;
  const height = rect.height ?? (rect.bottom ?? top) - top;
  const right = rect.right ?? left + width;
  const bottom = rect.bottom ?? top + height;

  element.getBoundingClientRect = () =>
    ({
      x: left,
      y: top,
      left,
      top,
      right,
      bottom,
      width,
      height,
      toJSON: () => ({}),
    }) as DOMRect;
}

function buildRows(size: number): Row[] {
  const statuses: Row['status'][] = ['Healthy', 'Pending', 'Alert'];

  return Array.from({ length: size }, (_, index) => ({
    id: `svc-${String(index + 1).padStart(5, '0')}`,
    name: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][index] ?? `Service ${index + 1}`,
    region: ['us-east-1', 'eu-west-3'][index % 2],
    status: statuses[index % statuses.length],
    throughput: 1000 + index * 1000,
  }));
}
