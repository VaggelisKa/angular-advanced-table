import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable, type NatTableState } from 'ng-advanced-table';

import { withNatTableSelectionColumn } from './table-selection';

interface Row {
  id: string;
  name: string;
}

const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    meta: { label: 'Service', rowHeader: true },
    cell: (info) => info.getValue<string>(),
  },
];

@Component({
  imports: [NatTable],
  template: `
    <nat-table
      [data]="rows()"
      [columns]="columns"
      [enableRowSelection]="true"
      [selectionMode]="selectionMode"
      [getRowId]="getRowId"
      [state]="state()"
      accessibleName="Selection table"
      (stateChange)="state.set($event)"
    />
  `,
})
class SelectionHost {
  readonly rows = signal<Row[]>([
    { id: 'r1', name: 'Alpha' },
    { id: 'r2', name: 'Beta' },
    { id: 'r3', name: 'Gamma' },
  ]);
  readonly columns = withNatTableSelectionColumn(baseColumns);
  readonly getRowId = (row: Row) => row.id;
  selectionMode: 'single' | 'multiple' = 'multiple';
  readonly state = signal<Partial<NatTableState>>({});
}

describe('withNatTableSelectionColumn', () => {
  let fixture: ComponentFixture<SelectionHost>;
  let host: SelectionHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function selectedRowCount(): number {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr.data-row')).filter(
      (row) => (row as HTMLElement).getAttribute('aria-selected') === 'true',
    ).length;
  }

  function headerCheckbox(): HTMLInputElement {
    return fixture.nativeElement.querySelector(
      'thead th[data-column-id="__natSelect"] input.nat-selection-checkbox',
    ) as HTMLInputElement;
  }

  function rowCheckbox(index: number): HTMLInputElement {
    return fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox',
    )[index] as HTMLInputElement;
  }

  it('prepends a selection column with a header and per-row checkboxes', () => {
    expect(headerCheckbox()).toBeTruthy();
    expect(
      fixture.nativeElement.querySelectorAll(
        'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox',
      ).length,
    ).toBe(3);

    const firstHeader = fixture.nativeElement.querySelector('thead th') as HTMLElement;
    expect(firstHeader.dataset['columnId']).toBe('__natSelect');
  });

  it('renders the plain column label instead of a select-all checkbox in single mode', async () => {
    // Set single mode before the first change detection to avoid NG0100.
    const single = TestBed.createComponent(SelectionHost);
    single.componentInstance.selectionMode = 'single';
    await single.whenStable();
    single.detectChanges();

    const selectHeader = single.nativeElement.querySelector(
      'thead th[data-column-id="__natSelect"]',
    ) as HTMLElement;
    expect(selectHeader.querySelector('input.nat-selection-checkbox')).toBeNull();
    expect(selectHeader.textContent?.trim()).toBe('Selection');

    single.destroy();
  });

  it('gives each per-row checkbox a unique default aria-label derived from the row id', () => {
    const labels = Array.from(
      fixture.nativeElement.querySelectorAll(
        'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox',
      ),
    ).map((input) => (input as HTMLInputElement).getAttribute('aria-label'));

    expect(labels).toEqual(['Select row r1', 'Select row r2', 'Select row r3']);
  });

  it('selects a single row through its checkbox', async () => {
    rowCheckbox(0).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.state().rowSelection).toEqual({ r1: true });
    expect(selectedRowCount()).toBe(1);
  });

  it('selects and clears all rows through the header checkbox with an indeterminate partial state', async () => {
    headerCheckbox().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(selectedRowCount()).toBe(3);
    expect(headerCheckbox().checked).toBe(true);

    rowCheckbox(0).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(selectedRowCount()).toBe(2);
    expect(headerCheckbox().indeterminate).toBe(true);
    expect(headerCheckbox().checked).toBe(false);
  });
});
