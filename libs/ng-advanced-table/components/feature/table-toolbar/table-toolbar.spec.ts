import { ToolbarWidgetHarness } from '@angular/aria/toolbar/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import type { NatTableUiController } from 'ng-advanced-table';

import { NatTableToolbar } from './table-toolbar';
import { NAT_TOOLBAR_ITEM } from '../../common/toolbar.const';
import type { NatToolbarItemRef } from '../../common/toolbar.type';
import { NatToolbarItem } from '../../ui/toolbar-item/toolbar-item.directive';

@Component({
  selector: 'nat-toolbar-controller-host',
  imports: [NatTableToolbar],
  template: `<nat-table-toolbar [for]="controller()" />`
})
class ToolbarControllerHost {
  public readonly controller = signal<NatTableUiController | undefined>(undefined);
}

const createControllerStub = (): NatTableUiController => {
  return {
    table: {} as NatTableUiController['table'],
    pagination: signal({ pageIndex: 0, pageSize: 10 }),
    pageCount: signal(1),
    canPreviousPage: signal(false),
    canNextPage: signal(false),
    globalFilter: signal(''),
    columnFilters: signal([]),
    enableGlobalFilter: () => true,
    enablePagination: () => true,
    setGlobalFilter: () => undefined,
    setColumnFilter: () => undefined,
    setPageSize: () => undefined,
    goToPage: () => undefined,
    nextPage: () => undefined,
    previousPage: () => undefined,
    tableElementId: signal('nat-table-el-1'),
    localeId: signal('en')
  };
};

@Component({
  selector: 'nat-toolbar-shell-host',
  imports: [NatTableToolbar],
  template: `
    <nat-table-toolbar [accessibleName]="accessibleName()">
      <span class="projected">Projected content</span>
    </nat-table-toolbar>
  `
})
class ToolbarShellHost {
  public readonly accessibleName = signal<string | undefined>(undefined);
}

@Component({
  selector: 'nat-toolbar-items-host',
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button class="item-alpha" natToolbarItem="alpha" natToolbarItemPosition="start" type="button">Alpha</button>
      @if (showBeta()) {
        <button class="item-beta" natToolbarItem="beta" type="button">Beta</button>
      }
      <button class="item-gamma" natToolbarItem="gamma" type="button">Gamma</button>
    </nat-table-toolbar>
  `
})
class ToolbarItemsHost {
  public readonly showBeta = signal(true);
}

@Component({
  selector: 'nat-toolbar-slots-host',
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button class="slot-end" natToolbarItem="end" natToolbarItemPosition="end" type="button">End</button>
      <button class="slot-bare" natToolbarItem="bare" type="button">Bare</button>
      <button class="slot-center" natToolbarItem="center" natToolbarItemPosition="center" type="button">Center</button>
      <button class="slot-start" natToolbarItem="start" natToolbarItemPosition="start" type="button">Start</button>
    </nat-table-toolbar>
  `
})
class ToolbarSlotsHost {}

const getItemRefs = (fixture: ComponentFixture<unknown>): NatToolbarItemRef[] => {
  return fixture.debugElement
    .queryAll(By.directive(NatToolbarItem))
    .map((debugElement) => debugElement.injector.get(NAT_TOOLBAR_ITEM));
};

