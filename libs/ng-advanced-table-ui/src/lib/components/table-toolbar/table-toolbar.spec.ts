import { Component, provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Directionality } from '@angular/cdk/bidi';

import { NatTableToolbar } from './table-toolbar';
import {
  buildNatToolbarFocusStops,
  resolveNatToolbarNavigationTarget,
  findNatToolbarHiddenFocusedItem,
} from './utils/toolbar-focus.util';
import type { NatToolbarFocusStopItem } from './common/toolbar-focus.type';
import { NatToolbarItem } from './toolbar-item.directive';
import { NAT_TOOLBAR_ITEM, NAT_TOOLBAR_MORE_BUTTON_ID } from './common/toolbar-tokens.const';
import type { NatToolbarItemRef } from './common/toolbar-tokens.type';
import type { NatTableUiController } from '../../shared/table-ui.types';
import { NAT_TABLE_UI_ENGLISH_LOCALE } from '../../shared/table-ui-intl';
import { NatToolbarOverflowMenu } from './toolbar-overflow-menu/toolbar-overflow-menu';

@Component({
  imports: [NatTableToolbar],
  template: `<nat-table-toolbar [for]="controller()" />`,
})
class ToolbarControllerHost {
  readonly controller = signal<NatTableUiController | undefined>(undefined);
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
  readonly accessibleName = signal<string | undefined>(undefined);
}

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem="start" class="item-alpha">Alpha</button>
      @if (showBeta()) {
        <button natToolbarItem class="item-beta">Beta</button>
      }
      <button natToolbarItem class="item-gamma">Gamma</button>
    </nat-table-toolbar>
  `,
})
class ToolbarItemsHost {
  readonly showBeta = signal(true);
}

interface ToolbarSeams {
  containerWidthSignal: WritableSignal<number>;
  gapSignal: WritableSignal<number>;
  widthByItemSignal: WritableSignal<ReadonlyMap<string, number>>;
  moreButtonWidthSignal: WritableSignal<number>;
  scheduleMeasure(): void;
  measureNow(): void;
}

function seams(toolbar: NatTableToolbar): ToolbarSeams {
  return toolbar as unknown as ToolbarSeams;
}

function setItemWidths(
  toolbarSeams: ToolbarSeams,
  entries: readonly (readonly [NatToolbarItemRef, number])[],
): void {
  toolbarSeams.widthByItemSignal.set(new Map(entries.map(([item, width]) => [item.id, width])));
}

function getItemRefs(fixture: ComponentFixture<unknown>): NatToolbarItemRef[] {
  return fixture.debugElement
    .queryAll(By.directive(NatToolbarItem))
    .map((debugElement) => debugElement.injector.get(NAT_TOOLBAR_ITEM));
}

function getToolbarInstance(fixture: ComponentFixture<unknown>): NatTableToolbar {
  return fixture.debugElement.query(By.directive(NatTableToolbar)).componentInstance;
}

describe('NatTableToolbar', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarShellHost, ToolbarControllerHost, ToolbarItemsHost],
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

  it('registers projected items reactively and assigns one roving tab stop', async () => {
    const fixture = TestBed.createComponent(ToolbarItemsHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);

    expect(getItemRefs(fixture).length).toBe(3);
    expect(toolbar.hiddenIds().size).toBe(0);
    expect(toolbar.containerWidth()).toBe(0);
    expect(toolbar.activeItemId()).toBe(alpha.id);
    expect(alpha.element.getAttribute('tabindex')).toBe('0');
    expect(beta.element.getAttribute('tabindex')).toBe('-1');
    expect(gamma.element.getAttribute('tabindex')).toBe('-1');

    fixture.componentInstance.showBeta.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getItemRefs(fixture).length).toBe(2);
    expect(getItemRefs(fixture).map((item) => item.id)).toEqual([alpha.id, gamma.id]);
  });

  it('hides overflowing items through the fit engine and skips the pass at width 0', async () => {
    const fixture = TestBed.createComponent(ToolbarItemsHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(200);
    fixture.detectChanges();
    await fixture.whenStable();

    // 3 x (100 + 8) = 324 > 200 ⇒ reserve More (40 + 8), drop end group last-DOM-first.
    expect(toolbar.hiddenIds()).toEqual(new Set([gamma.id, beta.id]));
    expect(toolbar.moreVisible()).toBe(true);
    expect(gamma.element.style.display).toBe('none');
    expect(gamma.element.classList.contains('nat-toolbar-item-hidden')).toBe(true);
    expect(gamma.element.hasAttribute('tabindex')).toBe(false);
    expect(alpha.element.style.display).toBe('');
    expect(toolbar.activeItemId()).toBe(alpha.id);

    toolbarSeams.containerWidthSignal.set(0);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toolbar.hiddenIds().size).toBe(0);
    expect(toolbar.moreVisible()).toBe(false);
    expect(gamma.element.style.display).toBe('');
  });

  it('pins the focused item visible during fit and releases the pin on focusout', async () => {
    const fixture = TestBed.createComponent(ToolbarItemsHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);

    gamma.element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(200);
    fixture.detectChanges();
    await fixture.whenStable();

    // Gamma would normally drop first; the focus pin forces beta then alpha out instead.
    expect(toolbar.hiddenIds()).toEqual(new Set([beta.id, alpha.id]));
    expect(gamma.element.style.display).toBe('');

    getToolbarElement(fixture).dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toolbar.hiddenIds()).toEqual(new Set([gamma.id, beta.id]));
  });

  it('notifies items when they collapse into or return from the overflow set', async () => {
    const fixture = TestBed.createComponent(ToolbarItemsHost);

    fixture.detectChanges();
    await fixture.whenStable();

    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);
    const onOverflowChange = vi.fn();

    gamma.setOverflowSpec({ onOverflowChange });

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(200);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onOverflowChange).toHaveBeenCalledTimes(1);
    expect(onOverflowChange).toHaveBeenLastCalledWith(true);

    toolbarSeams.containerWidthSignal.set(1000);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(onOverflowChange).toHaveBeenCalledTimes(2);
    expect(onOverflowChange).toHaveBeenLastCalledWith(false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(onOverflowChange).toHaveBeenCalledTimes(2);
  });

  describe('measurement', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('coalesces measure requests into a single animation frame', async () => {
      const frames: FrameRequestCallback[] = [];

      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
        frames.push(callback),
      );

      const fixture = TestBed.createComponent(ToolbarItemsHost);

      fixture.detectChanges();
      await fixture.whenStable();

      // Drain any Angular-internal rAF calls captured during stabilization.
      frames.length = 0;

      const toolbar = getToolbarInstance(fixture);
      const toolbarSeams = seams(toolbar);
      const toolbarElement = getToolbarElement(fixture);

      Object.defineProperty(toolbarElement, 'clientWidth', { configurable: true, value: 320 });
      toolbarElement.style.padding = '0 10px';
      toolbarElement.style.columnGap = '8px';

      toolbarSeams.scheduleMeasure();
      toolbarSeams.scheduleMeasure();

      expect(frames.length).toBe(1);

      frames[0](0);

      // content-box width = clientWidth (320) - horizontal padding (20)
      expect(toolbar.containerWidth()).toBe(300);
      expect(toolbarSeams.gapSignal()).toBe(8);

      frames.length = 0;
      toolbarSeams.scheduleMeasure();

      expect(frames.length).toBe(1);
    });

    it('re-measures visible items but keeps cached widths for hidden ones', async () => {
      const fixture = TestBed.createComponent(ToolbarItemsHost);

      fixture.detectChanges();
      await fixture.whenStable();

      const toolbar = getToolbarInstance(fixture);
      const [alpha, beta, gamma] = getItemRefs(fixture);
      const toolbarSeams = seams(toolbar);

      setItemWidths(toolbarSeams, [
        [alpha, 100],
        [beta, 100],
        [gamma, 100],
      ]);
      toolbarSeams.moreButtonWidthSignal.set(40);
      toolbarSeams.containerWidthSignal.set(160);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(toolbar.hiddenIds()).toEqual(new Set([gamma.id, beta.id]));

      toolbarSeams.measureNow();

      const widths = toolbarSeams.widthByItemSignal();

      // jsdom measures the visible alpha at 0; hidden items keep their cached widths.
      expect(widths.get(alpha.id)).toBe(0);
      expect(widths.get(beta.id)).toBe(100);
      expect(widths.get(gamma.id)).toBe(100);
    });

    it('prunes cached widths when items unregister', async () => {
      const fixture = TestBed.createComponent(ToolbarItemsHost);

      fixture.detectChanges();
      await fixture.whenStable();

      const toolbar = getToolbarInstance(fixture);
      const [alpha, beta, gamma] = getItemRefs(fixture);
      const toolbarSeams = seams(toolbar);

      setItemWidths(toolbarSeams, [
        [alpha, 100],
        [beta, 100],
        [gamma, 100],
      ]);

      fixture.componentInstance.showBeta.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const widths = toolbarSeams.widthByItemSignal();

      expect(widths.has(beta.id)).toBe(false);
      expect(widths.get(alpha.id)).toBe(100);
      expect(widths.get(gamma.id)).toBe(100);
    });

    it('accepts a More button element without ResizeObserver and destroys cleanly', async () => {
      const fixture = TestBed.createComponent(ToolbarItemsHost);

      fixture.detectChanges();
      await fixture.whenStable();

      const toolbar = getToolbarInstance(fixture);
      const toolbarSeams = seams(toolbar);

      expect(() =>
        toolbar.registerMoreButtonElement(document.createElement('button')),
      ).not.toThrow();
      expect(toolbarSeams.moreButtonWidthSignal()).toBe(40);
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});

describe('buildNatToolbarFocusStops', () => {
  const items: readonly NatToolbarFocusStopItem[] = [
    { id: 'e1', position: 'end' },
    { id: 's1', position: 'start' },
    { id: 'e2', position: 'end' },
    { id: 's2', position: 'start' },
  ];

  it('orders stops visually: start group in registry order, then end group', () => {
    expect(buildNatToolbarFocusStops(items, new Set(), false)).toEqual([
      's1',
      's2',
      'e1',
      'e2',
    ]);
  });

  it('skips hidden items', () => {
    expect(buildNatToolbarFocusStops(items, new Set(['s2', 'e1']), false)).toEqual([
      's1',
      'e2',
    ]);
  });

  it('appends the More button id when the More button is visible', () => {
    expect(buildNatToolbarFocusStops(items, new Set(['e2']), true)).toEqual([
      's1',
      's2',
      'e1',
      NAT_TOOLBAR_MORE_BUTTON_ID,
    ]);
  });

  it('returns only the More button id when every item is hidden', () => {
    expect(
      buildNatToolbarFocusStops(items, new Set(['s1', 's2', 'e1', 'e2']), true),
    ).toEqual([NAT_TOOLBAR_MORE_BUTTON_ID]);
  });
});

describe('resolveNatToolbarNavigationTarget', () => {
  const stops = ['a', 'b', 'c', NAT_TOOLBAR_MORE_BUTTON_ID] as const;

  it('Home targets the first stop, End targets the last stop', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'b', 'Home', false)).toBe('a');
    expect(resolveNatToolbarNavigationTarget(stops, 'b', 'End', false)).toBe(
      NAT_TOOLBAR_MORE_BUTTON_ID,
    );
  });

  it('ArrowRight moves forward and wraps in LTR', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'a', 'ArrowRight', false)).toBe('b');
    expect(
      resolveNatToolbarNavigationTarget(stops, NAT_TOOLBAR_MORE_BUTTON_ID, 'ArrowRight', false),
    ).toBe('a');
  });

  it('ArrowLeft moves backward and wraps in LTR', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'b', 'ArrowLeft', false)).toBe('a');
    expect(resolveNatToolbarNavigationTarget(stops, 'a', 'ArrowLeft', false)).toBe(
      NAT_TOOLBAR_MORE_BUTTON_ID,
    );
  });

  it('flips arrow direction in RTL (visual right = previous stop)', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'b', 'ArrowRight', true)).toBe('a');
    expect(resolveNatToolbarNavigationTarget(stops, 'b', 'ArrowLeft', true)).toBe('c');
  });

  it('targets the first stop when the active id is unknown or null', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'gone', 'ArrowRight', false)).toBe('a');
    expect(resolveNatToolbarNavigationTarget(stops, null, 'ArrowLeft', false)).toBe('a');
  });

  it('returns null for unhandled keys and empty stop lists', () => {
    expect(resolveNatToolbarNavigationTarget(stops, 'a', 'ArrowDown', false)).toBeNull();
    expect(resolveNatToolbarNavigationTarget([], 'a', 'ArrowRight', false)).toBeNull();
  });
});

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem id="end-a">End A</button>
      <button natToolbarItem="start" id="start-a">Start A</button>
      <input
        natToolbarItem="start"
        natToolbarOverflow="never"
        type="text"
        id="text-entry"
        aria-label="Filter"
      />
      <button natToolbarItem id="end-b">End B</button>
    </nat-table-toolbar>
  `,
})
class RovingToolbarHost {}

