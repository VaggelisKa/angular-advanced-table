import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import type { ColumnDef } from '@tanstack/angular-table';

import { NatList } from './list';
import type { NatTableRowActivateEvent } from '../common/row.type';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatListItemLabel } from '../ui/list-item-label.directive';
import { NatListItemTemplate } from '../ui/list-item-template.directive';
import { NatTableCellTemplate } from '../ui/table-cell-template.directive';

// Region opts out of row activation; the other columns keep it.
const fieldColumns: ColumnDef<Row, unknown>[] = columns.map((column) =>
  'accessorKey' in column && column.accessorKey === 'region' ? { ...column, meta: { ...column.meta, rowActivation: false } } : column
);

@Component({
  selector: 'test-list-field-pointer-host',
  imports: [NatList, NatTableCellTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        accessibleName="Operations list"
        enableRowActivation
        (rowActivate)="activated.set([...activated(), $event])">
        <ng-template let-status natTableCell="status">
          <span data-testid="status-layer">{{ status }}</span>
        </ng-template>
        <ng-template let-region natTableCell="region">
          <span data-testid="region-layer">{{ region }}</span>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class ListFieldPointerHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = fieldColumns;
  public readonly activated = signal<NatTableRowActivateEvent<Row>[]>([]);
}

@Component({
  selector: 'test-list-item-pointer-host',
  imports: [NatList, NatListItemLabel, NatListItemTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        accessibleName="Operations list"
        enableRowActivation
        (rowActivate)="activated.set([...activated(), $event])">
        <ng-template [natListItemOf]="columns" let-item natListItem>
          <h3 natListItemLabel>{{ item.name }}</h3>
          <label data-testid="item-flag-label">
            <input data-testid="item-flag" type="checkbox" />
            <span data-testid="item-flag-text">Flag {{ item.name }}</span>
          </label>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class ListItemPointerHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly activated = signal<NatTableRowActivateEvent<Row>[]>([]);
}

const render = async <T>(component: new () => T): Promise<ComponentFixture<T>> => {
  const fixture = TestBed.createComponent(component);

  await fixture.whenStable();

  return fixture;
};

describe('FEATURE: list pointer activation on content that covers the activator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: an activatable list with natTableCell templates in its fields', () => {
    describe('WHEN: templated field content is clicked', () => {
      it('THEN: it emits rowActivate once for that row', async () => {
        const fixture = await render(ListFieldPointerHost);

        queryAll(fixture, '[data-testid="status-layer"]')[1].click();

        expect(fixture.componentInstance.activated().map((event) => event.rowData.name)).toEqual(['Beta']);
      });
    });

    describe('WHEN: content of a field that opts out of row activation is clicked', () => {
      it('THEN: it does not emit rowActivate', async () => {
        const fixture = await render(ListFieldPointerHost);

        queryAll(fixture, '[data-testid="region-layer"]')[1].click();

        expect(fixture.componentInstance.activated()).toHaveLength(0);
      });
    });
  });

  describe('GIVEN: an activatable list whose item template holds a labelled checkbox', () => {
    describe('WHEN: the label text is clicked', () => {
      it('THEN: it toggles the checkbox without emitting rowActivate', async () => {
        const fixture = await render(ListItemPointerHost);

        queryAll(fixture, '[data-testid="item-flag-text"]')[0].click();

        expect(queryAll<HTMLInputElement>(fixture, '[data-testid="item-flag"]')[0].checked).toBe(true);
        expect(fixture.componentInstance.activated()).toHaveLength(0);
      });
    });
  });
});
