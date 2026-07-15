import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { buildRows } from '../test-helpers/table-data.helper';
import { TableHost, createTableHostFixture, getInternalTable } from '../test-helpers/table-hosts.helper';
import type { RecreateHostOptions } from '../test-helpers/table-hosts.helper';

describe('FEATURE: NatTable pagination controller', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture, host } = await createTableHostFixture());
  });

  const recreateHost = async (options: RecreateHostOptions = {}): Promise<void> => {
    fixture.destroy();
    ({ fixture, host } = await createTableHostFixture(options));
  };

  describe('GIVEN: pagination is enabled with client-side data spanning multiple pages', () => {
    describe('WHEN: reading pageCount', () => {
      it('should compute pageCount from the resolved row count and page size', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 10 } } });
        host.rows.set(buildRows(25));
        fixture.detectChanges();

        // then:
        expect(getInternalTable(fixture).pageCount()).toBe(3);
      });
    });
  });

  describe('GIVEN: pagination is disabled', () => {
    describe('WHEN: reading pageCount', () => {
      it('should return 1 regardless of the raw row/pageSize math', async () => {
        // when:
        await recreateHost({ enablePagination: false, initialState: { pagination: { pageIndex: 0, pageSize: 10 } } });
        host.rows.set(buildRows(25));
        fixture.detectChanges();

        // then: raw math (25 rows / 10 pageSize) would be 3; disabled pagination floors it at 1
        expect(getInternalTable(fixture).pageCount()).toBe(1);
      });
    });
  });

  describe('GIVEN: manual pagination mode', () => {
    describe('WHEN: manualPageCount is configured', () => {
      it('should return the configured manualPageCount', async () => {
        // when:
        await recreateHost({ mode: 'manual', enablePagination: true, manualPageCount: 5 });
        fixture.detectChanges();

        // then:
        expect(getInternalTable(fixture).pageCount()).toBe(5);
      });
    });

    describe('WHEN: manualPageCount is left unset', () => {
      it('should return 1', async () => {
        // when:
        await recreateHost({ mode: 'manual', enablePagination: true });
        fixture.detectChanges();

        // then:
        expect(getInternalTable(fixture).pageCount()).toBe(1);
      });
    });
  });

  describe('GIVEN: a paginated table with multiple pages of data', () => {
    describe('WHEN: navigating between pages', () => {
      it('should reflect pagination state and update canPreviousPage/canNextPage as the page changes', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // then: 6 rows / 2 per page = 3 pages, starting on the first page
        expect(table.pagination()).toStrictEqual({ pageIndex: 0, pageSize: 2 });
        expect(table.canPreviousPage()).toBe(false);
        expect(table.canNextPage()).toBe(true);

        // when:
        table.nextPage();
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(1);
        expect(table.canPreviousPage()).toBe(true);
        expect(table.canNextPage()).toBe(true);

        // when:
        table.nextPage();
        fixture.detectChanges();

        // then: on the last page, no further next page is available
        expect(table.pagination().pageIndex).toBe(2);
        expect(table.canPreviousPage()).toBe(true);
        expect(table.canNextPage()).toBe(false);
      });
    });

    describe('WHEN: goToPage is called with a zero-based index', () => {
      it('should navigate directly to the requested page', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // when:
        table.goToPage(2);
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(2);
      });
    });

    describe('WHEN: goToPage is called with an out-of-range index', () => {
      it('should clamp to the valid page range', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // when: request a page far past the last of 3 pages (6 rows / 2 per page)
        table.goToPage(99);
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(2);

        // when: request a page below the first
        table.goToPage(-5);
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(0);
      });
    });

    describe('WHEN: nextPage is called on the last page in client-side pagination', () => {
      it('should stay on the last page because the command guards on canNextPage', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // TanStack only clamps the upper pageIndex bound when `options.pageCount` is set
        // (manual pagination). In auto mode that option is undefined, so the underlying
        // `nextPage()` is an unclamped `pageIndex + 1` — the facade guards the call on
        // `canNextPage()` so it never delegates past the last page.
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // when: navigate to the last of 3 pages (6 rows / 2 per page), then try to advance past it
        table.goToPage(2);
        fixture.detectChanges();

        // then:
        expect(table.canNextPage()).toBe(false);

        // when:
        table.nextPage();
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(2);
        expect(table.canNextPage()).toBe(false);
      });
    });

    describe('WHEN: nextPage is called on the last page in manual pagination', () => {
      it('should stay on the last page because manualPageCount sets an explicit upper bound', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({
          mode: 'manual',
          enablePagination: true,
          manualPageCount: 3,
          initialState: { pagination: { pageIndex: 0, pageSize: 2 } }
        });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // when: navigate to the last of the 3 configured pages, then try to advance past it
        table.goToPage(2);
        fixture.detectChanges();
        table.nextPage();
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(2);
        expect(table.canNextPage()).toBe(false);
      });
    });

    describe('WHEN: previousPage is called on the first page', () => {
      it('should stay on the first page', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 0, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        // when:
        table.previousPage();
        fixture.detectChanges();

        // then:
        expect(table.pagination().pageIndex).toBe(0);
        expect(table.canPreviousPage()).toBe(false);
      });
    });

    describe('WHEN: setPageSize is called from a later page', () => {
      it('should set the page size and reset to the first page in a single state transition', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 2, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        host.paginationEvents.length = 0;

        // when:
        table.setPageSize(3);
        fixture.detectChanges();

        // then: page size and index land together, in one emitted state transition
        expect(table.pagination()).toStrictEqual({ pageIndex: 0, pageSize: 3 });
        expect(host.paginationEvents).toStrictEqual([{ pageIndex: 0, pageSize: 3 }]);
      });
    });

    describe('WHEN: setGlobalFilter is called from a later page', () => {
      it('should reset to the first page', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 1, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        expect(table.pagination().pageIndex).toBe(1);

        // when:
        table.setGlobalFilter('gamma');
        fixture.detectChanges();

        // then:
        expect(table.globalFilter()).toBe('gamma');
        expect(table.pagination().pageIndex).toBe(0);
      });
    });

    describe('WHEN: setColumnFilter is called from a later page', () => {
      it('should reset to the first page', async () => {
        // when:
        await recreateHost({ enablePagination: true, initialState: { pagination: { pageIndex: 1, pageSize: 2 } } });
        fixture.detectChanges();
        const table = getInternalTable(fixture);

        expect(table.pagination().pageIndex).toBe(1);

        // when:
        table.setColumnFilter('status', ['Healthy']);
        fixture.detectChanges();

        // then:
        expect(table.columnFilters()).toStrictEqual([{ id: 'status', value: ['Healthy'] }]);
        expect(table.pagination().pageIndex).toBe(0);
      });
    });
  });
});
