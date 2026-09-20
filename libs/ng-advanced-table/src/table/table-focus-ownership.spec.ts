import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { flexRenderComponent } from '@tanstack/angular-table';
import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from './table';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { mockClientRect, queryRequired } from '../test-helpers/table-dom.helper';

@Component({
  selector: 'test-nested-focus-table',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Nested focus table" data-testid="nested-table" />`
})
class NestedFocusTable {
  protected readonly rows = buildRows(1);
  protected readonly columns = columns;
}

const outerColumns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Service',
    meta: { label: 'Service', rowHeader: true },
    cell: () => flexRenderComponent(NestedFocusTable)
  },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' }, cell: (info) => info.getValue<string>() }
];

@Component({
  selector: 'test-nested-focus-host',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Outer focus table" data-testid="outer-table" />`
})
class NestedFocusHost {
  protected readonly rows = buildRows(1);
  protected readonly columns = outerColumns;
}

describe('FEATURE: focus scrolling ownership between nested tables', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NestedFocusHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a table rendered inside a cell of another table', () => {
    describe('WHEN: focus lands behind a pinned column in the nested table', () => {
      it('THEN: it scrolls only the nested region', async () => {
        const fixture = TestBed.createComponent(NestedFocusHost);

        await fixture.whenStable();

        const outerRegion = queryRequired<HTMLElement>(fixture, '[data-testid="outer-table"] [data-testid="nat-table-region"]');
        const nestedRegion = queryRequired<HTMLElement>(fixture, '[data-testid="nested-table"] [data-testid="nat-table-region"]');
        const nestedPinnedHeader = queryRequired<HTMLElement>(
          fixture,
          '[data-testid="nested-table"] [data-testid="nat-table-header-name"]'
        );
        const nestedCoveredHeader = queryRequired<HTMLElement>(
          fixture,
          '[data-testid="nested-table"] [data-testid="nat-table-header-region"]'
        );

        nestedPinnedHeader.classList.add('is-pinned-left');
        mockClientRect(outerRegion, { left: 0, right: 400, width: 400, height: 200 });
        mockClientRect(nestedRegion, { left: 100, right: 400, width: 300, height: 160 });
        mockClientRect(nestedPinnedHeader, { left: 100, right: 250, width: 150, height: 40 });
        mockClientRect(nestedCoveredHeader, { left: 200, right: 260, width: 60, height: 40 });
        outerRegion.scrollLeft = 30;
        nestedRegion.scrollLeft = 0;

        nestedCoveredHeader.focus();

        expect(nestedRegion.scrollLeft).toBe(-95);
        expect(outerRegion.scrollLeft).toBe(30);
      });
    });
  });
});
