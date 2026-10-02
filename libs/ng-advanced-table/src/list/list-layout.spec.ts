import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatList } from './list';
import { ListHost } from '../test-helpers/list-hosts.helper';
import type { Row } from '../test-helpers/table-data.helper';

const queryAll = <T extends HTMLElement>(fixture: ComponentFixture<ListHost>, selector: string): T[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));

const FIELD = '[data-testid="nat-list-field"]';

const fieldWidth = (field: HTMLElement | null | undefined): string =>
  field?.style.getPropertyValue('--sys-nat-table-list-field-width') ?? '';

describe('FEATURE: NatList item layouts (grid areas vs. wrapping flow slots)', () => {
  let fixture: ComponentFixture<ListHost>;
  let host: ListHost;

  const getList = (): NatList<Row> => fixture.debugElement.query(By.directive(NatList)).componentInstance as NatList<Row>;
  const getListHost = (): HTMLElement => fixture.debugElement.query(By.directive(NatList)).nativeElement as HTMLElement;

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

    describe('WHEN: the list renders', () => {
      it('THEN: it exposes the flow layout on the host and points every field at its width token with an equal-split default', async () => {
        await render();

        const items = queryAll(fixture, '[data-testid="nat-list-item"]');
        const fields = Array.from(items[0].querySelectorAll<HTMLElement>(FIELD));

        expect(getListHost().dataset['itemLayout']).toBe('flow');
        expect(fields.map(fieldWidth)).toStrictEqual([
          'var(--nat-list-field-width-name, calc(100% / 4))',
          'var(--nat-list-field-width-region, calc(100% / 4))',
          'var(--nat-list-field-width-status, calc(100% / 4))',
          'var(--nat-list-field-width-throughput, calc(100% / 4))'
        ]);
      });
    });

    describe('WHEN: a column is hidden through column visibility state', () => {
      it('THEN: it re-splits the default width between the remaining fields', async () => {
        await render();
        getList().patchState({ columnVisibility: { region: false } });
        await render();

        const firstField = queryAll(fixture, '[data-testid="nat-list-item"]')[0].querySelector<HTMLElement>(FIELD);

        expect(fieldWidth(firstField)).toBe('var(--nat-list-field-width-name, calc(100% / 3))');
      });
    });

    describe('WHEN: the layout is switched back to grid', () => {
      it('THEN: it drops the width bridges so the grid areas take over again', async () => {
        await render();
        host.itemLayout.set('grid');
        await render();

        const firstField = queryAll(fixture, '[data-testid="nat-list-item"]')[0].querySelector<HTMLElement>(FIELD);

        expect(getListHost().dataset['itemLayout']).toBe('grid');
        expect(fieldWidth(firstField)).toBe('');
        expect(firstField?.style.getPropertyValue('grid-area')).toBe('name');
      });
    });

    describe('WHEN: item navigation is enabled alongside the flow layout', () => {
      it('THEN: it sizes the fields inside the gridcell items the same way', async () => {
        host.enableItemNavigation.set(true);
        await render();

        const cells = queryAll(fixture, '[data-testid="nat-list-item-cell"]');

        expect(cells.length).toBeGreaterThan(0);
        expect(cells.map((cell) => fieldWidth(cell.querySelector<HTMLElement>(FIELD)))).toStrictEqual(
          cells.map(() => 'var(--nat-list-field-width-name, calc(100% / 4))')
        );
      });
    });
  });
});
