import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { RowData } from '@tanstack/angular-table';

import { NatTableService } from './table.service';
import type { Table } from '../common/table-features.type';
import type { NatTableUiController } from '../common/ui-controller.type';
import { NAT_TABLE_KEYBINDINGS } from '../hotkey-a11y/common/keybindings.const';

const createController = (id: string): NatTableUiController => {
  return {
    table: {} as Table<RowData>,
    enableGlobalFilter: () => false,
    enablePagination: () => false,
    patchState: () => undefined,
    tableElementId: signal(id)
  };
};

const createService = (): NatTableService => {
  TestBed.configureTestingModule({ providers: [NatTableService] });

  return TestBed.inject(NatTableService);
};

describe('FEATURE: NatTableService', () => {
  describe('GIVEN: competing table controllers registering against one surface', () => {
    describe('WHEN: a controller unregisters', () => {
      it('THEN: it clears the active controller only when the same instance unregisters', () => {
        const service = createService();
        const first = createController('first-table');
        const second = createController('second-table');

        service.setController(first);
        service.clearController(second);

        expect(service.controller()).toBe(first);

        service.setController(second);
        service.clearController(first);

        expect(service.controller()).toBe(second);

        service.clearController(second);

        expect(service.controller()).toBeNull();
      });
    });
  });

  describe('GIVEN: a surface configuring the service', () => {
    describe('WHEN: the configuration omits a defined-only scalar option', () => {
      it('THEN: it keeps the current value rather than resetting it to a default', () => {
        const service = createService();

        service.configure({ stickyHeader: false, enableSorting: true });
        service.configure({ enableMultiSort: true });

        expect(service.stickyHeader()).toBe(false);
        expect(service.enableSorting()).toBe(true);
        expect(service.enableMultiSort()).toBe(true);
      });
    });

    describe('WHEN: the configuration carries undefined for a pass-through option', () => {
      it('THEN: it applies undefined, because those options treat it as a real value', () => {
        const service = createService();

        service.configure({ manualPageCount: 5, locale: 'de-DE', direction: 'rtl' });

        expect(service.manualPageCount()).toBe(5);
        expect(service.locale()).toBe('de-DE');
        expect(service.direction()).toBe('rtl');

        service.configure({ manualPageCount: undefined, locale: undefined, direction: undefined });

        expect(service.manualPageCount()).toBeUndefined();
        expect(service.locale()).toBeUndefined();
        expect(service.direction()).toBeUndefined();
      });
    });

    describe('WHEN: the configuration repeats a structurally equal accessibility text object', () => {
      it('THEN: it keeps the stored reference so downstream computeds do not recompute', () => {
        const service = createService();

        service.configure({ accessibilityText: { description: 'Orders table' } });

        const stored = service.accessibilityText();

        service.configure({ accessibilityText: { description: 'Orders table' } });

        expect(service.accessibilityText()).toBe(stored);

        service.configure({ accessibilityText: { description: 'Orders grid' } });

        expect(service.accessibilityText()).not.toBe(stored);
      });
    });

    describe('WHEN: the configuration repeats a structurally equal keybindings object', () => {
      it('THEN: it keeps the stored reference so the keyboard map is not rebuilt', () => {
        const service = createService();

        service.configure({ keybindings: { rowActivate: ['Enter'] } });

        const stored = service.surfaceKeybindings();

        service.configure({ keybindings: { rowActivate: ['Enter'] } });

        expect(service.surfaceKeybindings()).toBe(stored);
      });
    });

    describe('WHEN: the configuration carries state and initial state', () => {
      it('THEN: it stores both slices as given', () => {
        const service = createService();

        service.configure({
          state: { pagination: { pageIndex: 2, pageSize: 10 } },
          initialState: { pagination: { pageIndex: 0, pageSize: 10 } }
        });

        expect(service.controlledState().pagination?.pageIndex).toBe(2);
        expect(service.initialState().pagination?.pageIndex).toBe(0);
      });
    });
  });

  describe('GIVEN: a surface configured with a table mode', () => {
    describe('WHEN: the mode is the string "manual"', () => {
      it('THEN: it reports pagination, sorting, and filtering as manual together', () => {
        const service = createService();

        service.configure({ mode: 'manual' });

        expect([service.manualPagination(), service.manualSorting(), service.manualFiltering()]).toStrictEqual([true, true, true]);
      });
    });

    describe('WHEN: the mode is the string "auto"', () => {
      it('THEN: it reports none of them as manual', () => {
        const service = createService();

        service.configure({ mode: 'auto' });

        expect([service.manualPagination(), service.manualSorting(), service.manualFiltering()]).toStrictEqual([false, false, false]);
      });
    });

    describe('WHEN: the mode configures each concern independently', () => {
      it('THEN: it reports manual only for the concerns configured as manual', () => {
        const service = createService();

        service.configure({ mode: { pagination: 'manual', sorting: 'auto', filtering: 'manual' } });

        expect([service.manualPagination(), service.manualSorting(), service.manualFiltering()]).toStrictEqual([true, false, true]);
      });
    });
  });

  describe('GIVEN: companion controls registering themselves with the service', () => {
    describe('WHEN: pagination controls register and unregister', () => {
      it('THEN: it reports pagination presence while at least one remains registered', () => {
        const service = createService();

        expect(service.hasPagination()).toBe(false);

        service.registerPagination();
        service.registerPagination();

        expect(service.hasPagination()).toBe(true);

        service.unregisterPagination();

        expect(service.hasPagination()).toBe(true);

        service.unregisterPagination();

        expect(service.hasPagination()).toBe(false);
      });
    });

    describe('WHEN: more unregisters arrive than registers', () => {
      it('THEN: it floors the count at zero rather than going negative', () => {
        const service = createService();

        service.unregisterPagination();
        service.unregisterSearch();
        service.registerPagination();
        service.registerSearch();

        expect([service.hasPagination(), service.hasSearch()]).toStrictEqual([true, true]);
      });
    });

    describe('WHEN: search controls register and unregister', () => {
      it('THEN: it reports search presence while at least one remains registered', () => {
        const service = createService();

        expect(service.hasSearch()).toBe(false);

        service.registerSearch();

        expect(service.hasSearch()).toBe(true);

        service.unregisterSearch();

        expect(service.hasSearch()).toBe(false);
      });
    });
  });

  describe('GIVEN: renderers seeding and committing the central state', () => {
    describe('WHEN: the state is seeded twice', () => {
      it('THEN: it seeds from the initial state once and keeps later commits on the second call', () => {
        const service = createService();

        service.configure({ initialState: { globalFilter: 'seed', pagination: { pageIndex: 1, pageSize: 25 } } });

        expect(service.seedState()).toBe(true);
        expect(service.hasSeededState()).toBe(true);
        expect(service.state().globalFilter).toBe('seed');
        expect(service.state().pagination).toStrictEqual({ pageIndex: 1, pageSize: 25 });

        service.commitState({ ...service.state(), globalFilter: 'typed' });

        expect(service.seedState()).toBe(false);
        expect(service.state().globalFilter).toBe('typed');
      });
    });

    describe('WHEN: a renderer commits a state with one slice controlled', () => {
      it('THEN: it stores the uncontrolled slices and reports the proposed controlled slice without applying it', () => {
        const service = createService();

        service.configure({ state: { globalFilter: 'bound' } });
        service.seedState();

        expect(service.stateChanges()).toBeNull();

        service.commitState({ ...service.state(), globalFilter: 'proposed', pagination: { pageIndex: 3, pageSize: 10 } });

        expect(service.state().globalFilter).toBe('bound');
        expect(service.state().pagination.pageIndex).toBe(3);
        expect(service.stateChanges()?.globalFilter).toBe('proposed');
      });
    });

    describe('WHEN: the binding stops controlling a slice', () => {
      it('THEN: it falls back to the state the service owns for that slice', () => {
        const service = createService();

        service.seedState();
        service.commitState({ ...service.state(), globalFilter: 'owned' });
        service.configure({ state: { globalFilter: 'bound' } });

        expect(service.state().globalFilter).toBe('bound');

        service.configure({ state: {} });

        expect(service.state().globalFilter).toBe('owned');
      });
    });
  });

  describe('GIVEN: keybindings provided globally and by the surface', () => {
    describe('WHEN: the surface overrides one global binding', () => {
      it('THEN: it merges the surface binding over the global one', () => {
        TestBed.configureTestingModule({
          providers: [
            NatTableService,
            { provide: NAT_TABLE_KEYBINDINGS, useValue: { rowActivate: ['Enter'], cellExitControl: 'Escape' } }
          ]
        });

        const service = TestBed.inject(NatTableService);

        service.configure({ keybindings: { rowActivate: ['F2'] } });

        expect(service.keybindings().rowActivate).toStrictEqual(['F2']);
        expect(service.keybindings().cellExitControl).toBe('Escape');
      });
    });

    describe('WHEN: no surface keybindings are set', () => {
      it('THEN: it exposes a keyboard map built from the resolved bindings', () => {
        const service = createService();

        expect(service.keyboard()).toBeDefined();
        expect(service.keybindings()).toBeDefined();
      });
    });
  });
});
