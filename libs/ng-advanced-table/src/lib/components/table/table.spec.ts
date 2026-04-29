import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import { NatTable } from './table';
import type {
  NatTableAccessibilityText,
  NatTableRowActivateEvent,
  NatTableState,
} from './table.types';

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
  imports: [NatTable],
  template: `
    <ng-template #expandedRow let-rowData let-collapse="collapse">
      <div class="expanded-detail">
        <span>{{ rowData.name }} diagnostics</span>
        <button type="button" class="collapse-detail" (click)="collapse()">Collapse</button>
      </div>
    </ng-template>

    <nat-table
      [data]="rows()"
      [columns]="columns"
      ariaLabel="Operations table"
      [initialState]="initialState"
      [state]="state()"
      [enableColumnReorder]="enableColumnReorder"
      [enablePagination]="enablePagination"
      [getRowId]="getRowId"
      [canExpandRow]="canExpandRow"
      [expandedRow]="expandedRow"
      [accessibilityText]="accessibilityText"
      (stateChange)="onStateChange($event)"
      (sortingChange)="onSortingChange($event)"
      (paginationChange)="onPaginationChange($event)"
      (globalFilterChange)="onGlobalFilterChange($event)"
      (columnFiltersChange)="onColumnFiltersChange($event)"
      (columnVisibilityChange)="onColumnVisibilityChange($event)"
      (columnOrderChange)="onColumnOrderChange($event)"
      (columnPinningChange)="onColumnPinningChange($event)"
      (expandedChange)="onExpandedChange($event)"
      (rowActivate)="onRowActivate($event)"
    />
  `,
})
class TableHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly state = signal<Partial<NatTableState>>({});
  readonly columns = columns;
  readonly getRowId = (row: Row) => row.id;
  readonly canExpandRow = (row: Row) => row.status !== 'Healthy';
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
  enableColumnReorder = false;
  accessibilityText: NatTableAccessibilityText = {};
  readonly stateEvents: NatTableState[] = [];
  readonly rowActivateEvents: NatTableRowActivateEvent<Row>[] = [];
  readonly sortingEvents: NatTableState['sorting'][] = [];
  readonly paginationEvents: NatTableState['pagination'][] = [];
  readonly globalFilterEvents: NatTableState['globalFilter'][] = [];
  readonly columnFiltersEvents: NatTableState['columnFilters'][] = [];
  readonly columnVisibilityEvents: NatTableState['columnVisibility'][] = [];
  readonly columnOrderEvents: NatTableState['columnOrder'][] = [];
  readonly columnPinningEvents: NatTableState['columnPinning'][] = [];
  readonly expandedEvents: NatTableState['expanded'][] = [];

  onStateChange(state: NatTableState): void {
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

  onExpandedChange(expanded: NatTableState['expanded']): void {
    this.expandedEvents.push(expanded);
  }

  onRowActivate(event: NatTableRowActivateEvent<Row>): void {
    this.rowActivateEvents.push(event);
  }
}

