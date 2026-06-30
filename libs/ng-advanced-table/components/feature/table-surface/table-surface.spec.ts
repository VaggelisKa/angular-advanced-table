import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { root, setScrollMetrics } from '../../test-helpers/table-dom.helper';
import { PaginationToolbarHost, TableHost } from '../../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable UI', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost, PaginationToolbarHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('GIVEN: a table surface with projected controls and pagination', () => {
    describe('WHEN: the surface renders', () => {
      it('THEN: it renders projected controls inside the themed surface', () => {
        fixture.detectChanges();

        expect(root(fixture).querySelector('nat-table-surface .surface')).toBeTruthy();
        expect(root(fixture).querySelectorAll('.column-chip')).toHaveLength(4);
      });

      it('THEN: it associates companion controls with the table element', () => {
        fixture.detectChanges();

        const table = root(fixture).querySelector('nat-table table') as HTMLTableElement;
        const columnChip = root(fixture).querySelector('.column-chip') as HTMLButtonElement;
        const pageSizeSelect = root(fixture).querySelector('nat-table-page-size select') as HTMLSelectElement;
        const pagerButton = root(fixture).querySelector('nat-table-pager .pager-button') as HTMLButtonElement;
        const scrollButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button') as HTMLButtonElement;
        const scrollRange = root(fixture).querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;

        expect(columnChip.getAttribute('aria-controls')).toBe(table.id);
        expect(columnChip.textContent.replaceAll(/\s+/g, ' ').trim()).toBe('Service Shown');
        expect(columnChip.getAttribute('aria-label')).toBe('Service shown. Hide column');
        expect(pageSizeSelect.getAttribute('aria-controls')).toBe(table.id);
        expect(pageSizeSelect.getAttribute('aria-label')).toBe('Rows per page');
        const firstOption = pageSizeSelect.querySelector('option') as HTMLOptionElement;

        expect(firstOption.value).toBe('2');
        expect(firstOption.textContent.trim()).toBe('2 rows');
        expect(firstOption.getAttribute('aria-label')).toBe('2 rows per page');
        expect(pagerButton.getAttribute('aria-controls')).toBe(table.id);
        expect(scrollButton.getAttribute('aria-controls')).toBe(table.id);
        expect(scrollRange.getAttribute('aria-controls')).toBe(table.id);
      });
    });

    describe('WHEN: the component initializes', () => {
      it('THEN: it does not emit stateChange on initialization', async () => {
        fixture.destroy();
        const newFixture = TestBed.createComponent(TableHost);
        const newHost = newFixture.componentInstance;

        newFixture.detectChanges();
        await newFixture.whenStable();

        expect(newHost.stateChangeCalls).toBe(0);
      });
    });

    describe('WHEN: scroll control interactions occur', () => {
      it('THEN: it controls the horizontal table scroll position with buttons and the range bar', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();
        await fixture.whenStable();

        const tableRegion = root(fixture).querySelector('nat-table .table-region') as HTMLElement;
        const leftButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-left') as HTMLButtonElement;
        const rightButton = root(fixture).querySelector('nat-table-scroll-control .scroll-button-right') as HTMLButtonElement;
        const range = root(fixture).querySelector('nat-table-scroll-control .scroll-range') as HTMLInputElement;
        const position = root(fixture).querySelector('nat-table-scroll-control .scroll-range-copy') as HTMLElement;

        setScrollMetrics(tableRegion, {
          clientWidth: 300,
          scrollWidth: 900
        });

        // when: a scroll event fires with overflow metrics
        tableRegion.dispatchEvent(new Event('scroll'));
        fixture.detectChanges();

        // then: initial scroll state is at position zero
        expect(leftButton.disabled).toBe(true);
        expect(rightButton.disabled).toBe(false);
        expect(range.max).toBe('600');
        expect(range.value).toBe('0');
        expect(position.textContent.trim()).toBe('0% scrolled');

        // when: the right scroll button is clicked
        rightButton.click();
        fixture.detectChanges();

        // then: table scrolls right by the step amount
        expect(tableRegion.scrollLeft).toBe(240);
        expect(leftButton.disabled).toBe(false);
        expect(range.value).toBe('240');
        expect(range.getAttribute('aria-valuetext')).toBe('40% scrolled');

        // when: the range bar is set to max
        range.value = '600';
        range.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        // then: table scrolls to the end
        expect(tableRegion.scrollLeft).toBe(600);
        expect(rightButton.disabled).toBe(true);
        expect(position.textContent.trim()).toBe('100% scrolled');
      });
    });

    describe('WHEN: column chips are clicked to hide columns', () => {
      it('THEN: it toggles column visibility and keeps the last visible column enabled', () => {
        fixture.detectChanges();

        for (const columnId of ['region', 'status', 'throughput']) {
          const chip = root(fixture).querySelector(`.column-chip[data-column-id="${columnId}"]`) as HTMLButtonElement;

          chip.click();
          fixture.detectChanges();
        }

        const lastVisibleChip = root(fixture).querySelector('.column-chip[data-column-id="name"]') as HTMLButtonElement;

        expect(lastVisibleChip.disabled).toBe(true);
        expect(root(fixture).querySelectorAll('thead th')).toHaveLength(1);
      });
    });

    describe('WHEN: page size and pager controls are interacted with', () => {
      it('THEN: it updates page size and pager state through the UI controls', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        fixture.detectChanges();

        const pageSizeSelect = root(fixture).querySelector('nat-table-page-size select') as HTMLSelectElement;
        const nextButton = root(fixture).querySelector('nat-table-pager .pager-button:last-child') as HTMLButtonElement;

        // when: page size is changed to 3
        pageSizeSelect.value = '3';
        pageSizeSelect.dispatchEvent(new Event('change'));
        fixture.detectChanges();

        // then: pagination state reflects new page size
        expect(host.tableState().pagination).toStrictEqual({
          pageIndex: 0,
          pageSize: 3
        });

        // when: next page button is clicked
        nextButton.click();
        fixture.detectChanges();

        // then: pagination state advances the page index
        expect(host.tableState().pagination).toStrictEqual({
          pageIndex: 1,
          pageSize: 3
        });
      });
    });

    describe('WHEN: a NatTablePagination component renders', () => {
      it('THEN: it renders NatTablePagination as a toolbar with grouped controls', () => {
        fixture.destroy();
        const paginationFixture = TestBed.createComponent(PaginationToolbarHost);

        paginationFixture.detectChanges();

        const toolbar = root(paginationFixture).querySelector('nat-table-pagination nat-table-toolbar') as HTMLElement;
        const groups = root(paginationFixture).querySelectorAll('nat-table-pagination [natToolbarGroup]');

        expect(toolbar).toBeTruthy();
        expect(toolbar.getAttribute('role')).toBe('toolbar');
        expect(toolbar.getAttribute('aria-label')).toBe('Table pagination');
        expect(groups).toHaveLength(2);
        expect(root(paginationFixture).querySelectorAll('nat-table-pagination select.page-size-select option')).toHaveLength(3);
        expect(root(paginationFixture).querySelectorAll('nat-table-pagination .pager-button')).toHaveLength(2);
      });
    });
  });
});
