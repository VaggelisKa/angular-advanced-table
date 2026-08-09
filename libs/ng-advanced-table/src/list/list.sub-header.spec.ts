import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatList } from './list';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableSubHeaderTemplate } from '../ui/table-sub-header-template.directive';

@Component({
  selector: 'test-list-sub-header-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        [enableRowActivation]="enableRowActivation()"
        [enableSubHeaders]="enableSubHeaders()"
        [subHeaderColumn]="subHeaderColumn()"
        [subHeaderOrder]="subHeaderOrder()"
        accessibleName="Grouped operations list" />
    </nat-table-surface>
  `
})
class ListSubHeaderHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly subHeaderColumn = signal<string | undefined>('status');
  public readonly subHeaderOrder = signal<readonly unknown[] | undefined>(undefined);
  public readonly enableRowActivation = signal(false);
  public readonly enableSubHeaders = signal(true);
}

@Component({
  selector: 'test-list-sub-header-template-host',
  imports: [NatList, TestTableSurface, NatTableSubHeaderTemplate],
  template: `
    <nat-table-surface>
      <nat-list [columns]="columns" [data]="rows()" accessibleName="Grouped operations list" subHeaderColumn="status">
        <ng-template let-count="rowCountValue" let-value natTableSubHeader>
          <strong class="custom-list-sub-header">{{ value }} × {{ count }}</strong>
        </ng-template>
      </nat-list>
    </nat-table-surface>
  `
})
class ListSubHeaderTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
}

const subHeaderItems = (fixture: ComponentFixture<unknown>): HTMLElement[] => queryAll(fixture, '[data-testid="nat-list-sub-header"]');

const itemNames = (fixture: ComponentFixture<unknown>): string[] =>
  queryAll(fixture, '[data-testid="nat-list-item"] [data-column-id="name"] .list-field-value').map((value) =>
    value.textContent.trim()
  );

describe('FEATURE: NatList sub-headers', () => {
  let fixture: ComponentFixture<ListSubHeaderHost>;
  let host: ListSubHeaderHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListSubHeaderHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  describe('GIVEN: a list with subHeaderColumn set', () => {
    describe('WHEN: items render without user sorting', () => {
      it('THEN: it renders one sub-header item per group with item-flavored announcement copy', () => {
        const items = subHeaderItems(fixture);

        expect(items.map((item) => item.querySelector('.sr-only')?.textContent.trim())).toStrictEqual([
          'Alert group, 2 items.',
          'Healthy group, 2 items.',
          'Pending group, 2 items.'
        ]);
        expect(items.map((item) => item.querySelector('[aria-hidden="true"]')?.textContent.trim())).toStrictEqual([
          'Alert',
          'Healthy',
          'Pending'
        ]);
        expect(itemNames(fixture)).toStrictEqual(['Gamma', 'Zeta', 'Alpha', 'Delta', 'Beta', 'Epsilon']);
      });
    });

    describe('WHEN: a subHeaderOrder array is set', () => {
      it('THEN: groups follow the configured order with unlisted values last', async () => {
        host.subHeaderOrder.set(['Pending', 'Healthy']);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderItems(fixture).map((item) => item.querySelector('[aria-hidden="true"]')?.textContent.trim())).toStrictEqual([
          'Pending',
          'Healthy',
          'Alert'
        ]);
        expect(itemNames(fixture)).toStrictEqual(['Beta', 'Epsilon', 'Alpha', 'Delta', 'Gamma', 'Zeta']);
      });
    });

    describe('WHEN: row activation is enabled', () => {
      it('THEN: sub-header items render no activator button and no selection state', async () => {
        host.enableRowActivation.set(true);
        await fixture.whenStable();
        fixture.detectChanges();

        for (const item of subHeaderItems(fixture)) {
          expect(item.querySelector('button')).toBeNull();
          expect(item.hasAttribute('data-selected')).toBe(false);
          expect(item.classList.contains('list-item')).toBe(false);
        }
      });
    });

    describe('WHEN: enableSubHeaders is set to false', () => {
      it('THEN: the configured sub-headers are ignored on the list renderer', async () => {
        host.enableSubHeaders.set(false);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderItems(fixture)).toHaveLength(0);
        expect(itemNames(fixture)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
      });
    });

    describe('WHEN: subHeaderColumn is cleared', () => {
      it('THEN: the list renders unsorted items with no sub-header items', async () => {
        host.subHeaderColumn.set(undefined);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(subHeaderItems(fixture)).toHaveLength(0);
        expect(itemNames(fixture)).toStrictEqual(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
      });
    });
  });
});

describe('FEATURE: NatList sub-header templates', () => {
  describe('GIVEN: a list with a custom sub-header template', () => {
    describe('WHEN: groups render', () => {
      it('THEN: the template replaces the default value rendering', async () => {
        await TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection()]
        }).compileComponents();

        const fixture = TestBed.createComponent(ListSubHeaderTemplateHost);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(queryAll(fixture, '.custom-list-sub-header').map((element) => element.textContent.trim())).toStrictEqual([
          'Alert × 2',
          'Healthy × 2',
          'Pending × 2'
        ]);
      });
    });
  });
});
