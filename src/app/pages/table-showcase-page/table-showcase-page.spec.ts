import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NatTable } from 'ng-advanced-table';

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
    expect(firstMenuButton.getAttribute('aria-label')).toContain('Open column actions');
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

  it('should apply semantic tones to move cells', () => {
    fixture.detectChanges();

    const changePercentCells = Array.from(
      fixture.nativeElement.querySelectorAll('tbody td[data-column-id="changePercent"]'),
    ) as HTMLTableCellElement[];
    const tones = changePercentCells.map((cell) => cell.getAttribute('data-tone'));

    expect(tones).toContain('negative');
    expect(tones).toContain('warning');
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

    expect(sparkCells.length).toBe(10);
  });

  it('should render ticker marks in the symbol column', () => {
    fixture.detectChanges();

    const marks = fixture.nativeElement.querySelectorAll(
      'tbody th[data-column-id="symbol"] nat-ticker-mark',
    );

    expect(marks.length).toBe(10);
  });

  it('should offer a 100-row page size while keeping the virtual window capped at 50 rows', async () => {
    fixture.detectChanges();

    const hundredRowChip = Array.from(
      fixture.nativeElement.querySelectorAll('.table-actions .chip'),
    ).find((button) => (button as HTMLButtonElement).textContent?.trim().startsWith('100')) as
      | HTMLButtonElement
      | undefined;
    const tableNote = fixture.nativeElement.querySelector('.table-card-note') as HTMLElement;

    expect(hundredRowChip).toBeTruthy();

    hundredRowChip?.click();
    fixture.detectChanges();
    setVirtualViewportHeight(fixture, 40 * 50);
    await fixture.whenStable();
    fixture.detectChanges();

    const viewportElement = fixture.nativeElement.querySelector(
      'cdk-virtual-scroll-viewport',
    ) as HTMLElement;
    const table = getVirtualizationTable(fixture);

    expect(table.bodyRows().length).toBe(100);
    expect(table.isVirtualized()).toBe(true);
    expect(table.virtualViewportHeight()).toBe(40 * 50);
    expect(viewportElement.style.height).toBe('2000px');
    expect(tableNote.textContent).toContain('50 body rows');
  });

  it('should expand actionable rows into a trade brief panel', () => {
    fixture.detectChanges();

    const expandTrigger = fixture.nativeElement.querySelector(
      '.row-expand-trigger',
    ) as HTMLButtonElement;

    expect(expandTrigger).toBeTruthy();
    expect(expandTrigger.getAttribute('aria-expanded')).toBe('false');

    expandTrigger.click();
    fixture.detectChanges();

    const tradeBrief = fixture.nativeElement.querySelector('.trade-brief') as HTMLElement;

    expect(tradeBrief).toBeTruthy();
    expect(tradeBrief.textContent).toContain('Playbook');
    expect(expandTrigger.getAttribute('aria-expanded')).toBe('true');
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

  it('should toggle table capabilities from the options dialog', () => {
    fixture.detectChanges();

    const optionsButton = fixture.nativeElement.querySelector(
      '[data-testid="open-table-options"]',
    ) as HTMLButtonElement;

    optionsButton.click();
    fixture.detectChanges();

    const pinningToggle = document.querySelector(
      '.feature-toggle[data-feature="allowColumnPinning"] input',
    ) as HTMLInputElement;
    const searchToggle = document.querySelector(
      '.feature-toggle[data-feature="enableGlobalFilter"] input',
    ) as HTMLInputElement;
    const visibilityToggle = document.querySelector(
      '.feature-toggle[data-feature="showColumnVisibility"] input',
    ) as HTMLInputElement;
    const paginationToggle = document.querySelector(
      '.feature-toggle[data-feature="enablePagination"] input',
    ) as HTMLInputElement;
    const virtualizationToggle = document.querySelector(
      '.feature-toggle[data-feature="enableVirtualization"] input',
    ) as HTMLInputElement;

    pinningToggle.click();
    searchToggle.click();
    visibilityToggle.click();
    paginationToggle.click();
    virtualizationToggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.pin-button')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.search-input')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.table-controls-surface')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.table-toolbar')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.table-card-note')?.textContent).toContain(
      'Virtualization is off',
    );
  });
});

function setVirtualViewportHeight(
  fixture: ComponentFixture<unknown>,
  height: number,
  width = 1440,
): void {
  const viewportDebugElement = fixture.debugElement.query(By.directive(CdkVirtualScrollViewport));

  if (!viewportDebugElement) {
    return;
  }

  const viewportElement = viewportDebugElement.nativeElement as HTMLElement;
  const rect = {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => undefined,
  } as DOMRect;

  Object.defineProperty(viewportElement, 'clientHeight', {
    configurable: true,
    value: height,
  });
  Object.defineProperty(viewportElement, 'offsetHeight', {
    configurable: true,
    value: height,
  });
  Object.defineProperty(viewportElement, 'clientWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(viewportElement, 'offsetWidth', {
    configurable: true,
    value: width,
  });
  viewportElement.getBoundingClientRect = () => rect;

  (viewportDebugElement.componentInstance as CdkVirtualScrollViewport).checkViewportSize();
  fixture.detectChanges();
}

type NatTableVirtualizationInternals = NatTable<unknown> & {
  bodyRows(): readonly unknown[];
  isVirtualized(): boolean;
  virtualViewportHeight(): number | null;
};

function getVirtualizationTable(
  fixture: ComponentFixture<TableShowcasePage>,
): NatTableVirtualizationInternals {
  return fixture.debugElement.query(By.directive(NatTable))
    .componentInstance as NatTableVirtualizationInternals;
}