describe('NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function recreateHost(
    options: {
      enableColumnReorder?: boolean;
      enablePagination?: boolean;
      accessibilityText?: NatTableAccessibilityText;
      initialState?: Partial<NatTableState>;
      state?: Partial<NatTableState>;
    } = {},
  ): Promise<void> {
    fixture.destroy();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    host.enableColumnReorder = options.enableColumnReorder ?? host.enableColumnReorder;
    host.enablePagination = options.enablePagination ?? host.enablePagination;
    host.accessibilityText = options.accessibilityText ?? host.accessibilityText;
    host.initialState = options.initialState ?? host.initialState;

    if (options.state) {
      host.state.set(options.state);
    }

    await fixture.whenStable();
  }

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

  it('only renders reorder handles when enableColumnReorder is true', async () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header-cell.is-reorderable')).toBeNull();

    await recreateHost({ enableColumnReorder: true });
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
    expect(host.stateEvents.at(-1)?.pagination.pageIndex).toBe(0);
    expect(host.globalFilterEvents.at(-1)).toBe('gamma');
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Gamma');
  });

  it('renders expanded row content for rows that can expand when expansion is uncontrolled', () => {
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;
    const expandableRow = table.table.getRowModel().rows[0];

    expect(expandableRow.getCanExpand()).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-expanded-row-for]')).toBeNull();

    expandableRow.toggleExpanded();
    fixture.detectChanges();

    const expandedRow = fixture.nativeElement.querySelector(
      `[data-expanded-row-for="${expandableRow.id}"]`,
    ) as HTMLTableRowElement;

    expect(expandedRow).toBeTruthy();
    expect(expandedRow.textContent).toContain('Zeta diagnostics');
    expect(host.stateEvents.at(-1)?.expanded).toEqual({
      [expandableRow.id]: true,
    });
    expect(host.expandedEvents.at(-1)).toEqual({
      [expandableRow.id]: true,
    });
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
    await recreateHost({ enableColumnReorder: true });
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

  it('keeps controlled expanded state external while still emitting the requested next state', async () => {
    await recreateHost({
      state: {
        expanded: {
          'svc-00006': true,
        },
      },
    });
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(NatTable))
      .componentInstance as NatTable<Row>;
    const expandableRow = table.table.getRowModel().rows[0];

    expect(
      fixture.nativeElement.querySelector(`[data-expanded-row-for="${expandableRow.id}"]`),
    ).toBeTruthy();

    expandableRow.toggleExpanded(false);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(`[data-expanded-row-for="${expandableRow.id}"]`),
    ).toBeTruthy();
    expect(host.stateEvents.at(-1)?.expanded).toEqual({});
  });

  it('lets callers override accessibility summaries and live announcements', async () => {
    const accessibilityText: NatTableAccessibilityText = {
      reorderKeyboardInstructions: 'Brug Alt+Shift til at flytte kolonner.',
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
      enableColumnReorder: true,
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
    expect(instructions.textContent).toContain('Brug Alt+Shift til at flytte kolonner.');

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

  it('keeps controlled columnOrder external while still emitting the requested next state', async () => {
    await recreateHost({
      enableColumnReorder: true,
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
    await recreateHost({ enableColumnReorder: true });
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
      enableColumnReorder: true,
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
      enableColumnReorder: true,
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

    table.onHeaderDrop(createDropEvent('region', 1, 0), leafHeaderGroup!);
    fixture.detectChanges();

    expect(host.stateEvents.length).toBe(0);
    expect(getHeaderColumnIds(fixture)).toEqual(['name', 'region', 'status', 'throughput']);
  });

  it('lets the browser size columns intrinsically while driving pin offsets from column sizes', () => {
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
    expect(headers[0]?.style.maxWidth).toBe('');
    expect(headers[0]?.style.minWidth).toBe('180px');
    expect(headers[1]?.style.minWidth).toBe('140px');
    expect(bodyCells[0]?.style.width).toBe('');
    expect(bodyCells[0]?.style.minWidth).toBe('180px');
    expect(headers[0]?.style.left).toBe('0px');
    expect(headers[1]?.style.left).toBe('180px');
    expect(bodyCells[1]?.style.left).toBe('180px');
    expect(headers[0]?.dataset['columnId']).toBe('name');
  });

  it('reorders columns from the keyboard and announces the move', async () => {
    await recreateHost({ enableColumnReorder: true });
    fixture.detectChanges();

    const regionHeader = fixture.nativeElement.querySelector(
      'thead th[data-column-id="region"]',
    ) as HTMLTableCellElement;
    const liveRegion = fixture.nativeElement.querySelector('p[aria-live="polite"]') as HTMLElement;

    regionHeader.focus();
    regionHeader.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        shiftKey: true,
        bubbles: true,
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
      imports: [NatTable],
      template: `
        <nat-table [data]="rows()" [columns]="columns()" ariaLabel="Operations table" />
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

  it('emits rowActivate for primary clicks and Enter / Space presses on the row', () => {
    fixture.detectChanges();

    const table = getInternalTable(fixture);
    const firstRow = fixture.nativeElement.querySelector('tbody tr.data-row') as HTMLTableRowElement;
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
      imports: [NatTable],
      template: `
        <nat-table
          [data]="rows()"
          [columns]="columns"
          ariaLabel="Operations table"
          (rowActivate)="onRowActivate($event)"
        />
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
