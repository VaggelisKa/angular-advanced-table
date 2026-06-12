import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTableToolbar } from '../table-toolbar';
import { NatToolbarItem } from './toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import type { NatToolbarItemRef } from '../common/toolbar-tokens.type';

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem value="export" id="default-end">Export</button>
      <button natToolbarItem="start" value="search" id="explicit-start">Search</button>
      <button [natToolbarItem]="dynamicPosition()" value="dynamic" id="dynamic">Dynamic</button>
      <div natToolbarItem value="custom">Custom widget</div>
    </nat-table-toolbar>
  `,
})
class DirectiveHost {
  public readonly dynamicPosition = signal<'' | 'start' | 'center' | 'end'>('');
}

@Component({
  imports: [NatToolbarItem],
  template: `<button natToolbarItem value="orphan">Orphan</button>`,
})
class ToolbarlessHost {}

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

  it('applies the nat-toolbar-item class and mirrors the host id from the aria widget', () => {
    expect(element('default-end').classList.contains('nat-toolbar-item')).toBe(true);
    // The id attribute feeds the exposed ToolbarWidget `id` input, whose host
    // binding writes the same value back — consumer ids stay stable.
    expect(itemRef('default-end').id).toBe('default-end');
    expect(element('default-end').id).toBe('default-end');
  });

  it('generates a unique aria widget id when the host declares none', () => {
    const unnamed = fixture.debugElement
      .queryAll(By.directive(NatToolbarItem))
      .map((debugElement) => debugElement.injector.get(NAT_TOOLBAR_ITEM))
      .find((ref) => ref.element.tagName === 'DIV');

    // cdk _IdGenerator format: ng-toolbar-widget-<appId>-<n>.
    expect(unnamed?.id).toMatch(/^ng-toolbar-widget-/);
    expect(unnamed?.element.id).toBe(unnamed?.id);
  });

  it("normalizes the position input: '' and 'end' -> end, 'start' and 'center' pass through", () => {
    expect(itemRef('default-end').position()).toBe('end');
    expect(itemRef('explicit-start').position()).toBe('start');

    fixture.componentInstance.dynamicPosition.set('center');
    fixture.detectChanges();

    expect(itemRef('dynamic').position()).toBe('center');
  });

  it('re-binds the position signal at runtime (slot placement stays static)', async () => {
    expect(itemRef('dynamic').position()).toBe('end');

    fixture.componentInstance.dynamicPosition.set('start');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(itemRef('dynamic').position()).toBe('start');
    // ng-content slots are resolved at compile time — a bound position never
    // moves the element out of the default (end) slot.
    expect(itemRef('dynamic').element.isConnected).toBe(true);
  });

  it('throws outside a toolbar — the ToolbarWidget host directive requires a parent ngToolbar', () => {
    expect(() => {
      const orphanFixture = TestBed.createComponent(ToolbarlessHost);
      orphanFixture.detectChanges();
    }).toThrow(/Toolbar/);
  });
});
