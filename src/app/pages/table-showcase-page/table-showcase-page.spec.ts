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

  it('should keep the default sort, no pinning, and page size', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstPinButton = fixture.nativeElement.querySelector('.pin-button') as HTMLButtonElement;
    const headers = Array.from(
      fixture.nativeElement.querySelectorAll('thead th'),
    ) as HTMLElement[];
    const changeHeader = headers.find((header) =>
      header.textContent?.includes('24h %'),
    ) as HTMLElement;

    expect(rows.length).toBe(24);
    expect(firstPinButton.textContent?.trim()).toBe('Pin');
    expect(changeHeader.querySelector('.sort-button.is-sorted')).toBeTruthy();
  });

  it('should update the status filter through controlled table state', () => {
    fixture.detectChanges();

    const decliningChip = fixture.nativeElement.querySelector(
      '.status-chip[data-status="Declining"]',
    ) as HTMLButtonElement;

    decliningChip.click();
    fixture.detectChanges();

    expect((component as never as { tableState: () => { columnFilters: unknown[] } }).tableState().columnFilters).toEqual([
      {
        id: 'status',
        value: ['Declining'],
      },
    ]);
  });

  it('should render only the trading signal in the signal cell', () => {
    fixture.detectChanges();

    const statusCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="status"]',
    ) as HTMLTableCellElement;

    expect(statusCell.textContent).toMatch(/Advancing|Watching|Declining|Halted/);
    expect(statusCell.textContent).not.toContain('$');
  });

  it('should keep search and column visibility working end to end', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('#table-search') as HTMLInputElement;
    const exchangeToggle = fixture.nativeElement.querySelector(
      '.column-chip[data-column-id="exchange"]',
    ) as HTMLButtonElement;

    searchInput.value = 'eqt-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);

    exchangeToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('thead')?.textContent).not.toContain('Exchange');
  });

  it('should apply positive and negative tones to move cells', () => {
    fixture.detectChanges();

    const changePercentCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="changePercent"]',
    ) as HTMLTableCellElement;

    expect(changePercentCell.getAttribute('data-tone')).toBe('positive');
  });

  it('should preserve the table render filter when toggling statuses', () => {
    fixture.detectChanges();

    const slowRenderChip = fixture.nativeElement.querySelector(
      '.render-chip[data-render-filter="slow"]',
    ) as HTMLButtonElement;
    const decliningChip = fixture.nativeElement.querySelector(
      '.status-chip[data-status="Declining"]',
    ) as HTMLButtonElement;

    slowRenderChip.click();
    fixture.detectChanges();

    decliningChip.click();
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
          value: ['Declining'],
        },
      ]),
    );
  });
});
