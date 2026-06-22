import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from './table-simulation';
import { ShowcaseThemeStore } from '../../showcase-theme';

describe('TableShowcasePage', () => {
  let component: TableShowcasePage;
  let fixture: ComponentFixture<TableShowcasePage>;
  let simulation: TableSimulation;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const query = <T extends Element>(selector: string): T => {
    const found = host().querySelector<T>(selector);

    if (!found) {
      throw new Error(`Expected element "${selector}" to render.`);
    }

    return found;
  };

  const queryAll = <T extends Element>(selector: string): NodeListOf<T> =>
    host().querySelectorAll<T>(selector);

  beforeEach(async () => {
    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
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

    const rows = queryAll('tbody tr');
    const firstMenuButton = query<HTMLButtonElement>('.menu-button');
    const firstReorderableHeader = host().querySelector('thead th.is-reorderable');
    const headers = Array.from(queryAll<HTMLElement>('thead th'));
    const changeHeader = headers.find((header) => header.textContent.includes('Chg %'));

    if (!changeHeader) {
      throw new Error('Expected the Chg % header to render.');
    }

    expect(rows).toHaveLength(10);
    expect(firstMenuButton.getAttribute('aria-label')).toBe('Open column actions for Symbol column');
    expect(firstMenuButton.querySelector('.menu-button__icon')).toBeTruthy();
    expect(firstReorderableHeader).toBeTruthy();
    expect(changeHeader.querySelector('.sort-button.is-sorted')).toBeFalsy();
    expect(
      changeHeader.querySelector('.market-sort-indicator[data-sort-state="none"]'),
    ).toBeTruthy();
  });

  it('should update the status filter through controlled table state', () => {
    fixture.detectChanges();

    const decliningChip = query<HTMLButtonElement>('.filter-pill[data-status="Declining"]');

    decliningChip.click();
    fixture.detectChanges();

    expect(component.tableState().columnFilters).toStrictEqual([
      {
        id: 'status',
        value: ['Declining'],
      },
    ]);
  });

  it('should render only the trading signal in the signal cell', () => {
    fixture.detectChanges();

    const statusCell = query<HTMLTableCellElement>(
      'tbody tr:first-child td[data-column-id="status"]',
    );

    expect(statusCell.textContent).toMatch(/Advancing|Watching|Declining|Halted/);
    expect(statusCell.textContent).not.toContain('$');
  });

  it('should keep search working end to end without rendering column visibility chips', () => {
    fixture.detectChanges();

    const searchInput = query<HTMLInputElement>('app-table-search input');

    searchInput.value = 'eqt-00001';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(queryAll('tbody tr')).toHaveLength(1);
    expect(host().querySelector('nat-table-column-visibility')).toBeFalsy();
    expect(host().querySelector('.column-chip')).toBeFalsy();
  });

  it('should apply warning tones to halted move cells', () => {
    fixture.detectChanges();

    const changePercentCell = query<HTMLTableCellElement>(
      'tbody tr:first-child td[data-column-id="changePercent"]',
    );

    expect(changePercentCell.getAttribute('data-tone')).toBe('warning');
  });

  it('should inherit the shared showcase theme', () => {
    fixture.detectChanges();

    const themeStore = TestBed.inject(ShowcaseThemeStore);
    const demoSurface = query<HTMLDivElement>('.demo-surface');

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

    const sparkCells = queryAll('tbody td[data-column-id="spark"] nat-sparkline svg');

    expect(sparkCells).toHaveLength(10);
  });

  it('should render ticker marks in the symbol column', () => {
    fixture.detectChanges();

    const marks = queryAll('tbody th[data-column-id="symbol"] nat-ticker-mark');

    expect(marks).toHaveLength(10);
  });

  it('should render a three-dots actions menu in each visible row', async () => {
    fixture.detectChanges();

    const actionTriggers = queryAll<HTMLButtonElement>(
      'tbody td[data-column-id="actions"] .row-actions-trigger',
    );

    expect(actionTriggers).toHaveLength(10);

    const firstTrigger = actionTriggers[0];

    firstTrigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const actionLabels = Array.from(
      document.body.querySelectorAll('.row-actions-item .row-actions-item-label'),
    ).map((element) => element.textContent.trim());

    expect(actionLabels).toStrictEqual(['Inspect tape', 'Create alert', 'Send to blotter']);
  });

  it('should preserve the table render filter when toggling statuses', () => {
    fixture.detectChanges();

    const slowRenderChip = query<HTMLButtonElement>('.render-chip[data-render-filter="slow"]');
    const decliningChip = query<HTMLButtonElement>('.filter-pill[data-status="Declining"]');

    slowRenderChip.click();
    fixture.detectChanges();

    decliningChip.click();
    fixture.detectChanges();

    expect(component.tableState().columnFilters).toStrictEqual(
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

    expect(host().querySelector('[data-testid="open-table-options"]')).toBeFalsy();
    expect(document.querySelector('.feature-dialog')).toBeFalsy();
    const tableSurfaceChildren = Array.from(
      query<HTMLElement>('nat-table-surface.table-shell > .surface').children,
    ).map((element) => element.tagName.toLowerCase());

    expect(tableSurfaceChildren.filter((tagName) => tagName === 'nat-table-toolbar')).toHaveLength(
      2,
    );
    expect(host().querySelector('app-table-search')).toBeTruthy();
    expect(
      host().querySelector('nat-table-toolbar nat-table-pagination[natToolbarItemPosition="end"]'),
    ).toBeTruthy();
    expect(host().querySelector('nat-table-scroll-control')).toBeTruthy();
    expect(host().querySelector('nat-render-metrics-filter')).toBeTruthy();
    expect(host().querySelector('nat-render-metrics-panel')).toBeTruthy();
    expect(host().querySelector('nat-table-column-visibility')).toBeFalsy();
  });
});
