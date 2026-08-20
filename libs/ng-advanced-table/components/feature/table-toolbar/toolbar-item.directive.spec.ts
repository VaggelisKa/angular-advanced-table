import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NatTableToolbar } from './table-toolbar';
import { NAT_TOOLBAR_ITEM } from '../../common/toolbar.const';
import type { NatToolbarItemPosition, NatToolbarItemRef } from '../../common/toolbar.type';
import { NatToolbarItem } from '../../ui/toolbar-item/toolbar-item.directive';

@Component({
  selector: 'nat-toolbar-item-host',
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button id="default-start" natToolbarItem="export" type="button">Export</button>
      <button id="explicit-end" natToolbarItem="filter" natToolbarItemPosition="end" type="button">Filter</button>
      <button [natToolbarItemPosition]="dynamicPosition()" id="dynamic" natToolbarItem="dynamic" type="button">Dynamic</button>
      <div natToolbarItem="custom">Custom widget</div>
    </nat-table-toolbar>
  `
})
class DirectiveHost {
  public readonly dynamicPosition = signal<NatToolbarItemPosition>('center');
}

/** Stands in for a design-system control: the host is a shell, the button is inside it. */
@Component({
  selector: 'nat-wrapped-control',
  template: `<button class="inner" type="button">Wrapped</button>`
})
class WrappedControl {}

@Component({
  selector: 'nat-focus-target-host',
  imports: [NatTableToolbar, NatToolbarItem, WrappedControl],
  template: `
    <nat-table-toolbar>
      <nat-wrapped-control [natToolbarItemFocusTarget]="selector()" id="wrapped" natToolbarItem="wrapped" />
      <button id="plain" natToolbarItem="plain" type="button">Plain</button>
    </nat-table-toolbar>
  `
})
class FocusTargetHost {
  public readonly selector = signal<string | undefined>('button.inner');
}

@Component({
  selector: 'nat-toolbarless-host',
  imports: [NatToolbarItem],
  template: `<button natToolbarItem="orphan" type="button">Orphan</button>`
})
class ToolbarlessHost {}

describe('FEATURE: NatToolbarItem', () => {
  let fixture: ComponentFixture<DirectiveHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(DirectiveHost);
    fixture.detectChanges();

    await fixture.whenStable();
  });

  const element = (domId: string): HTMLElement => {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  };

  const itemRef = (domId: string): NatToolbarItemRef => {
    return fixture.debugElement.query(By.css(`#${domId}`)).injector.get(NAT_TOOLBAR_ITEM);
  };

  describe('GIVEN: a toolbar item host is rendered', () => {
    describe('WHEN: mirrors the host id from the aria widget', () => {
      it('THEN: it keeps the consumer-provided id stable', () => {
        // The id attribute feeds the exposed ToolbarWidget `id` input, whose host
        // binding writes the same value back — consumer ids stay stable.
        expect(itemRef('default-start').id).toBe('default-start');
        expect(element('default-start').id).toBe('default-start');
      });
    });
  });

  describe('GIVEN: a toolbar item host is rendered with an unnamed toolbar widget', () => {
    describe('WHEN: generates a unique aria widget id when the host declares none', () => {
      it('THEN: it assigns a generated toolbar widget id', () => {
        const unnamed = fixture.debugElement
          .queryAll(By.directive(NatToolbarItem))
          .map((debugElement) => debugElement.injector.get(NAT_TOOLBAR_ITEM))
          .find((ref) => ref.element.tagName === 'DIV');

        expect(unnamed).toBeDefined();

        if (!unnamed) {
          throw new Error('Expected an unnamed toolbar item ref on a DIV host.');
        }

        // cdk _IdGenerator format: ng-toolbar-widget-<appId>-<n>.
        expect(unnamed.id).toMatch(/^ng-toolbar-widget-/);
        expect(unnamed.element.id).toBe(unnamed.id);
      });
    });
  });

  describe('GIVEN: toolbar items declare default and explicit positions', () => {
    describe("WHEN: defaults the position to 'start' and passes explicit values through", () => {
      it('THEN: it resolves default and explicit toolbar positions', () => {
        expect(itemRef('default-start').position()).toBe('start');
        expect(itemRef('explicit-end').position()).toBe('end');
      });
    });
  });

  describe('GIVEN: a toolbar item host is rendered with a dynamic toolbar item position', () => {
    describe('WHEN: re-binds the position signal at runtime (slot placement stays static)', () => {
      it('THEN: it updates the position signal while keeping content projected', async () => {
        expect(itemRef('dynamic').position()).toBe('center');

        fixture.componentInstance.dynamicPosition.set('end');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(itemRef('dynamic').position()).toBe('end');
        // ng-content slots are resolved at compile time — a bound position never
        // moves the element out of the catch-all (start) slot.
        expect(itemRef('dynamic').element.isConnected).toBe(true);
      });
    });
  });

  describe('GIVEN: a toolbar item is declared without a toolbar parent', () => {
    describe('WHEN: throws outside a toolbar — the ToolbarWidget host directive requires a parent ngToolbar', () => {
      it('THEN: it raises the toolbar parent requirement error', () => {
        expect(() => {
          const orphanFixture = TestBed.createComponent(ToolbarlessHost);

          orphanFixture.detectChanges();
        }).toThrow(/Toolbar/);
      });
    });
  });

  describe('GIVEN: a toolbar item wraps its real control', () => {
    let wrappedFixture: ComponentFixture<FocusTargetHost>;

    const host = (): HTMLElement => (wrappedFixture.nativeElement as HTMLElement).querySelector('#wrapped') as HTMLElement;
    const inner = (): HTMLElement => (wrappedFixture.nativeElement as HTMLElement).querySelector('.inner') as HTMLElement;

    beforeEach(async () => {
      wrappedFixture = TestBed.createComponent(FocusTargetHost);
      wrappedFixture.detectChanges();

      await wrappedFixture.whenStable();
    });

    describe('WHEN: the nominated target is resolved', () => {
      it('THEN: it pulls the inner control out of the sequential tab order', () => {
        // Without this the wrapper (carrying the roving tabindex) and the inner
        // button would both be tab stops, so Tab would enter the toolbar twice.
        expect(inner().getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('WHEN: the widget element is read for Aria registration', () => {
      it('THEN: it stays the host so hit-testing keeps resolving the item', () => {
        // Aria resolves events with `item.element().contains(target)`; repointing
        // this at the inner control would break click/focusin/keydown routing.
        const ref = wrappedFixture.debugElement.query(By.css('#wrapped')).injector.get(NAT_TOOLBAR_ITEM);

        expect(ref.element).toBe(host());
      });
    });

    describe('WHEN: the host receives focus', () => {
      it('THEN: it forwards focus to the nominated control', () => {
        host().focus();

        expect(document.activeElement).toBe(inner());
      });
    });

    describe('WHEN: no focus target is configured', () => {
      it('THEN: a plain item keeps focusing its own host', () => {
        const plain = (wrappedFixture.nativeElement as HTMLElement).querySelector('#plain') as HTMLElement;

        plain.focus();

        expect(document.activeElement).toBe(plain);
      });
    });

    describe('WHEN: the selector is cleared at runtime', () => {
      it('THEN: focus falls back to the host element', async () => {
        wrappedFixture.componentInstance.selector.set(undefined);
        wrappedFixture.detectChanges();
        await wrappedFixture.whenStable();

        // The former control gets its tab stop back — suppression is not
        // permanent once the item stops forwarding focus to it.
        expect(inner().hasAttribute('tabindex')).toBe(false);

        host().focus();

        expect(document.activeElement).toBe(host());
      });
    });

    describe('WHEN: the selector is repointed to one that resolves nothing', () => {
      it('THEN: it returns the former control to the sequential tab order', async () => {
        expect(inner().getAttribute('tabindex')).toBe('-1');

        wrappedFixture.componentInstance.selector.set('button.missing');
        wrappedFixture.detectChanges();
        await wrappedFixture.whenStable();

        expect(inner().hasAttribute('tabindex')).toBe(false);
      });
    });
  });
});
