import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import { ListHost } from '../test-helpers/list-hosts.helper';
import type { Row } from '../test-helpers/table-data.helper';

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

const queryRequired = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T => {
  const element = (fixture.nativeElement as HTMLElement).querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected element for selector: ${selector}`);
  }

  return element;
};

const keydown = (target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });

  target.dispatchEvent(event);

  return event;
};

describe('FEATURE: NatList composite item navigation', () => {
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
    host.enableItemNavigation.set(true);
  });

  describe('GIVEN: a list with item navigation enabled', () => {
    describe('WHEN: the list renders', () => {
      it('THEN: it renders the grid pattern roles instead of plain list semantics', async () => {
        await render();

        const list = queryRequired(fixture, '[data-testid="nat-list"]');
        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');

        expect(list.getAttribute('role')).toBe('grid');
        expect(items).toHaveLength(6);
        expect(items.every((item) => item.getAttribute('role') === 'row')).toBe(true);
        expect(cells).toHaveLength(6);
        expect(cells.every((cell) => cell.getAttribute('role') === 'gridcell')).toBe(true);
      });

      it('THEN: it keeps the whole list one tab stop through roving cell tabindex', async () => {
        await render();

        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');
        const tabStops = cells.filter((cell) => cell.getAttribute('tabindex') === '0');

        expect(tabStops).toHaveLength(1);
        expect(cells.filter((cell) => cell.getAttribute('tabindex') === '-1')).toHaveLength(cells.length - 1);
      });

      it('THEN: it describes the item keyboard model through aria-describedby instructions', async () => {
        await render();

        const list = queryRequired(fixture, '[data-testid="nat-list"]');
        const describedBy = list.getAttribute('aria-describedby') ?? '';
        const instructionIds = describedBy.split(' ').filter((id) => {
          const element = document.getElementById(id);

          return element?.textContent.includes('Up and Down arrow keys') ?? false;
        });

        expect(instructionIds).toHaveLength(1);
      });

      it('THEN: it does not render the plain-mode activator button even when activation is enabled', async () => {
        host.enableRowActivation.set(true);
        await render();

        expect(queryAll(fixture, '[data-testid="nat-list-item-activator"]')).toHaveLength(0);
      });
    });

    describe('WHEN: arrow keys move the roving focus', () => {
      it('THEN: it moves focus to the next and previous item cell', async () => {
        await render();

        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');

        cells[0].focus();
        fixture.detectChanges();

        keydown(cells[0], 'ArrowDown');
        fixture.detectChanges();

        expect(document.activeElement).toBe(cells[1]);

        keydown(cells[1], 'ArrowUp');
        fixture.detectChanges();

        expect(document.activeElement).toBe(cells[0]);
      });
    });

    describe('WHEN: an item is activated', () => {
      it('THEN: it emits rowActivate on item click without requiring enableRowActivation', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        items[1].querySelector<HTMLElement>('.list-field-value')?.click();
        fixture.detectChanges();

        expect(host.activated()).toHaveLength(1);
        expect(host.activated()[0].rowData.name).toBe(getList().table.getRowModel().rows[1].original.name);
      });

      it('THEN: it emits rowActivate on the rowActivate shortcut from a focused item cell', async () => {
        await render();

        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');

        cells[0].focus();

        const enterEvent = keydown(cells[0], 'Enter');

        fixture.detectChanges();

        expect(host.activated()).toHaveLength(1);
        expect(enterEvent.defaultPrevented).toBe(false);

        const spaceEvent = keydown(cells[0], ' ');

        fixture.detectChanges();

        expect(host.activated()).toHaveLength(2);
        // Space must not scroll the page.
        expect(spaceEvent.defaultPrevented).toBe(true);
      });

      it('THEN: it does not emit when the event originates from an interactive control inside a field', async () => {
        await render();

        const cell = queryAll(fixture, '[data-testid="nat-list-item-cell"]')[0];

        cell.insertAdjacentHTML('beforeend', '<button type="button" class="inline-control">Open</button>');

        const control = cell.querySelector<HTMLButtonElement>('button.inline-control');

        control?.click();
        fixture.detectChanges();

        expect(host.activated()).toHaveLength(0);
      });
    });

    describe('WHEN: an item cell contains interactive controls', () => {
      it('THEN: it steps into the controls with Enter and returns to the cell with Escape', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        await render();

        const cell = queryAll(fixture, '[data-testid="nat-list-item-cell"]')[0];

        cell.insertAdjacentHTML(
          'beforeend',
          '<button type="button" class="first-control">Edit</button><button type="button" class="second-control">Delete</button>'
        );

        const firstControl = cell.querySelector('button.first-control') as HTMLButtonElement;
        const secondControl = cell.querySelector('button.second-control') as HTMLButtonElement;

        // when: Enter on the cell steps into its first control instead of activating the row.
        cell.focus();
        keydown(cell, 'Enter');
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(firstControl);
        expect(host.activated()).toHaveLength(0);

        // when: Tab walks to the cell's next control.
        keydown(firstControl, 'Tab');
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(secondControl);

        // when: Escape returns focus to the owning cell.
        keydown(secondControl, 'Escape');
        fixture.detectChanges();

        // then:
        expect(document.activeElement).toBe(cell);
      });
    });

    describe('WHEN: multi row selection is enabled', () => {
      it('THEN: it marks the grid multiselectable and mirrors selection onto aria-selected', async () => {
        host.enableRowSelection.set(true);
        await render();

        const firstRowId = getList().table.getRowModel().rows[0].id;

        getList().patchState({ rowSelection: { [firstRowId]: true } });
        await render();

        const list = queryRequired(fixture, '[data-testid="nat-list"]');
        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(list.getAttribute('aria-multiselectable')).toBe('true');
        expect(items[0].getAttribute('aria-selected')).toBe('true');
        expect(items[1].getAttribute('aria-selected')).toBe('false');
        expect(items[0].getAttribute('data-selected')).toBe('true');
      });
    });

    describe('WHEN: single row selection is enabled', () => {
      it('THEN: it omits aria-multiselectable on the grid', async () => {
        host.enableRowSelection.set(true);
        host.selectionMode.set('single');
        await render();

        const list = queryRequired(fixture, '[data-testid="nat-list"]');

        expect(list.hasAttribute('aria-multiselectable')).toBe(false);
      });
    });
  });

  describe('GIVEN: a list with item navigation left disabled', () => {
    describe('WHEN: the list renders', () => {
      it('THEN: it keeps plain list semantics with no grid roles, roving tabindex, or keyboard instructions', async () => {
        host.enableItemNavigation.set(false);
        await render();

        const list = queryRequired(fixture, '[data-testid="nat-list"]');
        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const describedBy = list.getAttribute('aria-describedby') ?? '';
        const describesInstructions = describedBy
          .split(' ')
          .some((id) => document.getElementById(id)?.textContent.includes('arrow keys') ?? false);

        expect(list.hasAttribute('role')).toBe(false);
        expect(list.hasAttribute('aria-multiselectable')).toBe(false);
        expect(items.every((item) => !item.hasAttribute('role') && !item.hasAttribute('tabindex'))).toBe(true);
        expect(queryAll(fixture, '[data-testid="nat-list-item-cell"]')).toHaveLength(0);
        expect(describesInstructions).toBe(false);
      });
    });
  });
});
