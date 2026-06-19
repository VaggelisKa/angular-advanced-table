---
ng-advanced-table: patch
---

Fix column resizing so a column without an explicit `minSize` can no longer be shrunk until its resize handle disappears or the table overflows. Such columns now floor at a 48px default minimum (twice the 24px resize-handle hit target) instead of TanStack's 20px default, which was narrower than the handle. This keeps the handle grabbable when a column is dragged to its minimum and, in `fill` layout, stops a growing column from collapsing its neighbours to a sliver and pushing the table past its visible region. An explicit `minSize` on a column definition is still honoured exactly as declared.
