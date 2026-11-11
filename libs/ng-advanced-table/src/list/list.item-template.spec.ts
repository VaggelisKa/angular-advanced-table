import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatList } from './list';
import type { NatTableRowActivateEvent } from '../common/row.type';
import { buildRows, columns } from '../test-helpers/table-data.helper';
import type { Row } from '../test-helpers/table-data.helper';
import { queryAll } from '../test-helpers/table-dom.helper';
import { TestTableSurface } from '../test-helpers/table-hosts.helper';
import { NatListItemLabel } from '../ui/list-item-label.directive';
import { NatListItemTemplate } from '../ui/list-item-template.directive';

@Component({
  selector: 'test-list-item-template-host',
  imports: [NatList, NatListItemLabel, NatListItemTemplate, TestTableSurface],
  template: `
    <nat-table-surface>
      <nat-list
        [columns]="columns"
        [data]="rows()"
        [enableItemNavigation]="enableItemNavigation()"
        [enableRowActivation]="enableRowActivation()"
        [enableRowSelection]="enableRowSelection()"
        accessibleName="Operations list"
        (rowActivate)="activated.set([...activated(), $event])">
        @if (showItemTemplate()) {
          <ng-template
            [natListItemOf]="columns"
            let-ids="visibleColumnIds"
            let-index="rowIndex"
            let-item
            let-row="row"
            let-selected="selected"
            natListItem>
            <article
              [attr.data-column-ids]="ids.join(',')"
              [attr.data-row-index]="index"
              [attr.data-selected-flag]="selected"
              data-testid="item-card">
              @if (showLabel()) {
                <h3 data-testid="item-card-title" natListItemLabel>{{ item.name }}</h3>
              } @else {
                <h3 data-testid="item-card-title">{{ item.name }}</h3>
              }
              <p data-testid="item-card-status">{{ item.status }}</p>
              <button data-testid="item-card-select" type="button" (click)="row.toggleSelected()">Select</button>
            </article>
          </ng-template>
        }
      </nat-list>
    </nat-table-surface>
  `
})
class ListItemTemplateHost {
  public readonly rows = signal<Row[]>(buildRows(3));
  public readonly columns = columns;
  public readonly showItemTemplate = signal(true);
  public readonly showLabel = signal(true);
  public readonly enableRowActivation = signal(false);
  public readonly enableRowSelection = signal(false);
  public readonly enableItemNavigation = signal(false);
  public readonly activated = signal<NatTableRowActivateEvent<Row>[]>([]);
}

const cards = (fixture: ComponentFixture<unknown>): HTMLElement[] => queryAll(fixture, '[data-testid="item-card"]');

const text = (elements: HTMLElement[]): string[] => elements.map((element) => element.textContent.replace(/\s+/g, ' ').trim());

const labelWarnings = (warn: { mock: { calls: unknown[][] } }): unknown[][] =>
  warn.mock.calls.filter(([message]) => String(message).includes('natListItemLabel'));

