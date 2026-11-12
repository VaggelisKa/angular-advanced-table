import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatList } from './list';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatListItemLabel } from '../ui/list-item-label.directive';
import { NatListItemTemplate } from '../ui/list-item-template.directive';

@Component({
  selector: 'test-grouped-list-item-template-host',
  imports: [NatList, NatListItemLabel, NatListItemTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        accessibleName="Grouped operations list"
        enableRowActivation
        subHeaderColumn="status">
        <ng-template [natListItemOf]="columns" let-item natListItem>
          <h3 data-testid="grouped-item-title" natListItemLabel>{{ item.name }}</h3>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class GroupedListItemTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
}

@Component({
  selector: 'test-own-id-list-item-label-host',
  imports: [NatList, NatListItemLabel, NatListItemTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" [enableRowActivation]="enableRowActivation()" accessibleName="Operations list">
        <ng-template [natListItemOf]="columns" let-item natListItem>
          <h3 data-testid="own-id-item-title" id="own-title" natListItemLabel>{{ item.name }}</h3>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class OwnIdListItemLabelHost {
  public readonly rows = signal<Row[]>(buildRows(1));
  public readonly columns = columns;
  public readonly enableRowActivation = signal(true);
}

const activatorNames = (fixture: ComponentFixture<unknown>): (string | undefined)[] =>
  queryAll(fixture, '[data-testid="nat-list-item"]').map((item) => {
    const labelledby = item.querySelector('[data-testid="nat-list-item-activator"]')?.getAttribute('aria-labelledby');

    return labelledby ? item.querySelector(`[id="${labelledby}"]`)?.textContent.trim() : undefined;
  });

describe('FEATURE: projected list item template with grouping and labels', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  describe('GIVEN: a templated list grouped by a sub-header column', () => {
    describe('WHEN: the grouped items render', () => {
      it('THEN: it names every activator by its own item label with unique ids', async () => {
        const fixture = TestBed.createComponent(GroupedListItemTemplateHost);

        await fixture.whenStable();

        const titles = queryAll(fixture, '[data-testid="grouped-item-title"]');
        const ids = titles.map((title) => title.id);

        expect(queryAll(fixture, '[data-testid="nat-list-sub-header"]')).toHaveLength(3);
        expect(titles).toHaveLength(6);
        expect(new Set(ids).size).toBe(6);
        expect(activatorNames(fixture)).toEqual(titles.map((title) => title.textContent.trim()));
      });
    });
  });

  describe('GIVEN: a natListItemLabel element that has its own id', () => {
    describe('WHEN: row activation is turned off after it was on', () => {
      it('THEN: it uses the referenced id while activatable and restores its own id afterwards', async () => {
        const fixture = TestBed.createComponent(OwnIdListItemLabelHost);

        await fixture.whenStable();

        const [title] = queryAll(fixture, '[data-testid="own-id-item-title"]');
        const activatableId = title.id;

        expect(activatorNames(fixture)).toEqual(['Alpha']);

        fixture.componentInstance.enableRowActivation.set(false);
        await fixture.whenStable();

        expect(activatableId).not.toBe('own-title');
        expect(queryAll(fixture, '[data-testid="own-id-item-title"]')[0].id).toBe('own-title');
      });
    });
  });
});
