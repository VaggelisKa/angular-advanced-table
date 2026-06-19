import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NatTableHotkeyA11y } from './hotkey-a11y.directive';
import { NatTableService } from './table.service';
import { NAT_TABLE_KEYBINDINGS, serializeShortcutValue, DEFAULT_NAT_TABLE_KEYBINDINGS } from './keybindings';
import type { NatTableKeybindings } from './table.types';

@Component({
  imports: [NatTableHotkeyA11y],
  template: `
    <button data-testid="fallback-btn" [natHotkeyA11y]="actionKey()">Activate Row</button>
    <button data-testid="alias-btn" [natTableHotkeyA11y]="actionKey()">Alias Button</button>
  `,
})
class FallbackHost {
  readonly actionKey = signal<keyof NatTableKeybindings>('rowActivate');
}

@Component({
  imports: [NatTableHotkeyA11y],
  providers: [NatTableService],
  template: `
    <button data-testid="service-btn" [natHotkeyA11y]="actionKey()">
      {{ text() }}
    </button>
  `,
})
class ServiceHost {
  readonly actionKey = signal<keyof NatTableKeybindings>('rowActivate');
  readonly text = signal('Perform Action');
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
              columnReorderLeft: { key: 'ArrowLeft', shiftKey: true },
            } as NatTableKeybindings,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(FallbackHost);
      host = fixture.componentInstance;
      await fixture.whenStable();
    });

    it('should fall back to global NAT_TABLE_KEYBINDINGS configuration', async () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('[data-testid="fallback-btn"]') as HTMLButtonElement;

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Space');
      expect(button.getAttribute('aria-label')).toBe('Activate Row (Shortcut: Space)');
    });

    it('should support other input aliases like natTableHotkeyA11y', async () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('[data-testid="alias-btn"]') as HTMLButtonElement;

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Space');
      expect(button.getAttribute('aria-label')).toBe('Alias Button (Shortcut: Space)');
    });

    it('should update attributes when actionKey changes', async () => {
      host.actionKey.set('columnReorderLeft');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('[data-testid="fallback-btn"]') as HTMLButtonElement;
      expect(button.getAttribute('aria-keyshortcuts')).toBe('Shift+ArrowLeft');
      expect(button.getAttribute('aria-label')).toBe('Activate Row (Shortcut: Shift+ArrowLeft)');
    });

    it('should use default keybindings if not overridden in NAT_TABLE_KEYBINDINGS', async () => {
      host.actionKey.set('columnReorderRight');
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('[data-testid="fallback-btn"]') as HTMLButtonElement;
      expect(button.getAttribute('aria-keyshortcuts')).toBe(
        serializeShortcutValue(DEFAULT_NAT_TABLE_KEYBINDINGS.columnReorderRight),
      );
    });
  });

  describe('Scoped scenarios (with NatTableService)', () => {
    let fixture: ComponentFixture<ServiceHost>;
    let host: ServiceHost;
    let service: NatTableService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ServiceHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();

      fixture = TestBed.createComponent(ServiceHost);
      host = fixture.componentInstance;
      service = fixture.debugElement.injector.get(NatTableService);
      await fixture.whenStable();
    });

    it('should resolve keybindings from NatTableService and default values', async () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('[data-testid="service-btn"]') as HTMLButtonElement;

      expect(button.getAttribute('aria-keyshortcuts')).toBe('Enter Space');
      expect(button.getAttribute('aria-label')).toBe('Perform Action (Shortcut: Enter Space)');
    });

    it('should update keybindings dynamically when service keybindings change', async () => {
      service.surfaceKeybindings.set({ rowActivate: 'Ctrl+Enter' });
      fixture.detectChanges();
      await fixture.whenStable();

      const button = fixture.nativeElement.querySelector('[data-testid="service-btn"]') as HTMLButtonElement;
      expect(button.getAttribute('aria-keyshortcuts')).toBe('Control+Enter');
      expect(button.getAttribute('aria-label')).toBe('Perform Action (Shortcut: Control+Enter)');
    });

    it('should update aria-label reactively when inner text changes (MutationObserver)', async () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('[data-testid="service-btn"]') as HTMLButtonElement;

      const mutationPromise = new Promise<void>((resolve) => {
        const obs = new MutationObserver(() => {
          const label = button.getAttribute('aria-label');
          if (label && label.includes('Execute Row')) {
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
