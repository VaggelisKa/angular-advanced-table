import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import { ListHost } from '../test-helpers/list-hosts.helper';
import type { Row } from '../test-helpers/table-data.helper';

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

describe('FEATURE: NatList row selection', () => {
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

  describe('GIVEN: a list with row selection enabled', () => {
    describe('WHEN: a row is selected through the shared state', () => {
      it('THEN: it marks the item selected without putting aria-selected on the listitem', async () => {
        host.enableRowSelection.set(true);
        await render();

        const firstRowId = getList().table.getRowModel().rows[0].id;

        getList().patchState({ rowSelection: { [firstRowId]: true } });
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items[0].getAttribute('data-selected')).toBe('true');
        expect(items[1].getAttribute('data-selected')).toBe('false');
        expect(items[0].hasAttribute('aria-selected')).toBe(false);
      });
    });

    describe('WHEN: selection is disabled', () => {
      it('THEN: it omits the selected marker entirely', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(items[0].hasAttribute('data-selected')).toBe(false);
      });
    });

    describe('WHEN: selection mode is single', () => {
      it('THEN: it keeps at most one row selected', async () => {
        host.enableRowSelection.set(true);
        host.selectionMode.set('single');
        await render();

        const rows = getList().table.getRowModel().rows;

        getList().patchState({ rowSelection: { [rows[0].id]: true, [rows[1].id]: true } });
        await render();

        const selectedItems = queryAll(fixture, '[data-testid="nat-list-item"][data-selected="true"]');

        expect(selectedItems).toHaveLength(1);
      });
    });
  });
});
