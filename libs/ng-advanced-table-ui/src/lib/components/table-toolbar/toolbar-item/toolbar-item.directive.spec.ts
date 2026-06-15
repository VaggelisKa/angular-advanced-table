import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTableToolbar } from '../table-toolbar';
import { NatToolbarItem } from './toolbar-item.directive';
import { NAT_TOOLBAR_ITEM } from '../common/toolbar-tokens.const';
import type { NatToolbarItemPosition, NatToolbarItemRef } from '../common/toolbar-tokens.type';

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem="export" id="default-start">Export</button>
      <button natToolbarItem="filter" natToolbarItemPosition="end" id="explicit-end">Filter</button>
      <button natToolbarItem="dynamic" [natToolbarItemPosition]="dynamicPosition()" id="dynamic">Dynamic</button>
      <div natToolbarItem="custom">Custom widget</div>
    </nat-table-toolbar>
  `,
})
class DirectiveHost {
  public readonly dynamicPosition = signal<NatToolbarItemPosition>('center');
}

@Component({
  imports: [NatToolbarItem],
  template: `<button natToolbarItem="orphan">Orphan</button>`,
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

  it('mirrors the host id from the aria widget', () => {
    // The id attribute feeds the exposed ToolbarWidget `id` input, whose host
    // binding writes the same value back — consumer ids stay stable.
    expect(itemRef('default-start').id).toBe('default-start');
    expect(element('default-start').id).toBe('default-start');
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

  it("defaults the position to 'start' and passes explicit values through", () => {
    expect(itemRef('default-start').position()).toBe('start');
    expect(itemRef('explicit-end').position()).toBe('end');
  });

  it('re-binds the position signal at runtime (slot placement stays static)', async () => {
    expect(itemRef('dynamic').position()).toBe('center');

    fixture.componentInstance.dynamicPosition.set('end');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(itemRef('dynamic').position()).toBe('end');
    // ng-content slots are resolved at compile time — a bound position never
    // moves the element out of the catch-all (start) slot.
    expect(itemRef('dynamic').element.isConnected).toBe(true);
  });

  it('throws outside a toolbar — the ToolbarWidget host directive requires a parent ngToolbar', () => {
    expect(() => {
      const orphanFixture = TestBed.createComponent(ToolbarlessHost);
      orphanFixture.detectChanges();
    }).toThrow(/Toolbar/);
  });
});
