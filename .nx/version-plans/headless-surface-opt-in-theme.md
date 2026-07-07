---
ng-advanced-table: minor
---

Make the core table visually headless by default and ship the stock look as an opt-in theme. `NatTableSurface` no longer bakes the opinionated dark-teal palette and card chrome (background, border, radius, shadow, backdrop-filter) into its `--sys-nat-table-*` bridge defaults, so an unthemed table now inherits page/system colors and renders structurally. Import `ng-advanced-table/components/theme.css` once to restore the previous stock appearance, or set `--nat-table-*` tokens on a wrapper as before. The public `--nat-table-*` token contract and all token names are unchanged. Behavioral note: consumers who relied on the built-in default appearance without providing any tokens will now see an unstyled table until they import the opt-in theme or supply their own tokens. (#245)
