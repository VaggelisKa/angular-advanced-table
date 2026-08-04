import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NAT_EN_LOCALE_ID, NAT_TABLE_BUILT_IN_LOCALES, mergeNatTableAccessibilityText } from 'ng-advanced-table/locale';

import { NatList } from './list';
import type { TableAccessibilitySnapshot } from '../common/table-a11y.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { describeColumnVisibilityChange } from '../utils/table-announcement.util';
import { describePageChange, describePageSizeChange } from '../utils/table-pagination-announcement.util';

@Component({
  selector: 'test-unnamed-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" />
    </nat-table-surface>
  `
})
class UnnamedListHost {
  public readonly rows = signal<Row[]>(buildRows(2));
  public readonly columns = columns;
}

describe('FEATURE: NatList accessibility copy', () => {
  const columnStates = [
    { id: 'name', label: 'Service', visible: true },
    { id: 'region', label: 'Region', visible: true }
  ];
  const formatNumber = (value: number): string => String(value);

  const buildPaginationSnapshot = (): TableAccessibilitySnapshot => ({
    dataStatus: NAT_TABLE_DATA_STATUS.success,
    sorting: [],
    sortingKey: '',
    globalFilter: '',
    columnFiltersKey: '',
    rowSelectionKey: '',
    selectedRowCount: 0,
    columns: columnStates,
    visibleRows: 5,
    totalRows: 20,
    pageCount: 4,
    pagination: { pageIndex: 1, pageSize: 5 }
  });

  describe('GIVEN: the built-in English accessibility text', () => {
    describe('WHEN: a column-visibility change is described for a list', () => {
      it('THEN: it announces fields where the table announces columns', () => {
        const text = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText ?? {};
        const next = [columnStates[0], { ...columnStates[1], visible: false }];

        const listMessage = describeColumnVisibilityChange(columnStates, next, text, formatNumber, 'list');
        const tableMessage = describeColumnVisibilityChange(columnStates, next, text, formatNumber);

        expect(listMessage).toBe('Region field hidden. 1 visible field.');
        expect(tableMessage).toBe('Region column hidden. 1 visible column.');
      });
    });

    describe('WHEN: a pagination change is described for a list', () => {
      it('THEN: it announces items where the table announces rows', () => {
        const text = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText ?? {};
        const snapshot = buildPaginationSnapshot();

        expect(describePageSizeChange(snapshot, text, formatNumber, 'list')).toBe('Showing 5 items per page. Page 2 of 4.');
        expect(describePageSizeChange(snapshot, text, formatNumber)).toBe('Showing 5 rows per page. Page 2 of 4.');
        expect(describePageChange(snapshot, text, formatNumber, 'list')).toBe('Page 2 of 4. 5 items shown.');
        expect(describePageChange(snapshot, text, formatNumber)).toBe('Page 2 of 4. 5 rows shown.');
      });
    });

    describe('WHEN: only the table formatter is overridden', () => {
      it('THEN: the list falls back to it instead of dropping the announcement', () => {
        const next = [columnStates[0], { ...columnStates[1], visible: false }];

        const message = describeColumnVisibilityChange(
          columnStates,
          next,
          { columnVisibilityChange: () => 'custom table copy' },
          formatNumber,
          'list'
        );

        expect(message).toBe('custom table copy');
      });
    });
  });

  describe('GIVEN: a consumer overriding accessibility text through the provider merge', () => {
    describe('WHEN: the list pagination formatters are overridden', () => {
      it('THEN: the overrides win over the built-in list copy', () => {
        const builtIn = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText;
        const merged = mergeNatTableAccessibilityText(builtIn, {
          listPageSizeChange: ({ pageSizeText }) => `Per page: ${pageSizeText}`,
          listPageChange: ({ pageText }) => `On page ${pageText}`
        });
        const snapshot = buildPaginationSnapshot();

        expect(describePageSizeChange(snapshot, merged, formatNumber, 'list')).toBe('Per page: 5');
        expect(describePageChange(snapshot, merged, formatNumber, 'list')).toBe('On page 2');
      });

      it('THEN: the table keeps the built-in row copy', () => {
        const builtIn = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText;
        const merged = mergeNatTableAccessibilityText(builtIn, {
          listPageChange: () => 'list only'
        });
        const snapshot = buildPaginationSnapshot();

        expect(describePageChange(snapshot, merged, formatNumber)).toBe('Page 2 of 4. 5 rows shown.');
      });
    });

    describe('WHEN: only the shared pagination formatter is overridden', () => {
      it('THEN: the list inherits it instead of falling back to the built-in list copy', () => {
        const builtIn = NAT_TABLE_BUILT_IN_LOCALES[NAT_EN_LOCALE_ID].accessibilityText;
        const merged = mergeNatTableAccessibilityText(builtIn, {
          pageChange: ({ pageText }) => `Shared page ${pageText}`
        });
        const snapshot = buildPaginationSnapshot();

        // The built-in list formatter still exists after the merge, so a
        // consumer targeting every renderer must clear it explicitly.
        expect(describePageChange(snapshot, merged, formatNumber, 'list')).toBe('Page 2 of 4. 5 items shown.');
        expect(describePageChange(snapshot, { ...merged, listPageChange: undefined }, formatNumber, 'list')).toBe('Shared page 2');
      });
    });
  });
});

describe('FEATURE: NatList accessibility wiring', () => {
  let fixture: ComponentFixture<UnnamedListHost>;
  let warnings: string[];

  beforeEach(async () => {
    warnings = [];
    vi.spyOn(console, 'warn').mockImplementation((message: unknown) => {
      warnings.push(String(message));
    });

    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(UnnamedListHost);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GIVEN: a list rendered without an accessible name', () => {
    describe('WHEN: the dev-mode accessible-name check runs', () => {
      it('THEN: it names the list element and omits the caption advice it cannot honor', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();

        const accessibleNameWarnings = warnings.filter((warning) => warning.includes('accessible name'));

        expect(accessibleNameWarnings).toHaveLength(1);
        expect(accessibleNameWarnings[0]).toContain('<nat-list>');
        expect(accessibleNameWarnings[0]).not.toContain('<nat-table>');
        expect(accessibleNameWarnings[0]).not.toContain('caption');
      });
    });
  });
});
