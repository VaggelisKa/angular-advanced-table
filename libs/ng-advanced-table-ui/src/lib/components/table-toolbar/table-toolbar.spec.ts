import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { NatTableToolbar } from './table-toolbar';
import { NatToolbarItem } from './toolbar-item/toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type { NatToolbarItemRef } from './common/toolbar-tokens.type';
import type { NatTableUiController } from '../../shared/table-ui.types';

@Component({
  imports: [NatTableToolbar],
  template: `<nat-table-toolbar [for]="controller()" />`,
})
class ToolbarControllerHost {
  public readonly controller = signal<NatTableUiController | undefined>(undefined);
}

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

@Component({
  imports: [NatTableToolbar],
  template: `
    <nat-table-toolbar [accessibleName]="accessibleName()">
      <span class="projected">Projected content</span>
    </nat-table-toolbar>
  `,
})
class ToolbarShellHost {
  public readonly accessibleName = signal<string | undefined>(undefined);
}

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem="alpha" natToolbarItemPosition="start" class="item-alpha">Alpha</button>
      @if (showBeta()) {
        <button natToolbarItem="beta" class="item-beta">Beta</button>
      }
      <button natToolbarItem="gamma" class="item-gamma">Gamma</button>
    </nat-table-toolbar>
  `,
})
class ToolbarItemsHost {
  public readonly showBeta = signal(true);
}

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem="end" natToolbarItemPosition="end" class="slot-end">End</button>
      <button natToolbarItem="bare" class="slot-bare">Bare</button>
      <button natToolbarItem="center" natToolbarItemPosition="center" class="slot-center">Center</button>
      <button natToolbarItem="start" natToolbarItemPosition="start" class="slot-start">Start</button>
    </nat-table-toolbar>
  `,
})
class ToolbarSlotsHost {}

function getItemRefs(fixture: ComponentFixture<unknown>): NatToolbarItemRef[] {
  return fixture.debugElement
    .queryAll(By.directive(NatToolbarItem))
    .map((debugElement) => debugElement.injector.get(NAT_TOOLBAR_ITEM));
}


describe('NatTableToolbar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarShellHost, ToolbarControllerHost, ToolbarItemsHost, ToolbarSlotsHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  function getToolbarElement(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('nat-table-toolbar') as HTMLElement;
  }

  it('renders a horizontal toolbar landmark around projected content', () => {
    const fixture = TestBed.createComponent(ToolbarShellHost);

    fixture.detectChanges();

    const toolbar = getToolbarElement(fixture);

    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
    expect(toolbar.querySelector('.projected')?.textContent?.trim()).toBe('Projected content');
  });

  it('labels the toolbar from intl defaults and lets accessibleName win', () => {
    const fixture = TestBed.createComponent(ToolbarShellHost);

    fixture.detectChanges();

    const toolbar = getToolbarElement(fixture);

    expect(toolbar.getAttribute('aria-label')).toBe('Table toolbar');

    fixture.componentInstance.accessibleName.set('Products toolbar');
    fixture.detectChanges();

    expect(toolbar.getAttribute('aria-label')).toBe('Products toolbar');
  });

  it('binds aria-controls to the controller table element id and omits it otherwise', () => {
    const fixture = TestBed.createComponent(ToolbarControllerHost);

    fixture.detectChanges();

    const toolbar = getToolbarElement(fixture);

    expect(toolbar.hasAttribute('aria-controls')).toBe(false);

    fixture.componentInstance.controller.set(createControllerStub());
    fixture.detectChanges();

    expect(toolbar.getAttribute('aria-controls')).toBe('nat-table-el-1');
  });

  it('projects items into start/center/end slots, defaulting position-less items to start', () => {
    const fixture = TestBed.createComponent(ToolbarSlotsHost);

    fixture.detectChanges();

    const children = Array.from(getToolbarElement(fixture).children);
    const spacers = children.flatMap((el, i) =>
      el.classList.contains('nat-toolbar-spacer') ? [i] : [],
    );
    const indexOf = (cls: string) => children.findIndex((el) => el.classList.contains(cls));

    expect(spacers.length).toBe(2);
    // start and the position-less item share the leading (start) slot
    expect(indexOf('slot-start')).toBeLessThan(spacers[0]);
    expect(indexOf('slot-bare')).toBeLessThan(spacers[0]);
    // center sits between the spacers, end after the trailing spacer
    expect(indexOf('slot-center')).toBeGreaterThan(spacers[0]);
    expect(indexOf('slot-center')).toBeLessThan(spacers[1]);
    expect(indexOf('slot-end')).toBeGreaterThan(spacers[1]);
  });

  it('registers projected items reactively and assigns one roving tab stop', async () => {
    const fixture = TestBed.createComponent(ToolbarItemsHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const [alpha, beta, gamma] = getItemRefs(fixture);

    expect(getItemRefs(fixture).length).toBe(3);
    expect(alpha.element.getAttribute('tabindex')).toBe('0');
    expect(beta.element.getAttribute('tabindex')).toBe('-1');
    expect(gamma.element.getAttribute('tabindex')).toBe('-1');

    fixture.componentInstance.showBeta.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getItemRefs(fixture).length).toBe(2);
    expect(getItemRefs(fixture).map((item) => item.id)).toEqual([alpha.id, gamma.id]);
  });
});

describe('NatTableToolbar no-controller dev warning', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns once when the toolbar renders without a resolvable controller', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ToolbarShellHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const guardCalls = () =>
      warnSpy.mock.calls.filter((call) =>
        String(call[0]).includes('nat-table-toolbar: no controller resolved'),
      );

    expect(guardCalls().length).toBe(1);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(guardCalls().length).toBe(1);
  });

  it('does not warn when [for] is bound before the first render', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ToolbarControllerHost);
    fixture.componentInstance.controller.set(createControllerStub());
    fixture.detectChanges();
    await fixture.whenStable();

    const guardCalls = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('nat-table-toolbar: no controller resolved'),
    );

    expect(guardCalls.length).toBe(0);
  });
});
