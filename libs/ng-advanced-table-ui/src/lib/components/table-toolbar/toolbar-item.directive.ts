import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  isDevMode,
  numberAttribute,
  signal,
  type TemplateRef,
} from '@angular/core';

import { createIdGenerator } from '../../shared/create-id-generator';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type {
  NatToolbarItemPosition,
  NatToolbarItemPositionInput,
  NatToolbarItemRef,
  NatToolbarOverflowMode,
  NatToolbarOverflowSpec,
} from './common/toolbar-tokens.type';
import { isNatToolbarButtonLikeElement } from './utils/toolbar-item.util';

const nextNatToolbarItemId = createIdGenerator('nat-toolbar-item');

/**
 * Position attribute AND registration directive for toolbar items.
 *
 * `natToolbarItem` / `natToolbarItem=""` / `natToolbarItem="end"` -> end group;
 * `natToolbarItem="start"` -> start group. Re-bindable at runtime.
 *
 * Built-ins apply it via
 * `hostDirectives: [{ directive: NatToolbarItem, inputs: ['natToolbarItem'] }]`
 * and grab the ref with `inject(NAT_TOOLBAR_ITEM, { self: true })`.
 */
@Directive({
  selector: '[natToolbarItem]:not(nat-toolbar-search):not(nat-toolbar-sort):not(nat-toolbar-view):not(nat-toolbar-actions)',
  providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
  host: {
    class: 'nat-toolbar-item',
    '[class.nat-toolbar-item-hidden]': 'hidden()',
    '[style.display]': "hidden() ? 'none' : null",
    '[style.order]': 'flexOrder()',
    '[attr.tabindex]': 'tabIndexAttr()',
    '(focusin)': 'onFocusIn()',
  },
})
export class NatToolbarItem implements NatToolbarItemRef {
  readonly natToolbarItem = input<NatToolbarItemPositionInput>('');
  readonly natToolbarOverflow = input<NatToolbarOverflowMode>('auto');
  readonly natToolbarOverflowPriority = input(0, { transform: numberAttribute });
  readonly natToolbarOverflowLabel = input<string | undefined>(undefined);
  readonly natToolbarOverflowTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toolbar = inject(NAT_TABLE_TOOLBAR, { optional: true });
  private readonly overflowSpecSignal = signal<NatToolbarOverflowSpec | null>(null);
  private readonly focusTargetSignal = signal<HTMLElement | null>(null);
  private hasWarnedNonCollapsible = false;
  private hasWarnedEmptyOverflowLabel = false;

  readonly id = nextNatToolbarItemId();
  readonly overflowSpec = this.overflowSpecSignal.asReadonly();

  /**
   * Effective collapse priority: spec.priority when set, otherwise
   * natToolbarOverflowPriority input. Lower collapses first.
   */
  readonly effectivePriority = computed(
    () => this.overflowSpecSignal()?.priority ?? this.natToolbarOverflowPriority(),
  );

  get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  readonly position = computed<NatToolbarItemPosition>(() =>
    this.natToolbarItem() === 'start' ? 'start' : 'end',
  );

  readonly hidden = computed(() => this.toolbar?.hiddenIds().has(this.id) ?? false);

  readonly tabIndex = computed<0 | -1>(() =>
    this.toolbar === null || this.toolbar.activeItemId() === this.id ? 0 : -1,
  );

  readonly effectiveOverflowMode = computed<NatToolbarOverflowMode>(() => {
    const specMode = this.overflowSpecSignal()?.mode;

    if (specMode !== undefined) {
      return specMode;
    }

    const requested = this.natToolbarOverflow();

    if (requested !== 'auto') {
      return requested;
    }

    const hasMirrorMetadata =
      this.natToolbarOverflowLabel() !== undefined ||
      this.natToolbarOverflowTemplate() !== undefined ||
      this.overflowSpecSignal() !== null;

    if (hasMirrorMetadata || isNatToolbarButtonLikeElement(this.element)) {
      return 'auto';
    }

    if (isDevMode() && !this.hasWarnedNonCollapsible) {
      this.hasWarnedNonCollapsible = true;
      console.warn(
        `[ng-advanced-table-ui] natToolbarItem (${this.id}): non-button host without overflow ` +
          `metadata stays visible ('never'). Provide natToolbarOverflowLabel, ` +
          `natToolbarOverflowTemplate, or setOverflowSpec(...) to make it collapsible.`,
      );
    }

    return 'never';
  });

  /** start items 0, spacer ::before is 1, end items 2, More button 3. */
  protected readonly flexOrder = computed(() => (this.position() === 'start' ? 0 : 2));

  protected readonly tabIndexAttr = computed<number | null>(() => {
    if (this.toolbar === null || this.hidden() || this.focusTargetSignal() !== null) {
      return null;
    }

    return this.tabIndex();
  });

  setOverflowSpec(spec: NatToolbarOverflowSpec): void {
    this.overflowSpecSignal.set(spec);
  }

  setFocusTarget(target: HTMLElement | null): void {
    this.focusTargetSignal.set(target);
  }

  focusTarget(): HTMLElement {
    return this.focusTargetSignal() ?? this.element;
  }

  focus(): void {
    this.focusTarget().focus();
  }

  notifyOverflowChange(hidden: boolean): void {
    this.overflowSpecSignal()?.onOverflowChange?.(hidden);
  }

  resolveOverflowLabel(): string {
    const candidates = [
      this.natToolbarOverflowLabel(),
      this.overflowSpecSignal()?.label?.(),
      this.element.getAttribute('aria-label'),
      this.element.textContent,
    ];

    for (const candidate of candidates) {
      const normalized = candidate?.trim() ?? '';

      if (normalized) {
        return normalized;
      }
    }

    if (
      isDevMode() &&
      !this.hasWarnedEmptyOverflowLabel &&
      this.effectiveOverflowMode() !== 'never'
    ) {
      this.hasWarnedEmptyOverflowLabel = true;
      console.warn(
        `[ng-advanced-table-ui] natToolbarItem (${this.id}): collapsible item has ` +
          `no resolvable overflow label (natToolbarOverflowLabel, spec label, ` +
          `aria-label, and text content are all empty). The More menu demotes ` +
          `it to 'never' so it stays visible; provide a label to make it collapsible.`,
      );
    }

    return '';
  }

  protected onFocusIn(): void {
    // When a custom focus target is active the hosting component manages the
    // roving tab stop directly — suppress registration from the host element.
    if (this.focusTargetSignal() !== null) {
      return;
    }

    this.toolbar?.registerFocus(this.id);
  }
}
