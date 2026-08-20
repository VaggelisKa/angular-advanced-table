import { ToolbarWidget } from '@angular/aria/toolbar';
import { DestroyRef, Directive, afterNextRender, effect, inject, input, isDevMode } from '@angular/core';

import { NAT_TOOLBAR_ITEM } from '../../common/toolbar.const';
import type { NatToolbarItemPosition, NatToolbarItemRef } from '../../common/toolbar.type';
import {
  hasUnreachableShadowRoot,
  resolveNatToolbarFocusTarget,
  suppressNatToolbarFocusTargetTabStop
} from '../../utils/toolbar-focus-target.util';

/**
 * Marks an interactive element (a `<button>`, `<input>`, …) as a toolbar item,
 * so it joins the toolbar's roving keyboard focus (Left/Right, Home/End) and
 * matches screen-reader order.
 *
 * Plain action buttons need nothing more than the bare attribute:
 * ```html
 * <button natToolbarItem natToolbarItemPosition="start">Export</button>
 * ```
 *
 * For toggle or otherwise selectable items, give each one a unique `value` as a
 * stable identity — one string per item, unique within the toolbar:
 * ```html
 * <button natToolbarItem="bold">Bold</button>
 * <button natToolbarItem="italic">Italic</button>
 * ```
 *
 * `natToolbarItemPosition="start" | "center" | "end"` (default `start`) picks
 * the toolbar slot. It MUST be a static attribute — a binding
 * (`[natToolbarItemPosition]="expr"`) always lands in the start slot.
 *
 * When the item is a wrapper rather than the control itself — an Angular
 * component host, a Stencil custom element, any design-system button —
 * `natToolbarItemFocusTarget` nominates the descendant that should take focus:
 * ```html
 * <my-button natToolbarItem="filters" natToolbarItemFocusTarget="button">Filters</my-button>
 * ```
 *
 * Items only work inside a `<nat-table-toolbar>`.
 *
 * @example
 * ```html
 * <nat-table-toolbar>
 *   <button natToolbarItem natToolbarItemPosition="start">Export</button>
 *   <input natToolbarItem type="search" aria-label="Filter" />
 * </nat-table-toolbar>
 * ```
 */
@Directive({
  selector: '[natToolbarItem]',
  providers: [{ provide: NAT_TOOLBAR_ITEM, useExisting: NatToolbarItem }],
  // Aria's `value` is required; aliasing it to the always-present
  // selector attribute lets a bare `natToolbarItem` satisfy it with `''`. Bare
  // items then share value `''` (non-unique) — harmless while selection is
  // disabled; pass a string per item if Aria selection is ever re-enabled.
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['value: natToolbarItem', 'disabled', 'id'] }],
  host: {
    '(focus)': 'redirectFocusToTarget($event)'
  }
})
export class NatToolbarItem implements NatToolbarItemRef {
  public readonly natToolbarItemPosition = input<NatToolbarItemPosition>('start');

  /**
   * CSS selector for the descendant that should receive focus instead of this
   * host — for items that wrap their real control rather than being it.
   *
   * An open shadow root is searched before light DOM, so a custom element
   * resolves without the consumer knowing where its boundary is. The resolved
   * element is pulled out of the sequential tab order (`tabindex="-1"`) so the
   * toolbar keeps exactly one Tab stop.
   *
   * Registration and hit-testing deliberately stay on the host: Aria resolves
   * events with `item.element().contains(target)`, and shadow-DOM events
   * retarget to the host — so repointing the widget element itself would break
   * click, focusin and keydown routing.
   */
  public readonly natToolbarItemFocusTarget = input<string | undefined>(undefined);

  private readonly widget = inject(ToolbarWidget, { self: true });
  private readonly destroyRef = inject(DestroyRef);

  /** Re-applies the tab-stop suppression when the wrapper re-renders its control away. */
  private observer: MutationObserver | null = null;

  /** Root the observer is attached to — a shadow root may appear after the first pass. */
  private observedRoot: Node | null = null;

  /** One warning per item — a mis-typed selector should not spam every focus. */
  private hasWarnedUnresolved = false;

  /** Guards against queueing a `whenDefined` continuation on every observer tick. */
  private isAwaitingUpgrade = false;

  private isDestroyed = false;

  public constructor() {
    afterNextRender(() => this.syncFocusTarget());

    // A changed selector invalidates whatever was suppressed before.
    effect(() => {
      this.natToolbarItemFocusTarget();
      this.hasWarnedUnresolved = false;
      this.syncFocusTarget();
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      this.observer?.disconnect();
    });
  }

