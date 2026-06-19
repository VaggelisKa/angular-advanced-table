import { Component, signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ColumnDef } from '@tanstack/angular-table';

import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';

import { withNatTableSelectionColumn } from './with-table-selection-column';
import { NatTableSurface } from '../table-surface/table-surface';

type Row = {
  readonly id: string;
  readonly name: string;
};

const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    meta: { label: 'Service', rowHeader: true },
    cell: (info) => info.getValue<string>(),
  },
];

@Component({
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="state()" (stateChange)="state.set($event)">
      <nat-table
        [data]="rows()"
        [columns]="columns"
        [enableRowSelection]="true"
        [selectionMode]="selectionMode"
        [getRowId]="getRowId"
        accessibleName="Selection table"
      />
    </nat-table-surface>
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

@Component({
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface>
      <nat-table
        [data]="rows()"
        [columns]="columns"
        [enableRowSelection]="true"
        [getRowId]="getRowId"
        accessibleName="Selection override table"
      />
    </nat-table-surface>
  `,
})
class SelectionOverrideHost {
  readonly rows = signal<Row[]>([{ id: 'r1', name: 'Alpha' }]);
  readonly columns = withNatTableSelectionColumn(baseColumns, {
    selectAllAriaLabel: 'Pick every service',
    selectRowAriaLabel: (row) => `Pick service ${row.id}`,
  });
  readonly getRowId = (row: Row) => row.id;
}

describe('withNatTableSelectionColumn', () => {
  let fixture: ComponentFixture<SelectionHost>;
  let host: SelectionHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionHost, SelectionOverrideHost],
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
    expect(headerCheckbox().getAttribute('aria-label')).toBe('Select all rows');
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

  it('prefers explicit label overrides over the locale defaults', async () => {
    const overrideFixture = TestBed.createComponent(SelectionOverrideHost);

    await overrideFixture.whenStable();
    overrideFixture.detectChanges();

    const header = overrideFixture.nativeElement.querySelector(
      'thead th[data-column-id="__natSelect"] input.nat-selection-checkbox',
    ) as HTMLInputElement;
    const cell = overrideFixture.nativeElement.querySelector(
      'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox',
    ) as HTMLInputElement;

    expect(header.getAttribute('aria-label')).toBe('Pick every service');
    expect(cell.getAttribute('aria-label')).toBe('Pick service r1');

    overrideFixture.destroy();
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

    headerCheckbox().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(selectedRowCount()).toBe(3);
    expect(headerCheckbox().checked).toBe(true);
    expect(headerCheckbox().indeterminate).toBe(false);

    headerCheckbox().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(selectedRowCount()).toBe(0);
    expect(host.state().rowSelection).toEqual({});
    expect(headerCheckbox().checked).toBe(false);
    expect(headerCheckbox().indeterminate).toBe(false);
  });
});
