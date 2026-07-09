import { Directionality } from '@angular/cdk/bidi';
import type { Direction } from '@angular/cdk/bidi';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTableToolbar } from './table-toolbar';
import { NatToolbarItem } from '../../ui/toolbar-item/toolbar-item.directive';

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

const pressKey = (target: HTMLElement, key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers
  });

  target.dispatchEvent(event);

  return event;
};

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

  const element = (domId: string): HTMLElement => {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  };

  describe('GIVEN: a roving toolbar host is rendered', () => {
    describe('WHEN: gives the first VISUAL stop the tab stop (start group before end group)', () => {
      it('THEN: it sets the initial roving tab stop on the first visual item', () => {
        expect(element('start-a').getAttribute('tabindex')).toBe('0');
        expect(element('text-entry').getAttribute('tabindex')).toBe('-1');
        expect(element('end-a').getAttribute('tabindex')).toBe('-1');
        expect(element('end-b').getAttribute('tabindex')).toBe('-1');
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with focusable toolbar items', () => {
    describe('WHEN: moves the tab stop to the item that receives focus', () => {
      it('THEN: it updates roving tabindex state after focus moves', async () => {
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

  const element = (domId: string): HTMLElement => {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  };

  const focusItem = async (domId: string): Promise<void> => {
    element(domId).focus();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  describe('GIVEN: a roving toolbar host is rendered with left-to-right toolbar navigation', () => {
    describe('WHEN: ArrowRight moves focus to the next visual stop and prevents default', () => {
      it('THEN: it focuses the next item and cancels browser handling', async () => {
        await focusItem('start-a');
        const event = pressKey(element('start-a'), 'ArrowRight');

        expect(document.activeElement).toBe(element('text-entry'));
        expect(event.defaultPrevented).toBe(true);
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with focus on the last toolbar item', () => {
    describe('WHEN: ArrowRight wraps from the last stop to the first', () => {
      it('THEN: it moves focus back to the first item', async () => {
        await focusItem('end-b');
        pressKey(element('end-b'), 'ArrowRight');

        expect(document.activeElement).toBe(element('start-a'));
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with focus on the first toolbar item', () => {
    describe('WHEN: ArrowLeft wraps from the first stop to the last', () => {
      it('THEN: it moves focus back to the last item', async () => {
        await focusItem('start-a');
        pressKey(element('start-a'), 'ArrowLeft');

        expect(document.activeElement).toBe(element('end-b'));
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with boundary toolbar shortcuts', () => {
    describe('WHEN: Home and End jump to the first and last visual stops', () => {
      it('THEN: it focuses the boundary toolbar items', async () => {
        await focusItem('end-a');
        pressKey(element('end-a'), 'Home');
        expect(document.activeElement).toBe(element('start-a'));

        await focusItem('end-a');
        pressKey(element('end-a'), 'End');
        expect(document.activeElement).toBe(element('end-b'));
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with modified arrow key events', () => {
    describe('WHEN: ignores arrows carrying modifier keys', () => {
      it('THEN: it leaves modified arrow events untouched', async () => {
        await focusItem('start-a');
        const event = pressKey(element('start-a'), 'ArrowRight', { ctrlKey: true });

        expect(document.activeElement).toBe(element('start-a'));
        expect(event.defaultPrevented).toBe(false);
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with a text input inside the toolbar', () => {
    // Boundary-aware handoff (#249): a single-line input keeps Left/Right for its
    // caret while the caret has room to travel, then hands the arrow off to
    // roving nav once the caret sits at the value edge in the arrow's direction.
    // Visual order: start-a, text-entry, end-a, end-b.
    const searchInput = (): HTMLInputElement => element('text-entry') as HTMLInputElement;

    describe('WHEN: the caret sits mid-value and an arrow is pressed', () => {
      it('THEN: it keeps the caret key and roving focus stays on the input', async () => {
        await focusItem('text-entry');
        const input = searchInput();

        input.value = 'abc';
        input.setSelectionRange(1, 1);

        const arrowEvent = pressKey(input, 'ArrowRight');

        expect(document.activeElement).toBe(input);
        expect(arrowEvent.defaultPrevented).toBe(false);
      });
    });

    describe('WHEN: the caret reaches the value edge in the arrow direction', () => {
      it('THEN: it hands Left/Right off to the adjacent roving item', async () => {
        await focusItem('text-entry');
        const input = searchInput();

        input.value = 'abc';

        // when: caret at the end, ArrowRight advances to the next visual item
        input.setSelectionRange(3, 3);
        const forwardEvent = pressKey(input, 'ArrowRight');

        expect(document.activeElement).toBe(element('end-a'));
        expect(forwardEvent.defaultPrevented).toBe(true);

        // when: caret at the start, ArrowLeft steps back to the previous item
        await focusItem('text-entry');
        input.setSelectionRange(0, 0);
        const backwardEvent = pressKey(input, 'ArrowLeft');

        expect(document.activeElement).toBe(element('start-a'));
        expect(backwardEvent.defaultPrevented).toBe(true);
      });
    });

    describe('WHEN: Home/End are pressed inside the text input', () => {
      it('THEN: it preserves native caret shortcuts', async () => {
        await focusItem('text-entry');
        const input = searchInput();

        input.value = 'abc';
        input.setSelectionRange(1, 1);

        const homeEvent = pressKey(input, 'Home');

        expect(document.activeElement).toBe(input);
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

  const element = (domId: string): HTMLElement => {
    return (fixture.nativeElement as HTMLElement).querySelector(`#${domId}`) as HTMLElement;
  };

  describe('GIVEN: a roving toolbar host is rendered with right-to-left toolbar navigation', () => {
    describe('WHEN: ArrowLeft moves to the NEXT visual stop in RTL', () => {
      it('THEN: it focuses the next visual item in RTL order', async () => {
        element('start-a').focus();
        fixture.detectChanges();
        await fixture.whenStable();

        pressKey(element('start-a'), 'ArrowLeft');

        expect(document.activeElement).toBe(element('text-entry'));
      });
    });
  });

  describe('GIVEN: a roving toolbar host is rendered with right-to-left toolbar navigation at the next item', () => {
    describe('WHEN: ArrowRight moves to the PREVIOUS visual stop in RTL', () => {
      it('THEN: it focuses the previous visual item in RTL order', async () => {
        element('end-a').focus();
        fixture.detectChanges();
        await fixture.whenStable();

        pressKey(element('end-a'), 'ArrowRight');

        expect(document.activeElement).toBe(element('text-entry'));
      });
    });
  });
});