describe('NatTableToolbar roving tabindex', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${domId}`) as HTMLElement;
  }

  it('gives the first VISUAL stop the tab stop (start group before end group)', () => {
    expect(element('start-a').getAttribute('tabindex')).toBe('0');
    expect(element('text-entry').getAttribute('tabindex')).toBe('-1');
    expect(element('end-a').getAttribute('tabindex')).toBe('-1');
    expect(element('end-b').getAttribute('tabindex')).toBe('-1');
  });

  it('moves the tab stop to the item that receives focus', async () => {
    element('end-a').focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('end-a').getAttribute('tabindex')).toBe('0');
    expect(element('start-a').getAttribute('tabindex')).toBe('-1');
  });

  it('exposes a -1 More-button tab stop while nothing is collapsed', () => {
    const toolbar = fixture.debugElement.query(By.directive(NatTableToolbar))
      .componentInstance as NatTableToolbar;

    expect(toolbar.moreButtonTabIndex()).toBe(-1);
  });
});

function pressKey(
  target: HTMLElement,
  key: string,
  modifiers: Partial<KeyboardEventInit> = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers,
  });
  target.dispatchEvent(event);
  return event;
}

describe('NatTableToolbar keyboard navigation', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${domId}`) as HTMLElement;
  }

  async function focusItem(domId: string): Promise<void> {
    element(domId).focus();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('ArrowRight moves focus to the next visual stop and prevents default', async () => {
    await focusItem('start-a');
    const event = pressKey(element('start-a'), 'ArrowRight');

    expect(document.activeElement).toBe(element('text-entry'));
    expect(event.defaultPrevented).toBe(true);
  });

  it('ArrowRight wraps from the last stop to the first', async () => {
    await focusItem('end-b');
    pressKey(element('end-b'), 'ArrowRight');

    expect(document.activeElement).toBe(element('start-a'));
  });

  it('ArrowLeft wraps from the first stop to the last', async () => {
    await focusItem('start-a');
    pressKey(element('start-a'), 'ArrowLeft');

    expect(document.activeElement).toBe(element('end-b'));
  });

  it('Home and End jump to the first and last visual stops', async () => {
    await focusItem('end-a');
    pressKey(element('end-a'), 'Home');
    expect(document.activeElement).toBe(element('start-a'));

    await focusItem('end-a');
    pressKey(element('end-a'), 'End');
    expect(document.activeElement).toBe(element('end-b'));
  });

  it('ignores arrows carrying modifier keys', async () => {
    await focusItem('start-a');
    const event = pressKey(element('start-a'), 'ArrowRight', { ctrlKey: true });

    expect(document.activeElement).toBe(element('start-a'));
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not intercept arrows or Home/End while focus is inside a text input', async () => {
    await focusItem('text-entry');

    const arrowEvent = pressKey(element('text-entry'), 'ArrowRight');
    expect(document.activeElement).toBe(element('text-entry'));
    expect(arrowEvent.defaultPrevented).toBe(false);

    const homeEvent = pressKey(element('text-entry'), 'Home');
    expect(document.activeElement).toBe(element('text-entry'));
    expect(homeEvent.defaultPrevented).toBe(false);
  });
});

