import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from './table-simulation';

describe('TableShowcasePage', () => {
  let component: TableShowcasePage;
  let fixture: ComponentFixture<TableShowcasePage>;
  let simulation: TableSimulation;

  beforeEach(async () => {
    try {
      globalThis.localStorage?.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

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
    const firstReorderableHeader = fixture.nativeElement.querySelector(
      'thead th.is-reorderable',
    ) as HTMLTableCellElement;
    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const changeHeader = headers.find((header) =>
      header.textContent?.includes('Chg %'),
    ) as HTMLElement;

    expect(rows.length).toBe(24);
    expect(firstPinButton.textContent?.trim()).toBe('Pin');
    expect(firstReorderableHeader).toBeTruthy();
    expect(changeHeader.querySelector('.sort-button.is-sorted')).toBeTruthy();
    expect(changeHeader.querySelector('.market-sort-indicator[data-sort-state="desc"]')).toBeTruthy();
  });

  it('should update the status filter through controlled table state', () => {
    fixture.detectChanges();

    const decliningChip = fixture.nativeElement.querySelector(
      '.filter-pill[data-status="Declining"]',
    ) as HTMLButtonElement;

    decliningChip.click();
    fixture.detectChanges();

    expect(
      (component as never as { tableState: () => { columnFilters: unknown[] } }).tableState()
        .columnFilters,
    ).toEqual([
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

    const searchInput = fixture.nativeElement.querySelector('.search-input') as HTMLInputElement;
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

  it('should toggle between light and dark themes', () => {
    fixture.detectChanges();

    const demoSurface = fixture.nativeElement.querySelector('.demo-surface') as HTMLDivElement;
    const darkOption = fixture.nativeElement.querySelectorAll(
      '.theme-option',
    )[1] as HTMLButtonElement;
    const lightOption = fixture.nativeElement.querySelectorAll(
      '.theme-option',
    )[0] as HTMLButtonElement;

    expect(demoSurface.getAttribute('data-theme')).toMatch(/^(light|dark)$/);

    darkOption.click();
    fixture.detectChanges();

    expect(demoSurface.getAttribute('data-theme')).toBe('dark');
    expect(darkOption.getAttribute('aria-pressed')).toBe('true');

    lightOption.click();
    fixture.detectChanges();

    expect(demoSurface.getAttribute('data-theme')).toBe('light');
    expect(lightOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('should render a sparkline svg for each visible row', () => {
    fixture.detectChanges();

    const sparkCells = fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="spark"] nat-sparkline svg',
    );

    expect(sparkCells.length).toBe(24);
  });

  it('should render ticker marks in the symbol column', () => {
    fixture.detectChanges();

    const marks = fixture.nativeElement.querySelectorAll(
      'tbody th[data-column-id="symbol"] nat-ticker-mark',
    );

    expect(marks.length).toBe(24);
  });

  it('should preserve the table render filter when toggling statuses', () => {
    fixture.detectChanges();

    const slowRenderChip = fixture.nativeElement.querySelector(
      '.render-chip[data-render-filter="slow"]',
    ) as HTMLButtonElement;
    const decliningChip = fixture.nativeElement.querySelector(
      '.filter-pill[data-status="Declining"]',
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

  it('should toggle table capabilities from the options dialog', () => {
    fixture.detectChanges();

    const optionsButton = fixture.nativeElement.querySelector(
      '[data-testid="open-table-options"]',
    ) as HTMLButtonElement;

    optionsButton.click();
    fixture.detectChanges();

    const pinningToggle = fixture.nativeElement.querySelector(
      '.feature-toggle[data-feature="allowColumnPinning"] input',
    ) as HTMLInputElement;
    const searchToggle = fixture.nativeElement.querySelector(
      '.feature-toggle[data-feature="enableGlobalFilter"] input',
    ) as HTMLInputElement;
    const visibilityToggle = fixture.nativeElement.querySelector(
      '.feature-toggle[data-feature="showColumnVisibility"] input',
    ) as HTMLInputElement;
    const paginationToggle = fixture.nativeElement.querySelector(
      '.feature-toggle[data-feature="enablePagination"] input',
    ) as HTMLInputElement;

    pinningToggle.click();
    searchToggle.click();
    visibilityToggle.click();
    paginationToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pin-button')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.search-input')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.table-controls-surface')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.table-toolbar')).toBeFalsy();
  });
});
