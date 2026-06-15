import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NatTableToolbar } from './table-toolbar';
import { NatToolbarItem } from './toolbar-item/toolbar-item.directive';

/**
 * Tripwire suite for the @angular/aria (developer preview) integration.
 * Every test here locks an internal Aria behavior the toolbar patches or
 * relies on — a failure after an @angular/aria bump means the pattern
 * contract changed and `patchAriaToolbarPattern` in table-toolbar.ts must be
 * re-verified.
 *
 * Slot DOM order: A, search (start) | B (center) | C, D (end).
 */
@Component({
  imports: [NatTableToolbar, NatToolbarItem],
  template: `
    <nat-table-toolbar>
      <button natToolbarItem="a" natToolbarItemPosition="start" id="item-a">A</button>
      <button natToolbarItem="b" natToolbarItemPosition="center" id="item-b">B</button>
      <button natToolbarItem="c" id="item-c">C</button>
      @if (showD()) {
        <button natToolbarItem="d" id="item-d">D</button>
      }
      <input
        natToolbarItem="search"
        natToolbarItemPosition="start"
        type="search"
        id="search"
        aria-label="Filter"
      />
    </nat-table-toolbar>
  `,
})
class AriaIntegrationHost {
  public readonly showD = signal(true);
}

describe('NatTableToolbar @angular/aria integration', () => {
  let fixture: ComponentFixture<AriaIntegrationHost>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(AriaIntegrationHost);
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

  function dispatchKeydown(target: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  function dispatchPointerdown(target: HTMLElement): MouseEvent {
    // jsdom has no PointerEvent constructor; Aria's handler only needs the
    // event target and preventDefault, so a MouseEvent stands in.
    const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  }

  it('leaves Enter and Space to the browser so native button activation works', async () => {
    await focusItem('item-a');

    expect(dispatchKeydown(element('item-a'), 'Enter').defaultPrevented).toBe(false);
    expect(dispatchKeydown(element('item-a'), ' ').defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(element('item-a'));
  });

  it('does not preventDefault pointerdown on text-entry items (caret placement)', () => {
    expect(dispatchPointerdown(element('search')).defaultPrevented).toBe(false);
  });

  it('preventDefaults pointerdown on buttons — the Aria focus model the patches rely on', () => {
    // Aria suppresses native mousedown focus and re-focuses the widget from
    // its click handler instead. If this stops being true after a bump, the
    // text-entry onClick patch must be revisited.
    expect(dispatchPointerdown(element('item-a')).defaultPrevented).toBe(true);
  });

  it("focuses the clicked widget from Aria's click handler", async () => {
    element('item-c').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(element('item-c'));
    expect(element('item-c').getAttribute('tabindex')).toBe('0');
  });

  it('ignores clicks on text-entry items so the caret is never stolen', async () => {
    // The onClick patch must bypass Aria entirely for text-entry widgets —
    // if Aria handled the click it would re-focus the widget and move the
    // roving tab stop, stealing the caret the user just placed.
    await focusItem('item-a');

    element('search').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(element('item-a'));
    expect(element('item-a').getAttribute('tabindex')).toBe('0');
  });

  it('moves the roving tab stop to the first visual item when the active item unmounts', async () => {
    // Aria never clears its active widget on unregister — without the reset
    // effect in table-toolbar.ts NO item would carry tabindex="0" and Tab
    // would skip the toolbar entirely.
    await focusItem('item-d');
    expect(element('item-d').getAttribute('tabindex')).toBe('0');

    fixture.componentInstance.showD.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('item-a').getAttribute('tabindex')).toBe('0');
  });
});
