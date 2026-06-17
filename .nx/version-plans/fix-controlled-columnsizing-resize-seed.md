---
ng-advanced-table: patch
---

Fix the first pointer-drag resize of an auto-sized column (no `size` in its column def) when the surface passes a controlled `columnSizing` state binding. The pre-drag seed that exposes a column's rendered width to TanStack's resize handler now also applies through a transient overlay merged into `columnSizing`, so `column.getSize()` reports the measured width synchronously even though a controlled binding (which can only update on a later change-detection cycle) shadows the internal sizing signal. Previously `getResizeHandler` captured TanStack's 150px default as the drag start size, so the column jumped on the first drag; later drags were unaffected because a `columnSizing` entry already existed. The overlay is cleared once the start size is captured, so it never blocks a later controlled reset, and uncontrolled resizing is unchanged.
