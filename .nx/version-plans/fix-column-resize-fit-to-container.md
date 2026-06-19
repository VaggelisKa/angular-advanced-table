---
ng-advanced-table: minor
---

Constrain column resizing in `fill` mode to "fit": a pointer, touch, or keyboard resize can grow a column only into the space the other columns leave, so a filled table never becomes wider than its visible region. A column stops growing once the table is full (to widen one, shrink another), it never reaches a `maxSize` larger than the remaining space, and an already-overflowing table can still be shrunk. The fit limit drives the drag guide, the keyboard `End` jump, and the committed and announced width. In `fixed` sizing mode the table is authoritative and scrolls past the viewport instead, so the fit cap does not apply there.
