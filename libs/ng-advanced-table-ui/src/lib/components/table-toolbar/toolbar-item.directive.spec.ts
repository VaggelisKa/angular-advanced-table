import {
  Component,
  provideZonelessChangeDetection,
  signal,
  type WritableSignal,
} from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { NatToolbarItem } from './toolbar-item.directive';
import { isNatToolbarButtonLikeElement } from './utils/toolbar-item.util';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type { NatTableToolbarRef, NatToolbarItemRef } from './common/toolbar-tokens.type';

class FakeToolbar implements NatTableToolbarRef {
  readonly hiddenIds: WritableSignal<ReadonlySet<string>> = signal<ReadonlySet<string>>(
    new Set(),
  );
  readonly activeItemId = signal<string | null>(null);
  readonly containerWidth = signal(0);
  readonly focusRegistrations: string[] = [];

  registerFocus(itemId: string): void {
    this.focusRegistrations.push(itemId);
    this.activeItemId.set(itemId);
  }
}

@Component({
  imports: [NatToolbarItem],
  providers: [{ provide: NAT_TABLE_TOOLBAR, useFactory: () => new FakeToolbar() }],
  template: `
    <button natToolbarItem id="default-end">Export</button>
    <button natToolbarItem="start" id="explicit-start">Search</button>
    <button [natToolbarItem]="dynamicPosition()" id="dynamic">Dynamic</button>
    <button natToolbarItem natToolbarOverflowLabel="  Density  " aria-label="Host label" id="labelled">
      Text content
    </button>
    <div natToolbarItem id="plain-div">Custom widget</div>
    <div natToolbarItem natToolbarOverflow="always" id="forced-always">Forced</div>
    <div natToolbarItem natToolbarOverflowLabel="Density" id="promoted-div">Density widget</div>
    <button natToolbarItem id="composite">
      <input type="text" id="inner-input" aria-label="Filter" />
    </button>
  `,
})
class DirectiveHost {
  readonly dynamicPosition = signal<'' | 'start' | 'end'>('');
}

@Component({
  imports: [NatToolbarItem],
  template: `<button natToolbarItem id="standalone">Alone</button>`,
})
class StandaloneItemHost {}

