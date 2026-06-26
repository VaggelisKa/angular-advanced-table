---
ng-advanced-table: minor
---

Add Alt+Arrow keyboard resizing from a focused column header. When a resizable column's header is focused, Alt+Left / Alt+Right resize that column by one step — RTL-aware, fit/min/max clamped, and announced live — without tabbing to the separate resize handle, mirroring the separator's arrow behavior. Alt+Shift+Arrow still reorders the column. A shared resize-step routine now backs both the separator handle and the header shortcut. The English `resizeKeyboardInstructions` copy documents the new header shortcut.