describe('FEATURE: NatTableToolbar', () => {
  const getToolbarElement = (fixture: ComponentFixture<unknown>): HTMLElement => {
    return (fixture.nativeElement as HTMLElement).querySelector('nat-table-toolbar') as HTMLElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarShellHost, ToolbarControllerHost, ToolbarItemsHost, ToolbarSlotsHost],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  describe('GIVEN: a toolbar projecting content', () => {
    describe('WHEN: the toolbar is rendered', () => {
      it('THEN: it renders a horizontal toolbar landmark around projected content', () => {
        const fixture = TestBed.createComponent(ToolbarShellHost);

        fixture.detectChanges();

        const toolbar = getToolbarElement(fixture);

        expect(toolbar.getAttribute('role')).toBe('toolbar');
        expect(toolbar.getAttribute('aria-orientation')).toBe('horizontal');
        expect(toolbar.querySelector('.projected')?.textContent.trim()).toBe('Projected content');
      });
    });

    describe('WHEN: an accessibleName is supplied after the default render', () => {
      it('THEN: it labels the toolbar from intl defaults and lets accessibleName win', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const fixture = TestBed.createComponent(ToolbarShellHost);

        fixture.detectChanges();

        // then: it falls back to the intl default label
        const toolbar = getToolbarElement(fixture);

        expect(toolbar.getAttribute('aria-label')).toBe('Table toolbar');

        // when: an accessibleName is supplied
        fixture.componentInstance.accessibleName.set('Products toolbar');
        fixture.detectChanges();

        // then: the supplied name overrides the default
        expect(toolbar.getAttribute('aria-label')).toBe('Products toolbar');
      });
    });
  });

  describe('GIVEN: a toolbar bound to a controller', () => {
    describe('WHEN: a controller is bound after the initial render', () => {
      it('THEN: it binds aria-controls to the controller table element id and omits it otherwise', () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const fixture = TestBed.createComponent(ToolbarControllerHost);

        fixture.detectChanges();

        // then: aria-controls is omitted
        const toolbar = getToolbarElement(fixture);

        expect(toolbar.hasAttribute('aria-controls')).toBe(false);

        // when: a controller is bound
        fixture.componentInstance.controller.set(createControllerStub());
        fixture.detectChanges();

        // then: aria-controls points at the controller table element id
        expect(toolbar.getAttribute('aria-controls')).toBe('nat-table-el-1');
      });
    });
  });

  describe('GIVEN: a toolbar projecting positioned items', () => {
    describe('WHEN: the toolbar lays out its projected items', () => {
      it('THEN: it projects items into start/center/end slots, defaulting position-less items to start', () => {
        const fixture = TestBed.createComponent(ToolbarSlotsHost);

        fixture.detectChanges();

        const children = Array.from(getToolbarElement(fixture).children);
        const spacers = children.flatMap((el, i) => (el.classList.contains('nat-toolbar-spacer') ? [i] : []));
        const indexOf = (cls: string): number => children.findIndex((el) => el.classList.contains(cls));

        expect(spacers).toHaveLength(2);
        // start and the position-less item share the leading (start) slot
        expect(indexOf('slot-start')).toBeLessThan(spacers[0]);
        expect(indexOf('slot-bare')).toBeLessThan(spacers[0]);
        // center sits between the spacers, end after the trailing spacer
        expect(indexOf('slot-center')).toBeGreaterThan(spacers[0]);
        expect(indexOf('slot-center')).toBeLessThan(spacers[1]);
        expect(indexOf('slot-end')).toBeGreaterThan(spacers[1]);
      });
    });

    describe('WHEN: a projected item unmounts after the initial registration', () => {
      it('THEN: it registers projected items reactively and assigns one roving tab stop', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const fixture = TestBed.createComponent(ToolbarItemsHost);
        const loader = TestbedHarnessEnvironment.loader(fixture);

        // when: the toolbar renders its three projected items
        fixture.detectChanges();
        await fixture.whenStable();

        // then: all three register and only the first carries the roving tab stop
        const [alpha, beta, gamma] = getItemRefs(fixture);
        const widgets = await loader.getAllHarnesses(ToolbarWidgetHarness);

        expect(getItemRefs(fixture)).toHaveLength(3);
        expect(await Promise.all(widgets.map(async (widget) => widget.getText()))).toStrictEqual(['Alpha', 'Beta', 'Gamma']);
        expect(await Promise.all(widgets.map(async (widget) => widget.isActive()))).toStrictEqual([true, false, false]);
        expect(alpha.element.getAttribute('tabindex')).toBe('0');
        expect(beta.element.getAttribute('tabindex')).toBe('-1');
        expect(gamma.element.getAttribute('tabindex')).toBe('-1');

        // when: a projected item unmounts
        fixture.componentInstance.showBeta.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // then: the registry shrinks to the remaining items
        const remainingWidgets = await loader.getAllHarnesses(ToolbarWidgetHarness);

        expect(getItemRefs(fixture)).toHaveLength(2);
        expect(await Promise.all(remainingWidgets.map(async (widget) => widget.getText()))).toStrictEqual(['Alpha', 'Gamma']);
        expect(getItemRefs(fixture).map((item) => item.id)).toStrictEqual([alpha.id, gamma.id]);
      });
    });
  });

  describe('GIVEN: the toolbar renders without a controller', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('WHEN: the toolbar renders with no resolvable controller', () => {
      it('THEN: it warns once when the toolbar renders without a resolvable controller', async () => {
        // sequential flow kept whole — splitting re-runs setup and risks ordering
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection()]
        });
        const fixture = TestBed.createComponent(ToolbarShellHost);

        fixture.detectChanges();
        await fixture.whenStable();

        // then: it warns exactly once
        const guardCalls = (): unknown[][] =>
          warnSpy.mock.calls.filter((call) => String(call[0]).includes('nat-table-toolbar: no controller resolved'));

        expect(guardCalls()).toHaveLength(1);

        // when: a further change-detection cycle runs
        fixture.detectChanges();
        await fixture.whenStable();

        // then: the warning is not repeated
        expect(guardCalls()).toHaveLength(1);
      });
    });

    describe('WHEN: a controller is bound before the first render', () => {
      it('THEN: it does not warn when [for] is bound before the first render', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        TestBed.configureTestingModule({
          providers: [provideZonelessChangeDetection()]
        });
        const fixture = TestBed.createComponent(ToolbarControllerHost);

        fixture.componentInstance.controller.set(createControllerStub());
        fixture.detectChanges();
        await fixture.whenStable();

        const guardCalls = warnSpy.mock.calls.filter((call) => String(call[0]).includes('nat-table-toolbar: no controller resolved'));

        expect(guardCalls).toHaveLength(0);
      });
    });
  });
});
