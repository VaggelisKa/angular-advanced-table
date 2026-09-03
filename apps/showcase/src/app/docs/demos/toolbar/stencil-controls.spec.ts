import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { StencilToolbarExample } from './stencil-controls';

describe('FEATURE: StencilToolbarExample', () => {
  let fixture: ComponentFixture<StencilToolbarExample>;

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const query = <T extends Element>(selector: string): T => {
    const found = host().querySelector<T>(selector);

    if (!found) {
      throw new Error(`Expected element "${selector}" to render.`);
    }

    return found;
  };

  const innerButton = (hostTestId: string): HTMLButtonElement => {
    const found = query<HTMLElement>(`[data-testid="${hostTestId}"]`).shadowRoot?.querySelector<HTMLButtonElement>('button');

    if (!found) {
      throw new Error(`Expected "${hostTestId}" to render a button in its shadow root.`);
    }

    return found;
  };

  const lastAction = (): string => query('[data-testid="stencil-last-action"]').textContent.trim();

  beforeEach(async () => {
    try {
      globalThis.localStorage.removeItem('nat-showcase-theme');
    } catch {
      // ignore
    }

    await TestBed.configureTestingModule({
      imports: [StencilToolbarExample],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(StencilToolbarExample);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  describe('GIVEN: the custom-element example is rendered', () => {
    describe('WHEN: the custom elements upgrade', () => {
      it('THEN: it renders each inner button behind an open shadow root', () => {
        // `delegatesFocus` is not exposed by the unit-test DOM; the e2e covers
        // the delegating and non-delegating focus paths in a real browser.
        expect(innerButton('stencil-plain-host').getAttribute('data-testid')).toBe('stencil-plain-inner-button');
        expect(innerButton('stencil-delegating-host').getAttribute('data-testid')).toBe('stencil-delegating-inner-button');
      });
    });

    describe('WHEN: the bare toolbar items resolve their inner controls', () => {
      it('THEN: it suppresses both inner buttons so each element stays one Tab stop', () => {
        expect(innerButton('stencil-plain-host').getAttribute('tabindex')).toBe('-1');
        expect(innerButton('stencil-delegating-host').getAttribute('tabindex')).toBe('-1');
      });
    });

    describe('WHEN: a custom-element host receives focus', () => {
      it('THEN: it forwards focus to the inner button without a selector', () => {
        const plainHost = query<HTMLElement>('[data-testid="stencil-plain-host"]');

        plainHost.focus();

        expect(plainHost.shadowRoot?.activeElement).toBe(innerButton('stencil-plain-host'));
      });
    });

    describe('WHEN: each control is activated', () => {
      it('THEN: it records the activated control in the state readout', async () => {
        expect(lastAction()).toBe('none');

        innerButton('stencil-plain-host').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('stencil-plain');

        innerButton('stencil-delegating-host').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('stencil-delegating');

        query<HTMLButtonElement>('[data-testid="stencil-native-button"]').click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(lastAction()).toBe('stencil-native');
      });
    });
  });
});
