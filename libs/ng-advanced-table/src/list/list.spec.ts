import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import { ROW_ACTIVATE_INTERACTIVE_SELECTOR } from '../common/interaction.const';
import { NAT_TABLE_DATA_STATUS } from '../common/table-status.const';
import { NatTableService } from '../domain-logic/table.service';
import { ListHost } from '../test-helpers/list-hosts.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatTableRowRenderStrategyRegistry } from '../virtualization/table-row-render-strategy.service';

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

      it('THEN: it exposes named grid areas so consumers can lay out item fields', async () => {
        await render();

        const listHost = queryAll(fixture, 'nat-list')[0];
        const firstItem = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const firstField = firstItem.querySelector<HTMLElement>('.list-field');

        expect(listHost.style.getPropertyValue('--sys-nat-table-list-item-areas')).toBe("'name' 'region' 'status' 'throughput'");
        expect(firstField?.style.getPropertyValue('grid-area')).toBe('name');
      });

      it('THEN: it registers itself as the surface controller for companion controls', async () => {
        await render();

        const service = fixture.debugElement.query(By.directive(TestTableSurface)).injector.get(NatTableService);

        expect(service.controller()).toBe(getList());
      });

      it('THEN: it renders every row without providing any row-render strategy', async () => {
        await render();

        // The list is deliberately outside virtualization: it provides no
        // strategy registry, so the shared state must render the full row set.
        const listInjector = fixture.debugElement.query(By.directive(NatList)).injector;

        expect(listInjector.get(NatTableRowRenderStrategyRegistry, null)).toBeNull();
        expect(queryAll(fixture, '[data-testid="nat-list-item"]')).toHaveLength(6);
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

    describe('WHEN: each state is rendered', () => {
      it('THEN: it shares one base class and adds a per-state modifier and indicator', async () => {
        host.rows.set([]);
        await render();

        const emptyState = queryAll(fixture, '[data-testid="nat-list-empty-state"]')[0];

        expect(emptyState.classList.contains('list-state')).toBe(true);
        expect(emptyState.classList.contains('list-state-empty')).toBe(true);
        expect(emptyState.getAttribute('data-state')).toBe('empty');
        expect(emptyState.querySelector('.list-state-indicator')?.getAttribute('aria-hidden')).toBe('true');
        expect(emptyState.querySelector('.list-state-message')?.textContent.trim()).toBe(emptyState.textContent.trim());

        host.dataStatus.set(NAT_TABLE_DATA_STATUS.error);
        await render();

        const errorState = queryAll(fixture, '[data-testid="nat-list-error-state"]')[0];

        expect(errorState.classList.contains('list-state')).toBe(true);
        expect(errorState.classList.contains('list-state-error')).toBe(true);
        expect(errorState.getAttribute('data-state')).toBe('error');
      });
    });
  });

  describe('GIVEN: a list with row activation', () => {
    describe('WHEN: row activation is enabled', () => {
      it('THEN: it emits rowActivate on activator click and keeps the item itself out of the tab order', async () => {
        host.enableRowActivation.set(true);
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const activators = queryAll<HTMLButtonElement>(fixture, '[data-testid="nat-list-item-activator"]');

        expect(activators).toHaveLength(6);
        expect(items[0].hasAttribute('tabindex')).toBe(false);

        activators[0].click();
        await render();

        expect(host.activated()).toHaveLength(1);
        expect(host.activated()[0].rowData.name).toBe('Alpha');
      });

      it('THEN: it names each activator from its item first field via aria-labelledby', async () => {
        host.enableRowActivation.set(true);
        await render();

        const item = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const activator = item.querySelector('[data-testid="nat-list-item-activator"]');
        const firstField = item.querySelector('.list-field');

        // Named from the FIRST field only, so a screen reader hears a concise
        // name ("Service Alpha") instead of the whole item content twice.
        expect(firstField?.id).toBeTruthy();
        expect(activator?.getAttribute('aria-labelledby')).toBe(firstField?.id);
        expect(firstField?.textContent).toContain('Alpha');
      });

      it('THEN: it keeps the accessible name resolvable when row ids contain whitespace', async () => {
        host.enableRowActivation.set(true);
        host.getRowId.set((row) => `${row.name} ${row.region}`);
        await render();

        const item = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const activator = item.querySelector('[data-testid="nat-list-item-activator"]');
        const labelledby = activator?.getAttribute('aria-labelledby') ?? '';

        // aria-labelledby is a space-separated id list: an id derived from a
        // whitespace-bearing row id would split into unresolvable tokens and
        // leave the button with no accessible name.
        expect(labelledby).toBeTruthy();
        expect(labelledby).not.toContain(' ');
        expect(item.querySelector(`[id="${labelledby}"]`)?.textContent).toContain('Alpha');
      });

      it('THEN: the z-index guard covers every selector row activation exempts', async () => {
        host.enableRowActivation.set(true);
        await render();

        // CSS cannot import ROW_ACTIVATE_INTERACTIVE_SELECTOR, so this locks
        // the parity by hand: every control the event guard exempts must also
        // be raised above the stretched activator. Normalized because the
        // emulated-encapsulation compiler interleaves _ngcontent attribute
        // selectors and drops attribute-value quotes.
        const normalize = (value: string): string => value.replaceAll(/\[_ngcontent-[^\]]*\]/g, '').replaceAll(/['"]/g, '');
        const guardRule = Array.from(globalThis.document.querySelectorAll('style'))
          .map((style) => style.textContent)
          .join('\n')
          .split('}')
          .map(normalize)
          .find((rule) => rule.includes('.list-field') && rule.includes(':is(') && rule.includes('z-index'));

        expect(guardRule).toBeTruthy();

        for (const selector of ROW_ACTIVATE_INTERACTIVE_SELECTOR.split(',')) {
          expect(guardRule).toContain(normalize(selector.trim()));
        }
      });

      it('THEN: it emits rowActivate on Enter and Space and prevents their native default', async () => {
        host.enableRowActivation.set(true);
        await render();

        const activator = queryAll<HTMLButtonElement>(fixture, '[data-testid="nat-list-item-activator"]')[0];
        const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

        activator.dispatchEvent(enter);
        await render();

        expect(host.activated()).toHaveLength(1);
        // preventDefault suppresses the button's own native activation, which
        // would synthesize a click (double emit) and let Space scroll the page.
        expect(enter.defaultPrevented).toBe(true);

        activator.dispatchEvent(space);
        await render();

        expect(host.activated()).toHaveLength(2);
        expect(space.defaultPrevented).toBe(true);
      });

      it('THEN: it keeps the activator a sibling of the fields so events from nested controls never reach it', async () => {
        host.enableRowActivation.set(true);
        await render();

        const item = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const activator = item.querySelector('[data-testid="nat-list-item-activator"]');
        const field = item.querySelector<HTMLElement>('.list-field');

        // The activator must never wrap the fields: nested interactive content
        // inside a button is invalid HTML, and sibling structure (plus the
        // z-index raise in CSS) is what keeps e.g. a selection checkbox
        // operable without triggering activation.
        expect(field).toBeTruthy();
        expect(activator?.contains(field)).toBe(false);

        field?.click();
        await render();

        expect(host.activated()).toHaveLength(0);
      });
    });

    describe('WHEN: row activation is left disabled', () => {
      it('THEN: it leaves keydown defaults intact', async () => {
        await render();

        const item = queryAll(fixture, '[data-testid="nat-list-item"]')[0];
        const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

        item.dispatchEvent(event);
        await render();

        expect(event.defaultPrevented).toBe(false);
      });

      it('THEN: it does not emit when activation is disabled', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(queryAll(fixture, '[data-testid="nat-list-item-activator"]')).toHaveLength(0);
        expect(items[0].hasAttribute('tabindex')).toBe(false);

        items[0].click();
        await render();

        expect(host.activated()).toHaveLength(0);
      });
    });
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
