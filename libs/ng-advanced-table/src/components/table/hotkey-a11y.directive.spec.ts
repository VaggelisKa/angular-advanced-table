import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { NatTableHotkeyA11y } from './hotkey-a11y.directive';
import { DEFAULT_NAT_TABLE_KEYBINDINGS, NAT_TABLE_KEYBINDINGS, serializeShortcutValue } from './keybindings';
import { NatTableService } from './table.service';
import type { NatTableKeybindings } from './table.types';

const queryRequired = <T extends HTMLElement = HTMLElement>(f: ComponentFixture<unknown>, sel: string): T => {
  const element = (f.nativeElement as HTMLElement).querySelector<T>(sel);

  if (!element) {
    throw new Error(`Expected to find element matching "${sel}".`);
  }

  return element;
};

@Component({
  selector: 'test-fallback-host',
  imports: [NatTableHotkeyA11y],
  template: `
    <button [natHotkeyA11y]="actionKey()" data-testid="fallback-btn" type="button">Activate Row</button>
    <button [natTableHotkeyA11y]="actionKey()" data-testid="alias-btn" type="button">Alias Button</button>
  `
})
class FallbackHost {
  public readonly actionKey = signal<keyof NatTableKeybindings>('rowActivate');
}

@Component({
  selector: 'test-service-host',
  imports: [NatTableHotkeyA11y],
  providers: [NatTableService],
  template: `
    <button [natHotkeyA11y]="actionKey()" data-testid="service-btn" type="button">
      {{ text() }}
    </button>
  `
})
class ServiceHost {
  public readonly actionKey = signal<keyof NatTableKeybindings>('rowActivate');
  public readonly text = signal('Perform Action');
}

describe('NatTableHotkeyA11y', () => {
  describe('Fallback scenarios (without NatTableService)', () => {
    let fixture: ComponentFixture<FallbackHost>;
    let host: FallbackHost;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [FallbackHost],
        providers: [
          provideZonelessChangeDetection(),
          {
            provide: NAT_TABLE_KEYBINDINGS,
            useValue: {
              rowActivate: 'Space',
              columnReorderLeft: { key: 'ArrowLeft', shiftKey: true }
            } as NatTableKeybindings
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(FallbackHost);
      host = fixture.componentInstance;
      await fixture.whenStable();
    });

    it('should fall back to global NAT_TABLE_KEYBINDINGS configuration', () => {
      fixture.detectChanges();
      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="fallback-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Space');
      expect(button.getAttribute('aria-label')).toBe('Activate Row (Shortcut: Space)');
    });

    it('should support other input aliases like natTableHotkeyA11y', () => {
      fixture.detectChanges();
      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="alias-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Space');
      expect(button.getAttribute('aria-label')).toBe('Alias Button (Shortcut: Space)');
    });

    it('should update attributes when actionKey changes', async () => {
      host.actionKey.set('columnReorderLeft');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="fallback-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Shift+ArrowLeft');
      expect(button.getAttribute('aria-label')).toBe('Activate Row (Shortcut: Shift+ArrowLeft)');
    });

    it('should use default keybindings if not overridden in NAT_TABLE_KEYBINDINGS', async () => {
      host.actionKey.set('columnReorderRight');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="fallback-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe(serializeShortcutValue(DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight));
    });

    it('should initialize attributes when MutationObserver is unavailable', async () => {
      const originalMutationObserver = globalThis.MutationObserver;

      vi.stubGlobal('MutationObserver', undefined);

      const noObserverFixture = TestBed.createComponent(FallbackHost);

      try {
        await noObserverFixture.whenStable();
        noObserverFixture.detectChanges();

        const button = queryRequired<HTMLButtonElement>(noObserverFixture, '[data-testid="fallback-btn"]');

        expect(button.getAttribute('aria-keyshortcuts')).toBe('Space');
        expect(button.getAttribute('aria-label')).toBe('Activate Row (Shortcut: Space)');
      } finally {
        noObserverFixture.destroy();
        vi.stubGlobal('MutationObserver', originalMutationObserver);
      }
    });
  });

  describe('Scoped scenarios (with NatTableService)', () => {
    let fixture: ComponentFixture<ServiceHost>;
    let host: ServiceHost;
    let service: NatTableService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ServiceHost],
        providers: [provideZonelessChangeDetection()]
      }).compileComponents();

      fixture = TestBed.createComponent(ServiceHost);
      host = fixture.componentInstance;
      service = fixture.debugElement.injector.get(NatTableService);
      await fixture.whenStable();
    });

    it('should resolve keybindings from NatTableService and default values', () => {
      fixture.detectChanges();
      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="service-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Enter Space');
      expect(button.getAttribute('aria-label')).toBe('Perform Action (Shortcut: Enter Space)');
    });

    it('should update keybindings dynamically when service keybindings change', async () => {
      service.surfaceKeybindings.set({ rowActivate: 'Ctrl+Enter' });
      fixture.detectChanges();
      await fixture.whenStable();

      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="service-btn"]');

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Control+Enter');
      expect(button.getAttribute('aria-label')).toBe('Perform Action (Shortcut: Control+Enter)');
    });

    it('should update aria-label reactively when inner text changes (MutationObserver)', async () => {
      fixture.detectChanges();
      const button = queryRequired<HTMLButtonElement>(fixture, '[data-testid="service-btn"]');

      const mutationPromise = new Promise<void>((resolve) => {
        const obs = new MutationObserver(() => {
          const label = button.getAttribute('aria-label');

          if (label?.includes('Execute Row')) {
            obs.disconnect();
            resolve();
          }
        });

        obs.observe(button, { childList: true, attributes: true, attributeFilter: ['aria-label'] });
      });

      host.text.set('Execute Row');
      fixture.detectChanges();

      await mutationPromise;
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Execute Row (Shortcut: Enter Space)');
    });
  });
});
