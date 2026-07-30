import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import type { NatTableUserState } from '../common/table-state.type';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import type { NatTableDataStatus } from '../common/table-status.type';
import { NatTableService } from '../domain-logic/table.service';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';

@Component({
  selector: 'test-list-host',
  imports: [NatList, TestTableSurface],
  template: `
    <nat-table-surface [initialState]="initialState()" enableReordering>
      <nat-list [columns]="columns" [data]="rows()" [dataStatus]="dataStatus()" accessibleName="Operations list" />
    </nat-table-surface>
  `
})
class ListHost {
  public readonly rows = signal<Row[]>(buildRows(6));
  public readonly columns = columns;
  public readonly initialState = signal<Partial<NatTableUserState>>({});
  public readonly dataStatus = signal<NatTableDataStatus>(NAT_TABLE_DATA_STATUS.success);
}

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

const itemFieldLabels = (item: HTMLElement): string[] =>
  Array.from(item.querySelectorAll('.list-field-label')).map((label) => label.textContent.trim());

const itemFieldValue = (item: HTMLElement, columnId: string): string =>
  item.querySelector(`[data-column-id="${columnId}"] .list-field-value`)?.textContent.trim() ?? '';

describe('FEATURE: NatList (spike: list renderer on the shared table engine)', () => {
  let fixture: ComponentFixture<ListHost>;
  let host: ListHost;

  const getList = (): NatList<Row> => fixture.debugElement.query(By.directive(NatList)).componentInstance as NatList<Row>;

  const render = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListHost);
    host = fixture.componentInstance;
  });

  describe('GIVEN: a list rendered inside a table surface', () => {
    describe('WHEN: the list is rendered with default state', () => {
      it('THEN: it renders one list item per row with fields in visible column order', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items).toHaveLength(6);
        expect(itemFieldLabels(items[0])).toStrictEqual(['Service', 'Region', 'Status', 'Throughput']);
        expect(itemFieldValue(items[0], 'name')).toBe('Alpha');
      });

      it('THEN: it registers itself as the surface controller for companion controls', async () => {
        await render();

        const service = fixture.debugElement.query(By.directive(TestTableSurface)).injector.get(NatTableService);

        expect(service.controller()).toBe(getList());
      });
    });

    describe('WHEN: sorting state is applied through the controller', () => {
      it('THEN: it re-renders the items in sorted order', async () => {
        await render();

        getList().patchState({ sorting: [{ id: 'name', desc: true }] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldValue(items[0], 'name')).toBe('Zeta');
        expect(itemFieldValue(items.at(-1) as HTMLElement, 'name')).toBe('Alpha');
      });
    });

    describe('WHEN: column order state changes', () => {
      it('THEN: it reorders the fields inside every list item', async () => {
        await render();

        getList().patchState({ columnOrder: ['status', 'name', 'throughput', 'region'] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldLabels(items[0])).toStrictEqual(['Status', 'Service', 'Throughput', 'Region']);
      });
    });

    describe('WHEN: a column is hidden via column visibility state', () => {
      it('THEN: it removes that field from every list item', async () => {
        await render();

        getList().patchState({ columnVisibility: { region: false } });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldLabels(items[0])).toStrictEqual(['Service', 'Status', 'Throughput']);
      });
    });

    describe('WHEN: sorting is seeded from the surface initial state', () => {
      it('THEN: it renders the items pre-sorted', async () => {
        host.initialState.set({ sorting: [{ id: 'name', desc: true }] });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(itemFieldValue(items[0], 'name')).toBe('Zeta');
      });
    });
  });

  describe('GIVEN: a list with data lifecycle states', () => {
    describe('WHEN: the data status is loading with no rows', () => {
      it('THEN: it renders the loading state item and marks the list busy', async () => {
        host.rows.set([]);
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.loading);
        await render();

        const loadingItem = queryAll(fixture, '[data-testid="nat-list-loading-state"]');
        const list = queryAll(fixture, '[data-testid="nat-list"]')[0];

        expect(loadingItem).toHaveLength(1);
        expect(list.getAttribute('aria-busy')).toBe('true');
      });
    });

    describe('WHEN: the data status is error', () => {
      it('THEN: it renders the error state item instead of rows', async () => {
        host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        await render();

        expect(queryAll(fixture, '[data-testid="nat-list-error-state"]')).toHaveLength(1);
        expect(queryAll(fixture, '[data-testid="nat-list-item"]')).toHaveLength(0);
      });
    });

    describe('WHEN: the data is empty with success status', () => {
      it('THEN: it renders the empty state item', async () => {
        host.rows.set([]);
        await render();

        expect(queryAll(fixture, '[data-testid="nat-list-empty-state"]')).toHaveLength(1);
      });
    });
  });
});
