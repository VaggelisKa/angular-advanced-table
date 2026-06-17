import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';
import { NatTablePageSize, NatTablePager, NatTableSurface } from 'ng-advanced-table-ui';

import { TableSearch } from './table-search';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
};

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' } },
];

@Component({
  imports: [NatTable, NatTableSurface, NatTablePageSize, NatTablePager, TableSearch],
  template: `
    <nat-table-surface
      [state]="tableState()"
      [initialState]="initialState"
      (stateChange)="onTableStateChange($event)"
    >
      <app-table-search label="Search rows" placeholder="Search rows" />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table
        [data]="rows()"
        [columns]="columns"
        [getRowId]="getRowId"
        accessibleName="Demo table"
      />
    </nat-table-surface>
  `,
})
class Host {
  readonly rows = signal<Row[]>([
    { id: 'r1', name: 'Alpha', region: 'us-east-1' },
    { id: 'r2', name: 'Beta', region: 'eu-west-3' },
    { id: 'r3', name: 'Gamma', region: 'us-east-1' },
    { id: 'r4', name: 'Delta', region: 'eu-west-3' },
    { id: 'r5', name: 'Epsilon', region: 'us-east-1' },
    { id: 'r6', name: 'Zeta', region: 'eu-west-3' },
  ]);
  readonly columns = columns;
  readonly getRowId = (row: Row) => row.id;
  readonly pageSizeOptions = [2, 3, 5] as const;
  readonly tableState = signal<Partial<NatTableState>>({});
  readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 1, pageSize: 2 },
  };

  onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

describe('TableSearch (user-defined)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  function searchInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      'app-table-search input[type="search"]',
    ) as HTMLInputElement;
  }

  it('registers with the table so global filtering is enabled', () => {
    fixture.detectChanges();

    expect(searchInput()).toBeTruthy();
  });

  it('associates the input with the table element via aria-controls', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('nat-table table') as HTMLTableElement;

    expect(searchInput().getAttribute('aria-controls')).toBe(table.id);
  });

  it('filters rows and resets pagination to the first page on input', async () => {
    fixture.detectChanges();
    const input = searchInput();

    input.value = 'gamma';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.tableState().globalFilter).toBe('gamma');
    expect(host.tableState().pagination?.pageIndex).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
  });
});
