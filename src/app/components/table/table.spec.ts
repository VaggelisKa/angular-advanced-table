import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSimulation } from '../../pages/table-showcase-page/table-simulation';
import { Table } from './table';

@Component({
  imports: [Table],
  template: `
    <app-table
      [rows]="simulation.rows()"
      [statusCounts]="simulation.statusCounts()"
      [lastCycleDurationMs]="simulation.lastCycleDurationMs()"
      [lastTickAt]="simulation.lastTickAt()"
    />
  `,
})
class TableHost {
  protected readonly simulation = inject(TableSimulation);
}

describe('Table', () => {
  let fixture: ComponentFixture<TableHost>;
  let simulation: TableSimulation;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    simulation = TestBed.inject(TableSimulation);
    simulation.pause();
    await fixture.whenStable();
  });

  it('should render the default page size', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(24);
  });

  it('should filter rows by the search query', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#table-search') as HTMLInputElement;
    searchInput.value = 'svc-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstRow = rows[0] as HTMLTableRowElement;

    expect(rows.length).toBe(1);
    expect(firstRow.textContent).toContain('Checkout 1');
  });
});
