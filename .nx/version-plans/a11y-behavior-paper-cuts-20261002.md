---
ng-advanced-table: patch
---

Fix several accessibility paper cuts. When the pager's previous or next button disables itself on the first or last page, focus now moves to the other pager button instead of falling to the page body. Repeating the same live announcement, such as a keyboard resize that stays at the minimum width, is now read again: the table clears the live region and writes the message back after a short pause. The `natHotkeyA11y` shortcut suffix now comes from the new `accessibilityText.shortcutLabel` formatter, with Danish, Swedish, Finnish, and Norwegian copy; English output is unchanged. The row-selection docs now explain that select-all covers every filtered row across pages, and show how to turn `rowSelection` ids back into row objects.
