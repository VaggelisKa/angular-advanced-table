import { Component, DestroyRef, Directive, inject, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTable } from './table';
import type { NatTableRowRenderStrategy } from '../common/row-render-strategy.type';
import { NatTableRowRenderStrategyRegistry } from '../domain-logic/table-row-render-strategy.service';
import { NatList } from '../list/list';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableCellTemplate } from '../ui/table-cell-template.directive';

@Component({
  selector: 'test-duplicate-cell-template-host',
  imports: [NatTable, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations">
        <ng-template let-status natTableCell="status">
          <span data-testid="first-status-template">first {{ status }}</span>
        </ng-template>
        <ng-template let-status natTableCell="status">
          <span data-testid="second-status-template">second {{ status }}</span>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
class DuplicateCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
}

@Component({
  selector: 'test-rekeyed-cell-template-host',
  imports: [NatTable, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Operations">
        <ng-template [natTableCell]="columnId()" let-value>
          <span data-testid="rekeyed-template">templated {{ value }}</span>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
class RekeyedCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(2));
  public readonly columns = columns;
  public readonly columnId = signal('status');
}

@Directive({ selector: 'nat-table[testRemoteCellTemplateWindow]' })
class TestRemoteCellTemplateWindow {
  public constructor() {
    const strategy: NatTableRowRenderStrategy = {
      items: signal([
        { index: 3, start: 120, end: 160 },
        { index: 4, start: 160, end: 200 },
        { index: 5, start: 200, end: 240 }
      ]),
      totalSize: signal(40_000),
      rowHeight: signal(40),
      logicalRowCount: signal<number | null>(1000),
      rowWindowOffset: signal(3)
    };

    inject(DestroyRef).onDestroy(inject(NatTableRowRenderStrategyRegistry).register(strategy));
  }
}

@Component({
  selector: 'test-remote-cell-template-host',
  imports: [NatTable, NatTableCellTemplate, TestRemoteCellTemplateWindow, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-table [columns]="columns" [data]="rows()" accessibleName="Remote operations" testRemoteCellTemplateWindow>
        <ng-template let-index="rowIndex" let-status natTableCell="status">
          <span [attr.data-row-index]="index" data-testid="remote-status-template">{{ status }}</span>
        </ng-template>
      </nat-table>
    </nat-table-surface>
  `
})
class RemoteCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
}

@Component({
  selector: 'test-composite-list-cell-template-host',
  imports: [NatList, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" accessibleName="Operations" enableItemNavigation>
        <ng-template let-status natTableCell="status">
          <span data-testid="composite-status-template">list {{ status }}</span>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class CompositeListCellTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
}

const text = (elements: HTMLElement[]): string[] => elements.map((element) => element.textContent.replace(/\s+/g, ' ').trim());

const render = async <T>(component: new () => T): Promise<ComponentFixture<T>> => {
  const fixture = TestBed.createComponent(component);

  await fixture.whenStable();

  return fixture;
};

describe('FEATURE: projected cell templates at runtime', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: a table with two natTableCell templates for the same column', () => {
    describe('WHEN: the rows render', () => {
      it('THEN: it renders the first template only', async () => {
        const fixture = await render(DuplicateCellTemplateHost);

        expect(queryAll(fixture, '[data-testid="first-status-template"]')).toHaveLength(3);
        expect(queryAll(fixture, '[data-testid="second-status-template"]')).toHaveLength(0);
      });
    });
  });

  describe('GIVEN: a table with a natTableCell template bound to a column id', () => {
    describe('WHEN: the bound column id changes', () => {
      it('THEN: it moves the template to the new column and restores the old one', async () => {
        const fixture = await render(RekeyedCellTemplateHost);
        const rows = fixture.componentInstance.rows();

        fixture.componentInstance.columnId.set('region');
        await fixture.whenStable();

        const templated = queryAll(fixture, '[data-testid="rekeyed-template"]');

        expect(text(templated)).toEqual(rows.map((row) => `templated ${row.region}`));
        expect(templated.every((cell) => cell.closest('[data-testid="nat-table-cell-region"]') !== null)).toBe(true);
        expect(text(queryAll(fixture, '[data-testid="nat-table-cell-status"]'))).toEqual(rows.map((row) => row.status));
      });
    });
  });

  describe('GIVEN: a remote-windowed table with a natTableCell template', () => {
    describe('WHEN: the loaded window starts at an offset', () => {
      it('THEN: it passes the dataset position as the row index', async () => {
        const fixture = await render(RemoteCellTemplateHost);
        const templated = queryAll(fixture, '[data-testid="remote-status-template"]');

        expect(templated.map((cell) => cell.dataset['rowIndex'])).toEqual(['3', '4', '5']);
        expect(text(templated)).toEqual(fixture.componentInstance.rows().map((row) => row.status));
      });
    });
  });

  describe('GIVEN: a list with item navigation and a natTableCell template', () => {
    describe('WHEN: the items render', () => {
      it('THEN: it renders the template as the field value inside each item gridcell', async () => {
        const fixture = await render(CompositeListCellTemplateHost);
        const templated = queryAll(fixture, '[data-testid="composite-status-template"]');

        expect(text(templated)).toEqual(fixture.componentInstance.rows().map((row) => `list ${row.status}`));
        expect(templated.every((cell) => cell.closest('[role="gridcell"]') !== null)).toBe(true);
      });
    });
  });
});
