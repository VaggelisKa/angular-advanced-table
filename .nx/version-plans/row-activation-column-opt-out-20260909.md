---
ng-advanced-table: minor
---

Add `meta.rowActivation: false` so a column can exclude its body cells from row activation. Clicks and Enter/Space that start anywhere inside such a cell — including the padding around a small action button — no longer emit `rowActivate`, while the rest of the row still activates. The table and list renderers stamp `data-nat-row-activation="false"` on those cells/fields, and the same attribute works on any element inside a cell template as a finer opt-out. Documented alongside the WCAG 2.5.8 target-spacing reasoning in the columns, accessibility, and list-renderer topics.
