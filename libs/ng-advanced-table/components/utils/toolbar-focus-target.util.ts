/**
 * Resolution helpers for a toolbar item's focus target — the descendant that
 * should actually receive focus, either nominated through
 * `natToolbarItemFocusTarget` or resolved implicitly for a wrapper host.
 *
 * `@angular/aria` focuses a toolbar widget by calling `element.focus()` on the
 * element carrying the directive, so a wrapper component (an Angular component
 * host, a Stencil custom element, any design-system control) would otherwise
 * take focus on a non-interactive shell while the real control sits inside it.
 */

/**
 * Finds the nominated focus target beneath `host`.
 *
 * An **open** shadow root is searched first, so a custom element that renders
 * its control into shadow DOM resolves without the consumer knowing where the
 * boundary is; light DOM is the fallback. A closed shadow root is unreachable
 * by construction and yields `null`.
 */
export const resolveNatToolbarFocusTarget = (host: HTMLElement, selector: string): HTMLElement | null => {
  const trimmed = selector.trim();

  if (!trimmed) return null;

  // `querySelector` throws on a malformed selector; a bad selector is a
  // consumer typo, not a reason to tear down the whole toolbar.
  try {
    return host.shadowRoot?.querySelector<HTMLElement>(trimmed) ?? host.querySelector<HTMLElement>(trimmed);
  } catch {
    return null;
  }
};

/**
 * Elements that take focus on their own. A `natToolbarItem` sitting on one of
 * these *is* the control, so nothing inside it is ever nominated implicitly.
 */
const NAT_TOOLBAR_INTRINSIC_CONTROL_SELECTOR =
  'button, input, select, textarea, a[href], area[href], summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"])';

/**
 * Candidates for the implicit focus target, in DOM order. `[tabindex]` is kept
 * regardless of value because the resolved control is itself pulled to
 * `tabindex="-1"` and must still be found again on the next pass.
 */
const NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR =
  'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), ' +
  'a[href], area[href], summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

/** True when `host` is itself an interactive element rather than a wrapper around one. */
export const isNatToolbarIntrinsicControl = (host: HTMLElement): boolean => host.matches(NAT_TOOLBAR_INTRINSIC_CONTROL_SELECTOR);

/**
 * Finds the control a wrapper host should forward focus to when the consumer
 * nominated none — the first focusable descendant, searching an **open**
 * shadow root before light DOM exactly like {@link resolveNatToolbarFocusTarget}.
 *
 * An intrinsic control resolves to `null`: it is the target already. A host
 * whose only focusable descendant is a nested wrapper's own shell is left
 * alone as well — a `[tabindex]` hit is only trusted when it is not the
 * host's own roving attribute.
 */
export const resolveNatToolbarImplicitFocusTarget = (host: HTMLElement): HTMLElement | null => {
  if (isNatToolbarIntrinsicControl(host)) return null;

  return (
    host.shadowRoot?.querySelector<HTMLElement>(NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR) ??
    host.querySelector<HTMLElement>(NAT_TOOLBAR_FOCUSABLE_DESCENDANT_SELECTOR)
  );
};

/**
 * True when `host` hides its content behind a closed shadow root — the one
 * case `resolveNatToolbarFocusTarget` can never satisfy, and worth telling the
 * consumer apart from a plain selector typo.
 *
 * A closed root is not exposed on the element at all, so it is detected by
 * elimination: a defined custom element with no reachable `shadowRoot` and no
 * light-DOM children of its own.
 */
export const hasUnreachableShadowRoot = (host: HTMLElement): boolean => {
  if (host.shadowRoot) return false;

  if (!host.tagName.includes('-')) return false;

  const registry = globalThis.customElements;

  // `typeof` rather than a falsy check: the DOM lib types the registry as
  // always present, but it is absent on the server.
  if (typeof registry === 'undefined') return false;

  return registry.get(host.tagName.toLowerCase()) !== undefined && host.childElementCount === 0;
};

/**
 * Keeps the nominated target out of the sequential tab order.
 *
 * Without this the wrapper host (carrying the toolbar's roving `tabindex`) and
 * the inner control would both be tab stops, so Tab would land inside the
 * toolbar twice instead of moving past it — defeating the single-tab-stop
 * contract the toolbar pattern exists to provide.
 */
export const suppressNatToolbarFocusTargetTabStop = (target: HTMLElement): void => {
  if (target.getAttribute('tabindex') === '-1') return;

  target.setAttribute('tabindex', '-1');
};

/**
 * Undoes {@link suppressNatToolbarFocusTargetTabStop} when an element stops
 * being the nominated target (selector changed, cleared, or re-resolved to a
 * different control), so the former control returns to the sequential tab
 * order it had before suppression.
 *
 * `previousTabIndex` is the `tabindex` attribute value the element carried
 * before suppression (`null` when it carried none). A current value other than
 * `-1` means another owner has taken over the attribute since, and is left
 * untouched.
 */
export const restoreNatToolbarFocusTargetTabStop = (target: HTMLElement, previousTabIndex: string | null): void => {
  if (target.getAttribute('tabindex') !== '-1') return;

  if (previousTabIndex === null) {
    target.removeAttribute('tabindex');
  } else {
    target.setAttribute('tabindex', previousTabIndex);
  }
};
