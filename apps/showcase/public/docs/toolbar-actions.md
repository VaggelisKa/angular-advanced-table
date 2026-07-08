## Toolbar Shell

Use `<nat-table-toolbar>` for generic command rows near a table. Projected controls that participate in toolbar keyboard navigation must use `natToolbarItem` or `NatToolbarGroup`.

Keep DOM order aligned with screen-reader and roving-keyboard order. Visual placement should not make keyboard navigation surprising.

## Table Actions

A Table Action is a user-triggered operation that acts on table rows or table presentation state. Toolbar placement is optional; the behavior is not defined by where the control is rendered.

## Keyboard Order

Toolbar items use roving focus. Put controls in the order users should encounter them, then use toolbar positions for visual grouping. Do not place standalone composite controls inside the toolbar unless their individual interactive elements register correctly.

## Text Inputs In The Toolbar

A text field such as a search box keeps Left/Right for its own caret, so arrow keys do not advance roving focus off it. Press Tab to leave the field and the toolbar (Shift+Tab to step back out the other side). This matches the WAI-ARIA toolbar pattern for editable items: the input is a deliberate stop for arrow navigation, not a keyboard trap, because Tab always exits.

## Common Uses

Good toolbar content includes refresh buttons, export buttons, column visibility controls, pagination controls, and app-owned bulk actions. Product-specific search and domain filters can sit in or near the toolbar when they fit the workflow.
