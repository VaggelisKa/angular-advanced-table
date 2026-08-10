---
ng-advanced-table: patch
---

Restore a visible focus indicator in forced-colors (Windows High Contrast) mode.

`[ngGridCell]:focus-visible` paints its focus ring with an inset `box-shadow` and explicitly sets `outline: none`. Forced-colors mode forces `box-shadow` to `none`, so a focused grid cell had **no visible focus indicator at all** in that mode — a WCAG 2.4.7 (Focus Visible) failure affecting every keyboard user of the table on Windows High Contrast.

`.column-menu-item:focus-visible` in `ng-advanced-table/components` had the same defect: its two affordances are a `box-shadow` and a `color-mix` background, and forced colors removes the first and force-adjusts the second, leaving the focused item indistinguishable from its siblings.

Both now add an `outline` under `@media (forced-colors: active)`. `outline` survives forced colors, and the system colour keyword `Highlight` is used deliberately rather than the `--nat-table-focus-ring-color` token: custom properties are not force-adjusted, so a themed ring can resolve to a colour that is invisible against the forced background. A negative `outline-offset` keeps the ring inset, matching the box-shadow it stands in for, so it does not overlap neighbouring cells.

Safari does not implement `forced-colors` and ignores these blocks, leaving the existing box-shadow ring in place there.

Covered by a new e2e assertion that reads the computed outline of a focused header under real forced-colors emulation; it fails against the previous CSS.