describe('NatToolbarItem', () => {
  let fixture: ComponentFixture<DirectiveHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(DirectiveHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function element(domId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${domId}`) as HTMLElement;
  }

  function itemRef(domId: string): NatToolbarItemRef {
    return fixture.debugElement.query(By.css(`#${domId}`)).injector.get(NAT_TOOLBAR_ITEM);
  }

  function fakeToolbar(): FakeToolbar {
    return fixture.debugElement.injector.get(NAT_TABLE_TOOLBAR) as FakeToolbar;
  }

  it('assigns module-unique ids and applies the nat-toolbar-item class', () => {
    const ids = ['default-end', 'explicit-start', 'plain-div'].map((domId) => itemRef(domId).id);

    // nextNatToolbarItemId is module-level — never assume it starts at 0.
    for (const id of ids) {
      expect(id).toMatch(/^nat-toolbar-item-\d+$/);
    }
    expect(new Set(ids).size).toBe(ids.length);
    expect(element('default-end').classList.contains('nat-toolbar-item')).toBe(true);
  });

  it("normalizes the position input: '' and 'end' -> end (order 2), 'start' -> start (order 0)", () => {
    expect(itemRef('default-end').position()).toBe('end');
    expect(element('default-end').style.order).toBe('2');
    expect(itemRef('explicit-start').position()).toBe('start');
    expect(element('explicit-start').style.order).toBe('0');
  });

  it('re-binds the position at runtime', async () => {
    expect(itemRef('dynamic').position()).toBe('end');
    expect(element('dynamic').style.order).toBe('2');

    fixture.componentInstance.dynamicPosition.set('start');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(itemRef('dynamic').position()).toBe('start');
    expect(element('dynamic').style.order).toBe('0');
  });

  it('mirrors the toolbar hidden set: class, inline display, tabindex removal', async () => {
    const exportRef = itemRef('default-end');

    expect(exportRef.hidden()).toBe(false);
    expect(element('default-end').style.display).toBe('');
    expect(element('default-end').getAttribute('tabindex')).toBe('-1');

    fakeToolbar().hiddenIds.set(new Set([exportRef.id]));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(exportRef.hidden()).toBe(true);
    expect(element('default-end').classList.contains('nat-toolbar-item-hidden')).toBe(true);
    expect(element('default-end').style.display).toBe('none');
    expect(element('default-end').hasAttribute('tabindex')).toBe(false);

    fakeToolbar().hiddenIds.set(new Set());
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('default-end').style.display).toBe('');
    expect(element('default-end').getAttribute('tabindex')).toBe('-1');
  });

  it('grants tabindex 0 only to the active item and reports focusin to the toolbar', async () => {
    const exportRef = itemRef('default-end');

    fakeToolbar().activeItemId.set(exportRef.id);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('default-end').getAttribute('tabindex')).toBe('0');
    expect(element('explicit-start').getAttribute('tabindex')).toBe('-1');

    element('explicit-start').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(fakeToolbar().focusRegistrations).toContain(itemRef('explicit-start').id);
  });

  it('moves the roving target to an inner element via setFocusTarget', async () => {
    const composite = itemRef('composite');
    const inner = element('inner-input');

    expect(composite.focusTarget()).toBe(element('composite'));

    composite.setFocusTarget(inner);
    fixture.detectChanges();
    await fixture.whenStable();

    // Host tabindex attr is removed; the hosting component binds the inner one.
    expect(element('composite').hasAttribute('tabindex')).toBe(false);
    expect(composite.focusTarget()).toBe(inner);

    composite.focus();
    expect(document.activeElement).toBe(inner);

    composite.setFocusTarget(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(composite.focusTarget()).toBe(element('composite'));
    expect(element('composite').getAttribute('tabindex')).toBe('-1');
  });

  it('treats button-like hosts as auto and honors an explicit overflow input', () => {
    expect(itemRef('default-end').effectiveOverflowMode()).toBe('auto');
    expect(itemRef('forced-always').effectiveOverflowMode()).toBe('always');
  });

  it('promotes non-button hosts with mirror metadata to auto', () => {
    expect(itemRef('promoted-div').effectiveOverflowMode()).toBe('auto');
  });

  it('demotes a bare non-button host to never with one dev warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plainDiv = itemRef('plain-div');

    expect(plainDiv.effectiveOverflowMode()).toBe('never');

    const guardCalls = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('non-button host without overflow'),
    );

    expect(guardCalls.length).toBe(1);
    expect(String(guardCalls[0][0])).toContain(plainDiv.id);
  });

  it('lets spec.mode override every heuristic', () => {
    const exportRef = itemRef('default-end');

    exportRef.setOverflowSpec({ mode: 'never' });

    expect(exportRef.effectiveOverflowMode()).toBe('never');
    expect(exportRef.overflowSpec()?.mode).toBe('never');
  });

  it('effectivePriority falls back to natToolbarOverflowPriority when spec has no priority', () => {
    const exportRef = itemRef('default-end');

    // Default input priority is 0, no spec set yet.
    expect(exportRef.effectivePriority()).toBe(0);

    exportRef.setOverflowSpec({ label: () => 'Export' });

    // Spec without priority field still yields the input value.
    expect(exportRef.effectivePriority()).toBe(0);
  });

  it('effectivePriority prefers spec.priority over the input', () => {
    const exportRef = itemRef('default-end');

    exportRef.setOverflowSpec({ priority: -50 });

    expect(exportRef.effectivePriority()).toBe(-50);
    // Overrides even the default input of 0.
    expect(exportRef.natToolbarOverflowPriority()).toBe(0);
  });

  it('resolves the overflow label: input -> spec.label -> aria-label -> textContent', () => {
    // Input wins over aria-label and text content, and is trimmed.
    expect(itemRef('labelled').resolveOverflowLabel()).toBe('Density');

    // textContent fallback.
    const exportRef = itemRef('default-end');
    expect(exportRef.resolveOverflowLabel()).toBe('Export');

    // spec.label() beats aria-label and textContent.
    exportRef.setOverflowSpec({ label: () => 'Spec label' });
    expect(exportRef.resolveOverflowLabel()).toBe('Spec label');

    // aria-label beats (empty) textContent.
    const composite = itemRef('composite');
    composite.element.setAttribute('aria-label', 'Composite filter');
    expect(composite.resolveOverflowLabel()).toBe('Composite filter');
  });

  it('returns the empty string when every label source is empty', () => {
    // #composite has whitespace-only text and no host aria-label.
    expect(itemRef('composite').resolveOverflowLabel()).toBe('');
  });

  it('forwards overflow notifications to the registered spec callback', () => {
    const exportRef = itemRef('default-end');

    expect(() => exportRef.notifyOverflowChange(true)).not.toThrow();

    const calls: boolean[] = [];
    exportRef.setOverflowSpec({ onOverflowChange: (hidden) => calls.push(hidden) });

    exportRef.notifyOverflowChange(true);
    exportRef.notifyOverflowChange(false);

    expect(calls).toEqual([true, false]);
  });

  it('renders no tabindex attribute outside a toolbar and reports tabIndex() 0', async () => {
    const standalone = TestBed.createComponent(StandaloneItemHost);

    standalone.detectChanges();
    await standalone.whenStable();

    const ref = standalone.debugElement
      .query(By.css('#standalone'))
      .injector.get(NAT_TOOLBAR_ITEM);

    expect(ref.tabIndex()).toBe(0);
    expect(
      (standalone.nativeElement.querySelector('#standalone') as HTMLElement).hasAttribute(
        'tabindex',
      ),
    ).toBe(false);
  });
});

