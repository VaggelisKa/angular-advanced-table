## Toolbar Shell

Use `<nat-table-toolbar>` for generic command rows near a table. Projected controls that participate in toolbar keyboard navigation must use `natToolbarItem` or `NatToolbarGroup`.

Keep DOM order aligned with screen-reader and roving-keyboard order. Visual placement should not make keyboard navigation surprising.

## Table Actions

A Table Action is a user-triggered operation that acts on table rows or table presentation state. Toolbar placement is optional; the behavior is not defined by where the control is rendered.

## Wrapper Controls

`natToolbarItem` puts the roving tabindex on the element it sits on, and that element is what receives focus. When the item is a wrapper that renders its real control inside itself — a design-system component, a Stencil custom element — focus would land on a non-interactive shell while the inner control stayed in the tab order as a second stop.

Use `natToolbarItemFocusTarget` to nominate the control:

```html
<nat-table-toolbar accessibleName="Table actions">
  <my-button natToolbarItem="archive" natToolbarItemFocusTarget="button">Archive</my-button>
</nat-table-toolbar>
```

The selector searches an open shadow root before light DOM, so the same selector works whether the wrapper renders into shadow or light DOM. The resolved control is taken out of the sequential tab order, keeping the toolbar to a single Tab stop, and is re-suppressed when the wrapper re-renders. A control behind a **closed** shadow root cannot be reached — the component must be authored with an open root (Stencil: `shadow: true`, or `delegatesFocus: true`).

Registration and hit-testing stay on the wrapper, so click, focus and keyboard routing continue to resolve the item normally.

## Keyboard Order

Toolbar items use roving focus. Put controls in the order users should encounter them, then use toolbar positions for visual grouping. Do not place standalone composite controls inside the toolbar unless their individual interactive elements register correctly.

## Text Inputs In The Toolbar

A text field such as a search box keeps Left/Right for moving its own caret through the text. Once the caret reaches the edge of the value, pressing the same arrow again advances roving focus to the adjacent toolbar item, so the field is not a dead-end for arrow navigation. Tab still leaves the field and the toolbar entirely (Shift+Tab steps back out the other side). Multi-value inputs such as number or date pickers keep all their arrow keys, so use Tab to leave those.

## Common Uses

Good toolbar content includes refresh buttons, export buttons, column visibility controls, pagination controls, and app-owned bulk actions. Product-specific search and domain filters can sit in or near the toolbar when they fit the workflow.
