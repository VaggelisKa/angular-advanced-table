import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { WrappedToolbarExample } from './wrapped-controls';

describe('FEATURE: WrappedToolbarExample', () => {
  let fixture: ComponentFixture<WrappedToolbarExample>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const query = <T extends Element>(selector: string): T => {
    const found = host().querySelector<T>(selector);

    if (!found) {
      throw new Error(`Expected element "${selector}" to render.`);
    }

    return found;
  };

  const lastAction = (): string => query('[data-testid="wrapped-last-action"]').textContent.trim();

  beforeEach(async () => {
    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [WrappedToolbarExample],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(WrappedToolbarExample);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('GIVEN: the wrapped-controls example is rendered', () => {
    describe('WHEN: the wrappers nominate their inner buttons as focus targets', () => {
      it('THEN: it suppresses both inner buttons so each wrapper stays one Tab stop', () => {
        const lightInner = query<HTMLButtonElement>('[data-testid="wrapped-light-button"]');
        const shadowHost = query<HTMLElement>('app-shadow-wrapped-button');
        const shadowInner = shadowHost.shadowRoot?.querySelector<HTMLButtonElement>('[data-testid="wrapped-shadow-button"]');

        expect(lightInner.getAttribute('tabindex')).toBe('-1');
        // The shadow wrapper resolves through its open shadow root with the same selector.
        expect(shadowInner?.getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('WHEN: the wrapper hosts receive focus', () => {
      it('THEN: it forwards focus to the inner button', () => {
        const lightHost = query<HTMLElement>('app-wrapped-button');
        const lightInner = query<HTMLButtonElement>('[data-testid="wrapped-light-button"]');

        lightHost.focus();

        expect(document.activeElement).toBe(lightInner);
      });
    });

    describe('WHEN: each control is activated', () => {
      it('THEN: it records the activated control in the state readout', async () => {
        expect(lastAction()).toBe('none');

        query<HTMLButtonElement>('[data-testid="wrapped-light-button"]').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('wrapped-light');

        const shadowHost = query<HTMLElement>('app-shadow-wrapped-button');

        shadowHost.shadowRoot?.querySelector<HTMLButtonElement>('[data-testid="wrapped-shadow-button"]')?.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('wrapped-shadow');

        query<HTMLButtonElement>('[data-testid="wrapped-plain-button"]').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('wrapped-plain');
      });
    });
  });
});
