import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directionality, type Direction } from '@angular/cdk/bidi';

import { NatTableToolbar } from './table-toolbar';
import { NatToolbarItem } from './toolbar-item/toolbar-item.directive';

@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem value="end-a" id="end-a">End A</button>
      <button natToolbarItem="start" value="start-a" id="start-a">Start A</button>
      <!-- [value] binds the aria widget input only; a static value attribute
           would also prefill the text field. -->
      <input natToolbarItem="start" [value]="'text-entry'" type="text" id="text-entry" aria-label="Filter" />
      <button natToolbarItem value="end-b" id="end-b">End B</button>
    </nat-table-toolbar>
  `,
})
class RovingToolbarHost {}

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
});

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
        {
          provide: Directionality,
          // @angular/aria reads valueSignal; the cdk Directionality ctor needs
          // a document — a plain stub with both shapes is enough here.
          useValue: {
            value: 'rtl',
            valueSignal: signal<Direction>('rtl'),
          } as unknown as Directionality,
        },
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
