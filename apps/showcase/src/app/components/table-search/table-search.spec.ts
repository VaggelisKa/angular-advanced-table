import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from 'ng-advanced-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTablePageSize, NatTablePager, NatTableSurface } from 'ng-advanced-table-ui';

import { TableSearch } from './table-search';

type Row = {
  readonly id: string;
  readonly name: string;
  readonly region: string;
};

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name', meta: { label: 'Name', rowHeader: true } },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' } }
];

const getRowId = (row: Row): string => row.id;

@Component({
  selector: 'app-table-search-host',
  imports: [NatTable, NatTableSurface, NatTablePageSize, NatTablePager, TableSearch],
  template: `
    <nat-table-surface [initialState]="initialState" [state]="tableState()" (stateChange)="onTableStateChange($event)">
      <app-table-search label="Search rows" placeholder="Search rows" />
      <nat-table-page-size [pageSizeOptions]="pageSizeOptions" />
      <nat-table-pager />

      <nat-table [columns]="columns" [data]="rows()" [getRowId]="getRowId" accessibleName="Demo table" />
    </nat-table-surface>
  `
})
class Host {
  protected readonly rows = signal<Row[]>([
    { id: 'r1', name: 'Alpha', region: 'us-east-1' },
    { id: 'r2', name: 'Beta', region: 'eu-west-3' },
    { id: 'r3', name: 'Gamma', region: 'us-east-1' },
    { id: 'r4', name: 'Delta', region: 'eu-west-3' },
    { id: 'r5', name: 'Epsilon', region: 'us-east-1' },
    { id: 'r6', name: 'Zeta', region: 'eu-west-3' }
  ]);

  protected readonly columns = columns;
  protected readonly getRowId = getRowId;
  protected readonly pageSizeOptions = [2, 3, 5] as const;
  public readonly tableState = signal<Partial<NatTableState>>({});
  protected readonly initialState: Partial<NatTableState> = {
    pagination: { pageIndex: 1, pageSize: 2 }
  };

  protected onTableStateChange(state: Partial<NatTableState>): void {
    this.tableState.set(state);
  }
}

describe('TableSearch (user-defined)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const searchInput = (): HTMLInputElement => {
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('app-table-search input[type="search"]');

    if (!input) {
      throw new Error('Expected the search input to render.');
    }

    return input;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('registers with the table so global filtering is enabled', () => {
    fixture.detectChanges();

    expect(searchInput()).toBeTruthy();
  });

  it('associates the input with the table element via aria-controls', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const table = element.querySelector<HTMLTableElement>('nat-table table');

    if (!table) {
      throw new Error('Expected the table element to render.');
    }

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

    const element = fixture.nativeElement as HTMLElement;

    expect(host.tableState().globalFilter).toBe('gamma');
    expect(host.tableState().pagination?.pageIndex).toBe(0);
    expect(element.querySelectorAll('tbody tr')).toHaveLength(1);
  });
});
