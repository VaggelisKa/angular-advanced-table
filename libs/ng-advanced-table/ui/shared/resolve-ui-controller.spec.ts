import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { injectNatTableUiController } from './resolve-ui-controller';
import type { NatTableUiController } from './table-ui.types';
import { NatTableService } from './table.service';

const createControllerStub = (): NatTableUiController => {
  return {
    table: {} as NatTableUiController['table'],
    enableGlobalFilter: () => true,
    enablePagination: () => true,
    patchState: () => undefined,
    tableElementId: signal('nat-table-el-1'),
    localeId: signal('en')
  };
};

describe('FEATURE: injectNatTableUiController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GIVEN: the UI controller resolver is exercised', () => {
    describe('WHEN: throws outside an injection context', () => {
      it('THEN: it raises the Angular injection-context error', () => {
        const forInput = signal<NatTableUiController | undefined>(undefined);

        expect(() => injectNatTableUiController(forInput, 'spec-control')).toThrow();
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised with an explicit controller input', () => {
    describe('WHEN: resolves the explicit [for] controller and reacts to input changes', () => {
      it('THEN: it returns the current explicit controller signal value', () => {
        const stub = createControllerStub();
        const forInput = signal<NatTableUiController | undefined>(stub);
        const controller = TestBed.runInInjectionContext(() => injectNatTableUiController(forInput, 'spec-control'));

        expect(controller()).toBe(stub);

        forInput.set(undefined);
        expect(controller()).toBeNull();

        forInput.set(stub);
        expect(controller()).toBe(stub);
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised without a resolvable controller', () => {
    describe('WHEN: returns null with a single dev-mode warning while unresolved', () => {
      it('THEN: it reports unresolved controller state once', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const forInput = signal<NatTableUiController | undefined>(undefined);
        const controller = TestBed.runInInjectionContext(() => injectNatTableUiController(forInput, 'spec-control'));

        expect(controller()).toBeNull();

        // Flip to a controller and back: the once-guard must hold across recomputes.
        forInput.set(createControllerStub());
        expect(controller()).not.toBeNull();

        forInput.set(undefined);
        expect(controller()).toBeNull();

        const guardCalls = warnSpy.mock.calls.filter((call) => String(call[0]).includes('spec-control: no controller resolved'));

        expect(guardCalls).toHaveLength(1);
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised with only the service controller available', () => {
    describe('WHEN: falls back to the NatTableService controller when [for] is not set', () => {
      it('THEN: it returns the service-provided controller', () => {
        const stub = createControllerStub();

        TestBed.configureTestingModule({ providers: [NatTableService] });
        const service = TestBed.inject(NatTableService);
        const forInput = signal<NatTableUiController | undefined>(undefined);
        const controller = TestBed.runInInjectionContext(() => injectNatTableUiController(forInput, 'spec-control'));

        expect(controller()).toBeNull();

        service.setController(stub);
        expect(controller()).toBe(stub);

        service.setController(null);
        expect(controller()).toBeNull();
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised with explicit and service controllers', () => {
    describe('WHEN: prefers the explicit [for] controller over the service controller', () => {
      it('THEN: it returns the explicit controller over the fallback', () => {
        const forStub = createControllerStub();
        const serviceStub = createControllerStub();

        TestBed.configureTestingModule({ providers: [NatTableService] });
        TestBed.inject(NatTableService).setController(serviceStub);
        const forInput = signal<NatTableUiController | undefined>(forStub);

        const controller = TestBed.runInInjectionContext(() => injectNatTableUiController(forInput, 'spec-control'));

        expect(controller()).toBe(forStub);

        forInput.set(undefined);
        expect(controller()).toBe(serviceStub);
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised with optional unresolved usage', () => {
    describe('WHEN: does not warn while unresolved when optionalUsage is set', () => {
      it('THEN: it suppresses optional unresolved-controller warnings', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const forInput = signal<NatTableUiController | undefined>(undefined);
        const controller = TestBed.runInInjectionContext(() =>
          injectNatTableUiController(forInput, 'spec-control', { optionalUsage: true })
        );

        expect(controller()).toBeNull();
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN: the UI controller resolver is exercised with an immediately resolved controller', () => {
    describe('WHEN: does not warn when the controller resolves on first read', () => {
      it('THEN: it returns the controller without warning', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const forInput = signal<NatTableUiController | undefined>(createControllerStub());
        const controller = TestBed.runInInjectionContext(() => injectNatTableUiController(forInput, 'spec-control'));

        expect(controller()).not.toBeNull();
        expect(warnSpy).not.toHaveBeenCalled();
      });
    });
  });
});