describe('FEATURE: projected list item template', () => {
  let fixture: ComponentFixture<ListItemTemplateHost>;
  let host: ListItemTemplateHost;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(ListItemTemplateHost);
    host = fixture.componentInstance;
  });

  describe('GIVEN: a list with a natListItem template', () => {
    describe('WHEN: the items render', () => {
      it('THEN: it renders the template once per item with the row data', async () => {
        await fixture.whenStable();

        const titles = queryAll(fixture, '[data-testid="item-card-title"]');

        expect(text(titles)).toEqual(host.rows().map((row) => row.name));
        expect(cards(fixture).every((card) => card.closest('[data-testid="nat-list-item"]') !== null)).toBe(true);
      });

      it('THEN: it replaces the built-in fields', async () => {
        await fixture.whenStable();

        expect(queryAll(fixture, '[data-testid="nat-list-field"]')).toHaveLength(0);
        expect(queryAll(fixture, '[data-testid="nat-list-item-content"]')).toHaveLength(3);
      });

      it('THEN: it passes the row index and the visible column ids', async () => {
        await fixture.whenStable();

        const rendered = cards(fixture);

        expect(rendered.map((card) => card.dataset['rowIndex'])).toEqual(['0', '1', '2']);
        expect(rendered.every((card) => card.dataset['columnIds'] === 'name,region,status,throughput')).toBe(true);
      });
    });

    describe('WHEN: the data changes', () => {
      it('THEN: it updates the template with the new row', async () => {
        await fixture.whenStable();

        const [first, ...rest] = host.rows();

        host.rows.set([{ ...first, name: 'Renamed' }, ...rest]);
        await fixture.whenStable();

        expect(text(queryAll(fixture, '[data-testid="item-card-title"]'))[0]).toBe('Renamed');
      });
    });

    describe('WHEN: the template is removed', () => {
      it('THEN: it falls back to the built-in fields', async () => {
        await fixture.whenStable();
        host.showItemTemplate.set(false);
        await fixture.whenStable();

        expect(cards(fixture)).toHaveLength(0);
        expect(queryAll(fixture, '[data-testid="nat-list-field"]').length).toBeGreaterThan(0);
      });
    });
  });

  describe('GIVEN: a templated list with row selection enabled', () => {
    describe('WHEN: the template toggles the row selection', () => {
      it('THEN: it updates the selected flag and the item selection attribute', async () => {
        host.enableRowSelection.set(true);
        await fixture.whenStable();

        queryAll<HTMLButtonElement>(fixture, '[data-testid="item-card-select"]')[1].click();
        await fixture.whenStable();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');

        expect(cards(fixture).map((card) => card.dataset['selectedFlag'])).toEqual(['false', 'true', 'false']);
        expect(items.map((item) => item.dataset['selected'])).toEqual(['false', 'true', 'false']);
      });
    });
  });

  describe('GIVEN: a templated list with row activation enabled', () => {
    beforeEach(() => {
      host.enableRowActivation.set(true);
    });

    describe('WHEN: the template marks a natListItemLabel element', () => {
      it('THEN: it names each activator by that element without warning', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        await fixture.whenStable();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const names = items.map((item) => {
          const labelledby = item.querySelector('[data-testid="nat-list-item-activator"]')?.getAttribute('aria-labelledby');

          return labelledby ? item.querySelector(`[id="${labelledby}"]`)?.textContent.trim() : null;
        });

        expect(names).toEqual(host.rows().map((row) => row.name));
        expect(items.every((item) => !item.querySelector('[data-testid="nat-list-item-activator"]')?.hasAttribute('aria-label'))).toBe(
          true
        );
        expect(labelWarnings(warn)).toHaveLength(0);

        warn.mockRestore();
      });
    });

    describe('WHEN: the template marks no natListItemLabel element', () => {
      it('THEN: it names each activator by the first visible value and warns once', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        host.showLabel.set(false);
        await fixture.whenStable();
        host.rows.set(buildRows(2));
        await fixture.whenStable();

        const activators = queryAll(fixture, '[data-testid="nat-list-item-activator"]');

        expect(activators.map((activator) => activator.getAttribute('aria-label'))).toEqual(['Alpha', 'Beta']);
        expect(activators.every((activator) => !activator.hasAttribute('aria-labelledby'))).toBe(true);
        expect(labelWarnings(warn)).toHaveLength(1);

        warn.mockRestore();
      });
    });

    describe('WHEN: an activator is clicked', () => {
      it('THEN: it emits rowActivate for that row', async () => {
        await fixture.whenStable();

        queryAll<HTMLButtonElement>(fixture, '[data-testid="nat-list-item-activator"]')[2].click();

        expect(host.activated().map((event) => event.rowData.name)).toEqual(['Gamma']);
      });
    });
  });

  describe('GIVEN: a templated list with item navigation enabled', () => {
    beforeEach(async () => {
      host.enableItemNavigation.set(true);
      await fixture.whenStable();
    });

    describe('WHEN: the items render', () => {
      it('THEN: it renders the template inside each item gridcell without an activator', () => {
        expect(cards(fixture).every((card) => card.closest('[role="gridcell"]') !== null)).toBe(true);
        expect(queryAll(fixture, '[data-testid="nat-list-item-activator"]')).toHaveLength(0);
      });
    });

    describe('WHEN: the item content and then a control inside it are clicked', () => {
      it('THEN: it emits rowActivate for the content click only', () => {
        queryAll(fixture, '[data-testid="item-card-status"]')[0].click();
        queryAll<HTMLButtonElement>(fixture, '[data-testid="item-card-select"]')[1].click();

        expect(host.activated().map((event) => event.rowData.name)).toEqual(['Alpha']);
      });
    });
  });
});
