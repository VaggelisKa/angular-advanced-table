---
"ng-advanced-table": patch
---

Fix three latent bugs in `<nat-table>`:

- `hasSameColumnVisibility` now compares visibility only, so swapping purely cosmetic column metadata (e.g. i18n label changes or a new `columns` array with different headers but the same visibility map) no longer triggers a misleading "visible columns" announcement on the polite live region.
- The helper also guards against a missing counterpart column in the previous/next accessibility snapshot, removing an unsafe property access that could throw when consumers swap an entire column set while keeping the leaf count the same.
- The keyboard focus style no longer forces `position: relative` on pinned or sticky header cells. Sticky left/right pinned body cells and the sticky header row now keep their `position: sticky` context while focused, so keyboard users see pinned columns stay put instead of briefly unsticking when focus lands on them.
