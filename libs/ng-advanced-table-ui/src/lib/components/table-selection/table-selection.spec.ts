import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';
import type { NatTableState } from 'ng-advanced-table';
import { NatTable } from 'ng-advanced-table';

import { withNatTableSelectionColumn } from './with-table-selection-column';
import { NatTableSurface } from '../table-surface/table-surface';

type Row = {
  readonly id: string;
  readonly name: string;
};

const getRowId = (row: Row): string => row.id;

const baseColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    meta: { label: 'Service', rowHeader: true },
    cell: (info) => info.getValue<string>()
  }
];

@Component({
  selector: 'nat-selection-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface [state]="state()" (stateChange)="state.set($event)">
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [enableRowSelection]="true"
        [getRowId]="getRowId"
        [selectionMode]="selectionMode"
        accessibleName="Selection table" />
    </nat-table-surface>
  `
})
class SelectionHost {
  protected readonly rows = signal<Row[]>([
    { id: 'r1', name: 'Alpha' },
    { id: 'r2', name: 'Beta' },
    { id: 'r3', name: 'Gamma' }
  ]);

  protected readonly columns = withNatTableSelectionColumn(baseColumns);
  protected readonly getRowId = getRowId;
  public selectionMode: 'single' | 'multiple' = 'multiple';
  public readonly state = signal<Partial<NatTableState>>({});
}

@Component({
  selector: 'nat-selection-override-host',
  imports: [NatTable, NatTableSurface],
  template: `
    <nat-table-surface>
      <nat-table
        [columns]="columns"
        [data]="rows()"
        [enableRowSelection]="true"
        [getRowId]="getRowId"
        accessibleName="Selection override table" />
    </nat-table-surface>
  `
})
class SelectionOverrideHost {
  protected readonly rows = signal<Row[]>([{ id: 'r1', name: 'Alpha' }]);
  protected readonly columns = withNatTableSelectionColumn(baseColumns, {
    selectAllAriaLabel: 'Pick every service',
    selectRowAriaLabel: (row): string => `Pick service ${row.id}`
  });

  protected readonly getRowId = getRowId;
}

describe('withNatTableSelectionColumn', () => {
  let fixture: ComponentFixture<SelectionHost>;
  let host: SelectionHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionHost, SelectionOverrideHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  const root = (target: ComponentFixture<unknown> = fixture): HTMLElement => target.nativeElement as HTMLElement;

  const selectedRowCount = (): number =>
    Array.from(root().querySelectorAll('tbody tr.data-row')).filter((row) => row.getAttribute('aria-selected') === 'true').length;

  const headerCheckbox = (): HTMLInputElement =>
    root().querySelector<HTMLInputElement>('thead th[data-column-id="__natSelect"] input.nat-selection-checkbox') as HTMLInputElement;

  const rowCheckbox = (index: number): HTMLInputElement =>
    root().querySelectorAll<HTMLInputElement>('tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox')[index];

  it('prepends a selection column with a header and per-row checkboxes', () => {
    expect(headerCheckbox()).toBeTruthy();
    expect(headerCheckbox().getAttribute('aria-label')).toBe('Select all rows');
    expect(root().querySelectorAll('tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox')).toHaveLength(3);

    const firstHeader = root().querySelector<HTMLElement>('thead th') as HTMLElement;

    expect(firstHeader.dataset['columnId']).toBe('__natSelect');
  });

  it('renders the plain column label instead of a select-all checkbox in single mode', async () => {
    // Set single mode before the first change detection to avoid NG0100.
    const single = TestBed.createComponent(SelectionHost);

    single.componentInstance.selectionMode = 'single';
    await single.whenStable();
    single.detectChanges();

    const selectHeader = root(single).querySelector<HTMLElement>('thead th[data-column-id="__natSelect"]') as HTMLElement;

    expect(selectHeader.querySelector('input.nat-selection-checkbox')).toBeNull();
    expect(selectHeader.textContent.trim()).toBe('Selection');

    single.destroy();
  });

  it('gives each per-row checkbox a unique default aria-label derived from the row id', () => {
    const labels = Array.from(
      root().querySelectorAll<HTMLInputElement>('tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox')
    ).map((input) => input.getAttribute('aria-label'));

    expect(labels).toStrictEqual(['Select row r1', 'Select row r2', 'Select row r3']);
  });

  it('prefers explicit label overrides over the locale defaults', async () => {
    const overrideFixture = TestBed.createComponent(SelectionOverrideHost);

    await overrideFixture.whenStable();
    overrideFixture.detectChanges();

    const header = root(overrideFixture).querySelector<HTMLInputElement>(
      'thead th[data-column-id="__natSelect"] input.nat-selection-checkbox'
    ) as HTMLInputElement;
    const cell = root(overrideFixture).querySelector<HTMLInputElement>(
      'tbody td[data-column-id="__natSelect"] input.nat-selection-checkbox'
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

    expect(host.state().rowSelection).toStrictEqual({ r1: true });
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
    expect(host.state().rowSelection).toStrictEqual({});
    expect(headerCheckbox().checked).toBe(false);
    expect(headerCheckbox().indeterminate).toBe(false);
  });
});
