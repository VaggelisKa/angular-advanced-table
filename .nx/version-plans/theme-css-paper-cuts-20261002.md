---
ng-advanced-table: patch
---

Fix several styling paper cuts. The opt-in `components/theme.css` now works on browsers without `light-dark()` (Safari before 17.5, including the Safari 16.5 baseline). There it uses plain light values with a `prefers-color-scheme: dark` override, where before the surfaces rendered transparent. Newer browsers behave as before. Under `prefers-reduced-motion: reduce`, the table, header actions, companion controls, and the render-metrics filter now turn off their transitions and the column menu enter animation, so drag reorder, hover, and menu changes happen instantly. `end`-aligned columns, column menu items, and the sticky state-row and sub-header content now use logical properties, so they mirror under `direction="rtl"` and look the same in LTR. The header sort button now has a minimum target of 24 × 24 CSS px (WCAG 2.5.8). The Column Layout topic gains a Right-To-Left Layout section.
