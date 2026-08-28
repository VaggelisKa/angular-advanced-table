---
ng-advanced-table: patch
---

Stop clipping the focus ring of interactive controls inside table cells. Width-constrained header/data cells and the ellipsized data-cell content lift their `overflow: hidden` while the cell contains a `:focus-visible` descendant, so a focused button's outline paints fully; the ellipsis or line clamp returns when focus leaves.
