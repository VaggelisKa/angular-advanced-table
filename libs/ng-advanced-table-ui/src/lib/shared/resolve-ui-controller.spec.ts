import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { injectNatTableUiController } from './resolve-ui-controller';
import { NatTableService } from './table.service';
import type { NatTableUiController } from './table-ui.types';

function createControllerStub(): NatTableUiController {
  return {
    table: {} as NatTableUiController['table'],
    enableGlobalFilter: () => true,
    enablePagination: () => true,
    patchState: () => undefined,
    tableElementId: signal('nat-table-el-1'),
    localeId: signal('en'),
  };
}

describe('injectNatTableUiController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws outside an injection context', () => {
    const forInput = signal<NatTableUiController | undefined>(undefined);

    expect(() => injectNatTableUiController(forInput, 'spec-control')).toThrow();
  });

  it('resolves the explicit [for] controller and reacts to input changes', () => {
    const stub = createControllerStub();
    const forInput = signal<NatTableUiController | undefined>(stub);
    const controller = TestBed.runInInjectionContext(() =>
      injectNatTableUiController(forInput, 'spec-control'),
    );

    expect(controller()).toBe(stub);

    forInput.set(undefined);
    expect(controller()).toBeNull();

    forInput.set(stub);
    expect(controller()).toBe(stub);
  });

  it('returns null with a single dev-mode warning while unresolved', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const forInput = signal<NatTableUiController | undefined>(undefined);
    const controller = TestBed.runInInjectionContext(() =>
      injectNatTableUiController(forInput, 'spec-control'),
    );

    expect(controller()).toBeNull();

    // Flip to a controller and back: the once-guard must hold across recomputes.
    forInput.set(createControllerStub());
    expect(controller()).not.toBeNull();
    forInput.set(undefined);
    expect(controller()).toBeNull();

    const guardCalls = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('spec-control: no controller resolved'),
    );

    expect(guardCalls.length).toBe(1);
  });

  it('falls back to the NatTableService controller when [for] is not set', () => {
    const stub = createControllerStub();
    TestBed.configureTestingModule({ providers: [NatTableService] });
    const service = TestBed.inject(NatTableService);
    const forInput = signal<NatTableUiController | undefined>(undefined);
    const controller = TestBed.runInInjectionContext(() =>
      injectNatTableUiController(forInput, 'spec-control'),
    );

    expect(controller()).toBeNull();

    service.setController(stub);
    expect(controller()).toBe(stub);

    service.setController(null);
    expect(controller()).toBeNull();
  });

  it('prefers the explicit [for] controller over the service controller', () => {
    const forStub = createControllerStub();
    const serviceStub = createControllerStub();
    TestBed.configureTestingModule({ providers: [NatTableService] });
    TestBed.inject(NatTableService).setController(serviceStub);
    const forInput = signal<NatTableUiController | undefined>(forStub);
    const controller = TestBed.runInInjectionContext(() =>
      injectNatTableUiController(forInput, 'spec-control'),
    );

    expect(controller()).toBe(forStub);

    forInput.set(undefined);
    expect(controller()).toBe(serviceStub);
  });

  it('does not warn when the controller resolves on first read', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const forInput = signal<NatTableUiController | undefined>(createControllerStub());
    const controller = TestBed.runInInjectionContext(() =>
      injectNatTableUiController(forInput, 'spec-control'),
    );

    expect(controller()).not.toBeNull();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
