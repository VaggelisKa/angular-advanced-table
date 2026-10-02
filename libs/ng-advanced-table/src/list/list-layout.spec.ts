import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import { ListHost } from '../test-helpers/list-hosts.helper';
import type { Row } from '../test-helpers/table-data.helper';

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

describe('FEATURE: NatList item layouts (grid areas vs. wrapping flow slots)', () => {
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

  describe('GIVEN: a list using the flow item layout', () => {
    beforeEach(() => {
      host.itemLayout.set('flow');
    });

    describe('WHEN: the columns carry no listFieldSpan', () => {
      it('THEN: it marks the items as flow and gives every field an equal share of the line', async () => {
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const fields = Array.from(items[0].querySelectorAll<HTMLElement>('.list-field'));

        expect(listHost.dataset['itemLayout']).toBe('flow');
        expect(listHost.style.getPropertyValue('--sys-nat-table-list-field-slots')).toBe('4');
        expect(items.every((item) => item.classList.contains('list-item--flow'))).toBe(true);
        expect(fields.map((field) => field.style.getPropertyValue('--sys-nat-table-list-field-share'))).toStrictEqual([
          '0.25',
          '0.25',
          '0.25',
          '0.25'
        ]);
        expect(fields.some((field) => field.hasAttribute('data-nat-list-field-span'))).toBe(false);
      });
    });

    describe('WHEN: columns weight their fields and one takes a full line', () => {
      it('THEN: it writes weighted shares, flags the full field, and excludes it from the line slots', async () => {
        const spans: Partial<Record<string, number | 'full'>> = { name: 2, status: 'full' };

        host.columns.set(
          host.columns().map((column) => {
            const listFieldSpan = spans['accessorKey' in column ? String(column.accessorKey) : ''];

            return listFieldSpan === undefined ? column : { ...column, meta: { ...column.meta, listFieldSpan } };
          })
        );
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const firstItem = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const share = (columnId: string): string =>
          firstItem
            .querySelector<HTMLElement>(`[data-column-id="${columnId}"]`)
            ?.style.getPropertyValue('--sys-nat-table-list-field-share') ?? '';

        expect(listHost.style.getPropertyValue('--sys-nat-table-list-field-slots')).toBe('3');
        expect(share('name')).toBe('0.5');
        expect(share('region')).toBe('0.25');
        expect(share('throughput')).toBe('0.25');
        expect(share('status')).toBe('');
        expect(firstItem.querySelector('[data-column-id="status"]')?.getAttribute('data-nat-list-field-span')).toBe('full');
      });
    });

    describe('WHEN: a column is hidden through column visibility state', () => {
      it('THEN: it re-splits the line between the remaining fields', async () => {
        await render();
        getList().patchState({ columnVisibility: { region: false } });
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const firstField = queryAll(fixture, '[data-testid="nat-list-item"]')[0].querySelector<HTMLElement>('.list-field');

        expect(listHost.style.getPropertyValue('--sys-nat-table-list-field-slots')).toBe('3');
        expect(firstField?.style.getPropertyValue('--sys-nat-table-list-field-share')).toBe('0.3333');
      });
    });

    describe('WHEN: the layout is switched back to grid', () => {
      it('THEN: it drops the flow class, shares, and slot count so the grid areas take over again', async () => {
        await render();
        host.itemLayout.set('grid');
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const firstItem = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const firstField = firstItem.querySelector<HTMLElement>('.list-field');

        expect(listHost.dataset['itemLayout']).toBe('grid');
        expect(listHost.style.getPropertyValue('--sys-nat-table-list-field-slots')).toBe('');
        expect(firstItem.classList.contains('list-item--flow')).toBe(false);
        expect(firstField?.style.getPropertyValue('--sys-nat-table-list-field-share')).toBe('');
        expect(firstField?.style.getPropertyValue('grid-area')).toBe('name');
      });
    });

    describe('WHEN: item navigation is enabled alongside the flow layout', () => {
      it('THEN: it applies the flow class to the gridcell items too', async () => {
        host.enableItemNavigation.set(true);
        await render();

        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');

        expect(cells.length).toBeGreaterThan(0);
        expect(cells.every((cell) => cell.classList.contains('list-item--flow'))).toBe(true);
      });
    });
  });
});
