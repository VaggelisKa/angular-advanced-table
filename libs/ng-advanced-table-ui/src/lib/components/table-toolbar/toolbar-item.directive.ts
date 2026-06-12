import { Directive, ElementRef, computed, inject, input, signal } from '@angular/core';

import { createIdGenerator } from '../../shared/create-id-generator';
import { NAT_TABLE_TOOLBAR, NAT_TOOLBAR_ITEM } from './common/toolbar-tokens.const';
import type {
  NatToolbarItemPosition,
  NatToolbarItemPositionInput,
  NatToolbarItemRef,
  NatToolbarTabIndex,
} from './common/toolbar-tokens.type';

const nextNatToolbarItemId = createIdGenerator('nat-toolbar-item');

/**
 * Position attribute AND registration directive for toolbar items.
 *
 * `natToolbarItem` / `natToolbarItem=""` / `natToolbarItem="end"` -> end group;
 * `natToolbarItem="start"` -> start group; `natToolbarItem="center"` -> center
 * group. Re-bindable at runtime — the toolbar physically reorders the host
 * element so DOM (and screen-reader) order always matches visual order.
 */
@Directive({
  selector: '[natToolbarItem]',
  providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
  host: {
    class: 'nat-toolbar-item',
    '[attr.tabindex]': 'tabIndexAttr()',
    '(focusin)': 'onFocusIn()',
  },
})
export class NatToolbarItem implements NatToolbarItemRef {
  public readonly natToolbarItem = input<NatToolbarItemPositionInput>('');

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toolbar = inject(NAT_TABLE_TOOLBAR, { optional: true });
  private readonly focusTargetSignal = signal<HTMLElement | null>(null);

  public readonly id = nextNatToolbarItemId();

  public get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  public readonly position = computed<NatToolbarItemPosition>(() => {
    const raw = this.natToolbarItem();

    return raw === 'start' || raw === 'center' ? raw : 'end';
  });

  public readonly tabIndex = computed<NatToolbarTabIndex>(() =>
    this.toolbar === null || this.toolbar.activeItemId() === this.id ? 0 : -1,
  );

  protected readonly tabIndexAttr = computed<number | null>(() => {
    const hasCustomFocusTarget = this.focusTargetSignal() !== null;

    if (this.toolbar === null || hasCustomFocusTarget) return null;

    return this.tabIndex();
  });

  public setFocusTarget(target: HTMLElement | null): void {
    this.focusTargetSignal.set(target);
  }

  public focusTarget(): HTMLElement {
    return this.focusTargetSignal() ?? this.element;
  }

  public focus(): void {
    this.focusTarget().focus();
  }

  protected onFocusIn(): void {
    // When a custom focus target is active the hosting component manages the
    // roving tab stop directly — suppress registration from the host element.
    if (this.focusTargetSignal() !== null) return;

    this.toolbar?.registerFocus(this.id);
  }
}
