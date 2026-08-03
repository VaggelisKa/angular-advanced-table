---
ng-advanced-table: patch
---

Stop grid-only accessibility behavior from leaking into `nat-list`. `NatTableA11yService` no longer registers its effects in its own constructor; the renderer opts in through `registerSharedEffects(elementName, supportsCaption)` and, for the grid, `registerGridEffects()`. A list therefore skips column-resize announcements, the `aria-multiselectable` writer that queries a rendered `<table>`, and resize/reorder keybinding validation. The dev-mode accessible-name warning now names the actual element and only suggests `caption` on renderers that accept one, so a `nat-list` no longer reports a missing `<nat-table>` caption. Table behavior and warning copy are unchanged.
