import { DestroyRef, Directive, ElementRef, Renderer2, computed, effect, inject, input, signal } from '@angular/core';

import { NAT_TABLE_KEYBINDINGS, mergeNatTableKeybindings, serializeShortcutValue } from './keybindings';
import { NatTableService } from './table.service';
import type { NatTableKeybindings } from './table.types';

const readTrimmedText = (nativeEl: HTMLElement): string => (nativeEl.textContent || nativeEl.innerText || '').trim();

/**
 * Directive to manage keyboard shortcut screen reader readouts and ARIA attributes.
 * Updates `aria-keyshortcuts` and appends shortcut descriptions to `aria-label`
 * without losing the element's base text.
 */
@Directive({
  selector: '[natHotkeyA11y], [natTableHotkeyA11y], [appHotkeyA11y]'
})
export class NatTableHotkeyA11y {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly natTableService = inject(NatTableService, { optional: true });
  private readonly globalKeybindings = inject(NAT_TABLE_KEYBINDINGS, { optional: true }) ?? {};

  // Support multiple selector aliases as inputs
  public readonly natHotkeyA11y = input<keyof NatTableKeybindings | ''>('');
  public readonly natTableHotkeyA11y = input<keyof NatTableKeybindings | ''>('');
  public readonly appHotkeyA11y = input<keyof NatTableKeybindings | ''>('');

  // Resolve the active action key
  private readonly actionKey = computed<keyof NatTableKeybindings | null>(() => {
    const val = this.natHotkeyA11y() || this.natTableHotkeyA11y() || this.appHotkeyA11y();

    return val ? (val as keyof NatTableKeybindings) : null;
  });

  // Resolve the active keybindings configuration
  private readonly keybindings = computed(() => {
    if (this.natTableService) {
      return this.natTableService.keybindings();
    }

    return mergeNatTableKeybindings({}, this.globalKeybindings);
  });

  // Get and format the shortcut string representation
  private readonly shortcut = computed(() => {
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
  private readonly baseLabel = computed(() => {
    return this.originalAriaLabel() ?? this.originalInnerText();
  });

  // Guards against the directive's own attribute writes re-triggering the observer.
  private updatingAttributes = false;

  public constructor() {
    const nativeEl = this.el.nativeElement;

    // Initialize base values
    this.originalAriaLabel.set(nativeEl.getAttribute('aria-label'));
    this.originalInnerText.set(readTrimmedText(nativeEl));

    // Observe changes to attributes or content to stay in sync
    const observer = new MutationObserver((mutations) => this.syncFromMutations(nativeEl, mutations));

    observer.observe(nativeEl, {
      attributes: true,
      attributeFilter: ['aria-label'],
      childList: true,
      characterData: true,
      subtree: true
    });

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });

    // Effect to update ARIA attributes
    effect(() => {
      const currentShortcut = this.shortcut();
      const base = this.baseLabel();

      this.updatingAttributes = true;

      try {
        this.writeAriaAttributes(nativeEl, currentShortcut, base);
      } finally {
        this.updatingAttributes = false;
      }
    });
  }

  /** Re-reads aria-label / text into the original-* signals when changed from outside this directive. */
  private syncFromMutations(nativeEl: HTMLElement, mutations: MutationRecord[]): void {
    if (this.updatingAttributes) return;

    const isAriaLabel = (mutation: MutationRecord): boolean =>
      mutation.type === 'attributes' && mutation.attributeName === 'aria-label';
    const isTextMutation = (mutation: MutationRecord): boolean => mutation.type === 'childList' || mutation.type === 'characterData';

    if (mutations.some(isAriaLabel)) {
      this.syncExternalAriaLabel(nativeEl);
    }

    if (mutations.some(isTextMutation)) {
      this.originalInnerText.set(readTrimmedText(nativeEl));
    }
  }

  /** Captures an aria-label edit made outside this directive (one not carrying our shortcut suffix). */
  private syncExternalAriaLabel(nativeEl: HTMLElement): void {
    const newAriaLabel = nativeEl.getAttribute('aria-label');

    if (!newAriaLabel) {
      this.originalAriaLabel.set(null);

      return;
    }

    const currentShortcut = this.shortcut();
    const suffix = currentShortcut ? ` (Shortcut: ${currentShortcut})` : '';

    if (!suffix || !newAriaLabel.endsWith(suffix)) {
      this.originalAriaLabel.set(newAriaLabel);
    }
  }

  /** Writes aria-keyshortcuts and the shortcut-suffixed aria-label, or restores the originals when no shortcut applies. */
  private writeAriaAttributes(nativeEl: HTMLElement, currentShortcut: string, base: string): void {
    if (!currentShortcut) {
      this.renderer.removeAttribute(nativeEl, 'aria-keyshortcuts');
      const original = this.originalAriaLabel();

      if (original) {
        this.renderer.setAttribute(nativeEl, 'aria-label', original);
      } else {
        this.renderer.removeAttribute(nativeEl, 'aria-label');
      }

      return;
    }

    this.renderer.setAttribute(nativeEl, 'aria-keyshortcuts', currentShortcut);

    if (base) {
      this.renderer.setAttribute(nativeEl, 'aria-label', `${base} (Shortcut: ${currentShortcut})`);
    } else {
      this.renderer.removeAttribute(nativeEl, 'aria-label');
    }
  }
}
