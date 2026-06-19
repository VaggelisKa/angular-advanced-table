import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from './table-simulation';
import { ShowcaseThemeStore } from '../../showcase-theme';

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
      providers: [provideZonelessChangeDetection()],
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

  it('should start without seeded sorting, pinning, or custom pagination', () => {
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstMenuButton = fixture.nativeElement.querySelector(
      '.menu-button',
    ) as HTMLButtonElement;
    const firstReorderableHeader = fixture.nativeElement.querySelector(
      'thead th.is-reorderable',
    ) as HTMLTableCellElement;
    const headers = Array.from(fixture.nativeElement.querySelectorAll('thead th')) as HTMLElement[];
    const changeHeader = headers.find((header) =>
      header.textContent?.includes('Chg %'),
    ) as HTMLElement;

    expect(rows.length).toBe(10);
    expect(firstMenuButton.getAttribute('aria-label')).toBe(
      'Open column actions for Symbol column',
    );
    expect(firstMenuButton.querySelector('.menu-button__icon')).toBeTruthy();
    expect(firstReorderableHeader).toBeTruthy();
    expect(changeHeader.querySelector('.sort-button.is-sorted')).toBeFalsy();
    expect(
      changeHeader.querySelector('.market-sort-indicator[data-sort-state="none"]'),
    ).toBeTruthy();
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

  it('should keep search working end to end without rendering column visibility chips', () => {
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector(
      'app-table-search input',
    ) as HTMLInputElement;

    searchInput.value = 'eqt-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('nat-table-column-visibility')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.column-chip')).toBeFalsy();
  });

  it('should apply warning tones to halted move cells', () => {
    fixture.detectChanges();

    const changePercentCell = fixture.nativeElement.querySelector(
      'tbody tr:first-child td[data-column-id="changePercent"]',
    ) as HTMLTableCellElement;

    expect(changePercentCell.getAttribute('data-tone')).toBe('warning');
  });

  it('should inherit the shared showcase theme', () => {
    fixture.detectChanges();

    const themeStore = TestBed.inject(ShowcaseThemeStore);
    const demoSurface = fixture.nativeElement.querySelector('.demo-surface') as HTMLDivElement;

    expect(demoSurface.getAttribute('data-theme')).toMatch(/^(light|dark)$/);

    themeStore.setTheme('dark');
    fixture.detectChanges();

    expect(demoSurface.getAttribute('data-theme')).toBe('dark');

    themeStore.setTheme('light');
    fixture.detectChanges();

    expect(demoSurface.getAttribute('data-theme')).toBe('light');
  });

  it('should render a sparkline svg for each visible row', () => {
    fixture.detectChanges();

    const sparkCells = fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="spark"] nat-sparkline svg',
    );

    expect(sparkCells.length).toBe(10);
  });

  it('should render ticker marks in the symbol column', () => {
    fixture.detectChanges();

    const marks = fixture.nativeElement.querySelectorAll(
      'tbody th[data-column-id="symbol"] nat-ticker-mark',
    );

    expect(marks.length).toBe(10);
  });

  it('should render a three-dots actions menu in each visible row', async () => {
    fixture.detectChanges();

    const actionTriggers = fixture.nativeElement.querySelectorAll(
      'tbody td[data-column-id="actions"] .row-actions-trigger',
    ) as NodeListOf<HTMLButtonElement>;

    expect(actionTriggers.length).toBe(10);

    actionTriggers[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    const actionLabels = Array.from(
      document.body.querySelectorAll('.row-actions-item .row-actions-item-label'),
    ).map((element) => element.textContent?.trim());

    expect(actionLabels).toEqual(['Inspect tape', 'Create alert', 'Send to blotter']);
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

  it('should render the kitchen sink table features by default', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="open-table-options"]')).toBeFalsy();
    expect(document.querySelector('.feature-dialog')).toBeFalsy();
    const tableSurfaceChildren = Array.from(
      fixture.nativeElement.querySelector('nat-table-surface.table-shell > .surface').children,
    ).map((element) => (element as HTMLElement).tagName.toLowerCase());
    expect(tableSurfaceChildren.filter((tagName) => tagName === 'nat-table-toolbar').length).toBe(
      2,
    );
    expect(fixture.nativeElement.querySelector('app-table-search')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'nat-table-toolbar nat-table-pagination[natToolbarItemPosition="end"]',
      ),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nat-table-scroll-control')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nat-render-metrics-filter')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nat-render-metrics-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nat-table-column-visibility')).toBeFalsy();
  });
});