describe('isNatToolbarButtonLikeElement', () => {
  it('recognizes buttons, links with href, and role=button hosts', () => {
    const button = document.createElement('button');
    const link = document.createElement('a');
    const div = document.createElement('div');

    expect(isNatToolbarButtonLikeElement(button)).toBe(true);
    expect(isNatToolbarButtonLikeElement(link)).toBe(false);

    link.setAttribute('href', '/export');
    expect(isNatToolbarButtonLikeElement(link)).toBe(true);

    expect(isNatToolbarButtonLikeElement(div)).toBe(false);

    div.setAttribute('role', 'button');
    expect(isNatToolbarButtonLikeElement(div)).toBe(true);
  });
});

@Component({
  imports: [NatToolbarItem],
  template: `
    <button natToolbarItem id="icon-only"><svg aria-hidden="true"></svg></button>
    <button natToolbarItem id="labelled">Export</button>
  `,
})
class OverflowLabelWarningHost {}

describe('NatToolbarItem empty overflow label warning', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(OverflowLabelWarningHost);
    fixture.detectChanges();

    return {
      fixture,
      itemRef: (domId: string) =>
        fixture.debugElement.query(By.css(`#${domId}`)).injector.get(NAT_TOOLBAR_ITEM),
    };
  }

  it('warns exactly once when a collapsible item resolves an empty label', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { itemRef } = setup();
    const iconOnly = itemRef('icon-only');

    expect(iconOnly.effectiveOverflowMode()).toBe('auto');
    expect(iconOnly.resolveOverflowLabel()).toBe('');
    expect(iconOnly.resolveOverflowLabel()).toBe('');

    const guardCalls = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('no resolvable overflow label'),
    );

    expect(guardCalls.length).toBe(1);
    expect(String(guardCalls[0][0])).toContain(iconOnly.id);
  });

  it('does not warn when a label resolves', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { itemRef } = setup();

    expect(itemRef('labelled').resolveOverflowLabel()).toBe('Export');

    const guardCalls = warnSpy.mock.calls.filter((call) =>
      String(call[0]).includes('no resolvable overflow label'),
    );

    expect(guardCalls.length).toBe(0);
  });
});
