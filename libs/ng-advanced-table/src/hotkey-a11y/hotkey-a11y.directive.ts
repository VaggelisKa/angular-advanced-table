import {
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  afterEveryRender,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';

import { NAT_EN_LOCALE_ID, NAT_TABLE_INTL, mergeNatTableAccessibilityText, resolveNatTableIntl } from 'ng-advanced-table/locale';
import type { NatTableAccessibilityText } from 'ng-advanced-table/locale';

import { NAT_TABLE_KEYBINDINGS } from './common/keybindings.const';
import type { NatTableKeybindings } from './common/keybindings.type';
import { mergeNatTableKeybindings, serializeShortcutValue } from './utils/keybindings.util';
import { NatTableService } from '../domain-logic/table.service';

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
  private readonly tableIntlConfig = inject(NAT_TABLE_INTL);

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

    if (!key) return '';

    const bindings = this.keybindings();
    const value = bindings[key];

    return serializeShortcutValue(value);
  });

  // Resolve the shortcut label formatter the same way the table resolves its
  // accessibility copy: the active locale dictionary, then the table's own
  // `accessibilityText` overrides. Outside a table there is no locale, so the
  // English dictionary applies.
  private readonly formatShortcutLabel = computed(() => {
    const localeId = this.natTableService?.locale() ?? NAT_EN_LOCALE_ID;

    return mergeNatTableAccessibilityText(
      resolveNatTableIntl(this.tableIntlConfig, localeId).accessibilityText,
      this.natTableService?.accessibilityText()
    ).shortcutLabel;
  });

  // The last aria-label this directive wrote, so the observer can tell its own
  // writes from a consumer's edit whatever the locale's label shape.
  private lastWrittenAriaLabel: string | null = null;

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

    // Observe changes to attributes or content to stay in sync when a DOM observer exists.
    const observer = this.createMutationObserver(nativeEl);

    if (!observer) {
      afterEveryRender(() => {
        this.syncExternalAriaLabel(nativeEl);
        this.originalInnerText.set(readTrimmedText(nativeEl));
      });
    }

    this.destroyRef.onDestroy(() => observer?.disconnect());

    // Effect to update ARIA attributes
    effect(() => {
      const currentShortcut = this.shortcut();
      const base = this.baseLabel();
      const formatShortcutLabel = this.formatShortcutLabel();

      this.updatingAttributes = true;

      try {
        this.writeAriaAttributes(nativeEl, currentShortcut, base, formatShortcutLabel);
      } finally {
        this.updatingAttributes = false;
      }
    });
  }

  private createMutationObserver(nativeEl: HTMLElement): MutationObserver | null {
    const mutationObserverCtor = globalThis.MutationObserver;

    if (typeof mutationObserverCtor === 'undefined') return null;

    const observer = new mutationObserverCtor((mutations) => this.syncFromMutations(nativeEl, mutations));

    observer.observe(nativeEl, {
      attributes: true,
      attributeFilter: ['aria-label'],
      childList: true,
      characterData: true,
      subtree: true
    });

    return observer;
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

  /** Captures an aria-label edit made outside this directive (one it did not write itself). */
  private syncExternalAriaLabel(nativeEl: HTMLElement): void {
    const newAriaLabel = nativeEl.getAttribute('aria-label');

    if (!newAriaLabel) {
      this.originalAriaLabel.set(null);

      return;
    }

    if (!this.shortcut() || newAriaLabel !== this.lastWrittenAriaLabel) {
      this.originalAriaLabel.set(newAriaLabel);
    }
  }

  /** Writes aria-keyshortcuts and the shortcut-suffixed aria-label, or restores the originals when no shortcut applies. */
  private writeAriaAttributes(
    nativeEl: HTMLElement,
    currentShortcut: string,
    base: string,
    formatShortcutLabel: NatTableAccessibilityText['shortcutLabel']
  ): void {
    if (!currentShortcut) {
      this.renderer.removeAttribute(nativeEl, 'aria-keyshortcuts');
      this.writeAriaLabel(nativeEl, this.originalAriaLabel());

      return;
    }

    this.renderer.setAttribute(nativeEl, 'aria-keyshortcuts', currentShortcut);
    this.writeAriaLabel(nativeEl, base ? (formatShortcutLabel?.({ label: base, shortcutText: currentShortcut }) ?? base) : null);
  }

  private writeAriaLabel(nativeEl: HTMLElement, label: string | null): void {
    if (label) {
      this.lastWrittenAriaLabel = label;
      this.renderer.setAttribute(nativeEl, 'aria-label', label);
    } else {
      this.lastWrittenAriaLabel = null;
      this.renderer.removeAttribute(nativeEl, 'aria-label');
    }
  }
}