describe('NatTableToolbar keyboard navigation (RTL)', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Directionality, useValue: { value: 'rtl' } as Directionality },
      ],
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${domId}`) as HTMLElement;
  }

  it('ArrowLeft moves to the NEXT visual stop in RTL', async () => {
    element('start-a').focus();
    fixture.detectChanges();
    await fixture.whenStable();

    pressKey(element('start-a'), 'ArrowLeft');

    expect(document.activeElement).toBe(element('text-entry'));
  });

  it('ArrowRight moves to the PREVIOUS visual stop in RTL', async () => {
    element('end-a').focus();
    fixture.detectChanges();
    await fixture.whenStable();

    pressKey(element('end-a'), 'ArrowRight');

    expect(document.activeElement).toBe(element('text-entry'));
  });
});

describe('findNatToolbarHiddenFocusedItem', () => {
  function fakeItem(id: string): { id: string; element: HTMLElement } {
    return { id, element: document.createElement('div') };
  }

  it('returns the hidden item containing the active element', () => {
    const hidden = fakeItem('hidden-item');
    const visible = fakeItem('visible-item');
    const inner = document.createElement('button');
    hidden.element.appendChild(inner);

    expect(
      findNatToolbarHiddenFocusedItem([visible, hidden], new Set(['hidden-item']), inner),
    ).toBe(hidden);
  });

  it('returns null when the active element sits inside a visible item', () => {
    const visible = fakeItem('visible-item');
    const inner = document.createElement('button');
    visible.element.appendChild(inner);

    expect(
      findNatToolbarHiddenFocusedItem([visible], new Set(['other-id']), inner),
    ).toBeNull();
  });

  it('returns null when there is no active element', () => {
    expect(
      findNatToolbarHiddenFocusedItem([fakeItem('a')], new Set(['a']), null),
    ).toBeNull();
  });
});

describe('NatTableToolbar focus rescue', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;
  let toolbar: NatTableToolbar;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
    toolbar = fixture.debugElement.query(By.directive(NatTableToolbar))
      .componentInstance as NatTableToolbar;
  });

  function element(domId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${domId}`) as HTMLElement;
  }

  function itemIdOf(domId: string): string {
    return fixture.debugElement.query(By.css(`#${domId}`)).injector.get(NAT_TOOLBAR_ITEM).id;
  }

  function rescue(hiddenIds: ReadonlySet<string>): void {
    (
      toolbar as unknown as { rescueFocusFromHidden(ids: ReadonlySet<string>): void }
    ).rescueFocusFromHidden(hiddenIds);
  }

  it('moves focus to the More button when the focused item is hidden', () => {
    const moreButton = document.createElement('button');
    fixture.nativeElement.appendChild(moreButton);
    toolbar.registerMoreButtonElement(moreButton);

    element('end-a').focus();
    rescue(new Set([itemIdOf('end-a')]));

    expect(document.activeElement).toBe(moreButton);
  });

  it('does nothing when focus sits inside a visible item', () => {
    const moreButton = document.createElement('button');
    fixture.nativeElement.appendChild(moreButton);
    toolbar.registerMoreButtonElement(moreButton);

    element('end-a').focus();
    rescue(new Set([itemIdOf('end-b')]));

    expect(document.activeElement).toBe(element('end-a'));
  });

  it('does nothing while no More button is registered', () => {
    // Explicit clear: once Task G2 lands, the shell template auto-registers
    // the overflow menu's button at render — this spec must stay deterministic.
    toolbar.registerMoreButtonElement(null);

    element('end-a').focus();
    rescue(new Set([itemIdOf('end-a')]));

    expect(document.activeElement).toBe(element('end-a'));
  });
});

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem id="direct">Direct</button>
      <div class="wrapper">
        <button natToolbarItem id="wrapped">Wrapped</button>
      </div>
    </nat-table-toolbar>
  `,
})
class WrappedItemHost {}

describe('NatTableToolbar direct-child dev assertion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('errors once per item that is not a direct flex child of the toolbar row', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(WrappedItemHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const guardCalls = () =>
      errorSpy.mock.calls.filter((call) =>
        String(call[0]).includes('not a direct child of the toolbar row'),
      );

    expect(guardCalls().length).toBe(1);
    expect(String(guardCalls()[0][0])).toContain('nat-table-toolbar');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(guardCalls().length).toBe(1);
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

describe('NatTableToolbar overflow-menu integration', () => {
  let fixture: ComponentFixture<ToolbarItemsHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(ToolbarItemsHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function toolbarElement(): HTMLElement {
    return fixture.nativeElement.querySelector('nat-table-toolbar') as HTMLElement;
  }

  function menuHostElement(): HTMLElement {
    return toolbarElement().querySelector('nat-toolbar-overflow-menu') as HTMLElement;
  }

  it('renders the internal overflow menu as a direct child and feeds it the registered items', () => {
    const menuHost = menuHostElement();

    expect(menuHost).not.toBeNull();
    expect(menuHost.parentElement).toBe(toolbarElement());
    expect(menuHost.querySelector('.more-button')).not.toBeNull();

    const menu = fixture.debugElement.query(By.directive(NatToolbarOverflowMenu))
      .componentInstance as NatToolbarOverflowMenu;

    expect(menu.items().map((item) => item.id)).toEqual(
      getItemRefs(fixture).map((item) => item.id),
    );
    expect(menu.localeId()).toBe(NAT_TABLE_UI_ENGLISH_LOCALE);
    expect(menu.intl().toolbar?.toolbarLabel).toBe('Table toolbar');
  });

  it('shows the labelled More button once the fit pass collapses items', async () => {
    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);

    expect(menuHostElement().style.display).toBe('none');

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(200);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toolbar.moreVisible()).toBe(true);
    expect(menuHostElement().style.display).toBe('');
    expect(menuHostElement().querySelector('.more-button')?.getAttribute('aria-label')).toBe(
      'More toolbar items (2 hidden)',
    );
  });

  it('registers the More button so focus rescue and roving can target it', async () => {
    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(1000);
    fixture.detectChanges();
    await fixture.whenStable();

    beta.element.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toolbar.hiddenIds().size).toBe(0);

    // Deterministic hide-while-focused: 'always' pre-hides regardless of the
    // fit engine's focus pin (Section F mirrors this trigger in a real browser).
    beta.setOverflowSpec({ mode: 'always' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toolbar.hiddenIds()).toEqual(new Set([beta.id]));
    expect(document.activeElement).toBe(menuHostElement().querySelector('.more-button'));
    expect(toolbar.moreButtonTabIndex()).toBe(0);
  });

  it('binds moreButtonTabIndex to the DOM .more-button tabIndex', async () => {
    const toolbar = getToolbarInstance(fixture);
    const [alpha, beta, gamma] = getItemRefs(fixture);
    const toolbarSeams = seams(toolbar);

    setItemWidths(toolbarSeams, [
      [alpha, 100],
      [beta, 100],
      [gamma, 100],
    ]);
    toolbarSeams.gapSignal.set(8);
    toolbarSeams.moreButtonWidthSignal.set(40);
    toolbarSeams.containerWidthSignal.set(1000);
    fixture.detectChanges();
    await fixture.whenStable();

    // Focus beta so it becomes the active roving stop, then collapse it so
    // focus rescue moves the active stop to the More button (tabIndex 0).
    beta.element.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    beta.setOverflowSpec({ mode: 'always' });
    fixture.detectChanges();
    await fixture.whenStable();

    const moreButtonEl = menuHostElement().querySelector('.more-button') as HTMLElement;
    expect(moreButtonEl).not.toBeNull();
    expect(toolbar.moreButtonTabIndex()).toBe(0);
    // Verify the binding propagates the computed value to the actual DOM element.
    expect(moreButtonEl.tabIndex).toBe(toolbar.moreButtonTabIndex());
  });
});
