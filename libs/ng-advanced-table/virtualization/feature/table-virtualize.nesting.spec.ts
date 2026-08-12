import { Component, provideZonelessChangeDetection } from '@angular/core';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { NatList, NatTable, NatTableService, flexRenderComponent } from 'ng-advanced-table';
import type { ColumnDef } from 'ng-advanced-table';

import { NatTableVirtualize } from './table-virtualize.directive';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';

const NESTED_ROW_COUNT = 12;
const OUTER_ROW_COUNT = 60;

@Component({
  selector: 'test-nested-table',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Nested detail table" />`
})
class NestedTable {
  protected readonly rows = buildRows(NESTED_ROW_COUNT);
  protected readonly columns = columns;
}

@Component({
  selector: 'test-nested-list',
  imports: [NatList],
  providers: [NatTableService],
  template: `<nat-list [columns]="columns" [data]="rows" accessibleName="Nested detail list" />`
})
class NestedList {
  protected readonly rows = buildRows(NESTED_ROW_COUNT);
  protected readonly columns = columns;
}

const nestingColumns = (nested: Type<unknown>): ColumnDef<Row, unknown>[] => [
  {
    accessorKey: 'name',
    header: 'Service',
    meta: { label: 'Service', rowHeader: true },
    cell: (info) => (info.row.index === 0 ? flexRenderComponent(nested) : info.getValue<string>())
  },
  { accessorKey: 'region', header: 'Region', meta: { label: 'Region' }, cell: (info) => info.getValue<string>() }
];

@Component({
  selector: 'test-nested-table-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  template: `
    <nat-table [columns]="columns" [data]="rows" [natTableVirtualize]="{ rowHeight: 40 }" accessibleName="Outer virtual table" />
  `
})
class NestedTableHost {
  protected readonly rows = buildRows(OUTER_ROW_COUNT);
  protected readonly columns = nestingColumns(NestedTable);
}

@Component({
  selector: 'test-nested-list-host',
  imports: [NatTable, NatTableVirtualize],
  providers: [NatTableService],
  template: `
    <nat-table [columns]="columns" [data]="rows" [natTableVirtualize]="{ rowHeight: 40 }" accessibleName="Outer virtual list host" />
  `
})
class NestedListHost {
  protected readonly rows = buildRows(OUTER_ROW_COUNT);
  protected readonly columns = nestingColumns(NestedList);
}

describe('FEATURE: virtualization isolation between nested renderers', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NestedTableHost, NestedListHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a plain nat-table rendered inside a cell of a virtualized table', () => {
    describe('WHEN: the outer table mounts only a window of its own rows', () => {
      it('THEN: it renders every row of the inner table', async () => {
        const fixture = TestBed.createComponent(NestedTableHost);

        await fixture.whenStable();

        const outerRows = queryAll(fixture, ':scope > nat-table > .table-region > table > tbody > tr.data-row');
        const innerRows = queryAll(fixture, 'test-nested-table tbody tr.data-row');

        // The inner table opts into nothing: it must not inherit the outer
        // table's row window through the element injector hierarchy.
        expect(outerRows.length).toBeLessThan(OUTER_ROW_COUNT);
        expect(innerRows).toHaveLength(NESTED_ROW_COUNT);
        expect(queryAll(fixture, 'test-nested-table tr.virtual-spacer-row')).toHaveLength(0);

        fixture.destroy();
      });
    });
  });

  describe('GIVEN: a nat-list rendered inside a cell of a virtualized table', () => {
    describe('WHEN: the outer table mounts only a window of its own rows', () => {
      it('THEN: it renders every item of the inner list', async () => {
        const fixture = TestBed.createComponent(NestedListHost);

        await fixture.whenStable();

        const outerRows = queryAll(fixture, ':scope > nat-table > .table-region > table > tbody > tr.data-row');

        // NatList provides no strategy registry of its own, so an unscoped
        // lookup would resolve the outer table's and window the list too.
        expect(outerRows.length).toBeLessThan(OUTER_ROW_COUNT);
        expect(queryAll(fixture, 'test-nested-list [data-testid="nat-list-item"]')).toHaveLength(NESTED_ROW_COUNT);

        fixture.destroy();
      });
    });
  });
});
