import { effect, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';

import { TableHost, createTableHostFixture, getInternalStore } from '../test-helpers/table-hosts.helper';

// v9's injectTable forwards options from an effect; NatTableState owns the
// sync instead, through one deduplicated, untracked flushTableOptions().
describe('FEATURE: TanStack table options sync', () => {
  let fixture: ComponentFixture<TableHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    ({ fixture } = await createTableHostFixture());
  });

  describe('GIVEN: a rendered table', () => {
    describe('WHEN: a state change is committed and the view refreshes', () => {
      it('THEN: it applies the options at the commit and not again in the refresh', async () => {
        const store = getInternalStore(fixture);
        const optionsBefore = store.table.options;

        store.patchState({ sorting: [{ id: 'name', desc: false }] });
        const optionsAtCommit = store.table.options;

        await fixture.whenStable();

        expect(optionsAtCommit).not.toBe(optionsBefore);
        expect(store.table.options).toBe(optionsAtCommit);
        expect(store.table.atoms.sorting.get()).toStrictEqual([{ id: 'name', desc: false }]);
      });
    });

    describe('WHEN: nothing changed since the last sync', () => {
      it('THEN: flushing again leaves the table options untouched', async () => {
        const store = getInternalStore(fixture);
        const optionsBefore = store.table.options;

        store.flushTableOptions();
        store.flushTableOptions();
        await fixture.whenStable();

        expect(store.table.options).toBe(optionsBefore);
      });
    });

    describe('WHEN: another effect flushes the options', () => {
      it('THEN: it does not make that effect depend on the table options', async () => {
        const store = getInternalStore(fixture);
        let runs = 0;

        TestBed.runInInjectionContext(() =>
          effect(() => {
            runs++;
            store.flushTableOptions();
          })
        );
        await fixture.whenStable();
        expect(runs).toBe(1);

        store.patchState({ sorting: [{ id: 'name', desc: true }] });
        await fixture.whenStable();

        expect(runs).toBe(1);
      });
    });
  });
});
