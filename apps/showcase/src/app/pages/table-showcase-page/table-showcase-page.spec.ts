import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { TableShowcasePage } from './table-showcase-page';
import { TableSimulation } from './table-simulation';
import { ShowcaseThemeStore } from '../../showcase-theme';

describe('FEATURE: TableShowcasePage', () => {
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

  const queryAll = <T extends Element>(selector: string): NodeListOf<T> => host().querySelectorAll<T>(selector);

  beforeEach(async () => {
    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [TableShowcasePage],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableShowcasePage);
    component = fixture.componentInstance;
    simulation = TestBed.inject(TableSimulation);
    simulation.pause();
    await fixture.whenStable();
  });

  describe('GIVEN: the table showcase page is rendered', () => {
    describe('WHEN: create', () => {
      it('THEN: it creates the component instance', () => {
        expect(component).toBeTruthy();
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with default controlled state', () => {
    describe('WHEN: start without seeded sorting, pinning, or custom pagination', () => {
      it('THEN: it starts with the expected default table state', () => {
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
        expect(changeHeader.querySelector('.market-sort-indicator[data-sort-state="none"]')).toBeTruthy();
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with a controlled status filter', () => {
    describe('WHEN: update the status filter through controlled table state', () => {
      it('THEN: it updates controlled filter state', () => {
        fixture.detectChanges();

        const decliningChip = query<HTMLButtonElement>('.filter-pill[data-status="Declining"]');

        decliningChip.click();
        fixture.detectChanges();

        expect(component.tableState().columnFilters).toStrictEqual([
          {
            id: 'status',
            value: ['Declining']
          }
        ]);
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with signal cell rendering', () => {
    describe('WHEN: render only the trading signal in the signal cell', () => {
      it('THEN: it shows only the signal text', () => {
        fixture.detectChanges();

        const statusCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="status"]');

        expect(statusCell.textContent).toMatch(/Advancing|Watching|Declining|Halted/);
        expect(statusCell.textContent).not.toContain('$');
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with global search controls', () => {
    describe('WHEN: keep search working end to end without rendering column visibility chips', () => {
      it('THEN: it filters rows without showing visibility chips', () => {
        fixture.detectChanges();

        const searchInput = query<HTMLInputElement>('app-table-search input');

        searchInput.value = 'eqt-00001';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(queryAll('tbody tr')).toHaveLength(1);
        expect(host().querySelector('nat-table-column-visibility')).toBeFalsy();
        expect(host().querySelector('.column-chip')).toBeFalsy();
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with halted move cells', () => {
    describe('WHEN: apply warning tones to halted move cells', () => {
      it('THEN: it marks halted move cells with warning styling', () => {
        fixture.detectChanges();

        const changePercentCell = query<HTMLTableCellElement>('tbody tr:first-child td[data-column-id="changePercent"]');

        expect(changePercentCell.getAttribute('data-tone')).toBe('warning');
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with the shared showcase theme', () => {
    describe('WHEN: inherit the shared showcase theme', () => {
      it('THEN: it uses the shared showcase theme class', () => {
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
    });
  });

  describe('GIVEN: the table showcase page is rendered with sparkline history cells', () => {
    describe('WHEN: render a sparkline svg for each visible row', () => {
      it('THEN: it shows one sparkline per visible row', () => {
        fixture.detectChanges();

        const sparkCells = queryAll('tbody td[data-column-id="spark"] nat-sparkline svg');

        expect(sparkCells).toHaveLength(10);
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with ticker mark cells', () => {
    describe('WHEN: render ticker marks in the symbol column', () => {
      it('THEN: it shows ticker marks in symbol cells', () => {
        fixture.detectChanges();

        const marks = queryAll('tbody th[data-column-id="symbol"] nat-ticker-mark');

        expect(marks).toHaveLength(10);
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with row action menus', () => {
    describe('WHEN: render a three-dots actions menu in each visible row', () => {
      it('THEN: it shows row action menu buttons', async () => {
        fixture.detectChanges();

        const actionTriggers = queryAll<HTMLButtonElement>('tbody td[data-column-id="actions"] .row-actions-trigger');

        expect(actionTriggers).toHaveLength(10);

        const firstTrigger = actionTriggers[0];

        firstTrigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const actionLabels = Array.from(document.body.querySelectorAll('.row-actions-item .row-actions-item-label')).map((element) =>
          element.textContent.trim()
        );

        expect(actionLabels).toStrictEqual(['Inspect tape', 'Create alert', 'Send to blotter']);
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with render filter state', () => {
    describe('WHEN: preserve the table render filter when toggling statuses', () => {
      it('THEN: it keeps the render metrics filter selected', () => {
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
              value: 'slow'
            },
            {
              id: 'status',
              value: ['Declining']
            }
          ])
        );
      });
    });
  });

  describe('GIVEN: the table showcase page is rendered with default kitchen sink features', () => {
    describe('WHEN: render the kitchen sink table features by default', () => {
      it('THEN: it shows the expected default feature set', () => {
        fixture.detectChanges();

        expect(host().querySelector('[data-testid="open-table-options"]')).toBeFalsy();
        expect(document.querySelector('.feature-dialog')).toBeFalsy();
        const tableSurfaceChildren = Array.from(query<HTMLElement>('nat-table-surface.table-shell > .surface').children).map(
          (element) => element.tagName.toLowerCase()
        );

        expect(tableSurfaceChildren.filter((tagName) => tagName === 'nat-table-toolbar')).toHaveLength(1);
        expect(host().querySelector('.kitchen-metrics-controls nat-render-metrics-filter')).toBeTruthy();
        expect(host().querySelector('app-table-search')).toBeTruthy();
        expect(host().querySelector('nat-table-toolbar nat-table-pagination[natToolbarItemPosition="end"]')).toBeTruthy();
        expect(host().querySelector('nat-table-scroll-control')).toBeTruthy();
        expect(host().querySelector('nat-render-metrics-filter')).toBeTruthy();
        expect(host().querySelector('nat-render-metrics-panel')).toBeTruthy();
        expect(host().querySelector('nat-table-column-visibility')).toBeFalsy();
      });
    });
  });
});
