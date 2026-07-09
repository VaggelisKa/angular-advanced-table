## Grid Navigation

The table uses an ARIA grid keyboard model. Users move between cells with arrow keys and can enter interactive cell content without losing the table navigation context.

## Interactive Cells

Press Enter on a focused grid cell to move focus into the first interactive control. Tab and Shift+Tab move through controls inside the grid, and Escape returns focus to the cell.

Cells whose entire content is one arrow-safe control can delegate directly to that control. Inputs, selects, comboboxes, and other arrow-consuming controls stay on the Enter-to-interact model.

## Column Shortcuts

Column reordering exposes keyboard paths when `[enableReordering]="true"` is set on the table surface and the column opts in with `meta: { reorderable: true }`; both are required for keyboard reordering. Resizing exposes keyboard paths for resizable columns. Keep visible instructions and configured shortcuts aligned with `aria-keyshortcuts` when you customize keybindings.

## Custom Keybindings

Use `[keybindings]` on the table surface for per-table overrides, or `NAT_TABLE_KEYBINDINGS` for app-wide defaults. The table warns in development when configured shortcuts conflict.

Use `NatTableHotkeyA11y` when custom controls need shortcut names in their accessible names and `aria-keyshortcuts`.
