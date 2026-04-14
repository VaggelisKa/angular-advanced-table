import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from 'advanced-table';

describe('TableShowcasePage', () => {
  let component: TableShowcasePage;
  let fixture: ComponentFixture<TableShowcasePage>;
  let simulation: TableSimulation;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableShowcasePage],
    }).compileComponents();

    fixture = TestBed.createComponent(TableShowcasePage);
    component = fixture.componentInstance;
    simulation = TestBed.inject(TableSimulation);
    simulation.pause();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default page of rows', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(24);
  });

  it('should render header and cell text content', () => {
    fixture.detectChanges();
    const nativeElement = fixture.nativeElement as HTMLElement;
    const headerLabels = Array.from(nativeElement.querySelectorAll('thead th')).map((header) =>
      header.textContent?.replaceAll(/\s+/g, ' ').trim(),
    );
    const firstRowCells = Array.from(
      nativeElement.querySelectorAll('tbody tr:first-child td'),
    ).map((cell) => cell.textContent?.replaceAll(/\s+/g, ' ').trim());

    expect(headerLabels[0]).toContain('Workload');
    expect(firstRowCells[0]).toBeTruthy();
    expect(firstRowCells[1]).toBeTruthy();
  });
});
