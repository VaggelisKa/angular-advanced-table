import { Directionality } from '@angular/cdk/bidi';
import type { Direction } from '@angular/cdk/bidi';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTableToolbar } from './table-toolbar';
import { NatToolbarItem } from './toolbar-item/toolbar-item.directive';

@Component({
  selector: 'nat-roving-toolbar-host',
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button id="end-a" natToolbarItem="end-a" natToolbarItemPosition="end" type="button">End A</button>
      <button id="start-a" natToolbarItem="start-a" natToolbarItemPosition="start" type="button">Start A</button>
      <input aria-label="Filter" id="text-entry" natToolbarItem="text-entry" natToolbarItemPosition="start" type="text" />
      <button id="end-b" natToolbarItem="end-b" natToolbarItemPosition="end" type="button">End B</button>
    </nat-table-toolbar>
  `
})
class RovingToolbarHost {}

function pressKey(target: HTMLElement, key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers
  });

  target.dispatchEvent(event);

  return event;
}

describe('FEATURE: NatTableToolbar roving tabindex', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  }

  describe('GIVEN: gives the first VISUAL stop the tab stop (start group before end group)', () => {
    describe('WHEN: gives the first VISUAL stop the tab stop (start group before end group)', () => {
      it('THEN: it gives the first VISUAL stop the tab stop (start group before end group)', () => {
        expect(element('start-a').getAttribute('tabindex')).toBe('0');
        expect(element('text-entry').getAttribute('tabindex')).toBe('-1');
        expect(element('end-a').getAttribute('tabindex')).toBe('-1');
        expect(element('end-b').getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('GIVEN: moves the tab stop to the item that receives focus', () => {
    describe('WHEN: moves the tab stop to the item that receives focus', () => {
      it('THEN: it moves the tab stop to the item that receives focus', async () => {
        element('end-a').focus();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(element('end-a').getAttribute('tabindex')).toBe('0');
        expect(element('start-a').getAttribute('tabindex')).toBe('-1');
      });
    });
  });
});

describe('FEATURE: NatTableToolbar keyboard navigation', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  }

  async function focusItem(domId: string): Promise<void> {
    element(domId).focus();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  describe('GIVEN: ArrowRight moves focus to the next visual stop and prevents default', () => {
    describe('WHEN: ArrowRight moves focus to the next visual stop and prevents default', () => {
      it('THEN: it ArrowRight moves focus to the next visual stop and prevents default', async () => {
        await focusItem('start-a');
        const event = pressKey(element('start-a'), 'ArrowRight');

        expect(document.activeElement).toBe(element('text-entry'));
        expect(event.defaultPrevented).toBe(true);
      });
    });
  });

  describe('GIVEN: ArrowRight wraps from the last stop to the first', () => {
    describe('WHEN: ArrowRight wraps from the last stop to the first', () => {
      it('THEN: it ArrowRight wraps from the last stop to the first', async () => {
        await focusItem('end-b');
        pressKey(element('end-b'), 'ArrowRight');

        expect(document.activeElement).toBe(element('start-a'));
      });
    });
  });

  describe('GIVEN: ArrowLeft wraps from the first stop to the last', () => {
    describe('WHEN: ArrowLeft wraps from the first stop to the last', () => {
      it('THEN: it ArrowLeft wraps from the first stop to the last', async () => {
        await focusItem('start-a');
        pressKey(element('start-a'), 'ArrowLeft');

        expect(document.activeElement).toBe(element('end-b'));
      });
    });
  });

  describe('GIVEN: Home and End jump to the first and last visual stops', () => {
    describe('WHEN: Home and End jump to the first and last visual stops', () => {
      it('THEN: it Home and End jump to the first and last visual stops', async () => {
        await focusItem('end-a');
        pressKey(element('end-a'), 'Home');
        expect(document.activeElement).toBe(element('start-a'));

        await focusItem('end-a');
        pressKey(element('end-a'), 'End');
        expect(document.activeElement).toBe(element('end-b'));
      });
    });
  });

  describe('GIVEN: ignores arrows carrying modifier keys', () => {
    describe('WHEN: ignores arrows carrying modifier keys', () => {
      it('THEN: it ignores arrows carrying modifier keys', async () => {
        await focusItem('start-a');
        const event = pressKey(element('start-a'), 'ArrowRight', { ctrlKey: true });

        expect(document.activeElement).toBe(element('start-a'));
        expect(event.defaultPrevented).toBe(false);
      });
    });
  });

  describe('GIVEN: does not intercept arrows or Home/End while focus is inside a text input', () => {
    describe('WHEN: does not intercept arrows or Home/End while focus is inside a text input', () => {
      it('THEN: it does not intercept arrows or Home/End while focus is inside a text input', async () => {
        await focusItem('text-entry');

        const arrowEvent = pressKey(element('text-entry'), 'ArrowRight');

        expect(document.activeElement).toBe(element('text-entry'));
        expect(arrowEvent.defaultPrevented).toBe(false);

        const homeEvent = pressKey(element('text-entry'), 'Home');

        expect(document.activeElement).toBe(element('text-entry'));
        expect(homeEvent.defaultPrevented).toBe(false);
      });
    });
  });
});

describe('FEATURE: NatTableToolbar keyboard navigation (RTL)', () => {
  let fixture: ComponentFixture<RovingToolbarHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: Directionality,
          // @angular/aria reads valueSignal; the cdk Directionality ctor needs
          // a document — a plain stub with both shapes is enough here.
          useValue: {
            value: 'rtl',
            valueSignal: signal<Direction>('rtl')
          } as unknown as Directionality
        }
      ]
    });
    fixture = TestBed.createComponent(RovingToolbarHost);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function element(domId: string): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  }

  describe('GIVEN: ArrowLeft moves to the NEXT visual stop in RTL', () => {
    describe('WHEN: ArrowLeft moves to the NEXT visual stop in RTL', () => {
      it('THEN: it ArrowLeft moves to the NEXT visual stop in RTL', async () => {
        element('start-a').focus();
        fixture.detectChanges();
        await fixture.whenStable();

        pressKey(element('start-a'), 'ArrowLeft');

        expect(document.activeElement).toBe(element('text-entry'));
      });
    });
  });

  describe('GIVEN: ArrowRight moves to the PREVIOUS visual stop in RTL', () => {
    describe('WHEN: ArrowRight moves to the PREVIOUS visual stop in RTL', () => {
      it('THEN: it ArrowRight moves to the PREVIOUS visual stop in RTL', async () => {
        element('end-a').focus();
        fixture.detectChanges();
        await fixture.whenStable();

        pressKey(element('end-a'), 'ArrowRight');

        expect(document.activeElement).toBe(element('text-entry'));
      });
    });
  });
});
