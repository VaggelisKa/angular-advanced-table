import {
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  Renderer2,
  signal,
} from '@angular/core';
import {
  NAT_TABLE_KEYBINDINGS,
  mergeNatTableKeybindings,
  serializeShortcutValue,
} from './keybindings';
import type { NatTableKeybindings } from './table.types';
import { NatTableService } from './table.service';

/**
 * Directive to manage keyboard shortcut screen reader readouts and ARIA attributes.
 * Updates `aria-keyshortcuts` and appends shortcut descriptions to `aria-label`
 * without losing the element's base text.
 */
@Directive({
  selector: '[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]',
})
export class NatTableHotkeyA11y {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly natTableService = inject(NatTableService, { optional: true });
  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};

  // Support multiple selector aliases as inputs
  readonly natHotkeyA11y = input<keyof NatTableKeybindings | ''>('', { alias: 'natHotkeyA11y' });
  readonly natTableHotkeyA11y = input<keyof NatTableKeybindings | ''>('', { alias: 'natTableHotkeyA11y' });
  readonly appHotkeyA11y = input<keyof NatTableKeybindings | ''>('', { alias: 'appHotkeyA11y' });

  // Resolve the active action key
  readonly actionKey = computed<keyof NatTableKeybindings | null>(() => {
    const val = this.natHotkeyA11y() || this.natTableHotkeyA11y() || this.appHotkeyA11y();
    return val ? (val as keyof NatTableKeybindings) : null;
  });

  // Resolve the active keybindings configuration
  readonly keybindings = computed(() => {
    if (this.natTableService) {
      return this.natTableService.keybindings();
    }
    return mergeNatTableKeybindings({}, this.globalKeybindings);
  });

  // Get and format the shortcut string representation
  readonly shortcut = computed(() => {
    const key = this.actionKey();
    if (!key) {
      return '';
    }
    const bindings = this.keybindings();
    const value = bindings[key];
    return serializeShortcutValue(value);
  });

  // Track the original aria-label and inner text of the host element
  private readonly originalAriaLabel = signal<string | null>(null);
  private readonly originalInnerText = signal<string>('');

  // Compute the base label (aria-label has higher priority than innerText)
  readonly baseLabel = computed(() => {
    return this.originalAriaLabel() ?? this.originalInnerText();
  });

  constructor() {
    const nativeEl = this.el.nativeElement;

    // Track state to prevent recursive observer triggers
    let updatingAttributes = false;

    // Initialize base values
    const initialAriaLabel = nativeEl.getAttribute('aria-label');
    this.originalAriaLabel.set(initialAriaLabel);
    this.originalInnerText.set((nativeEl.textContent || nativeEl.innerText || '').trim());

    // Observe changes to attributes or content to stay in sync
    const observer = new MutationObserver((mutations) => {
      if (updatingAttributes) return;

      let textChanged = false;
      let ariaLabelChangedExternally = false;
      let externalAriaLabel: string | null = null;

      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-label') {
          const newAriaLabel = nativeEl.getAttribute('aria-label');
          const currentShortcut = this.shortcut();
          const suffix = currentShortcut ? ` (Shortcut: ${currentShortcut})` : '';
          
          if (!newAriaLabel) {
            ariaLabelChangedExternally = true;
            externalAriaLabel = null;
          } else if (!suffix || !newAriaLabel.endsWith(suffix)) {
            ariaLabelChangedExternally = true;
            externalAriaLabel = newAriaLabel;
          }
        } else if (mutation.type === 'childList' || mutation.type === 'characterData') {
          textChanged = true;
        }
      }

      if (ariaLabelChangedExternally) {
        this.originalAriaLabel.set(externalAriaLabel);
      }
      if (textChanged) {
        this.originalInnerText.set((nativeEl.textContent || nativeEl.innerText || '').trim());
      }
    });

    observer.observe(nativeEl, {
      attributes: true,
      attributeFilter: ['aria-label'],
      childList: true,
      characterData: true,
      subtree: true,
    });

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });

    // Effect to update ARIA attributes
    effect(() => {
      const currentShortcut = this.shortcut();
      const base = this.baseLabel();

      updatingAttributes = true;
      try {
        if (!currentShortcut) {
          this.renderer.removeAttribute(nativeEl, 'aria-keyshortcuts');
          const original = this.originalAriaLabel();
          if (original !== null) {
            if (original) {
              this.renderer.setAttribute(nativeEl, 'aria-label', original);
            } else {
              this.renderer.removeAttribute(nativeEl, 'aria-label');
            }
          } else {
            this.renderer.removeAttribute(nativeEl, 'aria-label');
          }
          return;
        }

        // 1. Update aria-keyshortcuts
        this.renderer.setAttribute(nativeEl, 'aria-keyshortcuts', currentShortcut);

        // 2. Update aria-label
        if (base) {
          this.renderer.setAttribute(
            nativeEl,
            'aria-label',
            `${base} (Shortcut: ${currentShortcut})`,
          );
        } else {
          this.renderer.removeAttribute(nativeEl, 'aria-label');
        }
      } finally {
        updatingAttributes = false;
      }
    });
  }
}
