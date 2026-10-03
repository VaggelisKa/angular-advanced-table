import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatTable } from './table';
import { NatTableService } from '../domain-logic/table.service';
import { NatList } from '../list/list';
import { NatTableStatic } from '../static-table/static-table';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';

const rows = buildRows(2);

@Component({
  selector: 'test-bare-table-host',
  imports: [NatTable],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Bare table" />`
})
class BareTableHost {
  protected readonly rows = rows;
  protected readonly columns: ColumnDef<Row, unknown>[] = columns;
}

@Component({
  selector: 'test-bare-static-table-host',
  imports: [NatTableStatic],
  template: `<nat-table-static [columns]="columns" [data]="rows" accessibleName="Bare static table" />`
})
class BareStaticTableHost {
  protected readonly rows = rows;
  protected readonly columns: ColumnDef<Row, unknown>[] = columns;
}

@Component({
  selector: 'test-bare-list-host',
  imports: [NatList],
  template: `<nat-list [columns]="columns" [data]="rows" accessibleName="Bare list" />`
})
class BareListHost {
  protected readonly rows = rows;
  protected readonly columns: ColumnDef<Row, unknown>[] = columns;
}

@Component({
  selector: 'test-provided-table-host',
  imports: [NatTable],
  providers: [NatTableService],
  template: `<nat-table [columns]="columns" [data]="rows" accessibleName="Provided table" />`
})
class ProvidedTableHost {
  protected readonly rows = rows;
  protected readonly columns: ColumnDef<Row, unknown>[] = columns;
}

const missingServiceMessage = (selector: string): string =>
  `[ng-advanced-table] <${selector}> could not find a NatTableService. Wrap it in <nat-table-surface> ` +
  `(ng-advanced-table/components), or add providers: [NatTableService] to a host component or directive.`;

describe('FEATURE: Renderers require a NatTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
  });

  describe('GIVEN: a <nat-table> with no surface and no NatTableService provider', () => {
    describe('WHEN: the table is created', () => {
      it('THEN: it throws a branded error naming both remedies instead of a raw NG0201', () => {
        expect(() => TestBed.createComponent(BareTableHost).detectChanges()).toThrow(missingServiceMessage('nat-table'));
      });
    });
  });

  describe('GIVEN: a <nat-table-static> with no surface and no NatTableService provider', () => {
    describe('WHEN: the static table is created', () => {
      it('THEN: it throws a branded error naming both remedies instead of a raw NG0201', () => {
        expect(() => TestBed.createComponent(BareStaticTableHost).detectChanges()).toThrow(missingServiceMessage('nat-table-static'));
      });
    });
  });

  describe('GIVEN: a <nat-list> with no surface and no NatTableService provider', () => {
    describe('WHEN: the list is created', () => {
      it('THEN: it throws a branded error naming both remedies instead of a raw NG0201', () => {
        expect(() => TestBed.createComponent(BareListHost).detectChanges()).toThrow(missingServiceMessage('nat-list'));
      });
    });
  });

  describe('GIVEN: a <nat-table> whose host provides NatTableService', () => {
    describe('WHEN: the table is created', () => {
      it('THEN: it renders without a surface', async () => {
        const fixture = TestBed.createComponent(ProvidedTableHost);

        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).querySelectorAll('[data-testid="nat-table-row"]')).toHaveLength(2);
      });
    });
  });
});
