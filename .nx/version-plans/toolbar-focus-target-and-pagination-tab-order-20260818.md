---
ng-advanced-table: minor
---

Add `natToolbarItemFocusTarget` and make `NatTablePagination` a plain control row instead of a toolbar.

`natToolbarItemFocusTarget` takes a CSS selector naming the descendant that should receive focus when a toolbar item is a wrapper rather than the control itself — an Angular component host, a Stencil custom element, any design-system button. `@angular/aria` focuses a toolbar widget by calling `element.focus()` on the element carrying the directive, so without this focus landed on a non-interactive shell while the inner control stayed in the tab order as a second stop.

The selector searches an open shadow root before light DOM, so a web component resolves without the consumer knowing where its boundary is. The resolved element is pulled out of the sequential tab order and re-suppressed through a `MutationObserver` when the wrapper re-renders, and a not-yet-upgraded custom element is retried on `customElements.whenDefined`. Registration and hit-testing deliberately stay on the host, because Aria resolves events with `item.element().contains(target)` and shadow-DOM events retarget to the host. A closed shadow root cannot be reached and warns in dev mode.

`NatTablePagination` no longer renders its own `<nat-table-toolbar>`. It now renders the page-size select and the pager as two labelled `role="group"` blocks, matching the existing `NatTablePageSize` and `NatTablePager` components:

- All three controls are ordinary tab stops. Previously the toolbar's roving tabindex collapsed them into one, so Tab reached the page-size select and skipped Previous/Next entirely — reachable only by arrow keys, which nothing advertised.
- Projecting the component into a consumer `<nat-table-toolbar>` produced `role="toolbar"` nested inside `role="toolbar"`. Compose pagination beside a toolbar, not inside it.
- `[disabled]` on the pager buttons is now the native property rather than the Aria soft-disable, so a disabled Previous is skipped by Tab instead of being focusable with `aria-disabled`.
