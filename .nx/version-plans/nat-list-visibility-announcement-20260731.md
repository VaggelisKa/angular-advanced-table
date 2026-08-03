---
ng-advanced-table: patch
---

Announce field changes rather than column changes in a list. Adds a `listColumnVisibilityChange` accessibility locale entry, selected when the renderer is a list, so hiding a field announces "Region field hidden. 1 visible field." instead of the grid's column wording. A consumer that overrode only `columnVisibilityChange` still wins, because the list falls back to it. `NatTableA11yService.registerSharedEffects` now takes the renderer kind (`'table' | 'list'`) instead of separate element-name and caption flags, and uses it for both the warning copy and the announcement copy.
