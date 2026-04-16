import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from './table-simulation';

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

  it('should keep the default sort, pinning, and page size', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstPinButton = fixture.nativeElement.querySelector('.pin-button') as HTMLButtonElement;
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('thead th'),
    ) as HTMLElement[];
    const netIncomeHeader = headers.find((header) =>
      header.textContent?.includes('Net Income'),
    ) as HTMLElement;

    expect(rows.length).toBe(24);
    expect(firstPinButton.textContent?.trim()).toBe('Unpin');
    expect(netIncomeHeader.querySelector('.sort-button.is-sorted')).toBeTruthy();
  });

  it('should update the status filter through controlled table state', () => {
    fixture.detectChanges();

    const alertChip = fixture.nativeElement.querySelector(
      '.status-chip[data-status="Alert"]',
    ) as HTMLButtonElement;

    alertChip.click();
    fixture.detectChanges();

    expect((component as never as { tableState: () => { columnFilters: unknown[] } }).tableState().columnFilters).toEqual([
      {
        id: 'status',
        value: ['Alert'],
      },
    ]);
  });

  it('should render only the health status in the status cell', () => {
    fixture.detectChanges();

    const statusCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="status"]',
    ) as HTMLTableCellElement;

    expect(statusCell.textContent).toMatch(/Healthy|Pending|Alert|Offline/);
    expect(statusCell.textContent).not.toContain('%');
  });

  it('should keep search and column visibility working end to end', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#table-search') as HTMLInputElement;
    const periodToggle = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="reportingPeriod"]',
    ) as HTMLButtonElement;

    searchInput.value = 'doc-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);

    periodToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Period');
  });

  it('should preserve the table render filter when toggling statuses', () => {
    fixture.detectChanges();

    const slowRenderChip = fixture.nativeElement.querySelector(
      '.render-chip[data-render-filter="slow"]',
    ) as HTMLButtonElement;
    const alertChip = fixture.nativeElement.querySelector(
      '.status-chip[data-status="Alert"]',
    ) as HTMLButtonElement;

    slowRenderChip.click();
    fixture.detectChanges();

    alertChip.click();
    fixture.detectChanges();

    expect(
      (
        component as never as {
          tableState: () => { columnFilters: { id: string; value: unknown }[] };
        }
      ).tableState().columnFilters,
    ).toEqual(
      expect.arrayContaining([
        {
          id: '__rowRenderMetric',
          value: 'slow',
        },
        {
          id: 'status',
          value: ['Alert'],
        },
      ]),
    );
  });
});
