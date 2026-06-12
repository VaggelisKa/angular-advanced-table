import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatToolbarItem } from './toolbar-item.directive';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type { NatTableToolbarRef, NatToolbarItemRef } from './common/toolbar-tokens.type';

class FakeToolbar implements NatTableToolbarRef {
  public readonly activeItemId = signal<string | null>(null);
  public readonly focusRegistrations: string[] = [];

  public registerFocus(itemId: string): void {
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
    <div natToolbarItem id="plain-div">Custom widget</div>
    <button natToolbarItem id="composite">
      <input type="text" id="inner-input" aria-label="Filter" />
    </button>
  `,
})
class DirectiveHost {
  public readonly dynamicPosition = signal<'' | 'start' | 'center' | 'end'>('');
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

  it("normalizes the position input: '' and 'end' -> end, 'start' and 'center' pass through", () => {
    expect(itemRef('default-end').position()).toBe('end');
    expect(itemRef('explicit-start').position()).toBe('start');

    fixture.componentInstance.dynamicPosition.set('center');
    fixture.detectChanges();

    expect(itemRef('dynamic').position()).toBe('center');
  });

  it('re-binds the position at runtime', async () => {
    expect(itemRef('dynamic').position()).toBe('end');

    fixture.componentInstance.dynamicPosition.set('start');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(itemRef('dynamic').position()).toBe('start');
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

  it('renders no tabindex attribute outside a toolbar and reports tabIndex() 0', async () => {
    const standalone = TestBed.createComponent(StandaloneItemHost);

    standalone.detectChanges();
    await standalone.whenStable();

    const ref = standalone.debugElement.query(By.css('#standalone')).injector.get(NAT_TOOLBAR_ITEM);

    expect(ref.tabIndex()).toBe(0);
    expect(
      (standalone.nativeElement.querySelector('#standalone') as HTMLElement).hasAttribute(
        'tabindex',
      ),
    ).toBe(false);
  });
});
