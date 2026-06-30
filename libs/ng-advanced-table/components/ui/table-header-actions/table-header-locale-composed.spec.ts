import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { requireOpenMenu, root, textOf } from '../../test-helpers/table-dom.helper';
import { HeaderActionCompositionHost, MultiSortHost } from '../../test-helpers/table-header-hosts.helper';
import { LocaleSwitchingHost } from '../../test-helpers/table-label-hosts.helper';

describe('FEATURE: NatTable UI', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocaleSwitchingHost, HeaderActionCompositionHost, MultiSortHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: locale switching configured', () => {
    describe('WHEN: the locale is switched', () => {
      it('THEN: it switches table and companion-control locale labels dynamically', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const localeFixture = TestBed.createComponent(LocaleSwitchingHost);
        const localeHost = localeFixture.componentInstance;

        localeFixture.detectChanges();

        const nativeElement = localeFixture.nativeElement as HTMLElement;
        const emptyState = nativeElement.querySelector('.empty-state') as HTMLElement;
        const tableSummary = nativeElement.querySelector('p.sr-only') as HTMLElement;
        const pageSizeGroup = nativeElement.querySelector('nat-table-page-size .page-size-container') as HTMLElement;
        const pageSizeSelect = nativeElement.querySelector('nat-table-page-size select') as HTMLSelectElement;
        const pager = nativeElement.querySelector('nat-table-pager .pager') as HTMLElement;
        const pagerLabel = nativeElement.querySelector('nat-table-pager .pager-label') as HTMLElement;
        const nextButton = nativeElement.querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;

        // then: default English labels are rendered
        expect(emptyState.textContent.trim()).toBe('No rows match the current view.');
        expect(tableSummary.textContent.trim()).toBe('No rows are currently shown. 4 visible columns. Page 1 of 1.');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rows per page');
        let firstLocaleOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;

        expect(firstLocaleOption.textContent.trim()).toBe('2 rows');
        expect(firstLocaleOption.getAttribute('aria-label')).toBe('2 rows per page');
        expect(pager.getAttribute('aria-label')).toBe('Table pagination');
        expect(pagerLabel.textContent.trim()).toBe('Page 1 of 1');
        expect(nextButton.getAttribute('aria-label')).toBe('Next page');

        // when: locale is switched to Danish
        localeHost.locale.set('da');
        localeFixture.detectChanges();

        // then: Danish labels are rendered
        firstLocaleOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;
        expect(emptyState.textContent.trim()).toBe('Ingen rækker matcher visningen.');
        expect(tableSummary.textContent.trim()).toBe('0 rækker og 4 kolonner.');
        expect(pageSizeGroup.getAttribute('aria-label')).toBe('Rækker pr. side');
        expect(firstLocaleOption.textContent.trim()).toBe('2 / side');
        expect(firstLocaleOption.getAttribute('aria-label')).toBe('Vis 2 rækker pr. side');
        expect(pager.getAttribute('aria-label')).toBe('Tabelsider');
        expect(pagerLabel.textContent.trim()).toBe('Side 1 af 1');
        expect(nextButton.getAttribute('aria-label')).toBe('Næste side');

        localeFixture.destroy();
      });
    });
  });

  describe('GIVEN: composed and multi-sort header actions', () => {
    describe('WHEN: composed header actions render', () => {
      it('THEN: it applies header actions idempotently and honors per-column metadata', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const compositionFixture = TestBed.createComponent(HeaderActionCompositionHost);

        compositionFixture.detectChanges();

        const nativeElement = compositionFixture.nativeElement as HTMLElement;
        const nameHeader = nativeElement.querySelector('thead th[data-column-id="name"]') as HTMLElement;
        const regionHeader = nativeElement.querySelector('thead th[data-column-id="region"]') as HTMLElement;
        const statusHeader = nativeElement.querySelector('thead th[data-column-id="status"]') as HTMLElement;
        const nameSortButton = nameHeader.querySelector('.sort-button') as HTMLButtonElement;
        const statusSortButton = statusHeader.querySelector('.sort-button') as HTMLButtonElement;
        const nameMenuButton = nameHeader.querySelector('.menu-button') as HTMLButtonElement;

        // then: outermost composition wins; per-column overrides are honored
        expect(nameHeader.querySelectorAll('.header-actions-row')).toHaveLength(1);
        expect(nameHeader.querySelectorAll('.sort-button')).toHaveLength(1);
        expect(textOf(nameHeader, '.header-label')).toBe('Service');
        expect(textOf(nameHeader, '.sort-icon')).toBe('S');
        expect(nameSortButton.getAttribute('aria-label')).toBe('Second sort Service');
        expect(nameMenuButton.getAttribute('aria-label')).toBe('Second menu Service');

        expect(regionHeader.querySelector('.sort-button')).toBeNull();
        expect(regionHeader.querySelector('.menu-button')).toBeNull();
        expect(regionHeader.textContent.trim()).toBe('Region');

        expect(statusHeader.querySelectorAll('.header-actions-row')).toHaveLength(1);
        expect(textOf(statusHeader, '.sort-icon')).toBe('Column');
        expect(statusSortButton.getAttribute('aria-label')).toBe('Column override for Status');

        // when: the name column menu is opened
        nameMenuButton.click();
        compositionFixture.detectChanges();
        await compositionFixture.whenStable();
        compositionFixture.detectChanges();

        // then: menu label uses outermost composition label
        expect(requireOpenMenu().getAttribute('aria-label')).toBe('Second column menu Service');

        compositionFixture.destroy();
      });
    });

    describe('WHEN: a second sort column is shift-clicked', () => {
      it('THEN: it adds a second sort column on shift-click when multi-sort is enabled', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const multiSortFixture = TestBed.createComponent(MultiSortHost);

        multiSortFixture.detectChanges();

        const nameSort = root(multiSortFixture).querySelector('thead th[data-column-id="name"] .sort-button') as HTMLButtonElement;
        const regionSort = root(multiSortFixture).querySelector('thead th[data-column-id="region"] .sort-button') as HTMLButtonElement;

        // when: name column is sorted first
        nameSort.click();
        multiSortFixture.detectChanges();

        // when: region column is shift-clicked to add a second sort
        regionSort.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
        multiSortFixture.detectChanges();

        // then: both columns are sorted and priority badges appear
        expect(multiSortFixture.componentInstance.tableState().sorting).toStrictEqual([
          { id: 'name', desc: false },
          { id: 'region', desc: false }
        ]);
        expect(root(multiSortFixture).querySelectorAll('.sort-priority')).toHaveLength(2);

        // The visible priority badge is aria-hidden, so the ordinal must also reach AT
        // through the sort button's accessible name.
        expect(nameSort.getAttribute('aria-label')).toContain('1 of 2');
        expect(regionSort.getAttribute('aria-label')).toContain('2 of 2');

        multiSortFixture.destroy();
      });
    });
  });
});
