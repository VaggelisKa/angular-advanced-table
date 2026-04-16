import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { type ColumnDef, type FilterFn } from '@tanstack/angular-table';

import { NatTable } from './table';
import type { NatTableState } from './table.types';

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
    <nat-table
      [data]="rows()"
      [columns]="columns"
      ariaLabel="Operations table"
      [initialState]="initialState"
      [state]="state()"
      [enableGlobalFilter]="enableGlobalFilter"
      [showColumnVisibility]="showColumnVisibility"
      [showPagination]="showPagination"
      [getRowId]="getRowId"
      (stateChange)="onStateChange($event)"
    />
  `,
})
class TableHost {
  readonly rows = signal<Row[]>(buildRows(6));
  readonly state = signal<Partial<NatTableState>>({});
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
  enableGlobalFilter = true;
  showColumnVisibility = true;
  showPagination = true;
  readonly stateEvents: NatTableState[] = [];

  onStateChange(state: NatTableState): void {
    this.stateEvents.push(state);
  }
}

describe('NatTable', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders caller-provided columns and rows using the initial state', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const headerLabels = headers.map((header) =>
      header.textContent?.replaceAll(/\s+/g, ' ').trim(),
    );
    const firstPinButton = fixture.nativeElement.querySelector('.pin-button') as HTMLButtonElement;

    expect(rows.length).toBe(2);
    expect(headerLabels[0]).toContain('Service');
    expect(headerLabels[1]).toContain('Region');
    expect(firstPinButton.textContent?.trim()).toBe('Unpin');
    expect(fixture.nativeElement.querySelector('tbody tr')?.textContent).toContain('Zeta');
  });

  it('applies semantic tone attributes from column metadata', () => {
    fixture.detectChanges();

    const throughputCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="throughput"]',
    ) as HTMLTableCellElement;

    expect(throughputCell.getAttribute('data-tone')).toBe('positive');
  });

  it('emits state changes for search, sort, visibility, pinning, and pagination', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#table-search') as HTMLInputElement;
    const sortButtons = fixture.nativeElement.querySelectorAll('.sort-button');
    const regionToggle = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="region"]',
    ) as HTMLButtonElement;
    const pinButtons = fixture.nativeElement.querySelectorAll('.pin-button');
    const nextButton = fixture.nativeElement.querySelector(
      '.pager-button:last-child',
    ) as HTMLButtonElement;

    searchInput.value = 'svc';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    sortButtons[1].click();
    fixture.detectChanges();

    regionToggle.click();
    fixture.detectChanges();

    pinButtons[0].click();
    fixture.detectChanges();

    nextButton.click();
    fixture.detectChanges();

    expect(host.stateEvents[0]?.globalFilter).toBe('svc');
    expect(host.stateEvents[0]?.pagination.pageIndex).toBe(0);
    expect(host.stateEvents.some((state) => state.sorting[0]?.id === 'region')).toBe(true);
    expect(
      host.stateEvents.some((state) => state.columnVisibility['region'] === false),
    ).toBe(true);
    expect(
      host.stateEvents.some((state) => (state.columnPinning.left?.length ?? 0) === 0),
    ).toBe(true);
    expect(host.stateEvents.at(-1)?.pagination.pageIndex).toBe(1);
  });

  it('only renders the pinned divider on the outer edge of the pinned group', () => {
    fixture.detectChanges();

    let headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const pinButtons = fixture.nativeElement.querySelectorAll(
      '.pin-button',
    ) as NodeListOf<HTMLButtonElement>;

    expect(headers[0]?.classList.contains('has-pinned-edge-left')).toBe(true);
    expect(headers[1]?.classList.contains('has-pinned-edge-left')).toBe(false);

    pinButtons[1]?.click();
    fixture.detectChanges();

    headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];

    expect(headers[0]?.classList.contains('has-pinned-edge-left')).toBe(false);
    expect(headers[1]?.classList.contains('has-pinned-edge-left')).toBe(true);
  });

  it('uses the same explicit width model for rendered columns and pinned offsets', () => {
    host.state.set({
      columnPinning: {
        left: ['name', 'region'],
        right: [],
      },
    });
    fixture.detectChanges();

    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const bodyCells = Array.from(
      fixture.nativeElement.querySelectorAll('tbody tr:first-child td'),
    ) as HTMLElement[];
    const colElements = Array.from(
      fixture.nativeElement.querySelectorAll('colgroup col'),
    ) as HTMLTableColElement[];

    expect(colElements[0]?.style.width).toBe('180px');
    expect(colElements[1]?.style.width).toBe('140px');
    expect(headers[0]?.style.width).toBe('180px');
    expect(headers[1]?.style.width).toBe('140px');
    expect(headers[0]?.style.left).toBe('0px');
    expect(headers[1]?.style.left).toBe('180px');
    expect(bodyCells[0]?.style.width).toBe('180px');
    expect(bodyCells[1]?.style.width).toBe('140px');
    expect(bodyCells[1]?.style.left).toBe('180px');
  });

  it('respects controlled state slices without mutating the rendered table', () => {
    host.state.set({
      columnVisibility: {
        region: false,
      },
    });
    fixture.detectChanges();

    const regionToggle = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="region"]',
    ) as HTMLButtonElement;

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Region');

    regionToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Region');
    expect(host.stateEvents.length).toBeGreaterThan(0);
  });

  it('keeps at least one column visible', () => {
    fixture.detectChanges();

    const columnIds = ['region', 'status', 'throughput'];

    for (const columnId of columnIds) {
      const columnToggle = fixture.nativeElement.querySelector(
        `.column-chip[data-column-id="${columnId}"]`,
      ) as HTMLButtonElement;

      columnToggle.click();
      fixture.detectChanges();
    }

    const serviceToggle = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="name"]',
    ) as HTMLButtonElement;

    expect(serviceToggle.disabled).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('thead th').length).toBe(1);
  });

  it('hides disabled toolbar sections and renders all rows when pagination is off', () => {
    fixture.destroy();
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    host.enableGlobalFilter = false;
    host.showColumnVisibility = false;
    host.showPagination = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#table-search')).toBeNull();
    expect(fixture.nativeElement.querySelector('.column-chip')).toBeNull();
    expect(fixture.nativeElement.querySelector('.pager')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(6);
  });
});

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