  public get id(): string {
    return this.widget.id();
  }

  /**
   * Host element — the widget's identity for Aria registration and hit-testing,
   * never the nominated focus target. See `natToolbarItemFocusTarget`.
   */
  public get element(): HTMLElement {
    return this.widget.element;
  }

  public readonly position = this.natToolbarItemPosition;

  public focus(): void {
    (this.resolveFocusTarget() ?? this.element).focus();
  }

  /**
   * Forwards focus from the wrapper host to the nominated control.
   *
   * `focus` does not bubble, so this fires only when the host itself is
   * focused — no redirect loop when the target below it takes over. It covers
   * every path Aria uses, since all of them end in `element.focus()`.
   */
  protected redirectFocusToTarget(event: FocusEvent): void {
    if (event.target !== this.element) return;

    const target = this.resolveFocusTarget();

    if (!target || target === this.element) return;

    // Shift+Tab out of the control lands on the host, because the host carries
    // the roving tabindex and precedes the control in sequential order.
    // Redirecting there would throw focus straight back in and trap the user —
    // the exact failure this input exists to prevent, in reverse. `relatedTarget`
    // on `focus` is the element being left, so an arrival *from* the target is
    // a backward exit and must be allowed through.
    if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;

    suppressNatToolbarFocusTargetTabStop(target);
    target.focus();
  }

  /** Resolves the nominated target, warning once in dev mode when it cannot be found. */
  private resolveFocusTarget(): HTMLElement | null {
    const selector = this.natToolbarItemFocusTarget();

    if (!selector) return null;

    const host = this.element;
    const target = resolveNatToolbarFocusTarget(host, selector);

    if (!target && isDevMode() && !this.hasWarnedUnresolved) {
      this.hasWarnedUnresolved = true;

      const reason = hasUnreachableShadowRoot(host)
        ? `<${host.tagName.toLowerCase()}> renders into a closed shadow root, which cannot be reached. ` +
          'Author the element with an open shadow root (Stencil: `shadow: true`, or `delegatesFocus: true`).'
        : `no descendant of <${host.tagName.toLowerCase()}> matches it.`;

      console.warn(`[ng-advanced-table/components] natToolbarItemFocusTarget="${selector}": ${reason}`);
    }

    return target;
  }

  /**
   * Applies tab-stop suppression to the currently resolved target, and keeps
   * the re-render watch pointed at the right root.
   *
   * Suppression has to land before the user first reaches the toolbar — an
   * un-suppressed inner control is a second Tab stop, which is exactly the
   * failure this input exists to remove — so it cannot wait for first focus.
   */
  private syncFocusTarget(): void {
    if (this.isDestroyed || !this.natToolbarItemFocusTarget()) return;

    this.observeFocusTarget();
    this.awaitCustomElementUpgrade();

    const target = this.resolveFocusTarget();

    if (target && target !== this.element) {
      suppressNatToolbarFocusTargetTabStop(target);
    }
  }

  /**
   * Watches the wrapper for re-renders. A component that rebuilds its control
   * drops the `tabindex="-1"` we set, which would silently restore the second
   * Tab stop. Re-attaches when a shadow root appears after the first pass.
   *
   * Only `childList` is observed, so writing the attribute back cannot feed
   * the observer its own mutation.
   */
  private observeFocusTarget(): void {
    const mutationObserverCtor = globalThis.MutationObserver;

    if (typeof mutationObserverCtor === 'undefined') return;

    const host = this.element;
    const root = host.shadowRoot ?? host;

    if (this.observedRoot === root) return;

    this.observer?.disconnect();
    this.observer = new mutationObserverCtor(() => this.syncFocusTarget());
    this.observer.observe(root, { childList: true, subtree: true });
    this.observedRoot = root;
  }

  /**
   * Re-syncs once a not-yet-upgraded custom element defines itself. Until then
   * it has neither a shadow root nor rendered children, so nothing to resolve.
   */
  private awaitCustomElementUpgrade(): void {
    const host = this.element;
    const tagName = host.tagName.toLowerCase();
    const registry = globalThis.customElements;

    // `typeof` rather than a falsy check: the DOM lib types the registry as
    // always present, but it is absent on the server.
    if (typeof registry === 'undefined') return;

    if (this.isAwaitingUpgrade || !tagName.includes('-') || registry.get(tagName)) return;

    this.isAwaitingUpgrade = true;

    void registry.whenDefined(tagName).then(() => {
      this.isAwaitingUpgrade = false;
      this.syncFocusTarget();
    });
  }
}
