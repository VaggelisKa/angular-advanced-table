---
ng-advanced-table: patch
---

Tighten the stock `NatTableScrollControl` buttons: each side now draws as a 36 × 36 px square with a 24 px arrow and no inline padding (previously 44 px tall with 18 px side padding around a 1 rem arrow), so the focus ring no longer outlines an oversized pill. An invisible pseudo-element extends each button's pointer target to the new `--nat-table-scroll-button-target-size` token (44 px stock, the WCAG 2.5.5 AAA size; it never shrinks below the visual box), both in the component fallbacks and in the opt-in `theme.css`.
